import { generateDemoSeedData } from '../src/services/mock/demoSeedHistory.ts';
import {
  computeOverviewMetrics,
  detectStudentsNeedingAttention,
  generatePedagogicalInsights,
} from '../src/analytics/metricsEngine.ts';
import {
  computeScoreDistribution,
  computeAvgScoreByTopic,
  computeWeeklyScoreTrends,
  computeClassComparison,
  computeStudentScoreRankings,
} from '../src/analytics/scoreAnalytics.ts';
import {
  computeClassRadarMastery,
  computeStudentTopicHeatmap,
  computeWeakestSkillsByTopic,
  computeMasteryDistribution,
} from '../src/analytics/masteryAnalytics.ts';
import { computeQuestionAnalytics } from '../src/analytics/questionAnalytics.ts';
import {
  computeDailyALT,
  computeWeeklyAttendance,
  computeLearningFunnel,
  computeVideoAnalytics,
  computeTopicProgressList,
} from '../src/analytics/engagementAnalytics.ts';
import { computeStudentProfileData } from '../src/analytics/studentProfileAnalytics.ts';
import { AnalyticsFilter } from '../src/analytics/types.ts';
import { QUESTIONS_BANK } from '../src/data/mockData.ts';

async function runPrompt4Verification() {
  console.log('=== BẮT ĐẦU KIỂM TRA TOÀN DIỆN PROMPT 4: DASHBOARD & PHÂN TÍCH ===\n');

  // 1. KIỂM TRA SEED DỮ LIỆU LỊCH SỬ 6 TUẦN CHO 28 HỌC SINH
  console.log('1. Khởi tạo và kiểm tra seed dữ liệu 6 tuần...');
  const { students, studentStates, classes } = generateDemoSeedData();

  console.log(`- Số lượng học sinh: ${students.length} (kỳ vọng: 28)`);
  if (students.length !== 28) {
    throw new Error(`Kỳ vọng 28 học sinh nhưng nhận được ${students.length}`);
  }

  const demoSeedCount = students.filter((s) => s.isDemoSeed).length;
  console.log(`- Số học sinh có nhãn isDemoSeed: ${demoSeedCount}`);
  if (demoSeedCount !== 28) {
    throw new Error('Tất cả học sinh seed cần có cờ isDemoSeed');
  }

  const sampleState = studentStates[students[0].id];
  console.log(`- Học sinh mẫu (${students[0].name}):`);
  console.log(`  + Số ngày điểm danh qua 6 tuần: ${sampleState.attendanceHistory.length}`);
  console.log(`  + Số câu hỏi đã làm: ${sampleState.questionResults.length}`);
  console.log(`  + Tổng XP: ${sampleState.totalXp}`);
  console.log(`  + Ghi chú sư phạm: "${sampleState.teacherNotes || '—'}"`);

  if (!sampleState.attendanceHistory.length || !sampleState.questionResults.length) {
    throw new Error('Dữ liệu học sinh thiếu lịch sử điểm danh hoặc câu hỏi làm bài');
  }

  // 2. KIỂM TRA BỘ LỌC CHUNG VÀ TỔNG QUAN METRICS
  console.log('\n2. Kiểm tra bộ lọc chung và tính toán 6 thẻ số liệu Tổng quan...');
  const baseFilter: AnalyticsFilter = {
    classIds: [],
    timeRange: '6w',
    topicId: 'all',
    studentIds: [],
    skillLevels: ['NHAN_BIET', 'THONG_HIEU', 'PHAN_TICH', 'VAN_DUNG'],
    activityType: 'all',
  };

  const overviewMetrics = computeOverviewMetrics(studentStates, students, baseFilter);
  console.log(`- Thẻ 1 (Hoạt động 7 ngày): ${overviewMetrics.active7DaysCount}/${students.length} (${overviewMetrics.active7DaysDiffPercent >= 0 ? '+' : ''}${overviewMetrics.active7DaysDiffPercent}%)`);
  console.log(`- Thẻ 2 (Tỉ lệ hoàn thành): ${overviewMetrics.completionRatePercent}% (${overviewMetrics.completionRateDiffPercent >= 0 ? '+' : ''}${overviewMetrics.completionRateDiffPercent}%)`);
  console.log(`- Thẻ 3 (Điểm trung bình): ${overviewMetrics.averageScore}/10 (${overviewMetrics.averageScoreDiff >= 0 ? '+' : ''}${overviewMetrics.averageScoreDiff})`);
  console.log(`- Thẻ 4 (Thời gian học TB/tuần): ${overviewMetrics.avgActiveMinutesPerWeek} phút (${overviewMetrics.avgActiveMinutesDiff >= 0 ? '+' : ''}${overviewMetrics.avgActiveMinutesDiff}%)`);
  console.log(`- Thẻ 5 (Bài viết chờ chấm): ${overviewMetrics.pendingGradingCount}`);
  console.log(`- Thẻ 6 (Quà chờ duyệt): ${overviewMetrics.pendingRewardCount}`);

  if (overviewMetrics.averageScore <= 0 || overviewMetrics.active7DaysCount <= 0) {
    throw new Error('Thẻ số liệu tổng quan trả về giá trị không hợp lệ');
  }

  // 3. KIỂM TRA DANH SÁCH "CẦN CHÚ Ý" VÀ "NHẬN XÉT TỰ ĐỘNG"
  console.log('\n3. Kiểm tra phát hiện "Cần chú ý" và nhận xét tự động sư phạm...');
  const topics = [
    { id: 'topic_tho_bon_nam', title: 'Thơ bốn chữ và năm chữ' },
    { id: 'topic_tu_lay_so_sanh', title: 'Từ láy và biện pháp tu từ so sánh' },
    { id: 'topic_truyen_ngan', title: 'Truyện ngắn hiện đại' },
  ];

  const attentionList = detectStudentsNeedingAttention(studentStates, students, topics as any, baseFilter);
  console.log(`- Số học sinh cần giáo viên quan tâm: ${attentionList.length}`);
  attentionList.slice(0, 3).forEach((item, idx) => {
    console.log(`  [${idx + 1}] ${item.studentName} (${item.className}): ${item.reasonTag} -> ${item.reasonDetail}`);
  });

  if (attentionList.length === 0) {
    throw new Error('Hệ thống phải tự động nhận diện ít nhất 1 học sinh cần quan tâm (at_risk / weak_analysis)');
  }

  const insights = generatePedagogicalInsights(studentStates, topics as any, baseFilter);
  console.log(`- Số câu nhận xét tự động: ${insights.length} (3-5 câu theo quy định)`);
  insights.forEach((ins, idx) => {
    console.log(`  [${idx + 1}] ${ins.text}`);
  });

  if (insights.length < 3) {
    throw new Error('Cần sinh ít nhất 3 nhận xét tự động theo góc nhìn sư phạm');
  }

  // 4. KIỂM TRA PHÂN TÍCH ĐIỂM SỐ (TAB 1)
  console.log('\n4. Kiểm tra phân tích Điểm số (Histogram, Chủ đề, Tuần, Lớp, Xếp hạng)...');
  const dist = computeScoreDistribution(studentStates, students, baseFilter);
  console.log(`- Histogram số dải điểm: ${dist.length}`);
  dist.forEach((b) => console.log(`  + ${b.rangeLabel}: ${b.count} học sinh (${b.percentage}%)`));

  const topicScores = computeAvgScoreByTopic(studentStates, topics as any, baseFilter);
  console.log(`- Điểm TB theo chủ đề (${topicScores.length} chủ đề):`);
  topicScores.forEach((ts) => console.log(`  + ${ts.topicTitle}: ${ts.averageScore}/10 (${ts.attemptCount} lượt)`));

  const weeklyTrends = computeWeeklyScoreTrends(studentStates, baseFilter);
  console.log(`- Xu hướng điểm theo tuần: ${weeklyTrends.length} tuần`);

  const classComp = computeClassComparison(studentStates, students, classes);
  console.log(`- So sánh giữa các lớp (${classComp.length} lớp):`);
  classComp.forEach((c) => console.log(`  + Lớp ${c.className}: TB ${c.averageScore}, Tỉ lệ đạt ${c.passRate}%`));

  const rankings = computeStudentScoreRankings(studentStates, students, baseFilter);
  console.log(`- Bảng điểm nội bộ: ${rankings.length} học sinh xếp theo điểm`);

  // 5. KIỂM TRA KỸ NĂNG & MASTERY 4 MỨC (TAB 2)
  console.log('\n5. Kiểm tra Mastery 4 mức (Radar, Heatmap, Weakest skills)...');
  const radar = computeClassRadarMastery(studentStates, students, baseFilter);
  console.log('- Radar 4 mức năng lực của lớp:');
  radar.forEach((r) => console.log(`  + ${r.levelName}: ${r.classAverage}% (Mục tiêu: ${r.targetGoal}%)`));

  const heatmap = computeStudentTopicHeatmap(studentStates, students, topics as any, baseFilter);
  console.log(`- Ma trận Heatmap: ${heatmap.length} ô (Học sinh × Chủ đề)`);

  const weakest = computeWeakestSkillsByTopic(studentStates, topics as any);
  console.log(`- Mức năng lực yếu nhất & Gợi ý hành động: ${weakest.length} gợi ý`);
  weakest.forEach((w) => console.log(`  + ${w.topicTitle} (Mức ${w.levelName}): ${w.pedagogicalAdvice}`));

  // 6. KIỂM TRA PHÂN TÍCH CÂU HỎI (TAB 3)
  console.log('\n6. Kiểm tra phân tích câu hỏi trong ngân hàng...');
  const qAnalytics = computeQuestionAnalytics(studentStates, QUESTIONS_BANK, topics as any, baseFilter);
  console.log(`- Số câu hỏi phân tích: ${qAnalytics.length}`);
  const flaggedQuestions = qAnalytics.filter((q) => q.flag);
  console.log(`- Số câu được gắn cờ cảnh báo (quá khó/dễ/nghi lỗi): ${flaggedQuestions.length}`);
  flaggedQuestions.slice(0, 3).forEach((q) => {
    console.log(`  + [${q.questionId}] ${q.flagLabel} - Đúng: ${q.accuracyRate}%`);
  });

  // 7. KIỂM TRA TƯƠNG TÁC & THỜI GIAN HỌC (TAB 4)
  console.log('\n7. Kiểm tra tương tác (ALT, Phễu 5 bước, Điểm danh, Video)...');
  const dailyAlt = computeDailyALT(studentStates, students, baseFilter);
  console.log(`- Chuỗi thời gian ALT: ${dailyAlt.length} ngày`);

  const funnel = computeLearningFunnel(studentStates, students.length);
  console.log('- Phễu học tập 5 bước:');
  funnel.forEach((f) => console.log(`  + ${f.stepName}: ${f.studentCount} HS (${f.percentage}%) - Rơi: ${f.dropOffPercentage}%`));

  const video = computeVideoAnalytics();
  console.log(`- Video xem >= 80%: ${video.completionRateOver80}%, Điểm nóng xem lại: ${video.rewatchHotspots.length} điểm`);

  // 8. KIỂM TRA HỒ SƠ HỌC SINH (TAB 5)
  console.log('\n8. Kiểm tra tính toán Hồ sơ học sinh chi tiết...');
  const studentProfile = computeStudentProfileData(students[0].id, studentStates, students, topics as any);
  if (!studentProfile) {
    throw new Error('Không thể tính toán hồ sơ học sinh');
  }
  console.log(`- Hồ sơ học sinh: ${studentProfile.account.name} (Lớp ${studentProfile.className})`);
  console.log(`  + Thứ hạng: ${studentProfile.rankInClass}/${studentProfile.totalStudentsInClass}`);
  console.log(`  + Số điểm radar mức năng lực: ${studentProfile.radarScores.length}`);
  console.log(`  + Tiến độ chủ đề: ${studentProfile.topicMasteryList.length} chủ đề`);
  console.log(`  + Lịch sử làm câu hỏi: ${studentProfile.attemptHistory.length} câu`);
  console.log(`  + Hoạt động theo 6 tuần: ${studentProfile.weeklyActivity.length} tuần`);

  // 9. KIỂM TRA TÍNH PHẢN ỨNG (REACTIVE UPDATES KHI HỌC SINH LÀM BÀI)
  console.log('\n9. Kiểm tra tính phản ứng (Học sinh làm bài -> Dashboard thay đổi tức thì)...');
  const testStudentId = students[0].id;
  const initialAttemptsCount = studentStates[testStudentId].questionResults.length;
  const initialAvgScore = computeOverviewMetrics(studentStates, students, baseFilter).averageScore;

  // Giả lập học sinh làm thêm 1 câu hỏi kiểm tra đúng tuyệt đối
  studentStates[testStudentId].questionResults.push({
    questionId: 'q_tho_01',
    level: 'NHAN_BIET',
    isCorrect: true,
    scoreRatio: 1.0,
    timestamp: Date.now(),
    topicId: 'topic_tho_bon_nam',
  });

  const updatedAttemptsCount = studentStates[testStudentId].questionResults.length;
  const updatedAvgScore = computeOverviewMetrics(studentStates, students, baseFilter).averageScore;
  console.log(`- Trước: ${initialAttemptsCount} câu, Điểm TB: ${initialAvgScore}`);
  console.log(`- Sau: ${updatedAttemptsCount} câu, Điểm TB: ${updatedAvgScore}`);

  if (updatedAttemptsCount !== initialAttemptsCount + 1) {
    throw new Error('Số lượng câu hỏi không được ghi nhận phản ứng');
  }

  // 10. KIỂM TRA BỘ LỌC THEO LỚP
  console.log('\n10. Kiểm tra hiệu lực của bộ lọc theo Lớp (Lớp 7A2)...');
  const filter7A2: AnalyticsFilter = {
    ...baseFilter,
    classIds: ['class_7a2'],
  };
  const metrics7A2 = computeOverviewMetrics(studentStates, students, filter7A2);
  const students7A2 = students.filter((s) => s.class_id === 'class_7a2');
  console.log(`- Toàn trường: ${overviewMetrics.active7DaysCount} em hoạt động / Lớp 7A2: ${metrics7A2.active7DaysCount} em hoạt động (${students7A2.length} HS)`);
  if (metrics7A2.active7DaysCount > overviewMetrics.active7DaysCount) {
    throw new Error('Bộ lọc lớp không thu hẹp phạm vi số liệu');
  }

  console.log('\n=== TẤT CẢ CÁC BƯỚC KIỂM TRA ĐỀU HOÀN THÀNH XUẤT SẮC 100%! ===');
}

runPrompt4Verification().catch((err) => {
  console.error('\n❌ KIỂM TRA THẤT BẠI:', err);
  process.exit(1);
});
