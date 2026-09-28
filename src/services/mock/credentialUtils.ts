/**
 * Tiện ích sinh Tên đăng nhập và Mật khẩu theo chuẩn:
 * - Tên đăng nhập: không dấu, chữ thường, quy tắc: [tên] + [chữ cái đầu họ và tên đệm] + [2 chữ số]
 *   Ví dụ: "Nguyễn Minh Anh" -> "anhnm27"
 * - Mật khẩu: 8 ký tự dễ đọc, loại trừ ký tự dễ nhầm lẫn (0, O, 1, l, I).
 */

// Bảng xóa dấu tiếng Việt
export function removeVietnameseTones(str: string): string {
  let res = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  res = res.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  return res;
}

/**
 * Sinh username theo quy tắc: tên + chữ đầu họ đệm + 2 số
 * Nguyễn Minh Anh -> "anh" + "n" + "m" + "27" = "anhnm27"
 */
export function generateUsername(fullName: string, existingUsernames: string[] = []): string {
  const cleanName = removeVietnameseTones(fullName.trim().toLowerCase());
  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'hocsinh' + Math.floor(10 + Math.random() * 90);
  }

  const firstName = parts[parts.length - 1]; // Tên chính (vd: Anh -> anh)
  const initialLetters = parts
    .slice(0, parts.length - 1)
    .map((p) => p.charAt(0))
    .join(''); // Họ và đệm (vd: Nguyen Minh -> nm)

  const baseUsername = `${firstName}${initialLetters}`;

  // Thử sinh số từ 10 đến 99 (hoặc tiếp tục nếu trùng)
  let attempts = 0;
  let candidate = '';
  do {
    const num = Math.floor(10 + Math.random() * 90);
    candidate = `${baseUsername}${num}`;
    attempts++;
    if (attempts > 50) {
      // Nếu trùng quá nhiều, dùng 3 chữ số
      candidate = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
      break;
    }
  } while (existingUsernames.includes(candidate));

  return candidate;
}

/**
 * Sinh mật khẩu 8 ký tự dễ đọc:
 * Loại bỏ ký tự dễ nhầm (0, O, o, 1, l, I)
 */
export function generateFriendlyPassword(length = 8): string {
  const chars = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  let password = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    password += chars.charAt(idx);
  }
  return password;
}

/**
 * Tạo UUID đơn giản cho mock
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
