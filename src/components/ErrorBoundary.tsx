import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { resetAllDemoData } from '../services/index.ts';
import { BrandFullLogo } from './MamVanLogo.tsx';
import { MamMuc } from './MamMuc.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Đã phát hiện lỗi giao diện:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleResetDataAndReload = () => {
    try {
      resetAllDemoData();
      // Xóa tất cả các key cũ của ứng dụng
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('mam_van_') || k.startsWith('vo_muc_'))) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn('Lỗi khi xóa dữ liệu:', e);
    }
    window.location.href = window.location.origin;
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF5EB] text-[#2F3E6B] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl p-6 sm:p-10 shadow-xl border border-[#E6DCC8] text-center relative overflow-hidden">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <BrandFullLogo widthClass="w-[180px] sm:w-[200px]" />
            </div>

            {/* Mầm Mực bối rối */}
            <div className="my-4 flex justify-center">
              <MamMuc mood="thinking" size="lg" />
            </div>

            <h2 className="font-lora text-2xl font-bold text-[#2F3E6B] mb-2">
              Đã xảy ra sự cố không mong muốn
            </h2>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
              Ứng dụng vừa gặp phải sự gián đoạn nhỏ khi nạp dữ liệu. Đừng lo lắng, dữ liệu gốc luôn được bảo vệ an toàn. Bạn hãy thử làm mới trang hoặc đặt lại dữ liệu demo để tiếp tục nhé!
            </p>

            {/* Nút hành động */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#2F3E6B] text-white font-bold text-xs hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại trang</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetDataAndReload}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#E2704A] text-white font-bold text-xs hover:bg-[#D45E36] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại dữ liệu demo</span>
              </button>
            </div>

            {/* Chi tiết lỗi dạng collapse */}
            {this.state.error && (
              <details className="mt-6 text-left border-t border-[#E6DCC8] pt-4">
                <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E2704A]" />
                  <span>Chi tiết kỹ thuật (dành cho lập trình viên)</span>
                </summary>
                <div className="mt-2 p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-rose-700 overflow-x-auto max-h-36">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-slate-600 text-[10px]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
