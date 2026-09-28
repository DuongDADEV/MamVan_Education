import { ThemeConfig } from '../types.ts';

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'mam_van_nature',
    name: 'Mầm Văn',
    subtitle: 'Mầm non & Ngòi bút vàng (Chuẩn thương hiệu)',
    description: 'Bản sắc nhận diện thương hiệu độc quyền Mầm Văn: Xanh lá rừng (#2F6B4F), ngòi bút vàng ấm (#C89B3C), lá non (#7AA874) trên nền trang sách kem nhẹ nhàng (#F6F1E8).',
    palette: {
      primaryTitle: '#2F6B4F', // Xanh lá đậm Mầm Văn
      accentAction: '#C89B3C', // Vàng ấm ngòi bút
      backgroundPage: '#FAF8F5', // Nền kem thanh nhã
      backgroundCard: '#FFFFFF', // Trắng ngà
      borderColor: '#E8D8BE', // Be ấm
      successSage: '#7AA874', // Xanh lá non
    },
  },
  {
    id: 'creative_edtech',
    name: 'Creative EdTech',
    subtitle: 'Năng động & Trẻ trung',
    description: 'Không gian khám phá tri thức hiện đại dành cho học sinh lớp 7. Sắc chàm Indigo (#4F46E5), tím Electric (#8B5CF6) kết hợp điểm nhấn vàng rực rỡ.',
    palette: {
      primaryTitle: '#1E1B4B', // Chàm đậm
      accentAction: '#4F46E5', // Indigo
      backgroundPage: '#F8FAFF', // Lam sáng
      backgroundCard: '#FFFFFF', // Trắng sứ
      borderColor: '#E2E8F0', // Slate nhẹ
      successSage: '#10B981', // Emerald
    },
  },
  {
    id: 'paper_ink',
    name: 'Giấy & Mực',
    subtitle: 'Cổ điển trang nhã',
    description: 'Quyển vở Văn hiện đại, trang nhã. Nền kem giấy với mực cửu long truyền thống, ấm dịu khi đọc lâu.',
    palette: {
      primaryTitle: '#2F3E6B', // Xanh mực
      accentAction: '#E2704A', // Cam đất
      backgroundPage: '#FAF5EB', // Kem giấy
      backgroundCard: '#FFFDF8', // Trắng ngà
      borderColor: '#E6DCC8', // Be nâu
      successSage: '#7FA88A', // Xanh sage
    },
  },
  {
    id: 'lotus_bamboo',
    name: 'Hồ Sen & Trúc Xanh',
    subtitle: 'Thi vị thanh thoát',
    description: 'Gợi nhớ hương sen đầu hạ và lũy tre làng Việt Nam. Nền sương ngọc kết hợp màu hồng sen tao nhã.',
    palette: {
      primaryTitle: '#1E4237', // Xanh trúc đậm
      accentAction: '#D96B7A', // Hồng hoa sen
      backgroundPage: '#F1F7F4', // Sương ngọc nhạt
      backgroundCard: '#FCFDFD', // Bạch liên
      borderColor: '#CFDFD6', // Be ngọc
      successSage: '#3D8B6D', // Ngọc lục bảo
    },
  },
  {
    id: 'kraft_amber',
    name: 'Gỗ Mộc & Hổ Phách',
    subtitle: 'Trầm ấm thư phòng',
    description: 'Không gian thư phòng hoài cổ, tĩnh lặng như đọc sách bên ánh đèn dầu vàng, hỗ trợ tập trung chuyên sâu.',
    palette: {
      primaryTitle: '#3E2A20', // Nâu gỗ mun
      accentAction: '#D66829', // Cam hổ phách
      backgroundPage: '#F5EEE6', // Giấy dó mộc
      backgroundCard: '#FFFBF5', // Lụa tơ tằm
      borderColor: '#E2D4C3', // Be gỗ
      successSage: '#657F52', // Rêu phong
    },
  },
  {
    id: 'autumn_sky',
    name: 'Trời Thu & Mây Chiều',
    subtitle: 'Nhẹ nhàng thanh lịch',
    description: 'Khoáng đạt, tinh tế như những áng văn mùa thu. Nền lam khói mát lành với điểm nhấn hoàng hôn đào.',
    palette: {
      primaryTitle: '#243354', // Xanh chàm mây
      accentAction: '#E3685C', // Hoàng hôn đào
      backgroundPage: '#F0F4F8', // Mây lam khói
      backgroundCard: '#FFFFFF', // Trắng sứ
      borderColor: '#D2DCE6', // Lam xám nhẹ
      successSage: '#4C829B', // Lam ngọc
    },
  },
];
