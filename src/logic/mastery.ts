import { MASTERY_CONFIG } from '../config.ts';
import { MasteryStatus, QuestionResult, SkillLevel } from '../types.ts';

export interface SkillMasteryInfo {
  level: SkillLevel;
  displayName: string;
  shortDesc: string;
  exampleSkill: string;
  totalQuestionsAttempted: number;
  percentage: number; // 0..100
  status: MasteryStatus;
  statusLabel: string;
}

export const SKILL_METADATA: Record<
  SkillLevel,
  { displayName: string; shortDesc: string; exampleSkill: string }
> = {
  NHAN_BIET: {
    displayName: 'Nhớ được',
    shortDesc: 'Nhận ra thể thơ, từ láy, dấu hiệu tu từ và kiến thức cơ bản',
    exampleSkill: 'Chỉ ra biện pháp tu từ trong câu, nhớ tên thể thơ bốn chữ, năm chữ',
  },
  THONG_HIEU: {
    displayName: 'Hiểu được',
    shortDesc: 'Giải thích tác dụng tu từ, nghĩa từ vựng và nội dung đoạn văn',
    exampleSkill: 'Giải thích tác dụng của so sánh, hiểu dụng ý của tác giả',
  },
  PHAN_TICH: {
    displayName: 'Phân tích được',
    shortDesc: 'Mổ xẻ vẻ đẹp ngôn từ, diễn biến tâm lý nhân vật và cảm xúc thơ',
    exampleSkill: 'Phân tích hình ảnh thơ độc đáo, làm rõ nét tính cách nhân vật',
  },
  VAN_DUNG: {
    displayName: 'Vận dụng được',
    shortDesc: 'Viết đoạn văn biểu cảm, sáng tạo và liên hệ thực tế cuộc sống',
    exampleSkill: 'Viết đoạn văn ghi lại cảm nghĩ về bài thơ, liên hệ tình cảm gia đình',
  },
};

/**
 * Tính điểm Mastery cho một mức năng lực dựa trên danh sách kết quả câu hỏi
 * Sử dụng trung bình có trọng số suy giảm theo thời gian (lần làm gần nhất quan trọng hơn)
 */
export function calculateLevelMastery(
  results: QuestionResult[],
  level: SkillLevel,
  topicId?: string
): SkillMasteryInfo {
  const meta = SKILL_METADATA[level];
  const relevantResults = results
    .filter((r) => r.level === level && (!topicId || r.topicId === topicId))
    // Sắp xếp mới nhất lên đầu
    .sort((a, b) => b.timestamp - a.timestamp);

  const count = relevantResults.length;

  if (count < MASTERY_CONFIG.MIN_QUESTIONS_REQUIRED) {
    return {
      level,
      displayName: meta.displayName,
      shortDesc: meta.shortDesc,
      exampleSkill: meta.exampleSkill,
      totalQuestionsAttempted: count,
      percentage: count > 0 ? Math.round(relevantResults.reduce((acc, r) => acc + r.scoreRatio, 0) / count * 100) : 0,
      status: 'INSUFFICIENT_DATA',
      statusLabel: `Chưa đủ dữ liệu (${count}/${MASTERY_CONFIG.MIN_QUESTIONS_REQUIRED} câu)`,
    };
  }

  // Lấy tối đa 12 câu gần nhất để tính trọng số
  const sample = relevantResults.slice(0, 12);
  let weightedScoreSum = 0;
  let weightSum = 0;

  sample.forEach((item, index) => {
    // index 0 là gần nhất, trọng số = 1; index k có trọng số = factor^k
    const weight = Math.pow(MASTERY_CONFIG.WEIGHT_DECAY_FACTOR, index);
    weightedScoreSum += item.scoreRatio * weight;
    weightSum += weight;
  });

  const percentage = Math.round((weightedScoreSum / weightSum) * 100);

  let status: MasteryStatus = 'PROGRESSING';
  let statusLabel = 'Đang tiến bộ';

  if (percentage < MASTERY_CONFIG.THRESHOLD_NEEDS_REVIEW) {
    status = 'NEEDS_REVIEW';
    statusLabel = 'Cần ôn lại';
  } else if (percentage >= MASTERY_CONFIG.THRESHOLD_PROGRESSING) {
    status = 'SOLID';
    statusLabel = 'Vững';
  }

  return {
    level,
    displayName: meta.displayName,
    shortDesc: meta.shortDesc,
    exampleSkill: meta.exampleSkill,
    totalQuestionsAttempted: count,
    percentage,
    status,
    statusLabel,
  };
}

/**
 * Tính toàn bộ Mastery 4 mức
 */
