import React from 'react';
import { MamMuc } from './MamMuc.tsx';
import { Coffee, ArrowRight } from 'lucide-react';

interface BreakReminderModalProps {
  continuousMinutes: number;
  onTakeBreak: () => void;
  onContinue: () => void;
}

export const BreakReminderModal: React.FC<BreakReminderModalProps> = ({
  continuousMinutes,
  onTakeBreak,
  onContinue,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-7 shadow-2xl text-center animate-[scaleIn_0.25s_ease] text-[#1E1B4B]">
        <MamMuc mood="sleepy" size="lg" className="mx-auto mb-3" />

        <h3 className="text-xl font-extrabold text-[#1E1B4B] mb-2">
          Mầm Mực nhắc bạn nghỉ mắt chút nhé!
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Bạn đã học rất tập trung trong suốt <strong className="text-[#4F46E5] font-bold">{continuousMinutes} phút</strong> liên tục rồi.
          Hãy uống một ngụm nước, vươn vai và nhìn ra xa để mắt được thư giãn nhé!
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onTakeBreak}
            className="w-full py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs sm:text-sm font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors"
          >
            <Coffee className="w-4 h-4" />
            <span>Nghỉ ngơi 5 phút</span>
          </button>

          <button
            onClick={onContinue}
            className="w-full py-3 rounded-2xl gradient-primary text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 hover:brightness-105 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>Mình tràn đầy năng lượng, học tiếp!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
