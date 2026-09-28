import {
  StudentAccount,
  ClassItem,
} from '../types.ts';
import {
  StudentState,
  QuestionResult,
  EssaySubmission,
  XPLogEntry,
  RewardRequest,
  SkillLevel,
} from '../../types.ts';
import { QUESTIONS_BANK } from '../../data/mockData.ts';

// Deterministic PRNG (Linear Congruential Generator)
let prngSeed = 987654321;
function pseudoRandom(): number {
  prngSeed = (prngSeed * 1664525 + 1013904223) % 4294967296;
  return prngSeed / 4294967296;
}

function randInt(min: number, max: number): number {
  return Math.floor(pseudoRandom() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

// 28 Học sinh đại diện cho 2 lớp (16 em Lớp 7A2, 12 em Lớp 7A3)
interface StudentTemplate {
  id: string;
  name: string;
  username: string;
  classId: string;
  className: string;
  studentCode: string;
  archetype: 'high_performer' | 'progressing' | 'weak_analysis' | 'erratic' | 'at_risk';
  teacherNote?: string;
}

const STUDENT_TEMPLATES: StudentTemplate[] = [
  // --- LỚP 7A2 (16 học sinh) ---
  { id: 'hs001', name: 'Nguyễn Minh Anh', username: 'hs001', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-01', archetype: 'high_performer', teacherNote: 'Rất có năng khiếu cảm thụ thơ ca, câu văn truyền cảm. Định hướng bồi dưỡng HSG cấp trường.' },
  { id: 'hs002', name: 'Trần Gia Bảo', username: 'hs002', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-02', archetype: 'weak_analysis', teacherNote: 'Nắm chắc kiến thức nhớ/hiểu nhưng còn yếu khi phân tích tác dụng biện pháp tu từ. Cần giao thêm bài tập mổ xẻ hình ảnh thơ.' },
  { id: 'hs003', name: 'Lê Hoàng Nam', username: 'hs003', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-03', archetype: 'progressing', teacherNote: 'Chăm chỉ, tiến bộ rõ rệt qua từng tuần. Kỹ năng diễn đạt ngày càng gãy gọn.' },
  { id: 'hs004', name: 'Vũ Bảo Ngọc', username: 'hs004', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-04', archetype: 'high_performer', teacherNote: 'Bài viết đoạn văn luôn đạt điểm giỏi (8.5 - 9.5). Tư duy bố cục chặt chẽ.' },
  { id: 'hs005', name: 'Phạm Quốc Tuấn', username: 'hs005', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-05', archetype: 'at_risk', teacherNote: 'Có dấu hiệu bỏ bê, 6 ngày chưa đăng nhập. Đã liên hệ phụ huynh đôn đốc nhắc nhở tối thứ Năm.' },
  { id: 'hs006', name: 'Đỗ Mai Chi', username: 'hs006', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-06', archetype: 'progressing', teacherNote: 'Cần rèn thêm viết câu phức và cách liên hệ thực tế trong đoạn văn vận dụng.' },
  { id: 'hs007', name: 'Bùi Quang Huy', username: 'hs007', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-07', archetype: 'erratic', teacherNote: 'Học tập thất thường. Tuần thì làm rất nhiều bài, tuần thì bỏ lơ. Cần theo dõi nhịp độ học hằng tuần.' },
  { id: 'hs008', name: 'Hoàng Thảo Linh', username: 'hs008', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-08', archetype: 'high_performer', teacherNote: 'Điểm số ổn định ở mức xuất sắc. Tích cực tham gia trả lời và đổi quà bookmark.' },
  { id: 'hs009', name: 'Ngô Đức Trọng', username: 'hs009', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-09', archetype: 'weak_analysis', teacherNote: 'Thường làm bài kiểm tra rất vội, hay bỏ qua bước phân tích dẫn chứng.' },
  { id: 'hs010', name: 'Dương Phương Anh', username: 'hs010', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-10', archetype: 'progressing', teacherNote: 'Giọng văn hồn nhiên, tiến bộ tốt ở chủ đề Từ láy và So sánh.' },
  { id: 'hs011', name: 'Đinh Hữu Phước', username: 'hs011', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-11', archetype: 'at_risk', teacherNote: 'Làm bài kiểm tra rất nhanh (< 2 phút), điểm thấp. Cần nhắc em xem kỹ video bài giảng trước khi làm bài.' },
  { id: 'hs012', name: 'Lý Thanh Hương', username: 'hs012', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-12', archetype: 'progressing', teacherNote: 'Chăm học đều đặn, tuần nào cũng đạt 5/5 ngày điểm danh.' },
  { id: 'hs013', name: 'Lâm Tuấn Kiệt', username: 'hs013', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-13', archetype: 'weak_analysis', teacherNote: 'Mức Phân tích chỉ đạt 42% ở bài Thơ 4-5 chữ. Cần giao thêm phiếu luyện tập chuyên đề.' },
  { id: 'hs014', name: 'Trịnh Thùy Trang', username: 'hs014', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-14', archetype: 'high_performer', teacherNote: 'Văn phong chững chạc, giàu sức gợi cảm.' },
  { id: 'hs015', name: 'Hồ Minh Đăng', username: 'hs015', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-15', archetype: 'erratic', teacherNote: 'Tâm lý học tập phụ thuộc cảm hứng. Cần khích lệ động viên thường xuyên bằng huy hiệu Mầm Mực.' },
  { id: 'hs016', name: 'Phan Gia Hân', username: 'hs016', classId: 'class_7a2', className: '7A2', studentCode: 'HS7A2-16', archetype: 'progressing', teacherNote: 'Rất chăm xem lại video lý thuyết, tỉ lệ xem đạt 95%.' },

  // --- LỚP 7A3 (12 học sinh) ---
  { id: 'hs017', name: 'Vũ Đức Duy', username: 'hs017', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-01', archetype: 'high_performer', teacherNote: 'Cán sự môn Văn lớp 7A3, gương mẫu và tích cực.' },
  { id: 'hs018', name: 'Nguyễn Diệu Linh', username: 'hs018', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-02', archetype: 'progressing', teacherNote: 'Tiến bộ vững vàng từ mức trung bình lên mức khá.' },
  { id: 'hs019', name: 'Trần Hải Đăng', username: 'hs019', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-03', archetype: 'weak_analysis', teacherNote: 'Khó khăn trong việc tìm từ ngữ đắt giá để giải thích tác dụng nghệ thuật.' },
  { id: 'hs020', name: 'Lê Khánh Ngọc', username: 'hs020', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-04', archetype: 'progressing', teacherNote: 'Có nỗ lực cao trong các bài viết đoạn văn tự luận.' },
  { id: 'hs021', name: 'Phạm Nhật Nam', username: 'hs021', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-05', archetype: 'at_risk', teacherNote: '7 ngày chưa đăng nhập vào hệ thống. Cần cô chủ nhiệm hỗ trợ nhắc nhở.' },
  { id: 'hs022', name: 'Hoàng Yến Nhi', username: 'hs022', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-06', archetype: 'erratic', teacherNote: 'Thiếu kiên nhẫn khi đọc các đoạn ngữ liệu dài trên 100 chữ.' },
  { id: 'hs023', name: 'Bùi Thế Anh', username: 'hs023', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-07', archetype: 'weak_analysis', teacherNote: 'Cần hướng dẫn lại mô hình 4 vế của phép so sánh tu từ.' },
  { id: 'hs024', name: 'Đặng Ngọc Ánh', username: 'hs024', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-08', archetype: 'progressing', teacherNote: 'Đạt danh hiệu Học sinh chuyên cần tuần 3 và tuần 5.' },
  { id: 'hs025', name: 'Trương Quốc Bảo', username: 'hs025', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-09', archetype: 'at_risk', teacherNote: 'Hay làm bài muộn sau hạn chót nộp bài.' },
  { id: 'hs026', name: 'Lê Phương Uyên', username: 'hs026', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-10', archetype: 'erratic', teacherNote: 'Cần sự theo dõi sát sao từ giáo viên trong giờ tự học.' },
  { id: 'hs027', name: 'Võ Minh Khang', username: 'hs027', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-11', archetype: 'weak_analysis', teacherNote: 'Yếu ở câu hỏi mở mức Phân tích của chủ đề Truyện ngắn.' },
  { id: 'hs028', name: 'Đoàn Thu Thảo', username: 'hs028', classId: 'class_7a3', className: '7A3', studentCode: 'HS7A3-12', archetype: 'progressing', teacherNote: 'Thái độ học tập nghiêm túc, tích cực hỏi bài khi gặp thắc mắc.' },
];

/**
 * Sinh dữ liệu lịch sử 6 tuần một cách có quy luật, nhất quán và cố định qua seed
 */
export function generateDemoSeedData(): {
  students: StudentAccount[];
  studentStates: Record<string, StudentState>;
  classes: ClassItem[];
} {
  // Đặt lại seed để mỗi lần chạy đều ra kết quả giống hệt nhau
  prngSeed = 987654321;

  const now = Date.now();
  const ONE_DAY = 86400000;
  const ONE_WEEK = 7 * ONE_DAY;
  const SIX_WEEKS_AGO = now - 6 * ONE_WEEK;

  const students: StudentAccount[] = [];
  const studentStates: Record<string, StudentState> = {};

  const qKeys = Object.keys(QUESTIONS_BANK);

  STUDENT_TEMPLATES.forEach((tmpl, sIdx) => {
    // 1. Tạo tài khoản StudentAccount
    let lastActiveOffset = 0;
    if (tmpl.archetype === 'at_risk') {
      lastActiveOffset = randInt(5, 8) * ONE_DAY; // 5-8 ngày trước (cảnh báo)
    } else if (tmpl.archetype === 'erratic') {
      lastActiveOffset = randInt(2, 4) * ONE_DAY;
    } else {
      lastActiveOffset = randInt(2, 12) * 3600000; // trong ngày
    }

    const lastActiveAt = now - lastActiveOffset;
    const hasLoggedIn = tmpl.archetype !== 'at_risk' || pseudoRandom() > 0.1;

    students.push({
      id: tmpl.id,
      name: tmpl.name,
      username: tmpl.username,
      password_hash: '123456',
      class_id: tmpl.classId,
      student_code: tmpl.studentCode,
      dob: `2013-0${(sIdx % 9) + 1}-15`,
      status: 'active',
      has_logged_in: hasLoggedIn,
      last_active_at: lastActiveAt,
      created_at: new Date(SIX_WEEKS_AGO - 10 * ONE_DAY).toISOString(),
      updated_at: new Date(lastActiveAt).toISOString(),
      isDemoSeed: true,
    } as any);

    // 2. Sinh lịch sử điểm danh (Attendance) qua 6 tuần
    const attendanceHistory: string[] = [];
    let totalActiveSeconds = 0;
    let totalXp = 0;
    const xpLogs: XPLogEntry[] = [];
    const questionResults: QuestionResult[] = [];
    const essaySubmissions: EssaySubmission[] = [];

    // Duyệt qua từng tuần trong 6 tuần
    for (let w = 0; w < 6; w++) {
      const weekStart = SIX_WEEKS_AGO + w * ONE_WEEK;
      let daysThisWeek = 0;

      // Xác định số ngày điểm danh theo Archetype
      if (tmpl.archetype === 'high_performer') daysThisWeek = randInt(5, 6);
      else if (tmpl.archetype === 'progressing') daysThisWeek = randInt(4, 5);
      else if (tmpl.archetype === 'weak_analysis') daysThisWeek = randInt(3, 4);
      else if (tmpl.archetype === 'erratic') daysThisWeek = w % 2 === 0 ? randInt(4, 5) : randInt(1, 2);
      else daysThisWeek = w < 4 ? randInt(2, 3) : randInt(0, 1);

      // Điểm danh các ngày trong tuần
      for (let d = 0; d < daysThisWeek; d++) {
        const dayTime = weekStart + (d * 1.2) * ONE_DAY + randInt(8, 20) * 3600000;
        const dObj = new Date(dayTime);
        const ymd = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
        if (!attendanceHistory.includes(ymd)) {
          attendanceHistory.push(ymd);
        }

        // Active learning time (giây) cho ngày này
        let dailySecs = 0;
        if (tmpl.archetype === 'high_performer') dailySecs = randInt(1800, 3600); // 30 - 60 phút
        else if (tmpl.archetype === 'progressing') dailySecs = randInt(1200, 2400); // 20 - 40 phút
        else if (tmpl.archetype === 'weak_analysis') dailySecs = randInt(900, 1800); // 15 - 30 phút
        else if (tmpl.archetype === 'erratic') dailySecs = randInt(300, 2700);
        else dailySecs = randInt(180, 720); // 3 - 12 phút (làm qua loa)

        totalActiveSeconds += dailySecs;

        // Nhật ký XP điểm danh
        const xpEarned = 2;
        totalXp += xpEarned;
        xpLogs.push({
          id: `xplog_${tmpl.id}_w${w}_d${d}`,
          timestamp: dayTime,
          actionName: 'Điểm danh hằng ngày',
          rawXp: xpEarned,
          actualXp: xpEarned,
          reason: 'Điểm danh chăm chỉ',
        });
      }

      // Sinh kết quả làm bài kiểm tra trong tuần này
      const numQuestionsThisWeek = tmpl.archetype === 'high_performer' ? randInt(6, 10)
        : tmpl.archetype === 'progressing' ? randInt(5, 8)
        : tmpl.archetype === 'weak_analysis' ? randInt(4, 7)
        : tmpl.archetype === 'erratic' ? randInt(2, 8)
        : randInt(1, 3);

      for (let q = 0; q < numQuestionsThisWeek; q++) {
        const qTime = weekStart + randInt(1, 6) * ONE_DAY + randInt(9, 21) * 3600000;
        const qId = randChoice(qKeys);
        const questionDef = QUESTIONS_BANK[qId];
        const lvl: SkillLevel = questionDef?.level || randChoice(['NHAN_BIET', 'THONG_HIEU', 'PHAN_TICH', 'VAN_DUNG']);
        const topicId = questionDef?.topicId || randChoice(['topic_tho_bon_nam', 'topic_tu_lay_so_sanh', 'topic_truyen_ngan']);

        // Tỉ lệ làm đúng tùy theo mức năng lực và archetype
        let passProb = 0.75;
        if (tmpl.archetype === 'high_performer') {
          passProb = lvl === 'VAN_DUNG' ? 0.88 : 0.96;
        } else if (tmpl.archetype === 'progressing') {
          passProb = (lvl === 'NHAN_BIET' || lvl === 'THONG_HIEU') ? 0.88 : (0.65 + w * 0.04);
        } else if (tmpl.archetype === 'weak_analysis') {
          if (lvl === 'NHAN_BIET') passProb = 0.85;
          else if (lvl === 'THONG_HIEU') passProb = 0.75;
          else if (lvl === 'PHAN_TICH') passProb = 0.40; // Rất yếu phân tích
          else passProb = 0.55;
        } else if (tmpl.archetype === 'erratic') {
          passProb = pseudoRandom() > 0.4 ? 0.85 : 0.45;
        } else {
          // at_risk
          passProb = (lvl === 'NHAN_BIET') ? 0.60 : 0.35;
        }

        const isCorrect = pseudoRandom() < passProb;
        const scoreRatio = isCorrect ? (pseudoRandom() > 0.3 ? 1.0 : 0.8) : (pseudoRandom() > 0.5 ? 0.4 : 0);

        questionResults.push({
          questionId: qId,
          level: lvl,
          isCorrect,
          scoreRatio,
          timestamp: qTime,
          topicId,
        });

        // XP khi làm bài
        const qXp = isCorrect ? 5 : 2;
        totalXp += qXp;
        xpLogs.push({
          id: `xplog_q_${tmpl.id}_${w}_${q}`,
          timestamp: qTime,
          actionName: `Làm bài kiểm tra: ${topicId}`,
          rawXp: qXp,
          actualXp: qXp,
          reason: isCorrect ? 'Trả lời đúng' : 'Nỗ lực làm bài',
        });
      }
    }

    // Sinh 1-2 bài viết đoạn văn nộp
    const hasGradedEssay = tmpl.archetype !== 'at_risk' || pseudoRandom() > 0.4;
    if (hasGradedEssay) {
      const eScore = tmpl.archetype === 'high_performer' ? randChoice([9.0, 9.5, 10])
        : tmpl.archetype === 'progressing' ? randChoice([7.5, 8.0, 8.5])
        : tmpl.archetype === 'weak_analysis' ? randChoice([5.5, 6.0, 6.5])
        : tmpl.archetype === 'erratic' ? randChoice([5.0, 7.5, 8.0])
        : randChoice([4.0, 4.5, 5.0]);

      essaySubmissions.push({
        id: `sub_${tmpl.id}_01`,
        studentId: tmpl.id,
        studentName: tmpl.name,
        className: tmpl.className,
        classId: tmpl.classId,
        questionId: 'q_tho_07',
        promptTitle: 'Cảm nghĩ về hình ảnh thơ bốn chữ, năm chữ',
        quizTitle: 'Kiểm tra năng lực: Thơ bốn chữ, năm chữ',
        content: `Hình ảnh thiên nhiên trong bài thơ đã để lại trong em ấn tượng vô cùng sâu sắc. Tác giả sử dụng ngòi bút tinh tế để làm bừng sáng bức tranh mùa xuân... Em nhận ra rằng tình yêu quê hương luôn bắt đầu từ những điều bình dị nhất.`,
        wordCount: randInt(65, 120),
        status: 'GRADED',
        skillLevel: 'VAN_DUNG',
        submittedAt: now - randInt(3, 14) * ONE_DAY,
        gradedAt: now - randInt(1, 10) * ONE_DAY,
        finalScore: eScore,
        totalScore: eScore,
        finalComment: eScore >= 8.5
          ? 'Bài viết văn phong rất truyền cảm, cảm xúc chân thành và giàu sức gợi!'
          : eScore >= 7.0
          ? 'Bài làm tốt, bố cục rõ ràng, cần trau chuốt thêm vốn từ ngữ nghệ thuật.'
          : 'Bài làm ở mức trung bình, em cần tập trung phân tích sâu hơn vào chi tiết thơ.',
        ai_vs_teacher_diff: Math.round(pseudoRandom() * 0.6 * 10) / 10,
        rubricScores: [
          { criterionName: 'Nội dung ý & Cảm thụ', score: Math.round((eScore * 0.4) * 10) / 10, maxScore: 4.0 },
          { criterionName: 'Bố cục & Liên kết', score: Math.round((eScore * 0.2) * 10) / 10, maxScore: 2.0 },
          { criterionName: 'Dùng từ & Chính tả', score: Math.round((eScore * 0.2) * 10) / 10, maxScore: 2.0 },
          { criterionName: 'Sáng tạo & Cảm xúc', score: Math.round((eScore * 0.2) * 10) / 10, maxScore: 2.0 },
        ],
      });
    }

    // Một số em có bài đang chờ chấm
    if (sIdx % 5 === 0) {
      const waitHours = sIdx === 5 ? 28 : randInt(4, 18);
      essaySubmissions.push({
        id: `sub_${tmpl.id}_pending`,
        studentId: tmpl.id,
        studentName: tmpl.name,
        className: tmpl.className,
        classId: tmpl.classId,
        questionId: 'q_lay_07',
        promptTitle: 'Viết đoạn văn phân tích tác dụng từ láy và so sánh',
        quizTitle: 'BTVN: Từ láy và tu từ so sánh',
        content: `Mỗi sớm mai thức dậy, em đều lắng nghe tiếng chim hót rộn rã như một dàn đồng ca... Những từ láy "thoang thoảng", "lấp lánh" làm cảnh vật quê hương trở nên sống động biết bao.`,
        wordCount: randInt(55, 95),
        status: sIdx === 5 ? 'AI_SUGGESTED' : 'PENDING_TEACHER',
        skillLevel: 'VAN_DUNG',
        submittedAt: now - waitHours * 3600000,
        hoursWaiting: waitHours,
        aiSuggestion: {
          rubricScores: [
            { criterionName: 'Nội dung ý & Cảm thụ', score: 3.2, maxScore: 4.0, reason: 'Chỉ ra đúng từ láy và phân tích được nét đẹp quê hương' },
            { criterionName: 'Bố cục & Liên kết', score: 1.6, maxScore: 2.0, reason: 'Có mở đoạn và kết đoạn rõ ràng' },
            { criterionName: 'Dùng từ & Chính tả', score: 1.6, maxScore: 2.0, reason: 'Dùng từ trong sáng, gợi cảm' },
            { criterionName: 'Sáng tạo & Cảm xúc', score: 1.6, maxScore: 2.0, reason: 'Cảm xúc hồn nhiên' },
          ],
          overallComment: 'Đoạn văn viết tốt, thể hiện được tình cảm gắn bó với quê hương. Em tiếp tục phát huy nhé!',
          suggestedTotalScore: 8.0,
          suggestedAt: new Date(now - (waitHours - 0.5) * 3600000).toISOString(),
        },
      });
    }

    // Yêu cầu đổi quà (Reward Requests)
    const rewardRequests: RewardRequest[] = [];
    if (totalXp > 300 && pseudoRandom() > 0.4) {
      rewardRequests.push({
        id: `req_${tmpl.id}_01`,
        rewardId: randChoice(['reward_bookmark', 'reward_sticker', 'reward_pen']),
        requestedAt: now - randInt(1, 14) * ONE_DAY,
        status: pseudoRandom() > 0.3 ? 'APPROVED' : 'PENDING_APPROVAL',
      });
    }

    // Huy hiệu mở khóa
    const unlockedBadgeIds: string[] = ['badge_streak_3'];
    if (totalXp > 150) unlockedBadgeIds.push('badge_xp_100');
    if (totalXp > 400) unlockedBadgeIds.push('badge_xp_300');
    if (attendanceHistory.length >= 15) unlockedBadgeIds.push('badge_streak_7');

    // 3. Ghép thành StudentState
    studentStates[tmpl.id] = {
      profile: {
        id: tmpl.id,
        name: tmpl.name,
        username: tmpl.username,
        role: 'student',
        grade: `Lớp ${tmpl.className}`,
        school: 'THCS Giấy & Mực',
        avatarSeed: tmpl.username,
      },
      xpToday: randInt(0, 15),
      xpWeek: randInt(20, 80),
      totalXp,
      activeSecondsToday: tmpl.archetype === 'at_risk' ? 0 : randInt(300, 1800),
      activeSecondsContinuous: randInt(180, 900),
      lastActiveTimestamp: lastActiveAt,
      lastAttendanceDate: attendanceHistory[attendanceHistory.length - 1] || '',
      attendanceDaysThisWeek: randInt(0, 5),
      attendanceHistory,
      consecutiveWeeks: randInt(1, 6),
      exemptDaysUsedThisWeek: 0,
      completedSteps: [
        'video_watch:video_tho_1',
        'summary_read:video_tho_1',
        'quiz_completed:quiz_tho_quick_1',
        'theory_understood:theory_tho_bon_nam',
        'video_watch:video_tulay_1',
      ],
      questionResults,
      flaggedNeedReviewTopicIds: tmpl.archetype === 'weak_analysis' ? ['topic_tho_bon_nam', 'topic_tu_lay_so_sanh'] : [],
      essaySubmissions,
      rewardRequests,
      unlockedBadgeIds,
      xpLogs: xpLogs.sort((a, b) => b.timestamp - a.timestamp),
      soundEnabled: true,
      animationsEnabled: true,
      fontSizePreference: 'normal',
      themePreference: 'creative_edtech',
      devTimeMultiplier: 1,
      devDateOffsetDays: 0,
      isDemoSeed: true,
      teacherNotes: tmpl.teacherNote,
    } as any;
  });

  const classes: ClassItem[] = [
    {
      id: 'class_7a2',
      name: '7A2',
      grade: 'Lớp 7',
      schoolYear: '2026-2027',
      teacherId: 'gv001',
      description: 'Lớp chọn văn học - Buổi sáng',
      studentCount: 16,
      active7DaysCount: 14,
      status: 'active',
      created_at: new Date(SIX_WEEKS_AGO - 15 * ONE_DAY).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'class_7a3',
      name: '7A3',
      grade: 'Lớp 7',
      schoolYear: '2026-2027',
      teacherId: 'gv001',
      description: 'Lớp Ngữ văn cơ bản - Buổi chiều',
      studentCount: 12,
      active7DaysCount: 9,
      status: 'active',
      created_at: new Date(SIX_WEEKS_AGO - 15 * ONE_DAY).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return { students, studentStates, classes };
}
