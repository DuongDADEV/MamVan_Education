import React from 'react';
import { MamMuc } from '../../MamMuc.tsx';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  mood?: 'happy' | 'cheer' | 'thinking' | 'sleepy' | 'proud' | 'waiting';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  mood = 'thinking',
}) => {
  return (
    <div className="bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto my-6 shadow-xs">
      {/* Luôn hiển thị bạn đồng hành Mầm Mực theo phong cách Giấy & Mực */}
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="relative">
          <MamMuc mood={mood} size="lg" className="mx-auto drop-shadow-xs" />
          {icon && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#FAF5EB] border border-[#E6DCC8] flex items-center justify-center text-[#2F3E6B] shadow-xs">
              {icon}
            </div>
          )}
        </div>
      </div>

      <h3 className="font-lora text-xl font-bold text-[#2F3E6B] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[#4B5563] leading-relaxed mb-6 font-normal">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E2704A] hover:bg-[#D45E36] text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
