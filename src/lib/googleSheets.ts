import { google } from 'googleapis';
import type { AttendanceStatus, Student, StudentsResponse } from '@/types';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || '출석부';

/**
 * 스프레드시트 고정 컬럼 구조 (0-based index)
 *   0: 이름
 *   1: 학교
 *   2: 수업유형 (요일/시간)
 *   3: 출처사
 *   4: 현황
 *   5: 시험범위
 *   6: 시험기간
 *   7: 학부모 연락처
 *   8: 학생 연락처
 *   9~: 날짜별 출석 (YYYY-MM-DD)
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

/** 열 인덱스(0-based)를 스프레드시트 열 문자로 변환 (예: 0→A, 25→Z, 26→AA) */
function colIndexToLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

function parsePhone(raw: string | undefined): string {
  return (raw ?? '').trim();
}

export async function getStudentsWithAttendance(date: string): Promise<StudentsResponse> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });

  const values = response.data.values ?? [];
  if (values.length === 0) return { students: [], dateColIndex: FIXED_COLS };

  const headers = values[0] as string[];

  // 오늘 날짜 열 찾기 (고정 컬럼 이후에서만 탐색)
  let dateColIndex = headers.indexOf(date);

  // 없으면 새 열로 추가
  if (dateColIndex === -1) {
    dateColIndex = headers.length < FIXED_COLS ? FIXED_COLS : headers.length;
    const colLetter = colIndexToLetter(dateColIndex);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${colLetter}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [[date]] },
    });
  }

  const students: Student[] = values.slice(1).map((row, index) => {
    const rawStatus = (row[dateColIndex] ?? '') as string;
    const status: AttendanceStatus =
      rawStatus === '출석' || rawStatus === '결석' ? rawStatus : '미확인';

    return {
      id: index,
      name: (row[0] ?? '').trim(),
      school: (row[1] ?? '').trim(),
      classType: (row[2] ?? '').trim(),
      publisher: (row[3] ?? '').trim(),
      examStatus: (row[4] ?? '').trim(),
      examRange: (row[5] ?? '').trim(),
      examPeriod: (row[6] ?? '').trim(),
      parentPhone: parsePhone(row[7]),
      studentPhone: parsePhone(row[8]),
      status,
    };
  });

  return { students, dateColIndex };
}

export async function updateAttendance(
  rowIndex: number,
  colIndex: number,
  status: AttendanceStatus
): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const colLetter = colIndexToLetter(colIndex);
  // 스프레드시트는 1-based, 1행은 헤더이므로 rowIndex + 2
  const range = `${SHEET_NAME}!${colLetter}${rowIndex + 2}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  });
}
