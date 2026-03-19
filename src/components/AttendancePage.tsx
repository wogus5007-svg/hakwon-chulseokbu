'use client';

import { useState, useEffect, useCallback } from 'react';
import StudentCard from './StudentCard';
import AbsentCard from './AbsentCard';
import type { AttendanceStatus, ContactStatus, Student, StudentsResponse } from '@/types';

type Tab = '전체' | '결석' | '휴원';

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayKorean(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export default function AttendancePage() {
  const [sheetList, setSheetList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [dateColIndex, setDateColIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<Tab>('전체');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const today = getTodayDateString();
  const todayKorean = getTodayKorean();

  // 시트 목록 불러오기
  useEffect(() => {
    fetch('/api/sheets')
      .then((r) => r.json())
      .then((data) => {
        if (data.sheets?.length > 0) {
          setSheetList(data.sheets);
          setSelectedSheet(data.sheets[0]);
        }
      })
      .catch(() => {});
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!selectedSheet) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/students?date=${today}&sheet=${encodeURIComponent(selectedSheet)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '데이터를 불러오지 못했습니다');
      }
      const data: StudentsResponse = await res.json();
      setStudents(data.students);
      setDateColIndex(data.dateColIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [today, selectedSheet]);

  useEffect(() => {
    if (selectedSheet) fetchStudents();
  }, [fetchStudents, selectedSheet]);

  const handleStatusChange = async (studentId: number, newStatus: AttendanceStatus) => {
    if (updatingId !== null) return;
    setUpdatingId(studentId);

    const prev = students;
    setStudents((s) => s.map((st) => (st.id === studentId ? { ...st, status: newStatus } : st)));

    try {
      const student = prev.find((s) => s.id === studentId);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: studentId,
          colIndex: dateColIndex,
          status: newStatus,
          contactStatus: student?.contactStatus,
          sheetName: selectedSheet,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '업데이트 실패');
      }
    } catch (err) {
      setStudents(prev);
      alert(`출석 상태 업데이트 실패: ${err instanceof Error ? err.message : '오류'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleContactChange = async (studentId: number, newContact: ContactStatus) => {
    if (updatingId !== null) return;
    setUpdatingId(studentId);

    const prev = students;
    setStudents((s) => s.map((st) => (st.id === studentId ? { ...st, contactStatus: newContact } : st)));

    try {
      const student = prev.find((s) => s.id === studentId);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: studentId,
          colIndex: dateColIndex,
          status: student?.status,
          contactStatus: newContact,
          sheetName: selectedSheet,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '업데이트 실패');
      }
    } catch (err) {
      setStudents(prev);
      alert(`연락 상태 업데이트 실패: ${err instanceof Error ? err.message : '오류'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const attendedCount = students.filter((s) => s.status === '출석').length;
  const absentCount = students.filter((s) => s.status === '결석').length;
  const pausedCount = students.filter((s) => s.status === '휴원').length;
  const unknownCount = students.filter((s) => s.status === '미확인').length;
  const absentStudents = students.filter((s) => s.status === '결석');
  const pausedStudents = students.filter((s) => s.status === '휴원');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {selectedSheet ? `${selectedSheet} 불러오는 중...` : '데이터 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-gray-700 font-semibold mb-1">오류가 발생했습니다</p>
          <p className="text-red-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchStudents}
            className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단 헤더 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 pt-4 pb-2 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">📋 이안서가 중등관 학원 출석부</h1>
            <p className="text-sm text-gray-400 mt-0.5">{todayKorean}</p>
          </div>
          <button
            onClick={fetchStudents}
            className="mt-1 p-2 rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <RefreshIcon />
          </button>
        </div>

        {/* 반 선택 탭 (시트가 2개 이상일 때만 표시) */}
        {sheetList.length > 1 && (
          <div className="flex overflow-x-auto px-4 pb-2 gap-2 scrollbar-hide">
            {sheetList.map((sheet) => (
              <button
                key={sheet}
                onClick={() => {
                  setSelectedSheet(sheet);
                  setActiveTab('전체');
                }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedSheet === sheet
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        )}

        {/* 통계 바 */}
        <div className="flex gap-2 px-4 pb-3">
          <StatBadge label="출석" count={attendedCount} color="green" />
          <StatBadge label="결석" count={absentCount} color="red" />
          <StatBadge label="휴원" count={pausedCount} color="purple" />
          <StatBadge label="미확인" count={unknownCount} color="gray" />
        </div>

        {/* 전체/결석/휴원 탭 */}
        <div className="flex border-t border-gray-100">
          {(['전체', '결석', '휴원'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {tab === '전체' ? `전체 (${students.length})` : tab === '결석' ? `결석 (${absentCount})` : `휴원 (${pausedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 py-3 space-y-2">
        {activeTab === '전체' ? (
          students.length === 0 ? (
            <EmptyState message="등록된 학생이 없습니다" sub="스프레드시트에 학생 명단을 추가해주세요" />
          ) : (
            students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onStatusChange={handleStatusChange}
                isUpdating={updatingId === student.id}
              />
            ))
          )
        ) : activeTab === '결석' ? (
          absentStudents.length === 0 ? (
            <EmptyState message="결석 학생이 없습니다 🎉" sub="모든 학생이 출석했습니다!" />
          ) : (
            absentStudents.map((student) => (
              <AbsentCard
                key={student.id}
                student={student}
                onStatusChange={handleStatusChange}
                onContactChange={handleContactChange}
                isUpdating={updatingId === student.id}
              />
            ))
          )
        ) : pausedStudents.length === 0 ? (
          <EmptyState message="휴원 학생이 없습니다" sub="휴원 중인 학생이 없습니다" />
        ) : (
          pausedStudents.map((student) => (
            <AbsentCard
              key={student.id}
              student={student}
              onStatusChange={handleStatusChange}
              onContactChange={handleContactChange}
              isUpdating={updatingId === student.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: 'green' | 'red' | 'gray' | 'blue' | 'purple' }) {
  const colorMap = { green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-700', gray: 'bg-gray-100 text-gray-600', blue: 'bg-blue-50 text-blue-700', purple: 'bg-purple-50 text-purple-700' };
  return (
    <div className={`flex-1 rounded-xl px-2 py-2 text-center ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold leading-tight">{count}</p>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-1">{sub}</p>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
