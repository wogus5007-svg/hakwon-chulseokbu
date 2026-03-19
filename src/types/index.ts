export type AttendanceStatus = '출석' | '결석' | '미확인';

export interface Student {
  /** 스프레드시트 데이터 행 인덱스 (헤더 제외, 0부터 시작) */
  id: number;
  name: string;
  school: string;
  classType: string;   // 수업 요일/시간
  publisher: string;   // 출처사
  examStatus: string;  // 현황
  examRange: string;   // 시험범위
  examPeriod: string;  // 시험기간
  parentPhone: string; // 학부모 연락처
  studentPhone: string; // 학생 연락처
  status: AttendanceStatus;
}

export interface StudentsResponse {
  students: Student[];
  /** 오늘 날짜에 해당하는 열 인덱스 */
  dateColIndex: number;
}

export interface AttendanceUpdateRequest {
  rowIndex: number;
  colIndex: number;
  status: AttendanceStatus;
  sheetName?: string;
}
