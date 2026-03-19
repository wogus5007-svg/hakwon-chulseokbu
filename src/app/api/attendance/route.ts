import { NextResponse } from 'next/server';
import { updateAttendance } from '@/lib/googleSheets';
import type { AttendanceUpdateRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AttendanceUpdateRequest = await request.json();
    const { rowIndex, colIndex, status, sheetName } = body;

    if (rowIndex === undefined || colIndex === undefined || !status) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
    }

    await updateAttendance(rowIndex, colIndex, status, sheetName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/attendance]', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
