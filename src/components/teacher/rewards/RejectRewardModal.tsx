import React, { useState } from 'react';
import { EnrichedRewardRequest } from '../../../services/types.ts';
import { X, AlertCircle, HeartHandshake, Send } from 'lucide-react';

interface RejectRewardModalProps {
  isOpen: boolean;
  request: EnrichedRewardRequest | null;
  onClose: () => void;
  onConfirmReject: (requestId: string, reason: string) => Promise<void>;
}

const GENTLE_REASONS = [
  'Tuần này em chưa tích lũy đủ số ngày điểm danh, cô trò mình cùng cố gắng đều đặn hơn ở tuần sau nhé!',
  'Mức XP tuần của em chưa đạt mốc yêu cầu của rương này. Em hãy tiếp tục làm thêm các bài luyện tập nhé!',
  'Mốc quà này hiện đã hết số lượng trong tuần, thầy/cô sẽ bổ sung thêm vào đầu tuần sau để tặng em nhé!',
  'Cô nhận thấy em có nhiều tiến bộ nhưng tuần này chưa kịp mở rương. Giờ ra chơi hãy gặp cô để nhận một lời động viên đặc biệt nhé!',
];

export const RejectRewardModal: React.FC<RejectRewardModalProps> = ({
  isOpen,
  request,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState<string>(GENTLE_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Bắt buộc ghi lý do từ chối bằng giọng nhẹ nhàng để học sinh không nản lòng.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirmReject(request.id, reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23325B]/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease]">
      <div
        className="bg-[#FFFDF8] border border-[#E6DCC8] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[scaleUp_0.15s_ease]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E6DCC8]/80 bg-[#FAF5EB]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <HeartHandshake className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 id="reject-modal-title" className="font-lora font-bold text-base text-[#2F3E6B]">
                Nhắn gửi nhẹ nhàng tới học sinh
              </h2>
              <p className="text-xs text-[#6B7280]">
                Từ chối yêu cầu đổi quà của học sinh: <strong>{request.studentName}</strong>
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

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* ĐỐI CHIẾU SỐ LIỆU */}
          <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[#E6DCC8] text-xs text-[#4B5563] space-y-1">
            <div className="flex justify-between">
              <span>Học sinh / Lớp:</span>
              <strong className="text-[#2F3E6B]">{request.studentName} ({request.className})</strong>
            </div>
            <div className="flex justify-between">
              <span>XP tuần thực tế / Yêu cầu:</span>
              <span className={request.xpWeekActual! < (request.reward?.requiredXp || 0) ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                {request.xpWeekActual} / {request.reward?.requiredXp || 0} XP
              </span>
            </div>
            <div className="flex justify-between">
              <span>Điểm danh tuần / Yêu cầu:</span>
              <span className={request.attendanceDaysActual! < (request.reward?.requiredAttendanceDays || 0) ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                {request.attendanceDaysActual} / {request.reward?.requiredAttendanceDays || 0} ngày
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
              Gợi ý lời nhắn sư phạm (bấm để chọn nhanh):
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {GENTLE_REASONS.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full text-left text-[11px] p-2 rounded-xl border transition-all ${
                    reason === r
                      ? 'border-[#2F3E6B] bg-[#2F3E6B]/5 text-[#2F3E6B] font-semibold'
                      : 'border-[#E6DCC8] bg-[#FFFDF8] hover:bg-[#FAF5EB] text-[#4B5563]'
                  }`}
                >
                  "{r}"
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F3E6B] mb-1.5">
              Nội dung lời nhắn gửi học sinh *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do với giọng điệu nhẹ nhàng, khích lệ em cố gắng..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1C7B7] bg-[#FFFDF8] text-xs text-[#2F3E6B] focus:outline-none focus:border-[#2F3E6B] focus:ring-1 focus:ring-[#2F3E6B]"
              required
            />
          </div>

          <p className="text-[11px] text-[#8C7E6A] italic">
            Lời nhắn này sẽ hiển thị trong lịch sử yêu cầu của học sinh để các em hiểu và tiếp tục phấn đấu.
          </p>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6DCC8]/70">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#D1C7B7] hover:bg-[#FAF5EB] text-xs font-semibold text-[#4B5563]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi lời nhắn & Từ chối'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
