'use client';

import type { AttendanceStatus, Student } from '@/types';

interface Props {
  student: Student;
  onStatusChange: (id: number, status: AttendanceStatus) => void;
  isUpdating: boolean;
}

const STATUS_ACTIVE: Record<AttendanceStatus, string> = {
  출석: 'bg-green-500 text-white',
  지각: 'bg-yellow-400 text-white',
  결석: 'bg-red-500 text-white',
  휴원: 'bg-purple-400 text-white',
  미확인: 'bg-gray-400 text-white',
};

const INDICATOR: Record<AttendanceStatus, string> = {
  출석: 'bg-green-500',
  지각: 'bg-yellow-400',
  결석: 'bg-red-500',
  휴원: 'bg-purple-400',
  미확인: 'bg-gray-300',
};

const ALL_STATUSES: AttendanceStatus[] = ['출석', '지각', '결석', '휴원', '미확인'];

export default function StudentCard({ student, onStatusChange, isUpdating }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm px-4 py-3 transition-opacity ${
        isUpdating ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* 상단: 이름 + 학교 */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${INDICATOR[student.status]}`} />
        <span className="font-bold text-gray-900 text-base">{student.name}</span>
        {student.school && (
          <span className="text-xs text-gray-400">{student.school}</span>
        )}
        {student.classType && (
          <span className="text-xs text-blue-500 ml-auto">{student.classType}</span>
        )}
      </div>

      {/* 하단: 상태 버튼 */}
      <div className="flex gap-1.5">
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => !isUpdating && onStatusChange(student.id, status)}
            disabled={isUpdating}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 select-none ${
              student.status === status ? STATUS_ACTIVE[status] : 'bg-gray-100 text-gray-500'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {(student.examStatus || student.examPeriod || student.examRange) && (
        <div className="mt-2 pt-2 border-t border-gray-50 flex flex-wrap gap-x-3 gap-y-0.5">
          {student.examStatus && (
            <span className="text-xs text-orange-500">현황: {student.examStatus}</span>
          )}
          {student.examPeriod && (
            <span className="text-xs text-gray-400">시험: {student.examPeriod}</span>
          )}
          {student.examRange && (
            <span className="text-xs text-gray-400">범위: {student.examRange}</span>
          )}
        </div>
      )}
    </div>
  );
}
