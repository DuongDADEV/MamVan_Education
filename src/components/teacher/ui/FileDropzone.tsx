import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number; // mặc định 10MB
  selectedFile?: File | null;
  onClearFile?: () => void;
  helperText?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  accept = '.xlsx, .xls, .csv',
  maxSizeBytes = 10 * 1024 * 1024,
  selectedFile,
  onClearFile,
  helperText = 'Kéo thả file .xlsx, .xls hoặc .csv vào đây, hoặc bấm để duyệt từ máy tính',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndHandle = (file: File) => {
    setErrorMessage(null);

    // Kiểm tra định dạng
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      setErrorMessage('Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc file bảng tính (.csv)');
      return;
    }

    // Kiểm tra kích thước
    if (file.size > maxSizeBytes) {
      setErrorMessage(`Dung lượng file vượt quá giới hạn ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandle(e.target.files[0]);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="bg-[#FAF5EB] border-2 border-dashed border-[#7FA88A] rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7FA88A]/20 text-[#2E5E3D] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#2F3E6B] truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[#6B7280]">
                {(selectedFile.size / 1024).toFixed(1)} KB • Sẵn sàng đọc dữ liệu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold text-[#2F3E6B] hover:text-[#E2704A] px-3 py-1.5 rounded-lg border border-[#E6DCC8] bg-white transition-colors"
            >
              Đổi file
            </button>
            {onClearFile && (
              <button
                type="button"
                onClick={onClearFile}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-rose-50 transition-colors"
                aria-label="Xóa file đã chọn"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-[#E2704A] bg-[#FAF5EB]/90 scale-[1.01]'
              : 'border-[#E6DCC8] bg-[#FAF5EB]/40 hover:bg-[#FAF5EB] hover:border-[#2F3E6B]/50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FFFDF8] border border-[#E6DCC8] flex items-center justify-center mx-auto mb-3 text-[#2F3E6B] shadow-xs">
            <UploadCloud className="w-7 h-7 text-[#E2704A]" />
          </div>

          <p className="text-sm font-semibold text-[#2F3E6B] mb-1">
            Bấm chọn file hoặc kéo thả file vào đây
          </p>
          <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
            {helperText}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 flex items-center gap-2 text-xs text-[#DC2626] font-medium bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
