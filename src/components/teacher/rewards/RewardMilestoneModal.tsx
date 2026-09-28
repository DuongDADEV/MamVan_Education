import React, { useState, useEffect } from 'react';
import { RewardItem, ChestTierKey } from '../../../types.ts';
import { CHEST_TIERS, getChestTierConfig } from '../../../config.ts';
import { ChestIllustration } from '../../rewards/ChestIllustration.tsx';
import { X, Gift, Sparkles, Eye, AlertCircle, Check, Info } from 'lucide-react';

interface RewardMilestoneModalProps {
  isOpen: boolean;
  reward: RewardItem | null;
  onClose: () => void;
  onSave: (data: Partial<RewardItem>) => Promise<void>;
}

export const RewardMilestoneModal: React.FC<RewardMilestoneModalProps> = ({
  isOpen,
  reward,
  onClose,
  onSave,
}) => {
  const [requiredXp, setRequiredXp] = useState<number>(300);
  const [requiredAttendanceDays, setRequiredAttendanceDays] = useState<number>(4);
  const [teaserDescription, setTeaserDescription] = useState<string>('');
  const [secretName, setSecretName] = useState<string>('');
  const [secretDescription, setSecretDescription] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [isPhysical, setIsPhysical] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reward) {
      setRequiredXp(reward.requiredXp || reward.xpCost || 300);
      setRequiredAttendanceDays(reward.requiredAttendanceDays || 4);
      setTeaserDescription(reward.teaserDescription || '');
      setSecretName(reward.secret?.name || '');
      setSecretDescription(reward.secret?.description || '');
      setStock(reward.stock !== undefined && reward.stock !== null ? String(reward.stock) : '');
      setIsPhysical(reward.isPhysical !== false);
      setIsActive(reward.isActive !== false);
    } else {
      setRequiredXp(300);
      setRequiredAttendanceDays(4);
      setTeaserDescription('Một món quà bất ngờ dành cho tuần học chuyên cần.');
      setSecretName('Bộ thẻ ghi nhớ văn học');
      setSecretDescription('Bộ 10 thẻ tóm tắt mẹo làm văn tự sự và biểu cảm ép bóng đẹp mắt.');
      setStock('');
      setIsPhysical(true);
      setIsActive(true);
    }
    setError(null);
  }, [reward, isOpen]);

  if (!isOpen) return null;

  // Tự động xác định cấp rương theo XP cấu hình
  const currentTierConfig = getChestTierConfig(requiredXp);
  const calculatedTierKey: ChestTierKey = currentTierConfig.key;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teaserDescription.trim()) {
      setError('Vui lòng nhập mô tả gợi mở cho học sinh');
      return;
    }
    if (!secretName.trim()) {
      setError('Vui lòng nhập tên món quà bí mật thật');
      return;
    }
    if (requiredXp < 50) {
      setError('Mức XP tuần yêu cầu phải từ 50 XP trở lên');
      return;
    }
    if (requiredAttendanceDays < 1 || requiredAttendanceDays > 7) {
      setError('Số ngày điểm danh yêu cầu phải từ 1 đến 7 ngày');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        id: reward ? reward.id : undefined,
        requiredXp,
        xpCost: requiredXp,
        requiredAttendanceDays,
        tierKey: calculatedTierKey,
        teaserDescription: teaserDescription.trim(),
        secret: {
          name: secretName.trim(),
          description: secretDescription.trim(),
        },
        stock: stock.trim() ? Math.max(0, parseInt(stock, 10)) : undefined,
        isPhysical,
        isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu mốc phần thưởng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23325B]/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease]">
      <div
        className="bg-[#FFFDF8] border border-[#E6DCC8] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-[scaleUp_0.15s_ease]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-modal-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E6DCC8]/80 bg-[#FAF5EB]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2704A]/10 text-[#E2704A] flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 id="milestone-modal-title" className="font-lora font-bold text-lg text-[#2F3E6B]">
                {reward ? 'Chỉnh sửa mốc quà tặng bí mật' : 'Tạo mới mốc quà tặng bí mật'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                Cấu hình mốc tuần, hình thức rương và món quà học sinh sẽ nhận khi mở
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#E6DCC8]/50 text-[#6B7280] hover:text-[#2F3E6B] flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* KHU VỰC LIVE PREVIEW RƯƠNG TỰ ĐỔI CẤP */}
          <div className="rounded-2xl border border-[#E6DCC8] p-4.5 bg-[#FAF5EB]/50 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FFFDF8] border border-[#E6DCC8] shadow-xs">
              <ChestIllustration
                tier={calculatedTierKey}
                state="eligible"
                size={84}
                animationsEnabled={false}
              />
              <span
                className="mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: currentTierConfig.badgeBg,
                  color: currentTierConfig.badgeText,
                  borderColor: currentTierConfig.borderColor,
                }}
              >
                {currentTierConfig.name} ({currentTierConfig.sizeLabel})
              </span>
            </div>

            <div className="flex-1 space-y-1.5 text-xs text-[#4B5563]">
              <div className="flex items-center gap-1.5 font-semibold text-[#2F3E6B]">
                <Sparkles className="w-4 h-4 text-[#F2B84B]" />
                <span>Xem trước rương học sinh nhìn thấy</span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Cấp rương tự động chuyển đổi theo mức XP tuần: <strong>≤300 XP (Hạt)</strong>,{' '}
                <strong>301-500 XP (Lá)</strong>, <strong>501-700 XP (Hoa)</strong>,{' '}
                <strong>&gt;700 XP (Vàng)</strong>.
              </p>
              <div className="p-2 rounded-xl bg-[#FFFDF8] border border-[#E6DCC8] text-[11px] text-[#2F3E6B] italic">
                "{teaserDescription || 'Mô tả gợi mở sẽ hiển thị ở đây...'}"
              </div>
            </div>
          </div>

          {/* ĐIỀU KIỆN ĐẠT QUÀ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
                Mức XP tuần yêu cầu *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={50}
                  max={2000}
                  step={10}
                  value={requiredXp}
                  onChange={(e) => setRequiredXp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-sm text-[#2F3E6B] font-semibold focus:outline-none focus:border-[#2F3E6B] focus:ring-1 focus:ring-[#2F3E6B]"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7E6A] font-semibold">
                  XP / tuần
                </span>
              </div>
              <p className="text-[11px] text-[#8C7E6A] mt-1">
                Thuộc nhóm: <strong>{currentTierConfig.name}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
                Số ngày điểm danh tối thiểu *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={requiredAttendanceDays}
                  onChange={(e) => setRequiredAttendanceDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-sm text-[#2F3E6B] font-semibold focus:outline-none focus:border-[#2F3E6B] focus:ring-1 focus:ring-[#2F3E6B]"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7E6A] font-semibold">
                  ngày / tuần
                </span>
              </div>
              <p className="text-[11px] text-[#8C7E6A] mt-1">
                Khuyến nghị: 3 đến 5 ngày
              </p>
            </div>
          </div>

          {/* MÔ TẢ GỢI MỞ DÀNH CHO HỌC SINH */}
          <div>
            <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
              Mô tả gợi mở cho học sinh (Teaser Description) *
            </label>
            <textarea
              rows={2}
              value={teaserDescription}
              onChange={(e) => setTeaserDescription(e.target.value)}
              placeholder="VD: Một món quà nhỏ xinh cho bước khởi đầu chăm chỉ. (Không nêu cụ thể món đồ)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-xs text-[#2F3E6B] focus:outline-none focus:border-[#2F3E6B] focus:ring-1 focus:ring-[#2F3E6B]"
              required
            />
            <p className="text-[11px] text-[#8C7E6A] mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#E2704A]" />
              <span>
                Quy tắc sư phạm: Giữ tính tò mò bí mật, không ghi tên món quà cụ thể ở đây.
              </span>
            </p>
          </div>

          {/* MÓN QUÀ THẬT (SECRET) - CHỈ GIÁO VIÊN THẤY */}
          <div className="rounded-2xl border-2 border-dashed border-[#E2704A]/40 p-4 bg-[#FAF5EB]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E2704A]" />
                <h4 className="text-xs font-bold text-[#2F3E6B] uppercase tracking-wider">
                  Món quà bí mật thật (Chỉ giáo viên thấy)
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2704A]/10 text-[#E2704A] font-semibold">
                Bảo mật tuyệt đối
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
              Thông tin này chỉ hiển thị cho học sinh sau khi thầy/cô đã trao quà và học sinh bấm
              "Mở rương ngay!".
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#2F3E6B] mb-1">
                Tên món quà thật *
              </label>
              <input
                type="text"
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                placeholder="VD: Bookmark Mầm Mực thủ công / Sổ tay Giấy & Mực"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-xs text-[#2F3E6B] font-semibold focus:outline-none focus:border-[#2F3E6B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2F3E6B] mb-1">
                Mô tả chi tiết món quà thật
              </label>
              <textarea
                rows={2}
                value={secretDescription}
                onChange={(e) => setSecretDescription(e.target.value)}
                placeholder="VD: Thẻ kẹp sách vẽ tay ép bóng bền đẹp, giáo viên đề tặng chữ ký và lời khen riêng cho em."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-xs text-[#2F3E6B] focus:outline-none focus:border-[#2F3E6B]"
              />
            </div>
          </div>

          {/* SỐ LƯỢNG & TÙY CHỌN KHÁC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
                Số lượng còn lại (Tùy chọn)
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Để trống = Vô hạn"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-xs text-[#2F3E6B] focus:outline-none focus:border-[#2F3E6B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
                Loại phần thưởng
              </label>
              <select
                value={isPhysical ? 'physical' : 'digital'}
                onChange={(e) => setIsPhysical(e.target.value === 'physical')}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-xs text-[#2F3E6B] focus:outline-none focus:border-[#2F3E6B]"
              >
                <option value="physical">Quà hiện vật (Bút, sổ, bookmark...)</option>
                <option value="digital">Đặc quyền lớp học (Chọn bài đọc, cộng điểm...)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
                Trạng thái hiển thị
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2F3E6B] border-[#D1C7B7] focus:ring-[#2F3E6B]"
                />
                <span className="text-xs text-[#2F3E6B] font-medium">
                  {isActive ? 'Đang mở cho học sinh đổi' : 'Tạm ẩn mốc này'}
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[#E6DCC8]/80 bg-[#FAF5EB]/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-[#D1C7B7] hover:bg-[#FAF5EB] text-xs font-semibold text-[#4B5563] transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#2F3E6B] hover:bg-[#23325B] text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : reward ? 'Lưu cập nhật' : 'Tạo mốc quà'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
