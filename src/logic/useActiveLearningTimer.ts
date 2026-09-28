import { useEffect, useRef, useState, useCallback } from 'react';
import { TIME_CONFIG } from '../config.ts';

interface ActiveLearningTimerProps {
  initialSecondsToday: number;
  onTick?: (activeSecondsToday: number, continuousSeconds: number) => void;
  onBreakReminder?: () => void;
  multiplier?: number;
  isVideoPlaying?: boolean;
}

export function useActiveLearningTimer({
  initialSecondsToday,
  onTick,
  onBreakReminder,
  multiplier = 1,
  isVideoPlaying = false,
}: ActiveLearningTimerProps) {
  const [activeSecondsToday, setActiveSecondsToday] = useState(initialSecondsToday);
  const [continuousSeconds, setContinuousSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [hasPromptedBreak, setHasPromptedBreak] = useState(false);

  const lastActivityTimestampRef = useRef<number>(Date.now());
  const activeSecondsRef = useRef(initialSecondsToday);
  const continuousSecondsRef = useRef(0);
  const isVideoPlayingRef = useRef(isVideoPlaying);
  const multiplierRef = useRef(multiplier);
  const hasPromptedBreakRef = useRef(hasPromptedBreak);

  // Lưu callbacks bằng ref để không làm recreate setInterval
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const onBreakReminderRef = useRef(onBreakReminder);
  onBreakReminderRef.current = onBreakReminder;

  // Cập nhật refs
  useEffect(() => {
    isVideoPlayingRef.current = isVideoPlaying;
  }, [isVideoPlaying]);

  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    hasPromptedBreakRef.current = hasPromptedBreak;
  }, [hasPromptedBreak]);

  // Cập nhật khi initialSecondsToday từ state cha thay đổi (ví dụ khi đổi user hoặc reset)
  useEffect(() => {
    setActiveSecondsToday(initialSecondsToday);
    activeSecondsRef.current = initialSecondsToday;
  }, [initialSecondsToday]);

  // Bộ lắng nghe sự kiện tương tác của người dùng
  const recordActivity = useCallback(() => {
    lastActivityTimestampRef.current = Date.now();
    setIsActive(true);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    const handleEvent = () => recordActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
    };
  }, [recordActivity]);

  // Interval chính đo từng giây - CHỈ TẠO 1 LẦN DUY NHẤT
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Kiểm tra tab có đang hiển thị hay không
      const isTabVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      if (!isTabVisible) {
        setIsActive(false);
        return;
      }

      // 2. Kiểm tra thời gian không hoạt động
      const now = Date.now();
      const secondsSinceLastAction = Math.floor((now - lastActivityTimestampRef.current) / 1000);

      // Nếu video đang phát hoặc người dùng có thao tác trong vòng IDLE_LIMIT_SECONDS (4 phút)
      const isCurrentlyActive = isVideoPlayingRef.current || secondsSinceLastAction < TIME_CONFIG.IDLE_LIMIT_SECONDS;

      setIsActive(isCurrentlyActive);

      if (isCurrentlyActive) {
        const addedSeconds = 1 * (multiplierRef.current || 1);
        activeSecondsRef.current += addedSeconds;
        continuousSecondsRef.current += addedSeconds;

        setActiveSecondsToday(activeSecondsRef.current);
        setContinuousSeconds(continuousSecondsRef.current);

        if (onTickRef.current) {
          onTickRef.current(activeSecondsRef.current, continuousSecondsRef.current);
        }

        // Kiểm tra nhắc nghỉ: 45 phút học liên tục
        const continuousMinutes = Math.floor(continuousSecondsRef.current / 60);
        if (
          continuousMinutes >= TIME_CONFIG.BREAK_REMINDER_MINUTES &&
          !hasPromptedBreakRef.current
        ) {
          setHasPromptedBreak(true);
          hasPromptedBreakRef.current = true;
          if (onBreakReminderRef.current) {
            onBreakReminderRef.current();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array: chỉ tạo 1 lần và dọn dẹp khi unmount

  const resetContinuousTimer = useCallback(() => {
    continuousSecondsRef.current = 0;
    setContinuousSeconds(0);
    setHasPromptedBreak(false);
  }, []);

  return {
    activeSecondsToday,
    activeMinutesToday: Math.floor(activeSecondsToday / 60),
    continuousMinutes: Math.floor(continuousSeconds / 60),
    isActive,
    recordActivity,
    resetContinuousTimer,
  };
}
