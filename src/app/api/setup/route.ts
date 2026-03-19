import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, sheetName, serviceAccountKey } = await request.json();

    // JSON 키 파싱 검증
    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(serviceAccountKey);
    } catch {
      return NextResponse.json(
        { error: 'JSON 키 형식이 잘못되었습니다. 파일 내용을 그대로 붙여넣었는지 확인해주세요.' },
        { status: 400 }
      );
    }

    if (!credentials.client_email || !credentials.private_key) {
      return NextResponse.json(
        { error: '서비스 계정 JSON 키가 올바르지 않습니다. Google Cloud에서 발급한 JSON 파일인지 확인해주세요.' },
        { status: 400 }
      );
    }

    // 구글 시트 연결 테스트
    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.get({ spreadsheetId });
    } catch {
      return NextResponse.json(
        {
          error:
            '구글 시트 연결에 실패했습니다.\n\n' +
            '확인해주세요:\n' +
            '1. 스프레드시트 URL이 올바른지\n' +
            '2. 구글 시트에서 서비스 계정 이메일에 편집자 권한을 공유했는지',
        },
        { status: 400 }
      );
    }

    // .env.local 파일 저장
    const keyJson = JSON.stringify(credentials); // 한 줄로 압축
    const envContent = [
      `GOOGLE_SPREADSHEET_ID=${spreadsheetId}`,
      `GOOGLE_SHEET_NAME=${sheetName || '출석부'}`,
      `GOOGLE_SERVICE_ACCOUNT_KEY='${keyJson}'`,
    ].join('\n') + '\n';

    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/setup]', error);
    return NextResponse.json(
      { error: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
