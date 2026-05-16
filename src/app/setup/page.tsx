'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

type Step = 1 | 2 | 3;

export default function SetupPage() {
  const [step, setStep] = useState<Step>(1);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('출석부');
  const [serviceKey, setServiceKey] = useState('');
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const extractId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const spreadsheetId = extractId(spreadsheetUrl) ?? (spreadsheetUrl.length > 20 && !spreadsheetUrl.includes('/') ? spreadsheetUrl : null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setServiceKey((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  };

  const goNext = () => {
    setError(null);
    if (step === 1 && !spreadsheetId) {
      setError('구글 스프레드시트 URL을 올바르게 입력해주세요.');
      return;
    }
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const handleSave = async () => {
    if (!serviceKey.trim()) {
      setError('서비스 계정 JSON 키를 입력해주세요.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, sheetName, serviceAccountKey: serviceKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">설정 완료!</h1>
          <p className="text-gray-500 mb-8">구글 시트 연동이 성공적으로 완료되었습니다.</p>
          <Link
            href="/"
            className="block w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg active:bg-blue-600"
          >
            출석부 시작하기 →
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            앞으로는 <strong>앱 시작하기</strong> 파일만 더블클릭하면 됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">📋</p>
          <h1 className="text-2xl font-bold text-gray-900">학원 출석부 설정</h1>
          <p className="text-gray-500 text-sm mt-1">처음 한 번만 설정하면 됩니다</p>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* 단계 내용 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                1단계: 구글 스프레드시트 연결
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                출석부로 사용할 구글 스프레드시트를 열고,<br />
                주소창의 URL 전체를 복사해서 붙여넣어 주세요.
              </p>

              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-500 font-mono break-all">
                예) https://docs.google.com/spreadsheets/d/<span className="text-blue-600 font-bold">1ABC...xyz</span>/edit
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                스프레드시트 URL
              </label>
              <textarea
                value={spreadsheetUrl}
                onChange={(e) => { setSpreadsheetUrl(e.target.value); setError(null); }}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              {spreadsheetId && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                  <span>✅</span>
                  <span className="font-mono text-xs truncate">{spreadsheetId}</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                2단계: 시트 이름 확인
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                구글 스프레드시트 하단의 탭 이름을 입력해주세요.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-800">
                💡 스프레드시트 하단에 시트 탭 이름이 보입니다.<br />
                기본값은 <strong>출석부</strong>입니다.<br />
                시트 탭 이름이 다르다면 그 이름을 입력해주세요.
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                시트 탭 이름
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <p className="text-xs text-gray-400 mt-2">
                학생 명단이 있는 시트의 탭 이름 (예: 출석부, Sheet1)
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                3단계: 구글 서비스 계정 연결
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                앱이 구글 시트를 읽고 쓸 수 있도록 권한을 연결해주세요.
              </p>

              {/* 설정 가이드 토글 */}
              <button
                onClick={() => setShowKeyGuide(!showKeyGuide)}
                className="w-full flex items-center justify-between bg-blue-50 rounded-xl p-3 mb-4 text-sm font-semibold text-blue-700"
              >
                <span>📖 처음이신가요? 설정 방법 보기</span>
                <span>{showKeyGuide ? '▲' : '▼'}</span>
              </button>

              {showKeyGuide && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-xs text-gray-700 space-y-2 leading-relaxed">
                  <p className="font-bold text-sm text-gray-900">서비스 계정 JSON 키 발급 방법</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">1</span> <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a> 접속 후 로그인</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">2</span> 상단 &quot;프로젝트 선택&quot; → &quot;새 프로젝트&quot; → 이름 입력 → 만들기</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">3</span> 왼쪽 메뉴 → API 및 서비스 → 라이브러리 → &quot;Google Sheets API&quot; 검색 → 사용 설정</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">4</span> 왼쪽 메뉴 → API 및 서비스 → 사용자 인증 정보 → &quot;+ 사용자 인증 정보 만들기&quot; → 서비스 계정</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">5</span> 이름 입력 → 만들고 계속하기 → 완료</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">6</span> 만들어진 서비스 계정 클릭 → &quot;키&quot; 탭 → &quot;키 추가&quot; → &quot;새 키 만들기&quot; → JSON → 만들기</p>
                  <p><span className="bg-blue-100 text-blue-800 px-1 rounded">7</span> JSON 파일이 자동으로 다운로드됩니다</p>
                  <hr className="border-gray-200" />
                  <p className="font-bold text-gray-900">구글 시트에 권한 공유하기</p>
                  <p><span className="bg-orange-100 text-orange-800 px-1 rounded">8</span> 다운로드된 JSON 파일을 메모장/텍스트편집기로 열기 → <strong>client_email</strong> 값 복사<br />(예: xxx@xxx.iam.gserviceaccount.com)</p>
                  <p><span className="bg-orange-100 text-orange-800 px-1 rounded">9</span> 구글 스프레드시트 열기 → 우상단 &quot;공유&quot; 버튼 → 복사한 이메일 붙여넣기 → 권한: 편집자 → 공유</p>
                  <p><span className="bg-orange-100 text-orange-800 px-1 rounded">10</span> 아래 JSON 키 붙여넣기 영역에 파일 내용을 붙여넣거나 파일을 업로드하세요</p>
                </div>
              )}

              {/* 파일 업로드 */}
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-blue-300 rounded-xl py-4 text-blue-600 font-semibold text-sm mb-3 active:bg-blue-50"
              >
                📂 JSON 파일 업로드 (클릭)
              </button>

              <p className="text-center text-xs text-gray-400 mb-2">또는 파일 내용을 직접 붙여넣기</p>

              <textarea
                value={serviceKey}
                onChange={(e) => { setServiceKey(e.target.value); setError(null); }}
                placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'}
                rows={6}
                className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              {serviceKey.length > 10 && (
                <div className="mt-2 text-green-600 text-sm flex items-center gap-1">
                  <span>✅</span>
                  <span>JSON 키 입력됨</span>
                </div>
              )}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-600 whitespace-pre-line">
              ❌ {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => { setStep((s) => (s - 1) as Step); setError(null); }}
                className="flex-1 py-3.5 border border-gray-200 rounded-xl text-gray-600 font-semibold"
              >
                ← 이전
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={goNext}
                className="flex-1 py-3.5 bg-blue-500 text-white rounded-xl font-bold active:bg-blue-600"
              >
                다음 →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3.5 bg-green-500 text-white rounded-xl font-bold active:bg-green-600 disabled:opacity-50"
              >
                {saving ? '연결 확인 중...' : '✅ 저장하고 시작하기'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          설정 정보는 이 컴퓨터에만 저장되며 외부로 전송되지 않습니다.
        </p>
      </div>
    </div>
  );
}
