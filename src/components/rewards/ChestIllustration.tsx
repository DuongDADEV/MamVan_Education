import React from 'react';
import { ChestTierKey } from '../../types.ts';
import { CHEST_TIERS } from '../../config.ts';

export type ChestVisualState = 'locked' | 'eligible' | 'pending' | 'approved' | 'given' | 'opened';

interface ChestIllustrationProps {
  tier: ChestTierKey;
  state?: ChestVisualState;
  size?: number;
  className?: string;
  animationsEnabled?: boolean;
}

/**
 * Minh họa Rương Quà Bí Mật dạng SVG vector phong cách Giấy & Mực:
 * - Kích thước tăng dần theo cấp: Hạt (88px) -> Lá (104px) -> Hoa (120px) -> Vàng (140px)
 * - Ổ khóa hình chiếc lá / mầm cây gợi cảm giác bí mật
 * - Nắp hé mở tỏa sáng khi đã duyệt (approved), mở toang khi đã mở (opened)
 * - Lắc nhẹ, phát sáng lấp lánh khi đủ điều kiện (eligible) hoặc đã trao (given)
 */
export const ChestIllustration: React.FC<ChestIllustrationProps> = ({
  tier,
  state = 'locked',
  size,
  className = '',
  animationsEnabled = true,
}) => {
  const tierConfig = CHEST_TIERS[tier] || CHEST_TIERS.HAT;
  const dimension = size || tierConfig.baseSizePx;

  // Hiệu ứng tương tác
  const isAnimated = animationsEnabled && (state === 'eligible' || state === 'given');
  const isLidAjar = state === 'approved';
  const isOpened = state === 'opened';
  const isLocked = state === 'locked';

  // Animation class
  const animClass = isAnimated
    ? 'animate-[bounce_3s_ease-in-out_infinite] motion-reduce:animate-none'
    : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-all duration-300 ${
        isLocked ? 'opacity-75 filter grayscale-[15%]' : ''
      } ${animClass} ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-hidden="true"
    >
      {/* Vòng hào quang phát sáng phía sau khi đủ điều kiện / đã trao / mở */}
      {(state === 'eligible' || state === 'given' || state === 'approved' || state === 'opened') && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-500"
          style={{
            background: tierConfig.glowColor,
            transform: 'scale(1.15)',
          }}
        />
      )}

      {/* RƯƠNG HẠT (HAT) - Hộp quà nhỏ xinh dải nơ mầm lá */}
      {tier === 'HAT' && (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm overflow-visible"
        >
          {/* Ánh sáng hé mở nếu approved */}
          {isLidAjar && (
            <path
              d="M 28 54 L 60 20 L 92 54 Z"
              fill="url(#hatGlow)"
              opacity="0.8"
            />
          )}

          <defs>
            <linearGradient id="hatGlow" x1="60" y1="20" x2="60" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7FA88A" stopOpacity="0.0" />
            </linearGradient>
            <filter id="hatShadow" x="-10%" y="-10%" width="120%" height="125%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2D5A3D" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Bóng đáy rương */}
          <ellipse cx="60" cy="106" rx="42" ry="7" fill="#2D5A3D" opacity="0.12" />

          {/* THÂN HỘP */}
          <rect
            x="24"
            y="52"
            width="72"
            height="50"
            rx="14"
            fill="#7FA88A"
            stroke="#4A7A57"
            strokeWidth="2.5"
            filter="url(#hatShadow)"
          />
          {/* Lớp nền vân kem nhạt bên trong thân */}
          <rect x="27" y="55" width="66" height="44" rx="11" fill="#8BB396" opacity="0.4" />

          {/* DẢI RU-BĂNG DỌC */}
          <rect x="52" y="52" width="16" height="50" fill="#FAF5EB" stroke="#4A7A57" strokeWidth="1.5" />
          <path d="M 60 52 L 60 102" stroke="#D8C8B0" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* NẮP HỘP */}
          {isOpened ? (
            // Nắp mở toang
            <g transform="translate(60, 48) rotate(-45) translate(-60, -48)">
              <rect x="20" y="32" width="80" height="20" rx="8" fill="#FAF5EB" stroke="#4A7A57" strokeWidth="2.5" />
              <rect x="52" y="32" width="16" height="20" fill="#7FA88A" />
            </g>
          ) : isLidAjar ? (
            // Nắp hé nhẹ
            <g transform="translate(60, 50) rotate(-12) translate(-60, -50)">
              <rect x="20" y="36" width="80" height="20" rx="8" fill="#FAF5EB" stroke="#4A7A57" strokeWidth="2.5" />
              <rect x="52" y="36" width="16" height="20" fill="#7FA88A" />
              {/* Nơ mầm cây */}
              <circle cx="60" cy="36" r="6" fill="#7FA88A" stroke="#4A7A57" strokeWidth="1.5" />
              <path d="M 60 36 C 54 26, 44 28, 48 34 Z" fill="#7FA88A" stroke="#4A7A57" strokeWidth="1.2" />
              <path d="M 60 36 C 66 26, 76 28, 72 34 Z" fill="#9BC4A6" stroke="#4A7A57" strokeWidth="1.2" />
            </g>
          ) : (
            // Nắp đóng chuẩn
            <g>
              <rect x="20" y="38" width="80" height="20" rx="8" fill="#FAF5EB" stroke="#4A7A57" strokeWidth="2.5" />
              <rect x="52" y="38" width="16" height="20" fill="#7FA88A" stroke="#4A7A57" strokeWidth="1.5" />
              {/* Dải nơ mềm mại */}
              <g transform="translate(60, 38)">
                {/* Cánh nơ trái */}
                <path d="M 0 0 C -12 -12, -22 -4, -10 2 C -3 4, 0 1, 0 0 Z" fill="#7FA88A" stroke="#4A7A57" strokeWidth="1.5" />
                {/* Cánh nơ phải */}
                <path d="M 0 0 C 12 -12, 22 -4, 10 2 C 3 4, 0 1, 0 0 Z" fill="#9BC4A6" stroke="#4A7A57" strokeWidth="1.5" />
                {/* Khuy tròn ở tâm */}
                <circle cx="0" cy="0" r="4.5" fill="#FAF5EB" stroke="#4A7A57" strokeWidth="1.5" />
                {/* Cuống mầm nhỏ vươn lên */}
                <path d="M 0 -4 C -2 -10, -6 -12, -4 -16 C -2 -14, 0 -10, 0 -4 Z" fill="#4A7A57" />
              </g>
            </g>
          )}

          {/* Ổ KHÓA HÌNH MẦM CÂY / CHIẾC LÁ */}
          <g transform="translate(60, 68)">
            {/* Tấm đế đồng */}
            <rect x="-9" y="-9" width="18" height="18" rx="5" fill="#FAF5EB" stroke="#4A7A57" strokeWidth="1.5" />
            {/* Lỗ khóa hoặc móc khóa */}
            <path d="M 0 -4 C -3 -4, -4 -2, -4 0 L -4 3 L 4 3 L 4 0 C 4 -2, 3 -4, 0 -4 Z" fill="none" stroke="#4A7A57" strokeWidth="1.5" />
            <circle cx="0" cy="2" r="1.5" fill="#2D5A3D" />
          </g>

          {/* Tia sao nhỏ lấp lánh khi eligible / given */}
          {isAnimated && (
            <>
              <path d="M 16 34 Q 16 40 22 40 Q 16 40 16 46 Q 16 40 10 40 Q 16 40 16 34 Z" fill="#F2B84B" />
              <path d="M 102 44 Q 102 48 106 48 Q 102 48 102 52 Q 102 48 98 48 Q 102 48 102 44 Z" fill="#F2B84B" />
            </>
          )}
        </svg>
      )}

      {/* RƯƠNG LÁ (LA) - Hộp quà lớn hơn, xanh mực, nơ to có lá rủ */}
      {tier === 'LA' && (
        <svg
          viewBox="0 0 130 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          {isLidAjar && (
            <path d="M 28 54 L 65 14 L 102 54 Z" fill="url(#laGlow)" opacity="0.85" />
          )}

          <defs>
            <linearGradient id="laGlow" x1="65" y1="14" x2="65" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF8E0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2F3E6B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="laBodyGrad" x1="65" y1="54" x2="65" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#35487B" />
              <stop offset="100%" stopColor="#223058" />
            </linearGradient>
          </defs>

          {/* Bóng đáy */}
          <ellipse cx="65" cy="115" rx="48" ry="8" fill="#1C2744" opacity="0.14" />

          {/* THÂN HỘP XANH MỰC */}
          <rect
            x="22"
            y="54"
            width="86"
            height="58"
            rx="16"
            fill="url(#laBodyGrad)"
            stroke="#1B2544"
            strokeWidth="2.5"
          />

          {/* DẢI RU-BĂNG SAGE */}
          <rect x="56" y="54" width="18" height="58" fill="#7FA88A" stroke="#1B2544" strokeWidth="1.5" />
          <path d="M 65 54 L 65 112" stroke="#5D8568" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* NẮP HỘP */}
          {isOpened ? (
            <g transform="translate(65, 52) rotate(-50) translate(-65, -52)">
              <rect x="18" y="32" width="94" height="22" rx="10" fill="#7FA88A" stroke="#1B2544" strokeWidth="2.5" />
              <rect x="56" y="32" width="18" height="22" fill="#2F3E6B" />
            </g>
          ) : isLidAjar ? (
            <g transform="translate(65, 54) rotate(-14) translate(-65, -54)">
              <rect x="18" y="34" width="94" height="22" rx="10" fill="#7FA88A" stroke="#1B2544" strokeWidth="2.5" />
              <rect x="56" y="34" width="18" height="22" fill="#FAF5EB" stroke="#1B2544" strokeWidth="1.5" />
              {/* Nơ đôi có lá non */}
              <circle cx="65" cy="34" r="6" fill="#FAF5EB" stroke="#1B2544" strokeWidth="1.5" />
            </g>
          ) : (
            <g>
              <rect x="18" y="36" width="94" height="22" rx="10" fill="#7FA88A" stroke="#1B2544" strokeWidth="2.5" />
              <rect x="56" y="36" width="18" height="22" fill="#FAF5EB" stroke="#1B2544" strokeWidth="1.5" />

              {/* NƠ TO CÓ CHIẾC LÁ NHỎ */}
              <g transform="translate(65, 36)">
                {/* Dải nơ vểnh sang hai bên */}
                <path d="M 0 0 C -16 -14, -26 -4, -12 4 C -4 6, 0 2, 0 0 Z" fill="#FAF5EB" stroke="#1B2544" strokeWidth="1.6" />
                <path d="M 0 0 C 16 -14, 26 -4, 12 4 C 4 6, 0 2, 0 0 Z" fill="#F0E8D5" stroke="#1B2544" strokeWidth="1.6" />
                {/* Chiếc lá mầm non rủ xuống */}
                <path d="M 0 0 C -6 8, -14 16, -10 22 C -6 20, -2 12, 0 0 Z" fill="#4D7A5C" stroke="#1B2544" strokeWidth="1.2" />
                <path d="M 0 0 C 6 8, 14 16, 10 22 C 6 20, 2 12, 0 0 Z" fill="#7FA88A" stroke="#1B2544" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="5" fill="#E2704A" stroke="#1B2544" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {/* Ổ KHÓA ĐỒNG TRUNG TÂM */}
          <g transform="translate(65, 74)">
            <ellipse cx="0" cy="0" rx="10" ry="10" fill="#FAF5EB" stroke="#1B2544" strokeWidth="1.8" />
            <path d="M -4 -3 C -4 -7, 4 -7, 4 -3 L 4 0 L -4 0 Z" fill="none" stroke="#1B2544" strokeWidth="1.6" />
            <circle cx="0" cy="2" r="2" fill="#2F3E6B" />
          </g>

          {/* Sparkles */}
          {isAnimated && (
            <>
              <path d="M 14 30 Q 14 36 20 36 Q 14 36 14 42 Q 14 36 8 36 Q 14 36 14 30 Z" fill="#E2704A" />
              <path d="M 116 40 Q 116 45 121 45 Q 116 45 116 50 Q 116 45 111 45 Q 116 45 116 40 Z" fill="#F2B84B" />
            </>
          )}
        </svg>
      )}

      {/* RƯƠNG HOA (HOA) - Rương gỗ vòm cong, họa tiết hoa, cam đất */}
      {tier === 'HOA' && (
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          {isLidAjar && (
            <path d="M 28 58 L 70 14 L 112 58 Z" fill="url(#hoaGlow)" opacity="0.85" />
          )}

          <defs>
            <linearGradient id="hoaGlow" x1="70" y1="14" x2="70" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF0D0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E2704A" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="woodGrad" x1="70" y1="58" x2="70" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E97E5B" />
              <stop offset="100%" stopColor="#CA5935" />
            </linearGradient>
          </defs>

          {/* Bóng đáy */}
          <ellipse cx="70" cy="124" rx="54" ry="9" fill="#582414" opacity="0.15" />

          {/* THÂN RƯƠNG GỖ CAM ĐẤT */}
          <rect
            x="20"
            y="58"
            width="100"
            height="62"
            rx="14"
            fill="url(#woodGrad)"
            stroke="#5A2413"
            strokeWidth="2.8"
          />

          {/* VÂN NẸP GỖ BE NÂU */}
          <rect x="23" y="61" width="14" height="56" rx="4" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
          <rect x="103" y="61" width="14" height="56" rx="4" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
          <rect x="58" y="58" width="24" height="62" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />

          {/* ĐINH TÁN ĐỒNG */}
          <circle cx="30" cy="68" r="2.2" fill="#753018" />
          <circle cx="30" cy="110" r="2.2" fill="#753018" />
          <circle cx="110" cy="68" r="2.2" fill="#753018" />
          <circle cx="110" cy="110" r="2.2" fill="#753018" />

          {/* HOA VĂN 4 CÁNH MỀM MẠI TRÊN THÂN GỖ */}
          <g transform="translate(44, 88)" fill="#FFF4EA" opacity="0.85">
            <circle cx="0" cy="-5" r="3.2" />
            <circle cx="0" cy="5" r="3.2" />
            <circle cx="-5" cy="0" r="3.2" />
            <circle cx="5" cy="0" r="3.2" />
            <circle cx="0" cy="0" r="2" fill="#E2704A" />
          </g>
          <g transform="translate(96, 88)" fill="#FFF4EA" opacity="0.85">
            <circle cx="0" cy="-5" r="3.2" />
            <circle cx="0" cy="5" r="3.2" />
            <circle cx="-5" cy="0" r="3.2" />
            <circle cx="5" cy="0" r="3.2" />
            <circle cx="0" cy="0" r="2" fill="#E2704A" />
          </g>

          {/* NẮP RƯƠNG VÒM CONG */}
          {isOpened ? (
            <g transform="translate(70, 56) rotate(-55) translate(-70, -56)">
              <path
                d="M 16 56 C 16 32, 124 32, 124 56 Z"
                fill="#E97E5B"
                stroke="#5A2413"
                strokeWidth="2.8"
              />
              <path d="M 58 36 L 58 56 L 82 56 L 82 36 Z" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
            </g>
          ) : isLidAjar ? (
            <g transform="translate(70, 58) rotate(-16) translate(-70, -58)">
              <path
                d="M 16 58 C 16 30, 124 30, 124 58 Z"
                fill="#E97E5B"
                stroke="#5A2413"
                strokeWidth="2.8"
              />
              <path d="M 58 32 L 58 58 L 82 58 L 82 32 Z" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
              <path d="M 62 26 Q 70 20 78 26" stroke="#5A2413" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g>
              <path
                d="M 16 58 C 16 30, 124 30, 124 58 Z"
                fill="#E97E5B"
                stroke="#5A2413"
                strokeWidth="2.8"
              />
              {/* Nẹp vòm nắp */}
              <path d="M 23 58 C 23 40, 37 40, 37 58 Z" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
              <path d="M 103 58 C 103 40, 117 40, 117 58 Z" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
              <path d="M 58 32 L 58 58 L 82 58 L 82 32 Z" fill="#EBDDC4" stroke="#5A2413" strokeWidth="1.5" />
              {/* Quai cầm trên đỉnh nắp rương */}
              <path d="M 62 26 Q 70 20 78 26" stroke="#5A2413" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Ổ KHÓA HOA ĐỒNG TRUNG TÂM */}
          <g transform="translate(70, 68)">
            <rect x="-12" y="-10" width="24" height="22" rx="6" fill="#F2B84B" stroke="#5A2413" strokeWidth="2" />
            <circle cx="0" cy="-1" r="3" fill="#5A2413" />
            <path d="M 0 0 L 0 5" stroke="#5A2413" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Sparkles */}
          {isAnimated && (
            <>
              <path d="M 12 28 Q 12 34 18 34 Q 12 34 12 40 Q 12 34 6 34 Q 12 34 12 28 Z" fill="#F2B84B" />
              <path d="M 126 36 Q 126 42 132 42 Q 126 42 126 48 Q 126 42 120 42 Q 126 42 126 36 Z" fill="#E2704A" />
            </>
          )}
        </svg>
      )}

      {/* RƯƠNG VÀNG (VANG) - Rương lớn viền vàng, tỏa ánh hào quang, tia lấp lánh */}
      {tier === 'VANG' && (
        <svg
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg overflow-visible"
        >
          {/* TIA HÀO QUANG VÀNG TỎA SÁNG */}
          <g opacity={isAnimated ? '0.75' : '0.45'}>
            <circle cx="75" cy="75" r="64" fill="url(#sunGlow)" />
            <path d="M 75 10 L 75 140 M 10 75 L 140 75 M 28 28 L 122 122 M 28 122 L 122 28" stroke="#FDE8B3" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
          </g>

          <defs>
            <radialGradient id="sunGlow" cx="75" cy="75" r="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#F2B84B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F2B84B" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="goldBodyGrad" x1="75" y1="62" x2="75" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F9CB65" />
              <stop offset="100%" stopColor="#D89926" />
            </linearGradient>
            <linearGradient id="goldLidGrad" x1="75" y1="28" x2="75" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE08A" />
              <stop offset="100%" stopColor="#E2A62C" />
            </linearGradient>
          </defs>

          {/* Bóng đáy */}
          <ellipse cx="75" cy="132" rx="58" ry="10" fill="#7A4E0B" opacity="0.18" />

          {/* THÂN RƯƠNG VÀNG HOÀNG KIM */}
          <rect
            x="18"
            y="62"
            width="114"
            height="66"
            rx="16"
            fill="url(#goldBodyGrad)"
            stroke="#754706"
            strokeWidth="3"
          />

          {/* MẢNG TRANG TRÍ KEM SANG TRỌNG */}
          <rect x="24" y="68" width="102" height="54" rx="10" fill="#FFFDF8" opacity="0.85" />
          {/* Vạch nẹp vàng viền quanh */}
          <rect x="22" y="62" width="16" height="66" fill="#F2B84B" stroke="#754706" strokeWidth="1.5" />
          <rect x="112" y="62" width="16" height="66" fill="#F2B84B" stroke="#754706" strokeWidth="1.5" />
          <rect x="63" y="62" width="24" height="66" fill="#F2B84B" stroke="#754706" strokeWidth="1.5" />

          {/* ĐINH TÁN KIM CƯƠNG / NGỌC */}
          <circle cx="30" cy="74" r="3" fill="#FFF8DE" stroke="#754706" strokeWidth="1" />
          <circle cx="30" cy="116" r="3" fill="#FFF8DE" stroke="#754706" strokeWidth="1" />
          <circle cx="120" cy="74" r="3" fill="#FFF8DE" stroke="#754706" strokeWidth="1" />
          <circle cx="120" cy="116" r="3" fill="#FFF8DE" stroke="#754706" strokeWidth="1" />

          {/* NẮP RƯƠNG HOÀNG GIA */}
          {isOpened ? (
            <g transform="translate(75, 60) rotate(-55) translate(-75, -60)">
              <path
                d="M 14 62 C 14 30, 136 30, 136 62 Z"
                fill="url(#goldLidGrad)"
                stroke="#754706"
                strokeWidth="3"
              />
              <path d="M 63 34 L 63 62 L 87 62 L 87 34 Z" fill="#FFEAA8" stroke="#754706" strokeWidth="1.5" />
            </g>
          ) : isLidAjar ? (
            <g transform="translate(75, 62) rotate(-16) translate(-75, -62)">
              <path
                d="M 14 62 C 14 30, 136 30, 136 62 Z"
                fill="url(#goldLidGrad)"
                stroke="#754706"
                strokeWidth="3"
              />
              <path d="M 63 34 L 63 62 L 87 62 L 87 34 Z" fill="#FFEAA8" stroke="#754706" strokeWidth="1.5" />
              {/* Vương miện mầm lá trên đỉnh */}
              <circle cx="75" cy="24" r="6" fill="#F2B84B" stroke="#754706" strokeWidth="2" />
            </g>
          ) : (
            <g>
              <path
                d="M 14 62 C 14 30, 136 30, 136 62 Z"
                fill="url(#goldLidGrad)"
                stroke="#754706"
                strokeWidth="3"
              />
              {/* Nẹp nắp mạ vàng */}
              <path d="M 22 62 C 22 42, 38 42, 38 62 Z" fill="#FFEAA8" stroke="#754706" strokeWidth="1.5" />
              <path d="M 112 62 C 112 42, 128 42, 128 62 Z" fill="#FFEAA8" stroke="#754706" strokeWidth="1.5" />
              <path d="M 63 34 L 63 62 L 87 62 L 87 34 Z" fill="#FFEAA8" stroke="#754706" strokeWidth="1.5" />
              {/* Vương miện ngòi bút / mầm vàng ngự trên đỉnh */}
              <g transform="translate(75, 26)">
                <path d="M 0 -8 L 6 0 L 0 6 L -6 0 Z" fill="#FFF9E6" stroke="#754706" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="2" fill="#E2704A" />
              </g>
            </g>
          )}

          {/* Ổ KHÓA VÀNG CHẠM KHẮC HÌNH NGÒI BÚT BÍ MẬT */}
          <g transform="translate(75, 74)">
            <rect x="-14" y="-12" width="28" height="26" rx="8" fill="#FFFDF8" stroke="#754706" strokeWidth="2.5" />
            <path d="M 0 -6 L 5 0 L 0 8 L -5 0 Z" fill="#F2B84B" stroke="#754706" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="1.5" fill="#754706" />
          </g>

          {/* CÁC TIA SAO HOÀNG KIM LẤP LÁNH (SPARKLES) */}
          <g>
            <path d="M 18 24 Q 18 32 26 32 Q 18 32 18 40 Q 18 32 10 32 Q 18 32 18 24 Z" fill="#F2B84B" />
            <path d="M 132 30 Q 132 37 139 37 Q 132 37 132 44 Q 132 37 125 37 Q 132 37 132 30 Z" fill="#F2B84B" />
            <path d="M 12 96 Q 12 100 16 100 Q 12 100 12 104 Q 12 100 8 100 Q 12 100 12 96 Z" fill="#E2704A" />
            <path d="M 138 90 Q 138 94 142 94 Q 138 94 138 98 Q 138 94 134 94 Q 138 94 138 90 Z" fill="#E2704A" />
          </g>
        </svg>
      )}
    </div>
  );
};

export default ChestIllustration;
