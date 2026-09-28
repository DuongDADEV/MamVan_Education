import { AnalyticsFilter, TimeRangeOption } from './types.ts';
import { StudentState, QuestionResult, EssaySubmission } from '../types.ts';
import { StudentAccount } from '../services/types.ts';

const ONE_DAY = 86400000;

export function getFilterDateRange(filter: AnalyticsFilter): [number, number] {
  const now = Date.now();
  if (filter.timeRange === 'custom' && filter.customDateRange) {
    return filter.customDateRange;
  }
  if (filter.timeRange === '7d') {
    return [now - 7 * ONE_DAY, now];
  }
  if (filter.timeRange === '30d') {
    return [now - 30 * ONE_DAY, now];
  }
  if (filter.timeRange === 'this_week') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
    return [monday, now];
  }
  // 6w (Mặc định toàn bộ dữ liệu mẫu 6 tuần)
  return [now - 42 * ONE_DAY, now];
}

export function filterStudents(
  students: StudentAccount[],
  filter: AnalyticsFilter
): StudentAccount[] {
  return students.filter((s) => {
    // Lọc theo lớp
    const matchClass =
      filter.classIds.includes('all') ||
      filter.classIds.length === 0 ||
      filter.classIds.includes(s.class_id);

    if (!matchClass) return false;

    // Lọc theo học sinh cụ thể
    if (filter.studentIds && filter.studentIds.length > 0) {
      if (!filter.studentIds.includes(s.id)) return false;
    }

    return true;
  });
}

export function filterStudentStates(
  allStates: Record<string, StudentState>,
  allowedStudentIds: Set<string>
): Record<string, StudentState> {
  const filtered: Record<string, StudentState> = {};
  for (const [id, state] of Object.entries(allStates)) {
    if (allowedStudentIds.has(id)) {
      filtered[id] = state;
    }
  }
  return filtered;
}

export function filterQuestionResults(
  results: QuestionResult[],
  filter: AnalyticsFilter,
  dateRange: [number, number]
): QuestionResult[] {
  const [startTime, endTime] = dateRange;
  return results.filter((r) => {
    // Lọc theo thời gian
    if (r.timestamp < startTime || r.timestamp > endTime) return false;

    // Lọc theo chủ đề
    if (filter.topicId && filter.topicId !== 'all') {
      if (r.topicId !== filter.topicId) return false;
    }

    // Lọc theo mức năng lực
    if (filter.skillLevels && filter.skillLevels.length > 0) {
      if (!filter.skillLevels.includes(r.level)) return false;
    }

    return true;
  });
}

export function filterEssays(
  essays: EssaySubmission[],
  filter: AnalyticsFilter,
  allowedStudentIds: Set<string>,
  dateRange: [number, number]
): EssaySubmission[] {
  const [startTime, endTime] = dateRange;
  return essays.filter((e) => {
    if (!allowedStudentIds.has(e.studentId)) return false;
    if (e.submittedAt < startTime || e.submittedAt > endTime) return false;
    if (filter.topicId && filter.topicId !== 'all') {
      if (e.quizId && !e.quizId.includes(filter.topicId)) return false;
    }
    return true;
  });
}
