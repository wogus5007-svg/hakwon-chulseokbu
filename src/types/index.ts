export type AttendanceStatus = '출석' | '결석' | '휴원' | '미확인';
export type ContactStatus = '미연락' | '미응답' | '출석예정';

export interface Student {
  id: number;
  name: string;
  school: string;
  classType: string;
  publisher: string;
  examStatus: string;
  examRange: string;
  examPeriod: string;
  parentPhone: string;
  studentPhone: string;
  status: AttendanceStatus;
  contactStatus: ContactStatus;
}

export interface StudentsResponse {
  students: Student[];
  dateColIndex: number;
}

export interface AttendanceUpdateRequest {
  rowIndex: number;
  colIndex: number;
  status: AttendanceStatus;
  contactStatus?: ContactStatus;
  sheetName?: string;
}
