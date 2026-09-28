import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between relative">
        {/* Thanh nối ngầm */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E6DCC8] -z-0" />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-[#7FA88A] text-white'
                    : isCurrent
                    ? 'bg-[#E2704A] text-white ring-4 ring-[#E2704A]/20'
                    : 'bg-[#FFFDF8] border border-[#E6DCC8] text-[#9CA3AF]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <p
                className={`text-xs mt-2 font-semibold ${
                  isCurrent
                    ? 'text-[#E2704A]'
                    : isCompleted
                    ? 'text-[#2F3E6B]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
