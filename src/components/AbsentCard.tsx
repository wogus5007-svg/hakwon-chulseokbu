'use client';

import type { AttendanceStatus, ContactStatus, Student } from '@/types';

interface Props {
  student: Student;
  onStatusChange: (id: number, status: AttendanceStatus) => void;
  onContactChange: (id: number, contactStatus: ContactStatus) => void;
  isUpdating: boolean;
}

function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

const CONTACT_CONFIG: Record<ContactStatus, { label: string; active: string }> = {
  미연락: { label: '미연락', active: 'bg-gray-400 text-white' },
  미응답: { label: '📵 미응답', active: 'bg-orange-500 text-white' },
  출석예정: { label: '✅ 출석예정', active: 'bg-blue-500 text-white' },
};

const CONTACT_STATUSES: ContactStatus[] = ['미연락', '미응답', '출석예정'];

export default function AbsentCard({ student, onStatusChange, onContactChange, isUpdating }: Props) {
  const parentClean = cleanPhone(student.parentPhone);
  const studentClean = cleanPhone(student.studentPhone);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-red-400 transition-opacity ${
        isUpdating ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* 학생 정보 + 출석 복귀 */}
      <div className="flex items-start justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900 text-lg">{student.name}</span>
            {student.school && <span className="text-sm text-gray-400">{student.school}</span>}
          </div>
          {student.classType && <p className="text-xs text-blue-500 mt-0.5">{student.classType}</p>}
          {student.examStatus && <p className="text-xs text-orange-500 mt-0.5">현황: {student.examStatus}</p>}
        </div>
        <button
          onClick={() => !isUpdating && onStatusChange(student.id, '출석')}
          disabled={isUpdating}
          className="ml-3 flex-shrink-0 bg-green-100 text-green-700 px-3 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform select-none"
        >
          출석 복귀
        </button>
      </div>

      {/* 연락 상태 */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-400 mb-2">연락 상태</p>
        <div className="flex gap-2">
          {CONTACT_STATUSES.map((cs) => (
            <button
              key={cs}
              onClick={() => !isUpdating && onContactChange(student.id, cs)}
              disabled={isUpdating}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 select-none ${
                student.contactStatus === cs
                  ? CONTACT_CONFIG[cs].active
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {CONTACT_CONFIG[cs].label}
            </button>
          ))}
        </div>
      </div>

      {/* 학부모 연락처 */}
      {student.parentPhone && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-1.5">학부모 · {student.parentPhone}</p>
          <div className="flex gap-2">
            <ContactButton type="tel" phone={parentClean} label="전화" color="blue" />
            <ContactButton type="sms" phone={parentClean} label="문자" color="green" />
          </div>
        </div>
      )}

      {/* 학생 연락처 */}
      {student.studentPhone && (
        <div className="px-4 pb-3 mt-1">
          <p className="text-xs text-gray-400 mb-1.5">학생 · {student.studentPhone}</p>
          <div className="flex gap-2">
            <ContactButton type="tel" phone={studentClean} label="전화" color="indigo" />
            <ContactButton type="sms" phone={studentClean} label="문자" color="teal" />
          </div>
        </div>
      )}

      {!student.parentPhone && !student.studentPhone && (
        <p className="px-4 pb-3 text-xs text-gray-400">연락처가 등록되지 않았습니다.</p>
      )}
    </div>
  );
}

function ContactButton({ type, phone, label, color }: {
  type: 'tel' | 'sms'; phone: string; label: string;
  color: 'blue' | 'green' | 'indigo' | 'teal';
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
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-semibold select-none ${colorMap[color]}`}
    >
      {type === 'tel' ? '📞' : '💬'} {label}
    </a>
  );
}
