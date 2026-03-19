import { NextResponse } from 'next/server';
import { getStudentsWithAttendance } from '@/lib/googleSheets';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  try {
    const data = await getStudentsWithAttendance(date);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/students]', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
