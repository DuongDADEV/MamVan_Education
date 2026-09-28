import React from 'react';
import { RewardTier, RewardRequest, RewardStatus } from '../../types.ts';
import { getChestTierConfig } from '../../config.ts';
import { ChestIllustration } from './ChestIllustration.tsx';
import { Clock, Sparkles, CheckCircle2, XCircle, Gift, AlertCircle, History } from 'lucide-react';

interface RequestHistoryProps {
  requests: RewardRequest[];
  rewards: RewardTier[];
  onOpenChest?: (reward: RewardTier, request: RewardRequest) => void;
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({
  requests,
  rewards,
  onOpenChest,
}) => {
  const getStatusBadge = (status: RewardStatus, req: RewardRequest, reward?: RewardTier) => {
    switch (status) {
      case 'OPENED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF5F0] border border-[#D4E2D7] text-[#2D5A3D] flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4D8F5A]" />
            <span>Đã mở rương</span>
          </span>
        );
      case 'GIVEN':
        return (
          <button
            onClick={() => reward && onOpenChest?.(reward, req)}
            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #E2704A 0%, #F2B84B 100%)',
            }}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Mở rương ngay!</span>
          </button>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF8EC] border border-[#F8DE9F] text-[#9A6B12] flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F2B84B]" />
            <span>Đã duyệt (Chờ trao)</span>
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5EB] border border-[#EADBBE] text-[#7A6A55] flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#C98A2C]" />
            <span>Chờ thầy/cô duyệt</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5EB] border border-[#EADBBE] text-[#8C7A65] flex items-center gap-1.5 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-[#E2704A]" />
            <span>Cần cố gắng thêm</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-7 border border-[#E6DCC8] shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EFE9DF]">
        <div className="w-8 h-8 rounded-xl bg-[#FAF5EB] border border-[#EADBBE] flex items-center justify-center text-[#7A6A55]">
          <History className="w-4 h-4 text-[#8C7A65]" />
        </div>
        <div>
          <h3
            className="text-base sm:text-lg font-bold text-[#2F3E6B]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            Lịch sử đề xuất nhận quà ({requests.length})
          </h3>
          <p className="text-xs text-[#5C6A79]">
            Theo dõi trạng thái duyệt và trao quà của giáo viên
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#8C7A65] italic">
          Em chưa gửi yêu cầu nhận quà nào. Hãy tích lũy đủ XP và ngày học để gửi thầy/cô nhé!
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const reward = rewards.find((r) => r.id === req.rewardId);
            const tierConfig = reward
              ? getChestTierConfig(reward.requiredXp, reward.tierKey)
              : null;
            const isOpened = req.status === 'OPENED';

            // QUY TẮC: Nếu chưa mở, TUYỆT ĐỐI không hiển thị tên quà thật!
            const titleDisplay = isOpened
              ? reward?.secret.name || 'Quà tặng'
              : `Quà bí mật (${tierConfig?.name || 'Rương quà'})`;

            return (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-[#EADBBE] bg-[#FAF5EB]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:bg-[#FAF5EB] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#E6DCC8] flex items-center justify-center shrink-0 shadow-xs">
                    {reward && (
                      <ChestIllustration
                        tier={reward.tierKey}
                        state={isOpened ? 'opened' : req.status === 'APPROVED' ? 'approved' : req.status === 'GIVEN' ? 'given' : 'locked'}
                        size={36}
                        animationsEnabled={false}
                      />
                    )}
                  </div>
                  <div>
                    <h4
                      className="text-sm font-bold text-[#2F3E6B]"
                      style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                      {titleDisplay}
                    </h4>
                    <p className="text-[11px] text-[#7A6A55] mt-0.5">
                      Gửi lúc: {new Date(req.requestedAt).toLocaleDateString('vi-VN')}
                      {req.rejectReason && req.status === 'REJECTED' && (
                        <span className="block text-[#B84E2A] mt-0.5 font-medium">
                          Lời nhắn: {req.rejectReason}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {getStatusBadge(req.status, req, reward)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
