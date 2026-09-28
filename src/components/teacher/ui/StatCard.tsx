import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
  trend?: {
    text: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgColor = 'bg-[#2F3E6B]/10',
  iconColor = 'text-[#2F3E6B]',
  onClick,
  trend,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-[#2F3E6B]/50 hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            {title}
          </p>
          <p className="font-lora text-3xl font-extrabold text-[#2F3E6B] mt-2 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-[#E6DCC8]/60 flex items-center justify-between text-xs">
          {subtext && <span className="text-[#4B5563] truncate">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-[#7FA88A]' : 'text-[#E2704A]'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
