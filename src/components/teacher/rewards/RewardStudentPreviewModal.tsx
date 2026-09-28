import React, { useState } from 'react';
import { RewardItem } from '../../../types.ts';
import { CHEST_TIERS } from '../../../config.ts';
import { ChestIllustration } from '../../rewards/ChestIllustration.tsx';
import { X, Sparkles, Lock, Gift, CheckCircle, Info } from 'lucide-react';

interface RewardStudentPreviewModalProps {
  isOpen: boolean;
  reward: RewardItem | null;
  onClose: () => void;
}

export const RewardStudentPreviewModal: React.FC<RewardStudentPreviewModalProps> = ({
  isOpen,
  reward,
  onClose,
}) => {
  const [simulationState, setSimulationState] = useState<'locked' | 'eligible' | 'given' | 'opened'>('eligible');

  if (!isOpen || !reward) return null;

  const tier = CHEST_TIERS[reward.tierKey] || CHEST_TIERS.HAT;
  const isOpened = simulationState === 'opened';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23325B]/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease]">
      <div
        className="bg-[#FFFDF8] border border-[#E6DCC8] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[scaleUp_0.15s_ease]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E6DCC8]/80 bg-[#FAF5EB]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2F3E6B]/10 text-[#2F3E6B] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#2F3E6B]" />
            </div>
            <div>
              <h2 id="preview-modal-title" className="font-lora font-bold text-base text-[#2F3E6B]">
                Bản xem trước phía học sinh
              </h2>
              <p className="text-xs text-[#6B7280]">
                Kiểm tra giao diện học sinh nhìn thấy ở các trạng thái khác nhau
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#E6DCC8]/50 text-[#6B7280] hover:text-[#2F3E6B] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TÙY CHỌN TRẠNG THÁI GIẢ LẬP */}
        <div className="px-6 pt-4 pb-2 bg-[#FAF5EB]/40 border-b border-[#E6DCC8]/50 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-[#4B5563] shrink-0">Trạng thái:</span>
          {(
            [
              { key: 'locked', label: 'Chưa đủ điều kiện' },
              { key: 'eligible', label: 'Đủ điều kiện (Chờ gửi)' },
              { key: 'given', label: 'Đã trao quà (Chờ mở)' },
              { key: 'opened', label: 'Đã mở rương' },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSimulationState(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                simulationState === s.key
                  ? 'bg-[#2F3E6B] text-white shadow-xs'
                  : 'bg-[#FFFDF8] border border-[#E6DCC8] text-[#4B5563] hover:bg-[#FAF5EB]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* BODY - MÔ PHỎNG CARD HỌC SINH */}
        <div className="p-6 flex flex-col items-center">
          <div
            className="w-full max-w-sm rounded-3xl border-2 p-6 flex flex-col items-center text-center shadow-lg transition-all duration-300 relative"
            style={{
              backgroundColor: isOpened ? '#FEF8EC' : '#FFFDF8',
              borderColor: isOpened ? '#F2B84B' : tier.borderColor,
            }}
          >
            {/* BADGE CẤP RƯƠNG */}
            <div
              className="text-[11px] font-bold px-3 py-1 rounded-full border mb-4"
              style={{
                backgroundColor: tier.badgeBg,
                color: tier.badgeText,
                borderColor: tier.borderColor,
              }}
            >
              {tier.name} • {tier.sizeLabel}
            </div>

            {/* MINH HỌA RƯƠNG */}
            <div className="my-2">
              <ChestIllustration
                tier={reward.tierKey}
                state={simulationState}
                size={isOpened ? 120 : 100}
                animationsEnabled={true}
              />
            </div>

            {/* NỘI DUNG HIỂN THỊ */}
            {!isOpened ? (
              <div className="mt-4 space-y-3 w-full">
                <p className="text-xs text-[#2F3E6B] italic font-medium leading-relaxed bg-[#FAF5EB] p-3 rounded-2xl border border-[#E6DCC8]/70">
                  "{reward.teaserDescription}"
                </p>

                <div className="flex items-center justify-center gap-4 text-xs text-[#6B7280] py-1 border-y border-[#E6DCC8]/60">
                  <span>Yêu cầu: <strong>{reward.requiredXp || reward.xpCost} XP</strong></span>
                  <span>•</span>
                  <span>Điểm danh: <strong>{reward.requiredAttendanceDays} ngày</strong></span>
                </div>

                {simulationState === 'given' ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSimulationState('opened')}
                      className="w-full py-2.5 rounded-2xl bg-[#E2704A] hover:bg-[#C95C38] text-white font-bold text-xs shadow-md animate-bounce flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Mở rương ngay!</span>
                    </button>
                    <p className="text-[10px] text-[#8C7E6A] mt-1.5">
                      Thầy/cô đã trao quà! Bấm để khám phá món quà bí mật
                    </p>
                  </div>
                ) : simulationState === 'eligible' ? (
                  <div className="w-full py-2.5 rounded-2xl bg-[#2F3E6B] text-white font-bold text-xs shadow-xs">
                    Gửi yêu cầu nhận quà
                  </div>
                ) : (
                  <div className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-400 font-semibold text-xs flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cần thêm nỗ lực để mở khóa</span>
                  </div>
                )}
              </div>
            ) : (
              /* ĐÃ MỞ RƯƠNG - HÉ LỘ MÓN QUÀ BÍ MẬT THẬT */
              <div className="mt-4 space-y-3 w-full animate-[fadeIn_0.3s_ease]">
                <div className="p-4 rounded-2xl bg-[#FAF5EB] border border-[#F2B84B]/60 text-left space-y-1.5 shadow-inner">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#E2704A]" />
                    <span className="text-xs font-bold text-[#E2704A] uppercase tracking-wider">
                      Món quà bí mật em nhận được:
                    </span>
                  </div>
                  <h3 className="font-lora font-bold text-base text-[#2F3E6B]">
                    {reward.secret?.name}
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    {reward.secret?.description}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-[#2E5E3D] font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Đã lưu vào bộ sưu tập quà tặng của em</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2 max-w-sm">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <p>
              Học sinh chỉ nhìn thấy mô tả gợi mở. Tên thật "{reward.secret?.name}" chỉ xuất hiện khi
              được giáo viên duyệt "Đã trao" và học sinh bấm "Mở rương ngay!".
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[#E6DCC8]/80 bg-[#FAF5EB]/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2F3E6B] text-white text-xs font-bold hover:bg-[#23325B] transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
