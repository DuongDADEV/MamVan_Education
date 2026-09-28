import React from 'react';
import {
  StudentAccount,
  StudentCredentialVoucher,
} from '../../services/types.ts';
import { StudentState, SkillLevel } from '../../types.ts';
import { Drawer } from './ui/Drawer.tsx';
import { StatusBadge } from './ui/StatusBadge.tsx';
import { calculateLevelMastery } from '../../logic/mastery.ts';
import {
  KeyRound,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  Calendar,
  Layers,
  CheckCircle,
  Edit2,
} from 'lucide-react';

interface StudentProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAccount | null;
  className?: string;
  studentState?: StudentState | null;
  onResetPassword: (studentId: string) => void;
  onToggleLock: (studentId: string, currentLocked: boolean) => void;
  onChangeClass: (studentId: string) => void;
  onEditStudent?: (student: StudentAccount) => void;
}

const SKILL_LEVELS: SkillLevel[] = ['NHAN_BIET', 'THONG_HIEU', 'PHAN_TICH', 'VAN_DUNG'];

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  isOpen,
  onClose,
  student,
  className,
  studentState,
  onResetPassword,
  onToggleLock,
  onChangeClass,
  onEditStudent,
}) => {
  if (!student) return null;

  const isLocked = student.status === 'locked';
  const state = studentState;

  // Tính thời gian học tích cực (phút)
  const activeMinutes = state ? Math.floor(state.activeSecondsToday / 60) : 0;
  const totalXp = state?.totalXp ?? 0;
  const xpWeek = state?.xpWeek ?? 0;
  const completedCount = state?.completedSteps?.length ?? 0;

  // Mastery 4 mức
  const questionResults = state?.questionResults || [];
  const masteryBreakdown = SKILL_LEVELS.map((lvl) => {
    return calculateLevelMastery(questionResults, lvl);
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={student.name}
      subtitle={`Tên đăng nhập: ${student.username} • Lớp ${className || student.class_id}`}
      width="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {onEditStudent && (
              <button
                type="button"
                onClick={() => onEditStudent(student)}
                className="px-3 py-2 rounded-xl border border-[#E6DCC8] bg-white hover:bg-[#FAF5EB] text-xs font-semibold text-[#2F3E6B] flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#2F3E6B]" />
                <span>Sửa thông tin</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onResetPassword(student.id)}
              className="px-3 py-2 rounded-xl border border-[#E6DCC8] bg-white hover:bg-[#FAF5EB] text-xs font-semibold text-[#2F3E6B] flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#E2704A]" />
              <span>Đặt lại mật khẩu</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleLock(student.id, isLocked)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isLocked
                ? 'bg-[#7FA88A] hover:bg-[#6E9578] text-white'
                : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở khóa tài khoản</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Tạm khóa tài khoản</span>
              </>
            )}
          </button>
        </div>
      }
    >
      {/* 1. THẺ THÔNG TIN TỔNG QUAN HỌC SINH */}
      <div className="bg-[#FAF5EB] border border-[#E6DCC8] rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2F3E6B] text-white flex items-center justify-center font-bold text-base shadow-xs">
              {student.name.charAt(student.name.lastIndexOf(' ') + 1) || 'A'}
            </div>
            <div>
              <p className="font-lora text-base font-bold text-[#2F3E6B]">
                {student.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B7280]">
                <span>Tài khoản: <strong className="font-mono text-[#2F3E6B]">{student.username}</strong></span>
                {student.student_code && <span>• Mã: {student.student_code}</span>}
              </div>
            </div>
          </div>

          <StatusBadge
            status={student.status}
            label={student.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E6DCC8]/80 text-xs">
          <div>
            <span className="text-[#6B7280] block">Lớp học:</span>
            <span className="font-semibold text-[#2F3E6B]">
              Lớp {className || student.class_id}
            </span>
          </div>
          <div>
            <span className="text-[#6B7280] block">Ngày sinh:</span>
            <span className="font-semibold text-[#2F3E6B]">
              {student.dob || 'Chưa cập nhật'}
            </span>
          </div>
          <div>
            <span className="text-[#6B7280] block">Trạng thái đăng nhập:</span>
            <span className="font-semibold text-[#2F3E6B]">
              {student.has_logged_in ? 'Đã từng học' : 'Chưa đăng nhập'}
            </span>
          </div>
          <div>
            <span className="text-[#6B7280] block">Lần học gần nhất:</span>
            <span className="font-semibold text-[#2F3E6B]">
              {student.last_active_at
                ? new Date(student.last_active_at).toLocaleString('vi-VN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : 'Chưa có hoạt động'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CHỈ SỐ TIẾN ĐỘ & THỜI GIAN HỌC */}
      <div>
        <h4 className="font-lora font-bold text-sm text-[#2F3E6B] mb-3">
          Chỉ số học tập tích cực
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-white border border-[#E6DCC8] rounded-xl text-center">
            <span className="text-[11px] text-[#6B7280] block">XP tuần này</span>
            <span className="font-lora text-xl font-bold text-[#E2704A] mt-1 block">
              +{xpWeek}
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#E6DCC8] rounded-xl text-center">
            <span className="text-[11px] text-[#6B7280] block">Tổng điểm XP</span>
            <span className="font-lora text-xl font-bold text-[#2F3E6B] mt-1 block">
              {totalXp}
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#E6DCC8] rounded-xl text-center">
            <span className="text-[11px] text-[#6B7280] block">Học hôm nay</span>
            <span className="font-lora text-xl font-bold text-[#7FA88A] mt-1 block">
              {activeMinutes}p
            </span>
          </div>
        </div>
      </div>

      {/* 3. BẢNG NĂNG LỰC MASTERY 4 MỨC */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-lora font-bold text-sm text-[#2F3E6B]">
            Năng lực văn học (Mastery 4 mức)
          </h4>
          <span className="text-[11px] text-[#6B7280]">
            Dựa trên {questionResults.length} câu đã làm
          </span>
        </div>

        <div className="space-y-2.5">
          {masteryBreakdown.map((m) => {
            let barColor = 'bg-[#7FA88A]';
            if (m.status === 'NEEDS_REVIEW') barColor = 'bg-[#E2704A]';
            else if (m.status === 'PROGRESSING') barColor = 'bg-[#F2B84B]';

            return (
              <div
                key={m.level}
                className="p-3 bg-white border border-[#E6DCC8] rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2F3E6B]">
                    {m.displayName} ({m.level})
                  </span>
                  <span className="font-bold text-[#2F3E6B]">
                    {m.percentage}% ({m.statusLabel})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#FAF5EB] h-2 rounded-full overflow-hidden border border-[#E6DCC8]">
                  <div
                    className={`h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#6B7280]">
                  {m.shortDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CÁC HUY HIỆU & BƯỚC HỌC ĐÃ HOÀN THÀNH */}
      <div className="pt-2">
        <h4 className="font-lora font-bold text-sm text-[#2F3E6B] mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#F2B84B]" />
          <span>Huy hiệu & Bài học đã mở khóa ({state?.unlockedBadgeIds?.length || 0} huy hiệu)</span>
        </h4>

        {state?.unlockedBadgeIds && state.unlockedBadgeIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {state.unlockedBadgeIds.map((bId) => (
              <span
                key={bId}
                className="px-2.5 py-1 rounded-full bg-[#FAF5EB] border border-[#E6DCC8] text-[11px] font-semibold text-[#2F3E6B]"
              >
                🏅 {bId}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B7280]">
            Em chưa nhận được huy hiệu nào. Hãy khuyến khích em học đều mỗi ngày!
          </p>
        )}
      </div>
    </Drawer>
  );
};
