import React, { useState, useEffect, useRef } from 'react';
import { StudentState, QuestionResult, EssaySubmission, Quiz, Question } from '../types.ts';
import { VIDEOS, QUIZZES, QUESTIONS_BANK } from '../data/mockData.ts';
import { XP_CONFIG, TIME_CONFIG } from '../config.ts';
import { awardXP } from '../logic/xpEngine.ts';
import { QuizRunner } from '../components/QuizRunner.tsx';
import { MamMuc } from '../components/MamMuc.tsx';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Gauge,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  useLiveQuery,
  contentService,
  quizService,
  essayRepository,
  VideoLessonWithMeta,
  QuizWithMeta,
  QuestionWithMeta,
} from '../services/index.ts';

interface VideoLessonScreenProps {
  videoId: string;
  state: StudentState;
  onUpdateState: (updater: (prev: StudentState) => StudentState) => void;
  onBackToList: () => void;
}

export const VideoLessonScreen: React.FC<VideoLessonScreenProps> = ({
  videoId,
  state,
  onUpdateState,
  onBackToList,
}) => {
  const { data: liveVideo } = useLiveQuery<VideoLessonWithMeta | null>(
    () => contentService.getVideoLessonById(videoId),
    ['content'],
    [videoId]
  );
  const video = liveVideo || VIDEOS[videoId];

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

  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Video, 2: Tóm tắt, 3: Luyện tập, 4: KT1, 5: KT2, 6: Hoàn thành

  // Video State & Theo dõi giây xem duy nhất (chống tua nhanh)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [watchedSecondsSet, setWatchedSecondsSet] = useState<Set<number>>(new Set());
  const [isVideoError, setIsVideoError] = useState(false);

  // Đếm ngược thời gian đọc tóm tắt tối thiểu (15 giây)
  const [summarySecondsLeft, setSummarySecondsLeft] = useState(TIME_CONFIG.MIN_SUMMARY_READ_SECONDS);

  // Theo dõi tỷ lệ đã xem thật (≥ 80%)
  const watchedRatio = watchedSecondsSet.size / Math.max(1, video?.durationSec || 600);
  const isWatchedEligible = watchedRatio >= 0.8 || state.completedSteps.includes(`video_watch:${videoId}`);

  // Tự động khôi phục bước đang dở nếu có
  useEffect(() => {
    if (state.currentProgress && state.currentProgress.itemId === videoId) {
      setCurrentStep(state.currentProgress.stepIndex || 1);
      if (state.currentProgress.videoSeconds && videoRef.current) {
        videoRef.current.currentTime = state.currentProgress.videoSeconds;
      }
    }
  }, [videoId, state.currentProgress]);

  // Bộ đếm thời gian khi phát video (theo dõi các giây đã xem thật sự)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (videoRef.current) {
          const sec = Math.floor(videoRef.current.currentTime);
          setCurrentTime(sec);
          setWatchedSecondsSet((prev) => new Set(prev).add(sec));
        } else {
          // Trường hợp giả lập bộ đếm video khi có lỗi
          setCurrentTime((prev) => {
            const next = prev + 1;
            setWatchedSecondsSet((s) => new Set(s).add(next));
            return next;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Bộ đếm đọc tóm tắt (Step 2)
  useEffect(() => {
    if (currentStep === 2 && summarySecondsLeft > 0) {
      const timer = setTimeout(() => {
        setSummarySecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, summarySecondsLeft]);

  if (!video) {
    return (
      <div className="p-8 text-center text-[#1E1B4B]">
        <p className="font-bold">Không tìm thấy video bài giảng này.</p>
        <button onClick={onBackToList} className="mt-4 px-5 py-2.5 gradient-primary text-white rounded-2xl font-bold">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // 1. Chuyển sang Bước 2 (Tóm tắt) & Cộng +5 XP xem video
  const handleProceedToSummary = () => {
    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `video_watch:${videoId}`,
        XP_CONFIG.VIDEO_WATCH_80_PERCENT_XP,
        `Xem >= 80% bài giảng: ${video.title}`
      );
      return {
        ...prev,
        ...xpRes.updatedState,
        currentProgress: {
          type: 'video',
          topicId: video.topicId,
          itemId: videoId,
          stepIndex: 2,
          videoSeconds: currentTime,
        },
      };
    });
    setCurrentStep(2);
  };

  // 2. Chuyển sang Bước 3 (Luyện tập) & Cộng +2 XP tóm tắt
  const handleProceedToPractice = () => {
    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `summary_read:${videoId}`,
        XP_CONFIG.VIDEO_SUMMARY_READ_XP,
        `Đọc tóm tắt kiến thức trọng tâm: ${video.title}`
      );
      return {
        ...prev,
        ...xpRes.updatedState,
        currentProgress: {
          type: 'video',
          topicId: video.topicId,
          itemId: videoId,
          stepIndex: 3,
        },
      };
    });
    setCurrentStep(3);
  };

  // 3. Hoàn thành Luyện tập & Cộng +5 XP -> Sang KT1
  const handleCompletePractice = (
    results: QuestionResult[],
    essays: EssaySubmission[],
    earned: number,
    max: number
  ) => {
    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `quiz_completed:${video.practiceQuizId}`,
        XP_CONFIG.VIDEO_PRACTICE_COMPLETED_XP,
        `Hoàn thành luyện tập: ${video.title}`
      );
      return {
        ...prev,
        ...xpRes.updatedState,
        questionResults: [...results, ...prev.questionResults],
        currentProgress: {
          type: 'video',
          topicId: video.topicId,
          itemId: videoId,
          stepIndex: 4,
        },
      };
    });
    setCurrentStep(4);
  };

  // 4. Hoàn thành KT1 (Kiểm tra nhanh) & Cộng +8 XP -> Sang KT2
  const handleCompleteQuickTest = (
    results: QuestionResult[],
    essays: EssaySubmission[],
    earned: number,
    max: number
  ) => {
    if (essays && essays.length > 0) {
      essays.forEach((e) => {
        essayRepository.createSubmission({
          studentId: 'hs001',
          questionId: e.questionId,
          content: e.content,
          wordCount: e.wordCount,
          status: 'PENDING_TEACHER',
          promptTitle: e.promptTitle || 'Viết đoạn văn cảm nghĩ',
          quizTitle: `KT Nhanh: ${video.title}`,
          skillLevel: 'VAN_DUNG',
        }).catch((err: any) => console.error('Lỗi lưu bài essay KT nhanh:', err));
      });
    }

    onUpdateState((prev) => {
      const xpRes = awardXP(
        prev,
        `quiz_completed:${video.quickTestId}`,
        XP_CONFIG.VIDEO_QUICK_TEST_XP,
        `Kiểm tra nhanh 7 phút: ${video.title}`
      );
      return {
        ...prev,
        ...xpRes.updatedState,
        questionResults: [...results, ...prev.questionResults],
        essaySubmissions: [...essays, ...(prev.essaySubmissions || [])],
        currentProgress: {
          type: 'video',
          topicId: video.topicId,
          itemId: videoId,
          stepIndex: 5,
        },
      };
    });
    setCurrentStep(5);
  };

  // 5. Hoàn thành KT2 (Mastery Check) & Cộng +8 XP + BONUS +20 XP Hoàn thành trọn vẹn
  const handleCompleteMasteryCheck = (
    results: QuestionResult[],
    essays: EssaySubmission[],
    earned: number,
    max: number
  ) => {
    if (essays && essays.length > 0) {
      essays.forEach((e) => {
        essayRepository.createSubmission({
          studentId: 'hs001',
          questionId: e.questionId,
          content: e.content,
          wordCount: e.wordCount,
          status: 'PENDING_TEACHER',
          promptTitle: e.promptTitle || 'Viết đoạn văn vận dụng',
          quizTitle: `Mastery Check: ${video.title}`,
          skillLevel: 'VAN_DUNG',
        }).catch((err: any) => console.error('Lỗi lưu bài essay Mastery:', err));
      });
    }

    onUpdateState((prev) => {
      // 1. Cộng XP Mastery Check (+8)
      const res1 = awardXP(
        prev,
        `quiz_completed:${video.masteryCheckId}`,
        XP_CONFIG.VIDEO_MASTERY_CHECK_XP,
        `Kiểm tra năng lực (Mastery Check): ${video.title}`
      );

      // 2. Bonus hoàn thành toàn bộ luồng (+20 XP)
      const res2 = awardXP(
        { ...prev, ...res1.updatedState },
        `video_flow_completed:${videoId}`,
        XP_CONFIG.VIDEO_FULL_COMPLETION_XP,
        `🎉 Thưởng hoàn thành trọn vẹn luồng học video: ${video.title}`
      );

      return {
        ...prev,
        ...res2.updatedState,
        questionResults: [...results, ...prev.questionResults],
        essaySubmissions: [...essays, ...(prev.essaySubmissions || [])],
        currentProgress: undefined, // Xóa tiến độ dở vì đã xong
      };
    });
    setCurrentStep(6);
  };

  const steps = [
    { num: 1, label: 'Xem video' },
    { num: 2, label: 'Trọng tâm' },
    { num: 3, label: 'Luyện tập' },
    { num: 4, label: 'KT nhanh' },
    { num: 5, label: 'Đánh giá' },
    { num: 6, label: 'Hoàn thành' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-8 space-y-6 text-[#1E1B4B]">
      {/* HEADER: Nút quay lại + Tên chủ đề */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <button
          onClick={onBackToList}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách bài giảng</span>
        </button>

        <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#4F46E5] font-bold">
          Luồng Bài giảng Video
        </span>
      </div>

      {/* STEPPER THANH TIẾN TRÌNH 6 BƯỚC */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((st, idx) => {
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="flex-1 flex flex-col items-center relative">
                {/* Đường nối giữa các bước */}
                {idx > 0 && (
                  <div
                    className={`absolute top-4 right-1/2 left-[-50%] h-0.5 -z-0 transition-colors ${
                      currentStep >= st.num ? 'bg-indigo-500' : 'bg-slate-100'
                    }`}
                  />
                )}

                {/* Vòng tròn số bước */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold z-10 transition-all ${
                    isDone
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : isCurrent
                      ? 'gradient-primary text-white ring-4 ring-indigo-100 scale-110 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/80'
                  }`}
                >
                  {isDone ? '✓' : st.num}
                </div>

                <span
                  className={`text-[10px] sm:text-xs mt-1.5 font-bold hidden sm:inline ${
                    isCurrent ? 'text-[#4F46E5]' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= BƯỚC 1: XEM VIDEO ================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] mb-2">
              {video.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                Thời lượng: {Math.round(video.durationSec / 60)} phút
              </span>
              <span>·</span>
              <span>Chủ đề: {video.subtopics.join(', ')}</span>
            </div>

            {/* KHUNG PHÁT VIDEO HOẶC PLACEHOLDER HIỆN ĐẠI */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 shadow-2xl flex flex-col justify-between p-4">
              {!isVideoError ? (
                <video
                  ref={videoRef}
                  src={video.sampleUrl}
                  className="w-full h-full object-cover rounded-2xl"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setIsVideoError(true)}
                  playsInline
                />
              ) : (
                /* Placeholder mô phỏng bài giảng video */
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-2xl">
                  <MamMuc mood="cheer" size="md" className="mb-3" />
                  <p className="text-base sm:text-lg font-extrabold mb-1">
                    {video.title}
                  </p>
                  <p className="text-xs text-slate-300 max-w-sm mb-4">
                    Khung phát mô phỏng thông minh (tự động đếm chính xác từng giây học thật).
                  </p>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-6 py-2.5 rounded-full gradient-primary text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:brightness-105 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying ? 'Tạm dừng bài giảng' : 'Bắt đầu xem bài giảng'}</span>
                  </button>
                </div>
              )}

              {/* BỘ ĐIỀU KHIỂN VIDEO (Modern Controls) */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between text-white text-xs gap-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) videoRef.current.pause();
                        else videoRef.current.play();
                      } else {
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-300">
                    {Math.floor(currentTime / 60)}:
                    {(currentTime % 60).toString().padStart(2, '0')} /{' '}
                    {Math.floor(video.durationSec / 60)}:00
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tốc độ phát 0.75x - 1.5x */}
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1 border border-white/10">
                    <Gauge className="w-3.5 h-3.5 text-yellow-400" />
                    <select
                      value={playbackSpeed}
                      onChange={(e) => {
                        const s = parseFloat(e.target.value);
                        setPlaybackSpeed(s);
                        if (videoRef.current) videoRef.current.playbackRate = s;
                      }}
                      className="bg-transparent text-white font-bold outline-none text-xs cursor-pointer"
                    >
                      <option value="0.75" className="bg-slate-900">0.75x</option>
                      <option value="1" className="bg-slate-900">1.0x</option>
                      <option value="1.25" className="bg-slate-900">1.25x</option>
                      <option value="1.5" className="bg-slate-900">1.5x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* THANH ĐO TIẾN TRÌNH XEM THẬT (Chống tua nhanh) */}
            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-slate-700">
                  Thời lượng đã xem thật: <strong className="text-[#4F46E5] font-bold font-mono">{Math.round(watchedRatio * 100)}%</strong> (Cần ≥ 80% để sang bước tiếp theo)
                </span>
                <span className="text-[#4F46E5] font-bold">+5 XP khi hoàn thành</span>
              </div>
              <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round(watchedRatio * 100))}%` }}
                />
              </div>
            </div>

            {/* Nút sang bước Kiến thức trọng tâm */}
            <div className="mt-6 flex justify-end">
              <button
                disabled={!isWatchedEligible}
                onClick={handleProceedToSummary}
                className="px-6 py-3 rounded-2xl gradient-primary text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Sang Kiến thức trọng tâm (+5 XP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BƯỚC 2: KIẾN THỨC TRỌNG TÂM ================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">
                Kiến thức trọng tâm sau bài giảng
              </h2>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-extrabold">
                +2 XP khi hoàn thành
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Hãy dành ít nhất 15 giây đọc kĩ các ý cần nhớ bên dưới để chuẩn bị cho bài luyện tập nhé!
            </p>

            <div className="space-y-4 mb-8">
              {video.summaryPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-indigo-100 transition-colors"
                >
                  <h4 className="text-sm font-extrabold text-[#1E1B4B] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] text-white text-xs flex items-center justify-center shrink-0 font-bold shadow-xs">
                      {idx + 1}
                    </span>
                    <span>{point.title}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                    {point.content}
                  </p>
                  {point.example && (
                    <div className="mt-2 pl-8 text-xs text-[#4F46E5] italic bg-white p-3 rounded-xl border border-indigo-100">
                      <strong>Ví dụ minh họa:</strong> {point.example}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Nút "Mình đã đọc xong" */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-[#4F46E5] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Xem lại video</span>
              </button>

              <button
                disabled={summarySecondsLeft > 0}
                onClick={handleProceedToPractice}
                className="px-6 py-3 rounded-2xl gradient-primary text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>
                  {summarySecondsLeft > 0
                    ? `Đọc kĩ thêm (${summarySecondsLeft}s)`
                    : 'Mình đã đọc xong (+2 XP)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BƯỚC 3: LUYỆN TẬP ================= */}
      {currentStep === 3 && (
        (() => {
          const q = quizzesMap[video.practiceQuizId] || QUIZZES[video.practiceQuizId];
          if (!q) {
            return (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-700">Chưa có bài luyện tập cho video này.</p>
                <button onClick={() => setCurrentStep(2)} className="text-xs text-[#4F46E5] font-bold">
                  Quay lại tóm tắt
                </button>
              </div>
            );
          }
          const qList = q.questionIds.map((id) => questionsMap[id]).filter(Boolean);
          return (
            <QuizRunner
              quiz={q}
              questions={qList}
              onComplete={handleCompletePractice}
              onExit={() => setCurrentStep(2)}
            />
          );
        })()
      )}

      {/* ================= BƯỚC 4: KIỂM TRA 1 (QUICK TEST) ================= */}
      {currentStep === 4 && (
        (() => {
          const q = quizzesMap[video.quickTestId] || QUIZZES[video.quickTestId];
          if (!q) {
            return (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-700">Chưa có bài kiểm tra 1 cho video này.</p>
                <button onClick={() => setCurrentStep(3)} className="text-xs text-[#4F46E5] font-bold">
                  Quay lại bước trước
                </button>
              </div>
            );
          }
          const qList = q.questionIds.map((id) => questionsMap[id]).filter(Boolean);
          return (
            <QuizRunner
              quiz={q}
              questions={qList}
              onComplete={handleCompleteQuickTest}
              onExit={() => setCurrentStep(3)}
            />
          );
        })()
      )}

      {/* ================= BƯỚC 5: KIỂM TRA 2 (MASTERY CHECK) ================= */}
      {currentStep === 5 && (
        (() => {
          const q = quizzesMap[video.masteryCheckId] || QUIZZES[video.masteryCheckId];
          if (!q) {
            return (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-700">Chưa có bài kiểm tra 2 cho video này.</p>
                <button onClick={() => setCurrentStep(4)} className="text-xs text-[#4F46E5] font-bold">
                  Quay lại bước trước
                </button>
              </div>
            );
          }
          const qList = q.questionIds.map((id) => questionsMap[id]).filter(Boolean);
          return (
            <QuizRunner
              quiz={q}
              questions={qList}
              onComplete={handleCompleteMasteryCheck}
              onExit={() => setCurrentStep(4)}
            />
          );
        })()
      )}

      {/* ================= BƯỚC 6: TỔNG KẾT HOÀN THÀNH TRỌN VẸN ================= */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-[fadeIn_0.4s_ease]">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl shadow-indigo-950/5 text-center relative overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <MamMuc mood="proud" size="xl" className="mx-auto mb-4" />

              <span className="text-xs uppercase tracking-wider text-emerald-600 font-extrabold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-2">
                Tuyệt vời! Bạn đã hoàn thành trọn vẹn luồng học video
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mb-2">
                {video.title}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Bạn đã hoàn thành đủ cả 5 bước: xem bài giảng, đọc tóm tắt, luyện tập và hoàn thành cả 2 bài kiểm tra!
              </p>

              {/* Bảng tổng kết XP nhận được */}
              <div className="p-5 rounded-3xl gradient-soft-indigo border border-indigo-100 max-w-sm mx-auto mb-8 text-center shadow-xs">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  Tổng XP nhận trọn vẹn bài học
                </span>
                <span className="text-4xl font-black text-[#4F46E5] font-mono tabular-nums">
                  +48 XP
                </span>
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                  (Xem: +5 · Tóm tắt: +2 · Luyện tập: +5 · KT1: +8 · KT2: +8 · Thưởng: +20)
                </p>
              </div>

              {/* Nút quay lại học bài tiếp theo */}
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
