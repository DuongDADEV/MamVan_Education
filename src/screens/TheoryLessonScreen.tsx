import React, { useState, useEffect } from 'react';
import { StudentState, QuestionResult, EssaySubmission, Quiz, Question } from '../types.ts';
import { THEORIES, QUIZZES, QUESTIONS_BANK } from '../data/mockData.ts';
import { XP_CONFIG, TIME_CONFIG } from '../config.ts';
import { awardXP } from '../logic/xpEngine.ts';
import { QuizRunner } from '../components/QuizRunner.tsx';
import { MamMuc } from '../components/MamMuc.tsx';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  ListTree,
  ChevronRight,
  Bookmark,
  ImageIcon,
} from 'lucide-react';
import {
  useLiveQuery,
  contentService,
  quizService,
  essayRepository,
  TheoryLessonWithMeta,
  QuizWithMeta,
  QuestionWithMeta,
} from '../services/index.ts';

interface TheoryLessonScreenProps {
  theoryId: string;
  state: StudentState;
  onUpdateState: (updater: (prev: StudentState) => StudentState) => void;
  onBackToList: () => void;
}

export const TheoryLessonScreen: React.FC<TheoryLessonScreenProps> = ({
  theoryId,
  state,
  onUpdateState,
  onBackToList,
}) => {
  const { data: liveTheory } = useLiveQuery<TheoryLessonWithMeta | null>(
    () => contentService.getTheoryLessonById(theoryId),
    ['content'],
    [theoryId]
  );
  const theory = liveTheory || THEORIES[theoryId];

  const { data: liveQuizzes } = useLiveQuery<QuizWithMeta[]>(
    () => quizService.getQuizzes(undefined, false),
    ['quiz']
  );
  const { data: liveQuestions } = useLiveQuery<Record<string, QuestionWithMeta>>(
    () => quizService.getQuestions(),
    ['quiz']
  );

  const quizzesMap: Record<string, Quiz> = {
    ...QUIZZES,
    ...(liveQuizzes ? Object.fromEntries(liveQuizzes.map((q) => [q.id, q])) : {}),
  };

  const questionsMap: Record<string, Question> = {
    ...QUESTIONS_BANK,
    ...(liveQuestions || {}),
  };

  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Đọc lý thuyết, 2: Luyện tập, 3: KT, 4: Hoàn thành

  // Đếm ngược thời gian đọc tối thiểu (25s) trước khi nút "Đã hiểu" bật
  const [secondsLeft, setSecondsLeft] = useState<number>(TIME_CONFIG.MIN_THEORY_READ_SECONDS);
  const isUnderstoodAlready = state.completedSteps.includes(`theory_understood:${theoryId}`);

  useEffect(() => {
    if (secondsLeft > 0 && !isUnderstoodAlready) {
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [secondsLeft, isUnderstoodAlready]);

  if (!theory) {
    return (
      <div className="p-8 text-center text-[#1E1B4B]">
        <p className="font-bold">Không tìm thấy bài lý thuyết này.</p>
        <button onClick={onBackToList} className="mt-4 px-5 py-2.5 gradient-primary text-white rounded-2xl font-bold">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // 1. Bấm "Đã hiểu" -> Cộng +10 XP -> Sang Bước 2 (Luyện tập)
  const handleUnderstood = () => {
    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `theory_understood:${theoryId}`,
        XP_CONFIG.THEORY_READ_UNDERSTOOD_XP,
        `Đọc lý thuyết và Đã hiểu: ${theory.title}`
      );
      // Xóa khỏi danh sách chưa hiểu nếu có
      const updatedFlagged = prev.flaggedNeedReviewTopicIds.filter((t) => t !== theory.topicId);

      return {
        ...prev,
        ...xpRes.updatedState,
        flaggedNeedReviewTopicIds: updatedFlagged,
        currentProgress: {
          type: 'theory',
          topicId: theory.topicId,
          itemId: theoryId,
          stepIndex: 2,
        },
      };
    });
    setCurrentStep(2);
  };

  // 2. Bấm "Chưa hiểu" -> Đánh dấu vào "Cần xem lại"
  const handleNotUnderstood = () => {
    onUpdateState((prev) => {
      const isAlreadyFlagged = prev.flaggedNeedReviewTopicIds.includes(theory.topicId);
      return {
        ...prev,
        flaggedNeedReviewTopicIds: isAlreadyFlagged
          ? prev.flaggedNeedReviewTopicIds
          : [...prev.flaggedNeedReviewTopicIds, theory.topicId],
      };
    });
    // Vẫn cho học sinh sang luyện tập hoặc ở lại đọc
    setCurrentStep(2);
  };

  // 3. Hoàn thành Luyện tập -> Sang KT
  const handleCompletePractice = (results: QuestionResult[]) => {
    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `quiz_completed:${theory.practiceQuizId}`,
        XP_CONFIG.THEORY_PRACTICE_COMPLETED_XP,
        `Hoàn thành luyện tập lý thuyết: ${theory.title}`
      );
      return {
        ...prev,
        ...xpRes.updatedState,
        questionResults: [...results, ...prev.questionResults],
        currentProgress: {
          type: 'theory',
          topicId: theory.topicId,
          itemId: theoryId,
          stepIndex: 3,
        },
      };
    });
    setCurrentStep(3);
  };

  // 4. Hoàn thành KT -> Sang Bước 4 (Hoàn thành)
  const handleCompleteTest = (results: QuestionResult[], essays: EssaySubmission[]) => {
    if (essays && essays.length > 0) {
      essays.forEach((e) => {
        essayRepository.createSubmission({
          studentId: 'hs001',
          questionId: e.questionId,
          content: e.content,
          wordCount: e.wordCount,
          status: 'PENDING_TEACHER',
          promptTitle: e.promptTitle || 'Viết đoạn văn theo yêu cầu',
          quizTitle: theory.title,
          skillLevel: 'VAN_DUNG',
        }).catch((err: any) => console.error('Lỗi gửi bài tự luận:', err));
      });
    }

    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `quiz_completed:${theory.testQuizId}`,
        XP_CONFIG.THEORY_TEST_XP,
        `Kiểm tra lý thuyết: ${theory.title}`
      );
      return {
        ...prev,
        ...xpRes.updatedState,
        questionResults: [...results, ...prev.questionResults],
        essaySubmissions: [...essays, ...(prev.essaySubmissions || [])],
        currentProgress: undefined,
      };
    });
    setCurrentStep(4);
  };

  // Render SVG Diagram trực quan cho từng chủ đề
  const renderSvgDiagram = (diagramType?: string) => {
    if (!diagramType) return null;

    if (diagramType === 'so_sanh') {
      return (
        <div className="my-5 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 overflow-x-auto">
          <p className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider mb-3">
            Sơ đồ mô hình 4 yếu tố của Phép so sánh:
          </p>
          <div className="flex items-center gap-2.5 min-w-[460px] justify-between text-center text-xs">
            <div className="flex-1 p-3 rounded-2xl bg-white border border-indigo-200 shadow-xs">
              <span className="font-extrabold text-[#4F46E5] block text-sm">Vế A</span>
              <span className="text-[11px] text-slate-500">(Sự vật so sánh)</span>
            </div>
            <span className="text-[#8B5CF6] font-extrabold text-base">→</span>
            <div className="flex-1 p-3 rounded-2xl bg-white border border-purple-200 shadow-xs">
              <span className="font-extrabold text-[#8B5CF6] block text-sm">Phương diện</span>
              <span className="text-[11px] text-slate-500">(Đặc điểm chung)</span>
            </div>
            <span className="text-[#22D3EE] font-extrabold text-base">→</span>
            <div className="flex-1 p-3 rounded-2xl bg-white border border-cyan-200 shadow-xs">
              <span className="font-extrabold text-cyan-600 block text-sm">Từ so sánh</span>
              <span className="text-[11px] text-slate-500">(như, là, hơn, tày)</span>
            </div>
            <span className="text-[#10B981] font-extrabold text-base">→</span>
            <div className="flex-1 p-3 rounded-2xl bg-white border border-emerald-200 shadow-xs">
              <span className="font-extrabold text-[#10B981] block text-sm">Vế B</span>
              <span className="text-[11px] text-slate-500">(Chuẩn so sánh)</span>
            </div>
          </div>
        </div>
      );
    }

    if (diagramType === 'tu_lay') {
      return (
        <div className="my-5 p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
          <p className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-3">
            Sơ đồ phân loại Từ láy:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1.5">
              <span className="font-extrabold text-[#10B981] block text-sm">1. Từ láy toàn bộ</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Lặp lại toàn bộ cả âm, vần, thanh hoặc biến đổi thanh nhẹ để tạo nhịp điệu.
              </p>
              <p className="text-[11px] font-mono font-bold text-[#4F46E5] bg-indigo-50 px-2 py-1 rounded-lg">
                Ví dụ: xanh xanh, thoang thoảng
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-1.5">
              <span className="font-extrabold text-[#4F46E5] block text-sm">2. Từ láy bộ phận</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Láy phụ âm đầu hoặc chỉ láy phần vần để gợi hình và gợi cảm giác.
              </p>
              <p className="text-[11px] font-mono font-bold text-[#8B5CF6] bg-purple-50 px-2 py-1 rounded-lg">
                Ví dụ: long lanh, liêu xiêu
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (diagramType === 'tho_bon_nam') {
      return (
        <div className="my-5 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <p className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider mb-3">
            Nhịp ngắt và Vần trong Thơ bốn chữ, năm chữ:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="font-extrabold text-[#4F46E5] block text-sm">Thơ 4 chữ</span>
              <p className="text-[11px] text-slate-600 mt-1">
                Nhịp chẵn đều đặn: <strong className="text-[#1E1B4B]">2/2</strong>
              </p>
              <p className="text-xs italic text-indigo-700 font-serif mt-2 bg-indigo-50/60 p-2 rounded-xl">
                "Mầm non / mắt lim dim"
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="font-extrabold text-[#8B5CF6] block text-sm">Thơ 5 chữ</span>
              <p className="text-[11px] text-slate-600 mt-1">
                Linh hoạt: <strong className="text-[#1E1B4B]">3/2</strong> hoặc <strong className="text-[#1E1B4B]">2/3</strong>
              </p>
              <p className="text-xs italic text-purple-700 font-serif mt-2 bg-purple-50/60 p-2 rounded-xl">
                "Đang nằm chờ / đón nắng"
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (diagramType === 'doan_van') {
      return (
        <div className="my-5 p-5 rounded-2xl bg-cyan-50/40 border border-cyan-100">
          <p className="text-xs font-bold text-cyan-800 uppercase tracking-wider mb-3">
            Cấu trúc 3 phần của Đoạn văn cảm nghĩ:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-center gap-3">
              <span className="font-extrabold text-[#4F46E5] w-24 shrink-0">1. Mở đoạn:</span>
              <span className="text-[11px] text-slate-700">Giới thiệu tác giả, tác phẩm & ấn tượng bao trùm.</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center gap-3">
              <span className="font-extrabold text-[#8B5CF6] w-24 shrink-0">2. Thân đoạn:</span>
              <span className="text-[11px] text-slate-700">Chọn 1–2 hình ảnh độc đáo để phân tích cảm xúc sâu sắc.</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center gap-3">
              <span className="font-extrabold text-[#10B981] w-24 shrink-0">3. Kết đoạn:</span>
              <span className="text-[11px] text-slate-700">Khái quát lại giá trị tác phẩm & liên hệ tâm hồn bản thân.</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const steps = [
    { num: 1, label: 'Đọc lý thuyết' },
    { num: 2, label: 'Luyện tập' },
    { num: 3, label: 'Kiểm tra' },
    { num: 4, label: 'Hoàn thành' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-8 space-y-6 text-[#1E1B4B]">
      {/* HEADER: Quay lại + Nhãn */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <button
          onClick={onBackToList}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách bài học</span>
        </button>

        <span className="text-xs px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#8B5CF6] font-bold">
          Luồng Lý thuyết chi tiết
        </span>
      </div>

      {/* STEPPER LUỒNG LÝ THUYẾT */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((st, idx) => {
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && (
                  <div
                    className={`absolute top-4 right-1/2 left-[-50%] h-0.5 -z-0 transition-colors ${
                      currentStep >= st.num ? 'bg-purple-500' : 'bg-slate-100'
                    }`}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold z-10 transition-all ${
                    isDone
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white ring-4 ring-purple-100 scale-110 shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/80'
                  }`}
                >
                  {isDone ? '✓' : st.num}
                </div>

                <span
                  className={`text-[10px] sm:text-xs mt-1.5 font-bold hidden sm:inline ${
                    isCurrent ? 'text-[#8B5CF6]' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= BƯỚC 1: ĐỌC LÝ THUYẾT ================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">
                {theory.title}
              </h2>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#4F46E5] font-extrabold self-start sm:self-auto">
                +10 XP khi bấm "Đã hiểu"
              </span>
            </div>

            {/* MỤC LỤC NHANH (Table of Contents) */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <ListTree className="w-4 h-4 text-[#8B5CF6]" />
                <span>Mục lục bài đọc:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {theory.sections.map((sec, sIdx) => (
                  <a
                    key={sIdx}
                    href={`#section-${sIdx}`}
                    className="text-xs px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:text-[#8B5CF6] text-slate-600 transition-colors"
                  >
                    {sIdx + 1}. {sec.title}
                  </a>
                ))}
              </div>
            </div>

            {/* CÁC PHẦN NỘI DUNG LÝ THUYẾT (BLOCKS HOẶC SECTIONS) */}
            {theory.blocks && theory.blocks.length > 0 ? (
              <div className="space-y-4">
                {theory.blocks.map((b, bIdx) => (
                  <div key={b.id || bIdx}>
                    {b.type === 'heading' && (
                      <h3
                        className={`font-extrabold text-[#1E1B4B] mt-5 mb-2 ${
                          b.level === 3 ? 'text-base' : 'text-lg'
                        }`}
                      >
                        {b.content}
                      </h3>
                    )}
                    {b.type === 'paragraph' && (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                        {b.content}
                      </p>
                    )}
                    {b.type === 'list' && (
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700 mb-3 pl-2">
                        {(b.items || []).map((it, itIdx) => (
                          <li key={itIdx}>{it}</li>
                        ))}
                      </ul>
                    )}
                    {b.type === 'example' && (
                      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5 my-3">
                        <strong className="text-xs font-bold text-[#4F46E5] block">Ví dụ thực tế:</strong>
                        <p className="text-xs sm:text-sm text-slate-800 italic">"{b.exampleText}"</p>
                        {b.exampleAnalysis && (
                          <p className="text-xs text-slate-600 pt-1 border-t border-indigo-100">
                            <strong>Phân tích:</strong> {b.exampleAnalysis}
                          </p>
                        )}
                      </div>
                    )}
                    {b.type === 'takeaway' && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-1 my-3">
                        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                          Ghi nhớ trọng tâm
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">{b.takeawayText}</p>
                      </div>
                    )}
                    {b.type === 'image' && b.imageUrl && (
                      <div className="my-3 text-center space-y-1">
                        <img
                          src={b.imageUrl}
                          alt={b.caption || 'Minh họa'}
                          className="max-h-72 rounded-2xl mx-auto object-contain border border-slate-200"
                        />
                        {b.caption && (
                          <p className="text-xs text-slate-500 italic">{b.caption}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {(theory.sections || []).map((sec, sIdx) => (
                  <div
                    key={sIdx}
                    id={`section-${sIdx}`}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3"
                  >
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1E1B4B] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-xl bg-purple-100 text-[#8B5CF6] text-xs font-extrabold flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <span>{sec.title}</span>
                    </h3>

                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8 space-y-2">
                      {sec.body.map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Sơ đồ nếu có */}
                    {sec.svgDiagramType && renderSvgDiagram(sec.svgDiagramType)}

                    {/* Ví dụ mẫu nếu có */}
                    {sec.example && (
                      <div className="mt-3 pl-8">
                        <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-[#4F46E5] block mb-1">Ví dụ thực tế:</strong>
                          <p className="italic font-serif text-indigo-950 mb-1">"{sec.example.text}"</p>
                          <p className="text-slate-600">{sec.example.analysis}</p>
                        </div>
                      </div>
                    )}

                    {sec.takeaway && (
                      <div className="pl-8 pt-1 text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ghi nhớ: {sec.takeaway}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 2 NÚT CUỐI BÀI: ĐÃ HIỂU VÀ CHƯA HIỂU */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleNotUnderstood}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs sm:text-sm font-bold hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Chưa hiểu (Lưu vào Cần ôn)</span>
              </button>

              <button
                disabled={secondsLeft > 0 && !isUnderstoodAlready}
                onClick={handleUnderstood}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl gradient-primary text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {secondsLeft > 0 && !isUnderstoodAlready
                    ? `Đọc kỹ thêm (${secondsLeft}s) để xác nhận`
                    : 'Đã hiểu bài (+10 XP)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BƯỚC 2: LUYỆN TẬP LÝ THUYẾT ================= */}
      {currentStep === 2 && (
        (() => {
          const q = quizzesMap[theory.practiceQuizId] || QUIZZES[theory.practiceQuizId];
          if (!q) {
            return (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-700">Chưa có bài luyện tập cho phần này.</p>
                <button onClick={() => setCurrentStep(1)} className="text-xs text-[#8B5CF6] font-bold">
                  Quay lại lý thuyết
                </button>
              </div>
            );
          }
          const qList = q.questionIds.map((id) => questionsMap[id]).filter(Boolean);
          return (
            <QuizRunner
              quiz={q}
              questions={qList}
              onComplete={(res) => handleCompletePractice(res)}
              onExit={() => setCurrentStep(1)}
            />
          );
        })()
      )}

      {/* ================= BƯỚC 3: KIỂM TRA LÝ THUYẾT ================= */}
      {currentStep === 3 && (
        (() => {
          const q = quizzesMap[theory.testQuizId] || QUIZZES[theory.testQuizId];
          if (!q) {
            return (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-700">Chưa có bài kiểm tra cho phần này.</p>
                <button onClick={() => setCurrentStep(2)} className="text-xs text-[#8B5CF6] font-bold">
                  Quay lại luyện tập
                </button>
              </div>
            );
          }
          const qList = q.questionIds.map((id) => questionsMap[id]).filter(Boolean);
          return (
            <QuizRunner
              quiz={q}
              questions={qList}
              onComplete={handleCompleteTest}
              onExit={() => setCurrentStep(2)}
            />
          );
        })()
      )}

      {/* ================= BƯỚC 4: TỔNG KẾT HOÀN THÀNH ================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-[fadeIn_0.4s_ease]">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl shadow-indigo-950/5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <MamMuc mood="proud" size="xl" className="mx-auto mb-4" />

              <span className="text-xs uppercase tracking-wider text-purple-600 font-extrabold px-3 py-1 rounded-full bg-purple-50 border border-purple-200 inline-block mb-2">
                Xuất sắc! Đã hoàn thành chuyên đề lý thuyết
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mb-2">
                {theory.title}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Em đã đọc kỹ lý thuyết, rèn luyện bài tập và vượt qua bài kiểm tra năng lực!
              </p>

              {/* Bảng tổng kết XP */}
              <div className="p-5 rounded-3xl gradient-soft-indigo border border-indigo-100 max-w-sm mx-auto mb-8 text-center shadow-xs">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  Tổng XP nhận trọn vẹn chuyên đề
                </span>
                <span className="text-4xl font-black text-[#8B5CF6] font-mono tabular-nums">
                  +28 XP
                </span>
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                  (Đã hiểu: +10 · Luyện tập: +8 · Kiểm tra: +10)
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={onBackToList}
                  className="px-8 py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:brightness-105 flex items-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>Về danh sách bài học</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
