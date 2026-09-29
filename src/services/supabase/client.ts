import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey: string | undefined = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Kiểm tra xem cấu hình biến môi trường có đầy đủ và hợp lệ hay không
const isMissingConfig = !supabaseUrl || !supabasePublishableKey;
const isPlaceholderKey =
  Boolean(supabasePublishableKey) &&
  (supabasePublishableKey === 'your_supabase_publishable_anon_key_here' ||
    supabasePublishableKey?.toLowerCase().includes('placeholder'));

const isConfigured = !isMissingConfig && !isPlaceholderKey;

if (!isConfigured) {
  console.warn(
    '[Supabase Client] Cảnh báo: Biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_PUBLISHABLE_KEY ' +
      'chưa được cấu hình hợp lệ trong .env.local (hoặc đang là placeholder). ' +
      'Vui lòng cập nhật .env.local để kích hoạt kết nối Supabase thực tế.'
  );
}

/**
 * Singleton Supabase Client instance dùng chung cho toàn bộ ứng dụng.
 * Được khởi tạo với URL và Publishable Anon Key an toàn từ biến môi trường.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://rhtyxtjqwwbipkbbwvzc.supabase.co',
  supabasePublishableKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Kiểm tra trạng thái sẵn sàng của cấu hình Supabase Client.
 */
export function isSupabaseReady(): boolean {
  return isConfigured;
}

/**
 * Trả về thông tin trạng thái cấu hình (đã che thông tin nhạy cảm).
 */
export function getSupabaseConfigStatus(): {
  isReady: boolean;
  url: string | undefined;
  hasPublishableKey: boolean;
} {
  return {
    isReady: isConfigured,
    url: supabaseUrl,
    hasPublishableKey: Boolean(supabasePublishableKey && !isPlaceholderKey),
  };
}

export default supabase;