export function calculateAllMastery(
  results: QuestionResult[],
  topicId?: string
): Record<SkillLevel, SkillMasteryInfo> {
  return {
    NHAN_BIET: calculateLevelMastery(results, 'NHAN_BIET', topicId),
    THONG_HIEU: calculateLevelMastery(results, 'THONG_HIEU', topicId),
    PHAN_TICH: calculateLevelMastery(results, 'PHAN_TICH', topicId),
    VAN_DUNG: calculateLevelMastery(results, 'VAN_DUNG', topicId),
  };
}

/**
 * Kiểm tra xem một chủ đề có đạt trạng thái "Vững" hay chưa
 * Điều kiện: Nhận biết & Thông hiểu >= 80% VÀ Phân tích & Vận dụng >= 60%
 */
export function isTopicSolid(results: QuestionResult[], topicId: string): boolean {
  const mastery = calculateAllMastery(results, topicId);
  
  // Nếu chưa đủ dữ liệu ở các mức cơ bản thì chưa tính vững
  if (
    mastery.NHAN_BIET.status === 'INSUFFICIENT_DATA' ||
    mastery.THONG_HIEU.status === 'INSUFFICIENT_DATA'
  ) {
    return false;
  }

  const rememberAndUnderstand =
    mastery.NHAN_BIET.percentage >= MASTERY_CONFIG.TOPIC_SOLID_REMEMBER_UNDERSTAND &&
    mastery.THONG_HIEU.percentage >= MASTERY_CONFIG.TOPIC_SOLID_REMEMBER_UNDERSTAND;

  // Với Phân tích & Vận dụng: nếu có dữ liệu thì cần >= 60%, nếu chưa làm câu nào ở mức này thì chưa đạt Vững toàn diện
  const analyzePass =
    mastery.PHAN_TICH.status === 'INSUFFICIENT_DATA'
      ? false
      : mastery.PHAN_TICH.percentage >= MASTERY_CONFIG.TOPIC_SOLID_ANALYZE_APPLY;
  
  const applyPass =
    mastery.VAN_DUNG.status === 'INSUFFICIENT_DATA'
      ? false
      : mastery.VAN_DUNG.percentage >= MASTERY_CONFIG.TOPIC_SOLID_ANALYZE_APPLY;

  return rememberAndUnderstand && analyzePass && applyPass;
}

/**
 * Tạo nhận xét của Mầm Mực theo cấu trúc: Điểm tốt → Cần xem lại → Lời nhắn thân thiện
 */
export function generateMamMucFeedback(
  mastery: Record<SkillLevel, SkillMasteryInfo>,
  quizTitle?: string
): { goodPoint: string; needsReview: string; encouragement: string; rawText: string } {
  const levels = Object.values(mastery);
  const solidLevels = levels.filter((l) => l.status === 'SOLID');
  const reviewLevels = levels.filter((l) => l.status === 'NEEDS_REVIEW');
  const progressingLevels = levels.filter((l) => l.status === 'PROGRESSING');

  let goodPoint = 'Bạn đã rất cố gắng tập trung hoàn thành bài học!';
  if (solidLevels.length > 0) {
    const names = solidLevels.map((l) => `"${l.displayName}"`).join(' và ');
    goodPoint = `Bạn nắm rất chắc phần ${names} (${solidLevels[0].percentage}%), phản xạ trả lời nhanh và chính xác!`;
  } else if (progressingLevels.length > 0) {
    goodPoint = `Khả năng ${progressingLevels[0].displayName} của bạn đang tiến bộ rõ rệt qua từng câu hỏi!`;
  }

  let needsReview = 'Kiến thức hiện tại khá cân bằng, bạn chỉ cần giữ nhịp học này.';
  if (reviewLevels.length > 0) {
    const weak = reviewLevels[0];
    needsReview = `Phần "${weak.displayName}" (${weak.percentage}%) còn đôi chỗ hơi nhầm lẫn, mình xem lại đoạn tóm tắt hoặc video nhé.`;
  } else {
    const insufficient = levels.filter((l) => l.status === 'INSUFFICIENT_DATA');
    if (insufficient.length > 0) {
      needsReview = `Chúng mình làm thêm vài câu ở mức "${insufficient[0].displayName}" để Mầm Mực đo chuẩn hơn nhé!`;
    }
  }

  const encouragements = [
    'Học Văn như ươm mầm cây, từng con chữ hôm nay sẽ nở hoa vào ngày mai bạn nhé!',
    'Mầm Mực rất vui vì bạn đã kiên trì đến câu cuối cùng. Nghỉ một chút rồi học tiếp nhé!',
    'Không cần phải hoàn hảo ngay, quan trọng là bạn hiểu thêm một ý thơ hay mỗi ngày!',
  ];
  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  const rawText = `${goodPoint} ${needsReview} ${encouragement}`;

  return { goodPoint, needsReview, encouragement, rawText };
}
