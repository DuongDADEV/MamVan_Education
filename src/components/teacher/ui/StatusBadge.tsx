import React from 'react';

export type StatusVariant =
  | 'active'
  | 'locked'
  | 'new'
  | 'draft'
  | 'published'
  | 'archived'
  | 'pending'
  | 'graded'
  | 'approved';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let defaultLabel = status;

  switch (status) {
    case 'active':
      badgeStyle = 'bg-[#7FA88A]/15 text-[#2E5E3D] border-[#7FA88A]/40';
      dotColor = 'bg-[#7FA88A]';
      defaultLabel = 'Hoạt động';
      break;
    case 'locked':
      badgeStyle = 'bg-[#E2704A]/15 text-[#A23F1E] border-[#E2704A]/40';
      dotColor = 'bg-[#E2704A]';
      defaultLabel = 'Tạm khóa';
      break;
    case 'new':
      badgeStyle = 'bg-[#F2B84B]/20 text-[#8C5D00] border-[#F2B84B]/50';
      dotColor = 'bg-[#F2B84B]';
      defaultLabel = 'Chưa đăng nhập';
      break;
    case 'published':
      badgeStyle = 'bg-[#2F3E6B]/15 text-[#2F3E6B] border-[#2F3E6B]/40';
      dotColor = 'bg-[#2F3E6B]';
      defaultLabel = 'Đã xuất bản';
      break;
    case 'draft':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300';
      dotColor = 'bg-amber-400';
      defaultLabel = 'Bản nháp';
      break;
    case 'archived':
      badgeStyle = 'bg-stone-100 text-stone-600 border-stone-300';
      dotColor = 'bg-stone-400';
      defaultLabel = 'Lưu trữ';
      break;
    case 'pending':
    case 'PENDING_TEACHER':
    case 'PENDING_APPROVAL':
      badgeStyle = 'bg-[#E2704A]/15 text-[#E2704A] border-[#E2704A]/40';
      dotColor = 'bg-[#E2704A] animate-pulse';
      defaultLabel = 'Chờ xử lý';
      break;
    case 'graded':
    case 'GRADED':
    case 'approved':
    case 'APPROVED':
      badgeStyle = 'bg-[#7FA88A]/15 text-[#2E5E3D] border-[#7FA88A]/40';
      dotColor = 'bg-[#7FA88A]';
      defaultLabel = 'Đã duyệt';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label || defaultLabel}</span>
    </span>
  );
};
