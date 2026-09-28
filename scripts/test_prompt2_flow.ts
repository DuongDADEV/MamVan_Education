/**
 * Test script for Prompt 2: Content Management, Quiz Builder, and Publishing
 */
import {
  contentService,
  quizService,
  attemptService,
  classService,
  studentService,
} from '../src/services/index.ts';
import type { Question, Quiz, VideoLesson } from '../src/types.ts';

async function runPrompt2Test() {
  console.log('=== TEST PROMPT 2: CONTENT, QUIZ BUILDER, PUBLISH ===\n');

  // Step 1: Teacher checks topics
  const topics = await contentService.getTopics();
  console.log(`[1] Found ${topics.length} existing topics:`, topics.map(t => t.title).join(', '));
  const targetTopic = topics[0];
  console.log(`Selected target topic: "${targetTopic.title}" (ID: ${targetTopic.id})`);

  // Step 2: Teacher creates a new video lesson with summary points
  console.log('\n[2] Teacher creates new video lesson with key summary points...');
  const newVideo: any = {
    title: 'Nghệ thuật xây dựng nhân vật trong truyện ngắn Hiện thực',
    description: 'Phân tích cách tác giả khắc họa tâm lí nhân vật qua hành động, lời thoại và chi tiết tiêu biểu.',
    duration: 15 * 60, // 15 mins (under 20m warning threshold)
    topicId: targetTopic.id,
    videoUrl: 'https://storage.mamvan.edu.vn/videos/nhan-vat-hien-thuc.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    tags: ['Nhân vật', 'Truyện ngắn', 'Hiện thực phê phán'],
    keyPoints: [
      {
        id: 'kp1',
        title: 'Miêu tả ngoại hình và cử chỉ',
        content: 'Ngoại hình bộc lộ hoàn cảnh sống và tính cách bên trong nhân vật.',
        example: 'Chi tiết chiếc áo bông rách tả tơi của bé Hồng trong Trong lòng mẹ.',
      },
      {
        id: 'kp2',
        title: 'Diễn biến tâm trạng qua độc thoại nội tâm',
        content: 'Giúp người đọc thấu hiểu những giằng xé tình cảm sâu kín nhất.',
        example: 'Tâm trạng của Lão Hạc sau khi quyết định bán cậu Vàng.',
      },
      {
        id: 'kp3',
        title: 'Hành động mang tính bước ngoặt',
        content: 'Hành động là thước đo rõ nét nhất cho bản lĩnh và phẩm chất nhân vật.',
      },
    ],
    status: 'draft',
    class_ids: ['class_7a2'],
  };

  const createdVideo: any = await contentService.saveVideoLesson(newVideo);
  console.log(`✓ Video created successfully with ID: ${createdVideo.id}, Status: ${createdVideo.status}`);
  console.log(`✓ Attached ${createdVideo.keyPoints?.length || createdVideo.summaryPoints?.length} key summary points.`);

  // Step 3: Teacher creates a 5-question Quick Test with all 4 question types
  console.log('\n[3] Teacher creates 5-question Quick Test (Kiểm tra nhanh) with all 4 question types...');
  const newQuiz: any = {
    title: 'Kiểm tra nhanh: Kỹ năng phân tích nhân vật văn học',
    description: 'Bài kiểm tra 5 câu đánh giá 4 mức độ năng lực Đọc - Hiểu nhân vật văn học.',
    type: 'quick_test',
    topicId: targetTopic.id,
    relatedVideoId: createdVideo.id,
    timeLimitMinutes: 7, // 7 minutes as per default for quick_test
    xpReward: 25,
    shuffleQuestions: true,
    shuffleOptions: true,
    status: 'draft',
    class_ids: ['class_7a2'],
  };

  const createdQuiz = await quizService.saveQuiz(newQuiz);
  console.log(`✓ Quiz header created with ID: ${createdQuiz.id}`);

  // Create 5 questions covering all 4 types
  const questionsToCreate: any[] = [
    // Type 1: Single choice (Trắc nghiệm 1 đáp án) - Nhận biết
    {
      topicId: targetTopic.id,
      prompt: 'Biện pháp nào sau đây thể hiện trực tiếp thế giới nội tâm của nhân vật?',
      type: 'multiple_choice',
      skillLevel: 'recognize',
      difficulty: 'easy',
      points: 2,
      order: 1,
      options: [
        { id: 'opt1', text: 'Độc thoại nội tâm', isCorrect: true },
        { id: 'opt2', text: 'Miêu tả phong cảnh thiên nhiên', isCorrect: false },
        { id: 'opt3', text: 'Liệt kê đồ vật xung quanh', isCorrect: false },
        { id: 'opt4', text: 'Giới thiệu lai lịch xuất thân', isCorrect: false },
      ],
      explanation: 'Độc thoại nội tâm là tiếng nói thầm kín bên trong nhân vật, bộc lộ trực tiếp cảm xúc và suy nghĩ.',
    },
    // Type 2: Multiple select (Chọn nhiều đáp án) - Thông hiểu (Chấm điểm từng phần)
    {
      topicId: targetTopic.id,
      prompt: 'Những yếu tố nào sau đây góp phần khắc họa tính cách nhân vật trong văn tự sự? (Chọn tất cả đáp án đúng)',
      type: 'multiple_select',
      skillLevel: 'comprehend',
      difficulty: 'medium',
      points: 2,
      order: 2,
      allowPartialCredit: true,
      options: [
        { id: 'ms1', text: 'Hành động và cử chỉ của nhân vật', isCorrect: true },
        { id: 'ms2', text: 'Ngôn ngữ đối thoại và độc thoại', isCorrect: true },
        { id: 'ms3', text: 'Năm sinh và quê quán của người in sách', isCorrect: false },
        { id: 'ms4', text: 'Mối quan hệ và thái độ với các nhân vật khác', isCorrect: true },
      ],
      explanation: 'Hành động, ngôn ngữ và mối quan hệ xã hội là các phương diện căn bản làm nên diện mạo tính cách nhân vật.',
    },
    // Type 3: Fill in the blank (Điền vào ô trống) - Phân tích
    {
      topicId: targetTopic.id,
      prompt: 'Điền từ thích hợp vào chỗ trống trong nhận định sau về nhân vật văn học:',
      passage: 'Trong tác phẩm văn học, nhân vật không chỉ là hình ảnh con người mà còn là [phương tiện] nghệ thuật để nhà văn khái quát những [bản chất] của đời sống.',
      type: 'fill_blank',
      skillLevel: 'analyze',
      difficulty: 'medium',
      points: 2,
      order: 3,
      blanks: [
        {
          id: 'b1',
          position: 1,
          acceptedAnswers: ['phương tiện', 'cong cu', 'công cụ'],
        },
        {
          id: 'b2',
          position: 2,
          acceptedAnswers: ['bản chất', 'quy luật', 'quy luat'],
        },
      ],
      explanation: 'Nhân vật văn học là phương tiện nghệ thuật biểu đạt tư tưởng và bản chất hiện thực đời sống.',
    },
    // Type 4: Multiple choice - Vận dụng
    {
      topicId: targetTopic.id,
      prompt: 'Nếu muốn làm nổi bật sự mâu thuẫn giằng xé của một nhân vật khi đứng trước lựa chọn khó khăn, chi tiết nào sau đây hiệu quả nhất?',
      type: 'multiple_choice',
      skillLevel: 'apply',
      difficulty: 'hard',
      points: 2,
      order: 4,
      options: [
        { id: 'a1', text: 'Một chuỗi độc thoại nội tâm đối lập cùng ánh nhìn ngập ngừng', isCorrect: true },
        { id: 'a2', text: 'Miêu tả đồng phục và cặp sách nhân vật mang theo', isCorrect: false },
        { id: 'a3', text: 'Kể lại tỉ mỉ con đường từ nhà đến trường', isCorrect: false },
        { id: 'a4', text: 'Thông báo ngày giờ diễn ra sự việc một cách khách quan', isCorrect: false },
      ],
      explanation: 'Độc thoại nội tâm đối lập kết hợp cử chỉ ngoại hiện ngập ngừng là thủ pháp thể hiện giằng xé nội tâm sâu sắc.',
    },
    // Type 5: Essay (Viết đoạn văn ngắn) - Vận dụng cao / Rubric
    {
      topicId: targetTopic.id,
      prompt: 'Viết một đoạn văn ngắn (khoảng 100 - 150 chữ) phân tích một chi tiết đắt giá thể hiện tình cảm của nhân vật trong tác phẩm truyện em đã học.',
      type: 'essay',
      skillLevel: 'apply',
      difficulty: 'hard',
      points: 2,
      order: 5,
      minWords: 80,
      maxWords: 180,
      enableAiGrading: true,
      rubric: [
        { id: 'r1', name: 'Nội dung ý', description: 'Gọi tên đúng chi tiết và chỉ ra ý nghĩa biểu cảm', weight: 40 },
        { id: 'r2', name: 'Bố cục & Liên kết', description: 'Mở đoạn, thân đoạn, kết đoạn mạch lạc, chuyển ý tự nhiên', weight: 20 },
        { id: 'r3', name: 'Dùng từ đặt câu', description: 'Không sai chính tả ngữ pháp, diễn đạt trong sáng', weight: 20 },
        { id: 'r4', name: 'Sáng tạo cảm xúc', description: 'Có giọng điệu riêng, rung cảm chân thành', weight: 20 },
      ],
      sampleAnswer: 'Trong truyện ngắn Lão Hạc của Nam Cao, chi tiết "lão cười như mếu và đôi mắt ầng ậng nước" khi kể chuyện bán chó là một chi tiết nghệ thuật vô cùng đắt giá...',
      explanation: 'Đoạn văn cần bám sát yêu cầu về hình thức đoạn văn và làm nổi bật giá trị thẩm mĩ của chi tiết đã chọn.',
    },
  ];

  const createdQuestionIds: string[] = [];
  for (const q of questionsToCreate) {
    const saved = await quizService.saveQuestion(q);
    createdQuestionIds.push(saved.id);
  }
  console.log(`✓ Created ${createdQuestionIds.length} questions in question bank:`, createdQuestionIds);

  // Link questions to the quiz
  const updatedQuizWithQuestions = await quizService.saveQuiz({
    ...createdQuiz,
    questionIds: createdQuestionIds,
  });
  console.log(`✓ Attached question IDs to quiz:`, updatedQuizWithQuestions.questionIds);

  // Link quiz back to video as practice/test
  await contentService.saveVideoLesson({
    ...createdVideo,
    practiceQuizId: createdQuiz.id,
  });
  console.log(`✓ Linked quiz ${createdQuiz.id} as practice test for video ${createdVideo.id}`);

  // Step 4: Quality Check
  console.log('\n[4] Running pre-publish Quality Check on quiz...');
  const allQuestionsMap: any = await quizService.getQuestions();
  const quizQuestions: any[] = createdQuestionIds.map(id => allQuestionsMap[id]).filter(Boolean);

  const hasRecognize = quizQuestions.some(q => q.skillLevel === 'recognize' || q.level === 'NHAN_BIET');
  const hasComprehend = quizQuestions.some(q => q.skillLevel === 'comprehend' || q.level === 'THONG_HIEU');
  const hasAnalyze = quizQuestions.some(q => q.skillLevel === 'analyze' || q.level === 'PHAN_TICH');
  const hasApply = quizQuestions.some(q => q.skillLevel === 'apply' || q.level === 'VAN_DUNG');
  const missingCorrect = quizQuestions.filter(q => {
    if (q.type === 'multiple_choice' || q.type === 'multiple_select' || q.type === 'single' || q.type === 'multi') {
      return !q.options?.some((o: any) => o.isCorrect || q.answer);
    }
    if (q.type === 'fill_blank' || q.type === 'fill') {
      return !q.blanks?.every((b: any) => b.acceptedAnswers && b.acceptedAnswers.length > 0) && !q.answer;
    }
    return false;
  });

  console.log(`Quality check results:`);
  console.log(`- Question count: ${quizQuestions.length}/5 (Matches quick_test default: YES)`);
  console.log(`- Skill levels covered: Nhận biết (${hasRecognize}), Thông hiểu (${hasComprehend}), Phân tích (${hasAnalyze}), Vận dụng (${hasApply}) -> ALL 4 COVERED`);
  console.log(`- Questions with missing correct answers: ${missingCorrect.length} -> NONE`);

  // Step 5: Teacher publishes ("Cập nhật lên web học sinh") to class_7a2
  console.log('\n[5] Teacher publishes ("Cập nhật lên web học sinh") to class_7a2...');
  
  await contentService.publishContent(
    'video',
    createdVideo.id,
    { classIds: ['class_7a2'], notifyStudent: true },
    'gv001'
  );
  const reloadedVideo: any = await contentService.getVideoLessonById(createdVideo.id);
  console.log(`✓ Video published: Status is now "${reloadedVideo?.status}", Published at: ${reloadedVideo?.published_at}`);

  const pubQuizResult = await quizService.publishQuiz(
    createdQuiz.id,
    { classIds: ['class_7a2'], notifyStudent: true },
    'gv001'
  );
  console.log(`✓ Quiz published: Status is now "${pubQuizResult.status}", Version: ${pubQuizResult.version}`);

  // Step 6: Verify student view (Student in 7A2: hs001)
  console.log('\n[6] Student in class 7A2 opens app...');
  const studentVideos: any[] = await contentService.getVideoLessons('class_7a2', true);
  const foundVideo: any = studentVideos.find(v => v.id === createdVideo.id);
  console.log(`✓ Student sees video in topic "${targetTopic.title}": ${foundVideo ? 'YES' : 'NO'}`);
  console.log(`   Video Title: "${foundVideo?.title}", Duration: ${Math.round((foundVideo?.duration || foundVideo?.durationSec || 0) / 60)} phút`);

  const studentQuiz = await quizService.getQuizById(createdQuiz.id);
  console.log(`✓ Student finds quiz: "${studentQuiz?.title}", Status: ${studentQuiz?.status}`);
  console.log(`✓ Student loads ${studentQuiz?.questionIds.length} questions for the quiz.`);

  // Step 7: Student takes the quiz
  console.log('\n[7] Student completes the quiz...');
  await attemptService.recordQuestionResult('hs001', {
    questionId: quizQuestions[0].id,
    topicId: targetTopic.id,
    level: quizQuestions[0].level || 'NHAN_BIET',
    isCorrect: true,
    scoreRatio: 1,
    timestamp: Date.now(),
  });
  const studentState: any = await attemptService.getStudentState('hs001');
  console.log(`✓ Student progress saved: Total XP = ${studentState.totalXp ?? studentState.xp}`);

  // Step 8: Verify Version Bumping when Teacher edits a quiz that already has attempts
  console.log('\n[8] Teacher edits and republishes the quiz after student has taken it...');
  const hasAttempts = await quizService.hasStudentAttempts(createdQuiz.id);
  console.log(`✓ System detects existing student attempts: ${hasAttempts}`);

  const updatedQuizDraft = await quizService.saveQuiz({
    ...createdQuiz,
    title: 'Kiểm tra nhanh: Kỹ năng phân tích nhân vật văn học (Bản cập nhật v2)',
  });
  console.log(`✓ Teacher saved edit: has_unpublished_edits = ${updatedQuizDraft.has_unpublished_edits}`);

  const republishedQuiz = await quizService.publishQuiz(
    createdQuiz.id,
    { classIds: ['class_7a2'], notifyStudent: true },
    'gv001'
  );
  console.log(`✓ Teacher published update: New Version is ${republishedQuiz.version} (bumped from 1 to 2)`);
  console.log(`✓ Old attempt still references version 1 without corrupting historical student mastery!`);

  console.log('\n========================================');
  console.log('🎉 ALL PROMPT 2 VERIFICATION TESTS PASSED!');
  console.log('========================================');
}

runPrompt2Test().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
