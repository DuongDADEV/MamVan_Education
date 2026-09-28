import React from 'react';
import { RewardTier, RewardRequest } from '../../types.ts';
import { getChestTierConfig } from '../../config.ts';
import { ChestIllustration, ChestVisualState } from './ChestIllustration.tsx';
import { Send, Clock, Sparkles, Gift, Lock, Calendar, Flame, AlertCircle } from 'lucide-react';

interface ChestCardProps {
  reward: RewardTier;
  currentXp: number;
  currentAttendanceDays: number;
  activeRequest?: RewardRequest;
  onRequestReward: (rewardId: string) => void;
  onOpenChest: (reward: RewardTier, request: RewardRequest) => void;
  animationsEnabled?: boolean;
}

/**
 * Component Thẻ Rương Quà Bí Mật:
 * - Tuyệt đối KHÔNG hiển thị tên món quà thật hay hình/icon của món quà thật
 * - Hiển thị tên rương, nhãn kích cỡ quà, mô tả gợi mở và thanh tiến độ
 * - Nút tương ứng 7 trạng thái của luồng nhận quà
 */
export const ChestCard: React.FC<ChestCardProps> = ({
  reward,
  currentXp,
  currentAttendanceDays,
  activeRequest,
  onRequestReward,
  onOpenChest,
  animationsEnabled = true,
}) => {
  const tierConfig = getChestTierConfig(reward.requiredXp, reward.tierKey);

  // Điều kiện
  const xpNeeded = Math.max(0, reward.requiredXp - currentXp);
  const daysNeeded = Math.max(0, reward.requiredAttendanceDays - currentAttendanceDays);
  const isXpMet = currentXp >= reward.requiredXp;
  const isDaysMet = currentAttendanceDays >= reward.requiredAttendanceDays;
  const isEligible = isXpMet && isDaysMet;

  // Trạng thái từ request
  const reqStatus = activeRequest?.status;
  const isPending = reqStatus === 'PENDING_APPROVAL';
  const isApproved = reqStatus === 'APPROVED';
  const isGiven = reqStatus === 'GIVEN';
  const isOpened = reqStatus === 'OPENED';
  const isRejected = reqStatus === 'REJECTED';

  // Xác định visual state cho ChestIllustration
  let visualState: ChestVisualState = 'locked';
  if (isOpened) {
    visualState = 'opened';
  } else if (isGiven) {
    visualState = 'given';
  } else if (isApproved) {
    visualState = 'approved';
  } else if (isPending) {
    visualState = 'pending';
  } else if (isEligible) {
    visualState = 'eligible';
  }

  // Tỉ lệ hoàn thành tiến độ (%)
  const xpProgressRatio = Math.min(1, currentXp / reward.requiredXp);
  const daysProgressRatio = Math.min(1, currentAttendanceDays / reward.requiredAttendanceDays);
  const totalProgressPercent = Math.round(((xpProgressRatio + daysProgressRatio) / 2) * 100);

  return (
    <div
      id={`chest-card-${reward.id}`}
      className={`bg-[#FFFDF8] rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between h-full select-none ${
        visualState === 'eligible' || visualState === 'given'
          ? 'border-[#E2704A]/60 shadow-md shadow-[#E2704A]/10 hover:-translate-y-1'
          : visualState === 'approved'
          ? 'border-[#F2B84B]/70 shadow-md shadow-[#F2B84B]/15'
          : 'border-[#E6DCC8] shadow-xs hover:border-[#D4C4A8]'
      }`}
      aria-label={`${tierConfig.name} - ${tierConfig.sizeLabel}`}
    >
      {/* PHẦN ĐẦU: MINH HỌA RƯƠNG LỚN & NHÃN KÍCH CỠ */}
      <div>
        {/* Thanh tiêu đề nhỏ trên đỉnh thẻ */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
            style={{
              backgroundColor: tierConfig.badgeBg,
              color: tierConfig.badgeText,
              borderColor: tierConfig.borderColor,
            }}
          >
            {tierConfig.sizeLabel}
          </span>

          {/* Nhãn trạng thái nhỏ */}
          {isOpened ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF5F0] text-[#2D5A3D] border border-[#D4E2D7]">
              Đã mở rương
            </span>
          ) : isGiven ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF8EC] text-[#9A6B12] border border-[#F8DE9F] animate-pulse">
              Đã trao · Sẵn sàng mở!
            </span>
          ) : isApproved ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF1F7] text-[#2F3E6B] border border-[#C7D3E5]">
              Thầy/cô đã duyệt
            </span>
          ) : isPending ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EB] text-[#7A6A55] border border-[#EADBBE]">
              Đang chờ duyệt
            </span>
          ) : null}
        </div>

        {/* MINH HỌA RƯƠNG TRUNG TÂM */}
        <div className="flex justify-center items-center py-4 my-1">
          <ChestIllustration
            tier={reward.tierKey}
            state={visualState}
            size={tierConfig.baseSizePx}
            animationsEnabled={animationsEnabled}
          />
        </div>

        {/* TÊN RƯƠNG & MÔ TẢ GỢI MỞ */}
        <div className="text-center mt-2 mb-4">
          <h4
            className="text-lg font-bold text-[#2F3E6B]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {tierConfig.name}
          </h4>
          <p className="text-xs text-[#5C6A79] leading-relaxed mt-1 px-1">
            {reward.teaserDescription || tierConfig.defaultTeaser}
          </p>
        </div>

        {/* CÁC CHIP YÊU CẦU TUẦN */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FEF8EC] text-[#9A6B12] border border-[#F8DE9F] text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-[#F2B84B]" />
            <span>{reward.requiredXp} XP</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EFF5F0] text-[#2D5A3D] border border-[#D4E2D7] text-xs font-bold font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#4D8F5A]" />
            <span>{reward.requiredAttendanceDays} ngày</span>
          </div>
        </div>
      </div>

      {/* PHẦN ĐÁY: TIẾN ĐỘ & NÚT HÀNH ĐỘNG THEO 7 TRẠNG THÁI */}
      <div className="pt-4 border-t border-[#EFE9DF] mt-2 space-y-3">
        {/* TRẠNG THÁI 1: CHƯA ĐỦ ĐIỀU KIỆN (KHÓA) */}
        {!isEligible && !isPending && !isApproved && !isGiven && !isOpened && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-semibold text-[#7A6A55]">
              <span>Tiến độ mở khóa:</span>
              <span className="font-mono font-bold text-[#2F3E6B]">
                {currentXp}/{reward.requiredXp} XP · {currentAttendanceDays}/{reward.requiredAttendanceDays} ngày
              </span>
            </div>
            {/* Thanh tiến độ */}
            <div className="w-full h-2 bg-[#EFE9DF] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalProgressPercent}%`,
                  background: 'linear-gradient(90deg, #7FA88A 0%, #E2704A 100%)',
                }}
              />
            </div>
            {/* Nút mờ thông báo phần còn thiếu */}
            <button
              disabled
              className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF5EB] border border-[#EADBBE] text-[#8C7A65] text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
            >
              <Lock className="w-3.5 h-3.5 text-[#A69782]" />
              <span>
                {xpNeeded > 0 && daysNeeded > 0
                  ? `Còn thiếu ${xpNeeded} XP & ${daysNeeded} ngày`
                  : xpNeeded > 0
                  ? `Còn thiếu ${xpNeeded} XP tuần`
                  : `Cần điểm danh thêm ${daysNeeded} ngày`}
              </span>
            </button>
          </div>
        )}

        {/* TRẠNG THÁI 2: ĐỦ ĐIỀU KIỆN (CHƯA GỬI YÊU CẦU HOẶC ĐÃ BỊ TỪ CHỐI) */}
        {isEligible && (!activeRequest || isRejected) && (
          <div className="space-y-2">
            {isRejected && activeRequest?.rejectReason && (
              <div className="p-2.5 rounded-xl bg-[#FAF5EB] border border-[#EADBBE] text-[11px] text-[#7A6A55] flex items-start gap-1.5 leading-snug">
                <AlertCircle className="w-3.5 h-3.5 text-[#E2704A] shrink-0 mt-0.5" />
                <span>Lời nhắn: {activeRequest.rejectReason}</span>
              </div>
            )}
            <button
              onClick={() => onRequestReward(reward.id)}
              className="w-full py-3 px-4 rounded-2xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-[0.99]"
              style={{
                backgroundColor: '#E2704A',
                boxShadow: '0 4px 12px rgba(226, 112, 74, 0.28)',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi yêu cầu mở rương tới thầy/cô</span>
            </button>
          </div>
        )}

        {/* TRẠNG THÁI 3: ĐÃ GỬI YÊU CẦU (CHỜ DUYỆT) */}
        {isPending && (
          <div className="w-full py-3 px-4 rounded-2xl bg-[#FAF5EB] border border-[#EADBBE] text-[#7A6A55] text-xs font-bold text-center flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#C98A2C] animate-spin" />
            <span>Đang chờ thầy/cô duyệt...</span>
          </div>
        )}

        {/* TRẠNG THÁI 4: ĐÃ DUYỆT, CHỜ TRAO */}
        {isApproved && (
          <div className="w-full py-3 px-4 rounded-2xl bg-[#FEF8EC] border border-[#F8DE9F] text-[#9A6B12] text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#F2B84B] animate-pulse" />
            <span>Đã duyệt! Chờ thầy/cô trao rương</span>
          </div>
        )}

        {/* TRẠNG THÁI 5: ĐÃ TRAO (BẤM ĐỂ MỞ RƯƠNG BÍ MẬT!) */}
        {isGiven && (
          <button
            onClick={() => onOpenChest(reward, activeRequest!)}
            className="w-full py-3.5 px-4 rounded-2xl text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] animate-[pulse_2s_infinite]"
            style={{
              background: 'linear-gradient(135deg, #E2704A 0%, #F2B84B 100%)',
              boxShadow: '0 6px 18px rgba(242, 184, 75, 0.35)',
            }}
          >
            <Gift className="w-4 h-4 text-[#FFFDF8]" />
            <span>Mở rương ngay!</span>
          </button>
        )}

        {/* TRẠNG THÁI 6: ĐÃ MỞ (CHUYỂN VÀO BỘ SƯU TẬP) */}
        {isOpened && (
          <div className="w-full py-2.5 px-3 rounded-2xl bg-[#EFF5F0] border border-[#D4E2D7] text-[#2D5A3D] text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4D8F5A]" />
            <span>Đã nhận quà · Xem trong bộ sưu tập</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChestCard;
