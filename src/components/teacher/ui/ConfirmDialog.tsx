import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  variant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  let btnColor = 'bg-[#2F3E6B] hover:bg-[#253256] text-white';
  let iconBg = 'bg-[#2F3E6B]/10 text-[#2F3E6B]';

  if (variant === 'danger') {
    btnColor = 'bg-[#DC2626] hover:bg-[#B91C1C] text-white';
    iconBg = 'bg-rose-100 text-rose-600';
  } else if (variant === 'warning') {
    btnColor = 'bg-[#E2704A] hover:bg-[#D45E36] text-white';
    iconBg = 'bg-amber-100 text-[#E2704A]';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B4B]/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-[scaleUp_0.15s_ease]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#2F3E6B] hover:bg-[#FAF5EB] transition-colors"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {variant === 'danger' || variant === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="font-lora text-lg font-bold text-[#2F3E6B] mb-2">
              {title}
            </h3>
            <div className="text-sm text-[#4B5563] leading-relaxed mb-6 font-normal">
              {message}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl border border-[#E6DCC8] text-sm font-semibold text-[#4B5563] hover:bg-[#FAF5EB] hover:text-[#2F3E6B] transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-[0.98] ${btnColor}`}
              >
                {isLoading ? 'Đang xử lý...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
