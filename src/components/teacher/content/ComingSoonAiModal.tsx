import React from 'react';
import { Sparkles, X, Bot, Check, FileQuestion, Video, BookOpen, Layers } from 'lucide-react';
import { MamMuc } from '../../MamMuc.tsx';

interface ComingSoonAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFeature?: string;
}

export const ComingSoonAiModal: React.FC<ComingSoonAiModalProps> = ({
  isOpen,
  onClose,
  targetFeature = 'Nội dung học',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1E1B4B]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDF8] border border-[#E6DCC8] rounded-3xl shadow-2xl overflow-hidden text-[#2F3E6B]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF5EB] border-b border-[#E6DCC8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E2704A] to-[#F2B84B] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-lora font-bold text-lg text-[#2F3E6B]">
                Trợ lý AI Mầm Văn (Sắp ra mắt)
              </h3>
              <p className="text-xs text-[#8C7E6A]">Tính năng thông minh đang được hoàn thiện</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[#8C7E6A] hover:text-[#2F3E6B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5EB] border border-[#E6DCC8]">
            <MamMuc mood="cheer" size="md" />
            <div>
              <p className="font-bold text-sm text-[#2F3E6B]">
                Tạo tự động {targetFeature} với Trí tuệ nhân tạo
              </p>
              <p className="text-xs text-[#8C7E6A] mt-1 leading-relaxed">
                Được huấn luyện chuyên biệt theo khung Chương trình GDPT 2018 môn Ngữ văn 7 và phong cách sư phạm Giấy & Mực.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C7E6A]">
              Những tiện ích AI sẽ sớm hỗ trợ thầy/cô:
            </p>
            <div className="space-y-2">
              {[
                {
                  icon: FileQuestion,
                  title: 'Sinh đề thi & câu hỏi 4 mức năng lực',
                  desc: 'Chỉ cần dán văn bản trích đoạn, AI tự tạo câu hỏi Nhận biết, Thông hiểu, Phân tích, Vận dụng.',
                },
                {
                  icon: Video,
                  title: 'Trích xuất ý trọng tâm từ Video',
                  desc: 'Tự động tạo danh sách tóm tắt ghi nhớ và câu hỏi luyện tập sau video chỉ sau 1 cú nhấp chuột.',
                },
                {
                  icon: BookOpen,
                  title: 'Gợi ý Rubric & Đoạn văn mẫu',
                  desc: 'Sinh tiêu chí chấm điểm chi tiết và đoạn văn mẫu chuẩn phong cách học sinh lớp 7.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-[#E6DCC8] flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#E2704A] flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2F3E6B]">{item.title}</h4>
                    <p className="text-[11px] text-[#8C7E6A] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF5EB] border-t border-[#E6DCC8] flex items-center justify-between">
          <span className="text-xs text-[#8C7E6A] italic">
            Giai đoạn tiếp theo sẽ kết nối API tạo tự động.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-[#2F3E6B] hover:bg-[#253256] text-white text-xs font-bold transition-all shadow-xs"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
