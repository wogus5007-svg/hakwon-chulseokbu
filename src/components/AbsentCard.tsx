'use client';

import type { AttendanceStatus, Student } from '@/types';

interface Props {
  student: Student;
  onStatusChange: (id: number, status: AttendanceStatus) => void;
  isUpdating: boolean;
}

/** 전화번호에서 숫자와 + 기호만 남김 (tel:, sms: 링크 호환) */
function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export default function AbsentCard({ student, onStatusChange, isUpdating }: Props) {
  const parentClean = cleanPhone(student.parentPhone);
  const studentClean = cleanPhone(student.studentPhone);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-red-400 transition-opacity ${
        isUpdating ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* 상단: 학생 정보 + 출석 복귀 */}
      <div className="flex items-start justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900 text-lg">{student.name}</span>
            {student.school && (
              <span className="text-sm text-gray-400">{student.school}</span>
            )}
          </div>
          {student.classType && (
            <p className="text-xs text-blue-500 mt-0.5">{student.classType}</p>
          )}
          {student.examStatus && (
            <p className="text-xs text-orange-500 mt-0.5">현황: {student.examStatus}</p>
          )}
        </div>
        <button
          onClick={() => !isUpdating && onStatusChange(student.id, '출석')}
          disabled={isUpdating}
          className="ml-3 flex-shrink-0 bg-green-100 text-green-700 px-3 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform select-none"
        >
          출석 복귀
        </button>
      </div>

      {/* 학부모 연락처 */}
      {student.parentPhone && (
        <div className="px-4 pb-1">
          <p className="text-xs text-gray-400 mb-1.5">
            학부모 · {student.parentPhone}
          </p>
          <div className="flex gap-2">
            <ContactButton type="tel" phone={parentClean} label="전화" />
            <ContactButton type="sms" phone={parentClean} label="문자" />
          </div>
        </div>
      )}

      {/* 학생 연락처 */}
      {student.studentPhone && (
        <div className="px-4 pb-3 mt-2">
          <p className="text-xs text-gray-400 mb-1.5">
            학생 · {student.studentPhone}
          </p>
          <div className="flex gap-2">
            <ContactButton type="tel" phone={studentClean} label="전화" color="indigo" />
            <ContactButton type="sms" phone={studentClean} label="문자" color="teal" />
          </div>
        </div>
      )}

      {/* 연락처가 모두 없을 때 */}
      {!student.parentPhone && !student.studentPhone && (
        <p className="px-4 pb-3 text-xs text-gray-400">연락처가 등록되지 않았습니다.</p>
      )}
    </div>
  );
}

function ContactButton({
  type,
  phone,
  label,
  color = 'blue',
}: {
  type: 'tel' | 'sms';
  phone: string;
  label: string;
  color?: 'blue' | 'green' | 'indigo' | 'teal';
}) {
  const colorMap = {
    blue: 'bg-blue-500 active:bg-blue-600',
    green: 'bg-green-500 active:bg-green-600',
    indigo: 'bg-indigo-500 active:bg-indigo-600',
    teal: 'bg-teal-500 active:bg-teal-600',
  };

  return (
    <a
      href={`${type}:${phone}`}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors select-none ${colorMap[color]}`}
    >
      {type === 'tel' ? <PhoneIcon /> : <SmsIcon />}
      {label}
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function SmsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}
