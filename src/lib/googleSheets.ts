import { google } from 'googleapis';
import type { AttendanceStatus, ContactStatus, Student, StudentsResponse } from '@/types';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || '출석부';

/**
 * 스프레드시트 고정 컬럼 구조 (0-based index)
 *   0: 이름 / 1: 학교 / 2: 수업유형 / 3: 출처사
 *   4: 현황 / 5: 시험범위 / 6: 시험기간
 *   7: 학부모 연락처 / 8: 학생 연락처
 *   9~: 날짜별 출석 (YYYY-MM-DD)
 *
 * 셀 저장 형식:
 *   출석 | 휴원 | 미확인 → 그대로 저장
 *   결석              → "결석" (미연락)
 *   결석 + 연락상태   → "결석:미응답" | "결석:출석예정"
 */
const FIXED_COLS = 9;

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다.');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function colIndexToLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

/** "결석:미응답" → { status: '결석', contactStatus: '미응답' } */
function parseCellValue(raw: string): { status: AttendanceStatus; contactStatus: ContactStatus } {
  const [statusPart, contactPart] = raw.split(':');
  const status: AttendanceStatus =
    statusPart === '출석' || statusPart === '결석' || statusPart === '휴원'
      ? statusPart
      : '미확인';
  const contactStatus: ContactStatus =
    contactPart === '미응답' || contactPart === '출석예정' ? contactPart : '미연락';
  return { status, contactStatus };
}

/** { status: '결석', contactStatus: '미응답' } → "결석:미응답" */
export function buildCellValue(status: AttendanceStatus, contactStatus?: ContactStatus): string {
  if (status === '결석' && contactStatus && contactStatus !== '미연락') {
    return `결석:${contactStatus}`;
  }
  return status;
}

export async function getStudentsWithAttendance(
  date: string,
  sheetName?: string
): Promise<StudentsResponse> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const targetSheet = sheetName || SHEET_NAME;
  const quotedSheet = `'${targetSheet}'`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: quotedSheet,
  });

  const values = response.data.values ?? [];
  if (values.length === 0) return { students: [], dateColIndex: FIXED_COLS };

  const headers = values[0] as string[];
  let dateColIndex = headers.indexOf(date);

  if (dateColIndex === -1) {
    dateColIndex = headers.length < FIXED_COLS ? FIXED_COLS : headers.length;
    const colLetter = colIndexToLetter(dateColIndex);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${quotedSheet}!${colLetter}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [[date]] },
    });
  }

  const students: Student[] = values.slice(1).map((row, index) => {
    const { status, contactStatus } = parseCellValue((row[dateColIndex] ?? '') as string);
    return {
      id: index,
      name: (row[0] ?? '').trim(),
      school: (row[1] ?? '').trim(),
      classType: (row[2] ?? '').trim(),
      publisher: (row[3] ?? '').trim(),
      examStatus: (row[4] ?? '').trim(),
      examRange: (row[5] ?? '').trim(),
      examPeriod: (row[6] ?? '').trim(),
      parentPhone: (row[7] ?? '').trim(),
      studentPhone: (row[8] ?? '').trim(),
      status,
      contactStatus,
    };
  });

  return { students, dateColIndex };
}

export async function updateAttendance(
  rowIndex: number,
  colIndex: number,
  status: AttendanceStatus,
  sheetName?: string,
  contactStatus?: ContactStatus
): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const targetSheet = sheetName || SHEET_NAME;
  const range = `'${targetSheet}'!${colIndexToLetter(colIndex)}${rowIndex + 2}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[buildCellValue(status, contactStatus)]] },
  });
}
