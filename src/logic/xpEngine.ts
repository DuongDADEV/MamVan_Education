import { XP_CONFIG, getEffectiveXpConfig } from '../config.ts';
import { StudentState, XPLogEntry } from '../types.ts';

export interface XPCalculationResult {
  stepKey: string;
  isFirstTime: boolean;
  rawXp: number;
  actualXp: number;
  reason: string;
  cappedNotice?: string;
  updatedState: {
    xpToday: number;
    xpWeek: number;
    totalXp: number;
    completedSteps: string[];
    xpLogs: XPLogEntry[];
  };
}

/**
 * Xác định trần XP hiện hành dựa trên số phút học tích cực trong ngày
 */
export function getCurrentDailyXpCap(activeMinutesToday: number): number {
  const cfg = getEffectiveXpConfig();
  if (activeMinutesToday >= cfg.DAILY_ACTIVE_MINUTES_LIMIT) {
    // Quá 90 phút: không cộng thêm
    return cfg.DAILY_CAP_TOTAL;
  }
  if (activeMinutesToday >= 45) {
    // 45 - 90 phút: tổng trần là 150 (hoặc cấu hình)
    return cfg.DAILY_CAP_TOTAL;
  }
  // 0 - 45 phút: trần là 130 (hoặc cấu hình)
  return cfg.DAILY_CAP_UNDER_45_MIN;
}

/**
 * Tính toán và cộng XP theo hành động học tập
 */
export function awardXP(
  state: StudentState,
  actionKey: string,
  rawXp: number,
  actionName: string,
  forceAllowRepeat = false
): XPCalculationResult {
  const isFirstTime = !state.completedSteps.includes(actionKey);

  // Quy tắc 1: Mỗi mục chỉ cộng XP lần đầu hoàn thành
  if (!isFirstTime && !forceAllowRepeat) {
    return {
      stepKey: actionKey,
      isFirstTime: false,
      rawXp,
      actualXp: 0,
      reason: `Bạn đã hoàn thành mục này trước đó. Luyện tập thêm rất tốt nhưng không cộng thêm XP để tránh áp lực điểm số.`,
      updatedState: {
        xpToday: state.xpToday,
        xpWeek: state.xpWeek,
        totalXp: state.totalXp,
        completedSteps: state.completedSteps,
        xpLogs: state.xpLogs,
      },
    };
  }

  const activeMinutes = Math.floor(state.activeSecondsToday / 60);
  const cfg = getEffectiveXpConfig();

  // Kiểm tra nếu học quá 90 phút trong ngày
  if (activeMinutes >= cfg.DAILY_ACTIVE_MINUTES_LIMIT) {
    const log: XPLogEntry = {
      id: 'xp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      actionName,
      rawXp,
      actualXp: 0,
      reason: 'Học quá 90 phút tích cực hôm nay',
      cappedNotice: 'Hôm nay bạn đã học rất chăm chỉ rồi! Hệ thống tạm dừng cộng XP để bạn nghỉ ngơi, nhưng bài học vẫn được ghi nhận trọn vẹn vào Cây và Năng lực nhé!',
    };

    return {
      stepKey: actionKey,
      isFirstTime: true,
      rawXp,
      actualXp: 0,
      reason: 'Đạt trần 90 phút học trong ngày',
      cappedNotice: log.cappedNotice,
      updatedState: {
        xpToday: state.xpToday,
        xpWeek: state.xpWeek,
        totalXp: state.totalXp,
        completedSteps: [...state.completedSteps, actionKey],
        xpLogs: [log, ...state.xpLogs].slice(0, 50),
      },
    };
  }

  // Tính trần ngày
  const dailyCap = getCurrentDailyXpCap(activeMinutes);
  const remainingDaily = Math.max(0, dailyCap - state.xpToday);

  // Tính trần tuần
  const remainingWeekly = Math.max(0, cfg.WEEKLY_XP_CAP - state.xpWeek);

  // XP thực nhận bị chặn bởi trần ngày và trần tuần
  let actualXp = Math.min(rawXp, remainingDaily, remainingWeekly);
  if (actualXp < 0) actualXp = 0;

  let cappedNotice: string | undefined;
  if (actualXp < rawXp) {
    if (remainingDaily <= 0) {
      cappedNotice = `Bạn đã đạt trần ${dailyCap} XP của hôm nay! Việc học vẫn được tính vào Cây lớn và Năng lực, mai chúng mình tích thêm XP nhé.`;
    } else if (remainingWeekly <= 0) {
      cappedNotice = `Tuyệt vời! Bạn đã đạt trần tuần ${cfg.WEEKLY_XP_CAP} XP để đổi quà. Nghỉ ngơi hoặc tiếp tục nuôi Cây Văn nhé!`;
    } else {
      cappedNotice = `Nhận ${actualXp}/${rawXp} XP do chạm giới hạn trần (${dailyCap} XP ngày).`;
    }
  }

  const log: XPLogEntry = {
    id: 'xp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    actionName,
    rawXp,
    actualXp,
    reason: actionName,
    cappedNotice,
  };

  const newCompletedSteps = isFirstTime ? [...state.completedSteps, actionKey] : state.completedSteps;

  return {
    stepKey: actionKey,
    isFirstTime,
    rawXp,
    actualXp,
    reason: `Hoàn thành: ${actionName}`,
    cappedNotice,
    updatedState: {
      xpToday: state.xpToday + actualXp,
      xpWeek: state.xpWeek + actualXp,
      totalXp: state.totalXp + actualXp,
      completedSteps: newCompletedSteps,
      xpLogs: [log, ...state.xpLogs].slice(0, 50),
    },
  };
}
