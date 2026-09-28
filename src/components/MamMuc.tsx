import React from 'react';
import { MascotMood } from '../types.ts';

interface MamMucProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bubbleText?: string;
  className?: string;
  animate?: boolean;
}

export const MamMuc: React.FC<MamMucProps> = ({
  mood = 'happy',
  size = 'md',
  bubbleText,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: { w: 48, h: 56, text: 'text-xs' },
    md: { w: 80, h: 96, text: 'text-sm' },
    lg: { w: 120, h: 140, text: 'text-base' },
    xl: { w: 160, h: 190, text: 'text-lg' },
  };

  const { w, h } = sizeMap[size];

  // Render SVG mắt và miệng theo mood
  const renderFace = () => {
    switch (mood) {
      case 'cheer':
        return (
          <g>
            {/* Mắt lấp lánh hình cánh cung vui sướng */}
            <path d="M 36 50 Q 42 42 48 50" stroke="#FFFDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 64 50 Q 70 42 76 50" stroke="#FFFDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Miệng cười mở to phấn khích */}
            <path d="M 48 60 Q 56 70 64 60 Z" fill="#E2704A" />
            <ellipse cx="56" cy="65" rx="4" ry="2" fill="#F4A3A3" />
            {/* Má hồng */}
            <ellipse cx="32" cy="56" rx="5" ry="3" fill="#F4A3A3" opacity="0.8" />
            <ellipse cx="80" cy="56" rx="5" ry="3" fill="#F4A3A3" opacity="0.8" />
            {/* Tia sáng nhỏ hai bên */}
            <circle cx="28" cy="40" r="1.5" fill="#F2B84B" />
            <circle cx="84" cy="40" r="1.5" fill="#F2B84B" />
          </g>
        );

      case 'thinking':
        return (
          <g>
            {/* Mắt nhìn lên suy tư có chớp mắt */}
            <g className={animate ? 'mam-muc-eyes-blink' : ''}>
              <ellipse cx="44" cy="46" rx="5" ry="6" fill="#FFFDF8" />
              <circle cx="45" cy="44" r="3" fill="#1C243B" />
              <circle cx="46" cy="43" r="1" fill="#FFFDF8" />

              <ellipse cx="68" cy="46" rx="5" ry="6" fill="#FFFDF8" />
              <circle cx="69" cy="44" r="3" fill="#1C243B" />
              <circle cx="70" cy="43" r="1" fill="#FFFDF8" />
            </g>

            {/* Chân mày nhíu nhẹ */}
            <path d="M 40 38 Q 45 40 48 39" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 64 39 Q 67 40 72 38" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" />

            {/* Miệng chúm chím suy nghĩ */}
            <circle cx="56" cy="62" r="3.5" fill="#E2704A" />

            {/* Má hồng */}
            <ellipse cx="34" cy="54" rx="4" ry="2.5" fill="#F4A3A3" opacity="0.7" />
            <ellipse cx="78" cy="54" rx="4" ry="2.5" fill="#F4A3A3" opacity="0.7" />
          </g>
        );

      case 'sleepy':
        return (
          <g>
            {/* Mắt nhắm tít ngái ngủ */}
            <path d="M 36 50 Q 42 54 48 50" stroke="#FFFDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 64 50 Q 70 54 76 50" stroke="#FFFDF8" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Miệng ngáp tròn đáng yêu */}
            <ellipse cx="56" cy="62" rx="5.5" ry="7" fill="#E2704A" />

            {/* Chữ Z nhỏ ru ngủ */}
            <text x="78" y="38" fill="#7FA88A" fontSize="10" fontWeight="bold" opacity="0.9">z</text>
            <text x="85" y="30" fill="#7FA88A" fontSize="8" fontWeight="bold" opacity="0.7">z</text>

            {/* Má hồng */}
            <ellipse cx="33" cy="55" rx="5" ry="3" fill="#F4A3A3" opacity="0.8" />
            <ellipse cx="79" cy="55" rx="5" ry="3" fill="#F4A3A3" opacity="0.8" />
          </g>
        );

      case 'proud':
        return (
          <g>
            {/* Mắt cong tự hào mãn nguyện */}
            <path d="M 36 48 Q 42 42 48 48" stroke="#FFFDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 64 48 Q 70 42 76 48" stroke="#FFFDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Miệng cười tươi rộng */}
            <path d="M 46 58 Q 56 68 66 58" stroke="#FFFDF8" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Ngôi sao nhỏ sáng lấp lánh cạnh má */}
            <polygon points="26,38 28,43 33,44 29,48 30,53 26,50 22,53 23,48 19,44 24,43" fill="#F2B84B" />
            <polygon points="86,38 88,43 93,44 89,48 90,53 86,50 82,53 83,48 79,44 84,43" fill="#F2B84B" />

            {/* Má hồng đậm */}
            <ellipse cx="32" cy="55" rx="6" ry="3.5" fill="#F4A3A3" opacity="0.9" />
            <ellipse cx="80" cy="55" rx="6" ry="3.5" fill="#F4A3A3" opacity="0.9" />
          </g>
        );

      case 'waiting':
        return (
          <g>
            {/* Mắt mở tròn hiền từ chờ đợi có chớp mắt */}
            <g className={animate ? 'mam-muc-eyes-blink' : ''}>
              <circle cx="42" cy="48" r="6" fill="#FFFDF8" />
              <circle cx="43" cy="48" r="3.5" fill="#1C243B" />
              <circle cx="44" cy="46" r="1.5" fill="#FFFDF8" />

              <circle cx="70" cy="48" r="6" fill="#FFFDF8" />
              <circle cx="69" cy="48" r="3.5" fill="#1C243B" />
              <circle cx="70" cy="46" r="1.5" fill="#FFFDF8" />
            </g>

            {/* Miệng mỉm cười nhẹ */}
            <path d="M 50 60 Q 56 64 62 60" stroke="#FFFDF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Má hồng */}
            <ellipse cx="33" cy="55" rx="4.5" ry="3" fill="#F4A3A3" opacity="0.75" />
            <ellipse cx="79" cy="55" rx="4.5" ry="3" fill="#F4A3A3" opacity="0.75" />
          </g>
        );

      case 'happy':
      default:
        return (
          <g>
            {/* Mắt to tròn long lanh có chớp mắt tự nhiên */}
            <g className={animate ? 'mam-muc-eyes-blink' : ''}>
              <circle cx="42" cy="47" r="6.5" fill="#FFFDF8" />
              <circle cx="43" cy="47" r="4" fill="#1C243B" />
              <circle cx="44" cy="45" r="1.8" fill="#FFFDF8" />
              <circle cx="41" cy="49" r="0.8" fill="#FFFDF8" />

              <circle cx="70" cy="47" r="6.5" fill="#FFFDF8" />
              <circle cx="69" cy="47" r="4" fill="#1C243B" />
              <circle cx="70" cy="45" r="1.8" fill="#FFFDF8" />
              <circle cx="67" cy="49" r="0.8" fill="#FFFDF8" />
            </g>

            {/* Miệng cười thân thiện */}
            <path d="M 48 59 Q 56 67 64 59" stroke="#FFFDF8" strokeWidth="2.8" fill="none" strokeLinecap="round" />

            {/* Má hồng phấn */}
            <ellipse cx="32" cy="54" rx="5" ry="3" fill="#F4A3A3" opacity="0.8" />
            <ellipse cx="80" cy="54" rx="5" ry="3" fill="#F4A3A3" opacity="0.8" />
          </g>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Giọt mực SVG */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={w}
          height={h}
          viewBox="0 0 112 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-sm transition-transform duration-300 hover:scale-105 ${
            animate ? 'mam-muc-idle-float' : ''
          }`}
        >
          <defs>
            {/* Gradient thân giọt mực - Creative Indigo & Electric Purple */}
            <linearGradient id="inkBodyGrad" x1="56" y1="26" x2="56" y2="108" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="0.55" stopColor="#4F46E5" />
              <stop offset="1" stopColor="#312E81" />
            </linearGradient>

            {/* Gradient lá chồi non - Emerald Mint */}
            <linearGradient id="sproutGrad" x1="56" y1="2" x2="56" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>

            {/* Ánh sáng trên vai giọt mực */}
            <linearGradient id="highlightGrad" x1="36" y1="36" x2="48" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* CHỒI LÁ TRÊN ĐẦU (Với chuyển động nhún lắc nhẹ nhàng) */}
          <g className={animate ? 'mam-muc-sprout-idle' : ''}>
            {/* Cuống mầm nhỏ */}
            <path d="M 56 26 Q 56 16 56 12" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
            
            {/* Lá trái */}
            <path
              d="M 56 16 C 46 12 40 4 48 2 C 54 8 56 14 56 16 Z"
              fill="url(#sproutGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
            {/* Gân lá trái */}
            <path d="M 55 14 Q 50 8 49 5" stroke="#065F46" strokeWidth="0.8" fill="none" opacity="0.6" />

            {/* Lá phải nhỏ hơn */}
            <path
              d="M 56 14 C 64 12 68 6 63 3 C 58 7 56 12 56 14 Z"
              fill="url(#sproutGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
          </g>

          {/* BÓNG DƯỚI ĐÁY */}
          <ellipse cx="56" cy="116" rx="28" ry="6" fill="#C7D2FE" opacity="0.6" />

          {/* THÂN GIỌT MỰC DỄ THƯƠNG */}
          {/* Đường cong giọt nước phúng phính: thuôn ở đỉnh (x=56, y=26) và phình to ở bụng (y=75..95) */}
          <path
            d="M 56 26 
               C 66 42 88 56 90 78 
               C 92 98 76 112 56 112 
               C 36 112 20 98 22 78 
               C 24 56 46 42 56 26 Z"
            fill="url(#inkBodyGrad)"
            stroke="#1E1B4B"
            strokeWidth="2.5"
          />

          {/* VỆT SÁNG BÓNG TRÊN THÂN MỰC (Specular Reflection) */}
          <path
            d="M 36 44 
               C 30 54 28 66 30 76 
               C 31 82 34 88 38 90
               C 34 84 34 72 36 62
               C 38 52 44 46 48 42
               C 42 41 38 42 36 44 Z"
            fill="url(#highlightGrad)"
          />

          {/* Vệt sáng phụ nhỏ xíu góc phải */}
          <circle cx="76" cy="88" r="2.5" fill="#FFFFFF" opacity="0.4" />

          {/* KHUÔN MẶT CẢM XÚC */}
          {renderFace()}
        </svg>
      </div>

      {/* BONG BÓNG THOẠI (Speech Bubble) */}
      {bubbleText && (
        <div className="relative max-w-sm rounded-2xl bg-white border border-indigo-100 p-3.5 shadow-md shadow-indigo-500/5 text-[#1E1B4B] text-sm leading-relaxed">
          {/* Mũi nhọn trỏ vào Mầm Mực */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-indigo-100" />
          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-0 h-0 border-y-7 border-y-transparent border-r-7 border-r-white" />
          <p className="font-semibold text-[#4F46E5]">{bubbleText}</p>
        </div>
      )}
    </div>
  );
};
