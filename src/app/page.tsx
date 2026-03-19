import { redirect } from 'next/navigation';
import AttendancePage from '@/components/AttendancePage';

export default function Home() {
  // 환경변수 미설정 시 설정 마법사로 이동
  if (!process.env.GOOGLE_SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    redirect('/setup');
  }

  return <AttendancePage />;
}
