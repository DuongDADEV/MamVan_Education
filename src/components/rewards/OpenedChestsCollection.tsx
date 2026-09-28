import React from 'react';
import { RewardTier, RewardRequest } from '../../types.ts';
import { getChestTierConfig } from '../../config.ts';
import { ChestIllustration } from './ChestIllustration.tsx';
import { MamMuc } from '../MamMuc.tsx';
import { Sparkles, Calendar, Award } from 'lucide-react';

interface OpenedChestsCollectionProps {
  openedRequests: {
    request: RewardRequest;
    reward: RewardTier;
  }[];
}

/**
 * Mục "Rương đã mở" (Bộ sưu tập quà tặng đã tiết lộ):
 * - Hiển thị các rương học sinh đã nhận và đã mở
 * - Tiết lộ tên món quà thật, ngày nhận và biểu tượng rương đã mở
 */
export const OpenedChestsCollection: React.FC<OpenedChestsCollectionProps> = ({
  openedRequests,
}) => {
  return (
    <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-7 border border-[#E6DCC8] shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFE9DF]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EFF5F0] border border-[#D4E2D7] flex items-center justify-center text-[#2D5A3D]">
            <Sparkles className="w-4 h-4 text-[#4D8F5A]" />
          </div>
          <div>
            <h3
              className="text-base sm:text-lg font-bold text-[#2F3E6B]"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              Rương đã mở ({openedRequests.length})
            </h3>
            <p className="text-xs text-[#5C6A79]">
              Bộ sưu tập những món quà em đã khám phá và nhận từ thầy/cô
            </p>
          </div>
        </div>
      </div>

      {openedRequests.length === 0 ? (
        <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
          <MamMuc mood="thinking" size="md" className="mb-2" />
          <p className="text-xs text-[#7A6A55] font-medium">
            Em chưa mở rương quà nào. Hãy tích lũy XP tuần này và xin thầy/cô trao rương nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {openedRequests.map(({ request, reward }) => {
            const tierConfig = getChestTierConfig(reward.requiredXp, reward.tierKey);
            const dateStr = new Date(request.openedAt || request.givenAt || request.requestedAt).toLocaleDateString('vi-VN');

            return (
              <div
                key={request.id}
                className="p-4 rounded-2xl bg-[#FAF5EB] border border-[#EADBBE] flex items-center gap-3.5 shadow-2xs hover:border-[#D8C6A5] transition-all"
              >
                {/* Rương mở toang */}
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E6DCC8] flex items-center justify-center shrink-0 shadow-xs">
                  <ChestIllustration
                    tier={reward.tierKey}
                    state="opened"
                    size={48}
                    animationsEnabled={false}
                  />
                </div>

                {/* Thông tin món quà đã tiết lộ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.2 rounded-md border"
                      style={{
                        backgroundColor: tierConfig.badgeBg,
                        color: tierConfig.badgeText,
                        borderColor: tierConfig.borderColor,
                      }}
                    >
                      {tierConfig.name}
                    </span>
                    <span className="text-[10px] text-[#8C7A65] flex items-center gap-0.5 font-mono">
                      <Calendar className="w-3 h-3 text-[#A69782]" />
                      {dateStr}
                    </span>
                  </div>

                  <h4
                    className="text-sm font-bold text-[#2F3E6B] truncate"
                    style={{ fontFamily: "'Lora', Georgia, serif" }}
                  >
                    {reward.secret.name}
                  </h4>
                  <p className="text-xs text-[#5C6A79] truncate mt-0.5">
                    {reward.secret.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpenedChestsCollection;
