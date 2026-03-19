import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다.');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function GET() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    });
    const sheetNames = (res.data.sheets ?? []).map((s) => s.properties?.title ?? '');
    return NextResponse.json({ sheets: sheetNames.filter(Boolean) });
  } catch (error) {
    console.error('[GET /api/sheets]', error);
    return NextResponse.json({ error: '시트 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}
