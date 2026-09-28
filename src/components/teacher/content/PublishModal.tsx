import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  AlertTriangle,
  Bell,
  CheckSquare,
  Square,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { ClassItem } from '../../../services/types.ts';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemType: 'topic' | 'video' | 'theory' | 'quiz';
  classes: ClassItem[];
  currentClassIds?: string[];
  hasStudentAttempts?: boolean;
  currentVersion?: number;
  warnings?: string[];
  onConfirmPublish: (options: { classIds: string[]; notifyStudent: boolean }) => Promise<void>;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  itemType,
  classes,
  currentClassIds = ['all'],
  hasStudentAttempts = false,
  currentVersion = 1,
  warnings = [],
  onConfirmPublish,
}) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(() => {
    if (currentClassIds.includes('all')) {
      return ['all'];
    }
    return currentClassIds.length > 0 ? currentClassIds : ['class_7a2'];
  });
  const [notifyStudent, setNotifyStudent] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Bài giảng Video';
      case 'theory':
        return 'Lý thuyết';
      case 'quiz':
        return 'Bài tập / Đề kiểm tra';
      case 'topic':
        return 'Chủ đề học';
      default:
        return 'Nội dung';
    }
  };

  const handleToggleClass = (classId: string) => {
    if (classId === 'all') {
      setSelectedClasses(['all']);
      return;
    }

    let next = selectedClasses.filter((id) => id !== 'all');
    if (next.includes(classId)) {
      next = next.filter((id) => id !== classId);
    } else {
      next.push(classId);
    }

    if (next.length === 0) {
      next = ['class_7a2'];
    }
    setSelectedClasses(next);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmPublish({
        classIds: selectedClasses,
        notifyStudent,
      });
      onClose();
    } catch (e) {
      console.error('Lỗi khi xuất bản:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E1B4B]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDF8] border border-[#E6DCC8] rounded-3xl shadow-2xl overflow-hidden text-[#2F3E6B]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF5EB] border-b border-[#E6DCC8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-lora font-bold text-lg text-[#2F3E6B]">
                Cập nhật lên web học sinh
              </h3>
              <p className="text-xs text-[#8C7E6A]">Xuất bản nội dung học cho các lớp được phân công</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[#8C7E6A] hover:text-[#2F3E6B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Content Overview */}
          <div className="p-4 rounded-2xl bg-[#FAF5EB] border border-[#E6DCC8]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7E6A]">
              Mục chuẩn bị xuất bản:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                {getItemTypeLabel(itemType)}
              </span>
              <h4 className="text-sm font-bold text-[#2F3E6B]">{itemTitle}</h4>
            </div>
          </div>

          {/* Cảnh báo đã có học sinh làm bài (Version bumping) */}
          {hasStudentAttempts && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Đã có học sinh làm bài tập này</p>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Hệ thống sẽ tự động tạo <strong>Phiên bản {currentVersion + 1}</strong>. Các lượt làm bài cũ vẫn được giữ nguyên kết quả điểm số và độ vững Mastery. Học sinh làm tiếp theo sẽ dùng phiên bản mới này.
                </p>
              </div>
            </div>
          )}

          {/* Warnings List if any */}
          {warnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Lưu ý chất lượng trước khi cập nhật:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px] text-amber-700">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Target Classes Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2F3E6B]">
              Áp dụng cho lớp học nào?
            </label>
            <div className="space-y-2">
              <div
                onClick={() => handleToggleClass('all')}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedClasses.includes('all')
                    ? 'border-[#2F3E6B] bg-indigo-50/30 font-bold shadow-2xs'
                    : 'border-[#E6DCC8] hover:bg-black/5 text-[#8C7E6A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedClasses.includes('all') ? (
                    <CheckSquare className="w-4 h-4 text-[#2F3E6B]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C7E6A]" />
                  )}
                  <span className="text-xs text-[#2F3E6B]">Tất cả các lớp học</span>
                </div>
                <span className="text-[10px] text-[#8C7E6A]">Mọi học sinh đều thấy</span>
              </div>

              {classes.map((cls) => {
                const isChecked =
                  selectedClasses.includes('all') || selectedClasses.includes(cls.id);
                return (
                  <div
                    key={cls.id}
                    onClick={() => handleToggleClass(cls.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'border-[#2F3E6B] bg-indigo-50/30 font-bold shadow-2xs'
                        : 'border-[#E6DCC8] hover:bg-black/5 text-[#8C7E6A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#2F3E6B]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8C7E6A]" />
                      )}
                      <span className="text-xs text-[#2F3E6B]">Lớp {cls.name}</span>
                    </div>
                    <span className="text-[10px] text-[#8C7E6A] font-mono">
                      {cls.studentCount || 0} học sinh
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Notification Toggle */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E6DCC8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#E2704A] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2F3E6B]">
                  Thông báo cho học sinh trên trang chủ
                </p>
                <p className="text-[11px] text-[#8C7E6A]">
                  Hiện biểu ngữ "Có bài học/bài kiểm tra mới" khi học sinh mở app
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyStudent}
                onChange={(e) => setNotifyStudent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E2704A]"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF5EB] border-t border-[#E6DCC8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-[#E6DCC8] hover:bg-black/5 text-[#8C7E6A] text-xs font-bold transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Xác nhận cập nhật</span>
          </button>
        </div>
      </div>
    </div>
  );
};
