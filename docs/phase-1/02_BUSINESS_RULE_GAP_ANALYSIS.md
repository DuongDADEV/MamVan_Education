# BÁO CÁO PHÂN TÍCH SAI LỆCH QUY TẮC NGHIỆP VỤ & QUYẾT ĐỊNH MỞ (PHASE 1)
**Project Audit: Mầm Văn (Grade 7 Vietnamese Language EdTech Platform)**  
*Mã tài liệu:* `DOC-MV-AUDIT-02`  
*Ngày thực hiện:* 29/09/2026  
*Vai trò kiểm toán:* Senior Software Architect, Lead Business Analyst & QA Engineer  
*Phạm vi:* Đối chiếu 8 nhóm quy tắc nghiệp vụ cốt lõi, Phân tích lỗ hổng XP tự luận, 11 Quyết định nghiệp vụ cần Product Owner phê duyệt, Bộ kịch bản kiểm thử QA.

---

## MỤC LỤC
1. [Phần F – Đối chiếu tính nhất quán của quy tắc nghiệp vụ (Business Rule Consistency Check)](#phần-f--đối-chiếu-tính-nhất-quán-của-quy-tắc-nghiệp-vụ)
2. [Phân tích chuyên sâu: Lỗ hổng và nguy cơ cộng trùng XP bài viết (+10 XP)](#phân-tích-chuyên-sâu-lỗ-hổng-và-nguy-cơ-cộng-trùng-xp-bài-viết-10-xp)
3. [Phần H – Danh mục quyết định mở cần Product Owner phê duyệt (Open Decisions)](#phần-h--danh-mục-quyết-định-mở-cần-product-owner-phê-duyệt)
4. [Bộ kịch bản kiểm thử QA (Edge Cases & Regression Scenarios)](#bộ-kịch-bản-kiểm-thử-qa-edge-cases--regression-scenarios)

---

## PHẦN F – ĐỐI CHIẾU TÍNH NHẤT QUÁN CỦA QUY TẮC NGHIỆP VỤ

Bảng tổng hợp đối chiếu giữa **Yêu cầu nghiệp vụ lý thuyết** và **Triển khai thực tế trong source code**:

| Nhóm quy tắc | Yêu cầu nghiệp vụ (Business Requirement) | Triển khai thực tế trong source (Actual Implementation) | Bằng chứng code (File & Dòng) | Đánh giá | Quyết định nghiệp vụ cần PO chốt |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **1. Điểm danh** | Học sinh chủ động bấm thẻ điểm danh trên trang chủ để nhận +2 XP và tưới cây. Không tự động điểm danh khi đăng nhập. | **Khớp 100%.** Đăng nhập tại `LoginScreen.tsx` chỉ tạo session. Điểm danh chỉ kích hoạt khi học sinh click thẻ tại `HomeScreen.tsx` gọi `handleAttendanceCheckIn()`. | `App.tsx` (L356–390), `LoginScreen.tsx` (L120–135) | **MATCH** | Cần quy định rõ: Có cho phép điểm danh bù các ngày bị ốm/nghỉ có phép hay không? |
| **2. Active Learning Time (ALT)** | Chỉ tính khi học sinh thực sự tương tác và tab đang hiển thị; nếu bất hoạt $\ge 4$ phút thì tự động tạm dừng bộ đếm. | **Khớp 100%.** Hook `useActiveLearningTimer` lắng nghe 6 sự kiện (`mousemove`, `keydown`, `scroll`...), kiểm tra `document.visibilityState === 'visible'` và ngưỡng `IDLE_LIMIT_SECONDS = 240` (4 phút). | `useActiveLearningTimer.ts` (L63–96), `config.ts` (L54) | **MATCH** | Khi xem video thời lượng dài (>10 phút) không chạm chuột, bộ đếm có tính là active không? (Hiện tại code đã gắn `isVideoPlayingRef` để miễn trừ dừng khi đang phát video). |
| **3. Giới hạn XP (Caps)** | - 45 phút đầu: tối đa 130 XP.<br>- Phút 45–90: tối đa thêm 20 XP (tổng trần 150 XP).<br>- Quá 90 phút: không cộng thêm XP.<br>- Trần tuần: 900 XP.<br>- Chỉ nhận XP lần đầu hoàn thành. | **Khớp thuật toán.** Hàm `awardXP()` kiểm tra `completedSteps` (chặn cộng lặp lại); tính trần ngày linh hoạt theo `activeMinutes` qua `getCurrentDailyXpCap()`; chặn trần tuần 900 XP. | `xpEngine.ts` (L23–35, L40–118), `config.ts` (L10–18) | **MATCH** | Cần quyết định: Vào ngày Chủ nhật reset tuần, học sinh hoàn thành bài tập giao từ tuần trước thì điểm tính vào tuần cũ hay tuần mới? |
| **4. Đánh giá Mastery** | - 4 mức: Nhận biết, Thông hiểu, Phân tích, Vận dụng.<br>- Tối thiểu 5 câu mỗi mức mới kết luận.<br>- Cần ôn lại: < 50%.<br>- Đang tiến bộ: 50–79%.<br>- Vững: $\ge 80\%$.<br>- Chủ đề Vững: NB & TH $\ge 80\%$ VÀ PT & VD $\ge 60\%$. | **Khớp thuật toán.** `calculateLevelMastery` kiểm tra `count < 5` $\rightarrow$ `INSUFFICIENT_DATA`; dùng trọng số suy giảm `0.88^index`; `isTopicSolid()` áp dụng đúng ngưỡng 80/80 và 60/60. | `mastery.ts` (L45–106, L127–154), `config.ts` (L70–81) | **MATCH** | Khi học sinh làm sai 5 câu liên tiếp sau khi đã đạt Vững, trạng thái có bị tụt xuống "Cần ôn lại" ngay lập tức hay có độ trễ cảnh báo? |
| **5. Bài viết tự luận (Essay)** | - Học sinh nộp bài nhận XP theo quy định.<br>- AI chỉ gợi ý điểm.<br>- Giáo viên là người chốt điểm.<br>- Mastery cập nhật **sau khi** giáo viên chốt.<br>- Học sinh không được xem gợi ý AI. | **SAI LỆCH NGHIỆM TRỌNG:**<br>1. Khi HS nộp bài, `QuizRunner.tsx` lập tức đẩy `QuestionResult` với `scoreRatio = 0.8` vào Mastery trước khi giáo viên chấm!<br>2. Khi giáo viên chấm, `mockRepositories.ts` lại đẩy thêm 1 `QuestionResult` nữa $\rightarrow$ **Mastery bị tính 2 lần**.<br>3. HS `hs001` bị hardcode khi nộp. | `QuizRunner.tsx` (L126–147), `mockRepositories.ts` (L1870–1884) | **MISMATCH** | **Cần quyết định gấp:** Nộp bài essay có được cộng điểm tạm thời không? Quy tắc tính lại Mastery khi GV sửa điểm bài viết. |
| **6. Phần thưởng bí mật** | - GV quản lý quà bí mật.<br>- HS chỉ thấy teaser.<br>- Chỉ mở nội dung bí mật khi GV đã trao (`GIVEN`) và HS bấm nhận quà (`OPENED`). | **Khớp logic giao diện, nhưng HỞ BẢO MẬT DỮ LIỆU.** Toàn bộ `secret.name` và `secret.description` bị đóng gói sẵn trong file tĩnh `rewards.ts` gửi xuống máy học sinh. Bất kỳ ai mở DevTools đều đọc được quà trước. | `rewards.ts` (L18–21), `RewardsScreen.tsx` (L50), `TeacherRewardsScreen.tsx` | **MISMATCH** *(Security)* | Cần bảo mật Backend: Supabase RLS hoặc Function chỉ trả trường `secret` khi trạng thái yêu cầu chuyển sang `GIVEN` hoặc `OPENED`. |
| **7. Quy tắc xem Video** | - Hoàn thành khi xem ít nhất 80% thời lượng duy nhất.<br>- Tua nhanh không được tính hoàn thành. | **Khớp logic tạm thời, nhưng MẤT DỮ LIỆU KHI RELOAD.** Dùng `watchedSecondsSet` đếm từng giây không trùng lặp (tua video thì giây nhảy cóc, không tăng size của Set). Tuy nhiên Set này lưu trong React state, F5 là mất. | `VideoLessonScreen.tsx` (L77, L84, L103) | **PARTIAL** | Cần cơ chế lưu định kỳ mảng giây đã xem xuống LocalStorage/Database để học sinh không phải xem lại từ đầu nếu rớt mạng. |
| **8. Quản lý phiên bản (Versioning)** | Không được làm thay đổi kết quả làm bài cũ khi giáo viên sửa hoặc xuất bản đề thi phiên bản mới. | **SAI LỆCH TOÀN VẸN:** Khi GV sửa câu hỏi, `saveQuestion()` sửa đè lên cùng ID `q_...`. Lịch sử `QuestionResult` chỉ lưu ID nên mở lại bài thi cũ sẽ thấy đề bài mới đã bị sửa. | `mockRepositories.ts` (L1374, L1468) | **MISMATCH** | Cần thiết kế bảng Snapshot: Khi GV xuất bản phiên bản mới, tạo bản ghi mới hoặc snapshot immutable JSON của câu hỏi. |

---

## PHÂN TÍCH CHUYÊN SÂU: LỖ HỔNG VÀ NGUY CƠ CỘNG TRÙNG XP BÀI VIẾT (+10 XP)

### 1. Nguồn phát sinh vấn đề
Trong tài liệu yêu cầu nghiệp vụ sơ bộ có đề cập: *"Học sinh nộp bài viết cảm nghĩ được nhận +10 XP"*. Tuy nhiên, trong mã nguồn hiện hành:
* File cấu hình [config.ts](file:///e:/APP_Education/MamVan_Education-main/MamVan_Education-main/src/config.ts) hoàn toàn **không có** biến `ESSAY_SUBMISSION_XP`.
* Con số **+10 XP** thực tế đang xuất hiện tại:
  1. `THEORY_READ_UNDERSTOOD_XP: 10` trong [config.ts](file:///e:/APP_Education/MamVan_Education-main/MamVan_Education-main/src/config.ts#L31) (Cộng khi học sinh đọc xong lý thuyết và bấm nút *"Đã hiểu"* sau 25 giây).
  2. `THEORY_FULL_COMPLETION_XP: 10` trong [config.ts](file:///e:/APP_Education/MamVan_Education-main/MamVan_Education-main/src/config.ts#L35) (Thưởng khi hoàn thành toàn bộ luồng lý thuyết).

### 2. Nguy cơ cộng trùng XP (Double-dipping XP)
Trong luồng học thực tế:
* Câu hỏi viết đoạn văn (`essay`) **không đứng độc lập** mà được nhúng bên trong một Quiz (ví dụ: `quiz_tulay_quick` hoặc `quiz_doanvan_test`).
* Khi học sinh nhấn nút nộp bài kiểm tra có chứa câu tự luận:
  * [VideoLessonScreen.tsx](file:///e:/APP_Education/MamVan_Education-main/MamVan_Education-main/src/screens/VideoLessonScreen.tsx#L241) đã gọi `awardXP(..., XP_CONFIG.VIDEO_QUICK_TEST_XP, ...)` $\rightarrow$ Học sinh đã nhận ngay **+8 XP** cho việc hoàn thành bài kiểm tra.
  * Nếu hệ thống tự động kích hoạt thêm quy tắc *"Nộp bài tự luận +10 XP"*, học sinh sẽ nhận được **$8 + 10 = 18\text{ XP}$** cho cùng một bài làm.
  * Nghiêm trọng hơn, khi giáo viên vào chấm điểm tại [mockRepositories.ts](file:///e:/APP_Education/MamVan_Education-main/MamVan_Education-main/src/services/mock/mockRepositories.ts#L1874), nếu backend lại thiết kế cộng thêm điểm thưởng khi giáo viên chấm xong, học sinh sẽ bị cộng XP lần thứ 3!

### 3. Khuyến nghị kiến trúc giải quyết
1. **Không cộng XP riêng lẻ khi bấm nộp bài tự luận.** Việc nộp bài tự luận là một phần của lượt làm Quiz, điểm nộp đã được bao hàm trong XP hoàn thành Quiz (`QUIZ_COMPLETED_XP`).
2. **Chỉ cộng XP chất lượng (Quality Bonus) sau khi Giáo viên chấm:**
   * Nếu giáo viên chấm đạt $\ge 8/10$ điểm: Thưởng thêm `+10 XP` khuyến khích bài viết xuất sắc.
   * Hành động này được định danh rõ ràng trong sổ cái: `actionName = 'essay_graded_bonus:<submissionId>'` để tránh trùng lặp.

---

## PHẦN H – DANH MỤC QUYẾT ĐỊNH MỞ CẦN PRODUCT OWNER PHÊ DUYỆT

Dưới đây là 11 vấn đề kiến trúc và nghiệp vụ đang ở trạng thái **CHƯA CHỐT**, bắt buộc Product Owner phải đưa ra văn bản quyết định trước khi thiết kế Database Supabase:

### Quyết định 1: Cơ chế Điểm danh chủ động hay tự động
* **Mô tả vấn đề:** Điểm danh học tập đầu ngày nên để học sinh tự giác bấm hay tự động ghi nhận ngay khi đăng nhập?
* **Hành vi hiện tại:** Học sinh phải chủ động bấm thẻ "Điểm danh nhận +2 XP" trên trang chủ. Đăng nhập không tự điểm danh.
* **Các phương án:**
  * *Phương án A:* Giữ nguyên bấm chủ động (Tăng tính tương tác, khuyến khích nghi thức bắt đầu buổi học).
  * *Phương án B:* Tự động điểm danh khi đăng nhập lần đầu trong ngày (Tránh việc học sinh quên bấm dù đã vào học cả buổi).
  * *Phương án C:* Kết hợp: Tự động ghi nhận ngày chuyên cần khi có tương tác học tập bất kỳ, nhưng nút bấm nhận +2 XP trên trang chủ là phần thưởng bấm tay.
* **Tác động Database:** Nếu chọn B/C, cần trigger Database trên bảng `auth_sessions` hoặc bảng `active_learning_logs`.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án C.**
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 2: Quy tắc XP và tính điểm bài viết tự luận (Essay)
* **Mô tả vấn đề:** Thời điểm và hạn mức cộng XP cho bài tự luận để tránh cộng trùng với bài kiểm tra.
* **Hành vi hiện tại:** Khi nộp bài tự luận nhúng trong Quiz, hệ thống chỉ cộng XP của Quiz (+8 XP); không có +10 XP riêng cho essay. Nhưng Mastery bị tính trước 0.8 điểm.
* **Các phương án:**
  * *Phương án A:* Nộp bài tự luận nhận +5 XP; giáo viên chấm xong nếu đạt yêu cầu nhận thêm +10 XP.
  * *Phương án B:* Nộp bài không nhận XP riêng (chỉ nhận XP bài kiểm tra); chỉ nhận +10 XP khi giáo viên chấm đạt loại Khá/Giỏi.
  * *Phương án C:* Giữ nguyên hiện tại, toàn bộ XP quy về Quiz.
* **Tác động Database:** Quyết định việc tạo bản ghi giao dịch trong bảng `xp_ledger` tại bước nộp bài hay bước chấm bài.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án B.**
* **Mức ưu tiên:** KHẨN CẤP.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 3: Xử lý 4 dạng câu hỏi trong lưu trữ kết quả thi
* **Mô tả vấn đề:** Có cần lưu nguyên văn đáp án học sinh đã chọn cho từng dạng câu hỏi (Single, Multi, Fill, Essay) hay chỉ lưu Đúng/Sai?
* **Hành vi hiện tại:** Đang vứt bỏ toàn bộ đáp án của học sinh, chỉ lưu `isCorrect` và `scoreRatio`.
* **Các phương án:**
  * *Phương án A:* Bắt buộc lưu toàn bộ đáp án chi tiết (`student_answer`: JSONB) và đề bài snapshot cho từng câu hỏi.
  * *Phương án B:* Chỉ lưu điểm tổng và tỷ lệ đúng sai từng câu như hiện tại để tiết kiệm dung lượng.
* **Tác động Database:** Phương án A cần bảng `attempt_answers` có dung lượng lưu trữ lớn hơn nhưng đáp ứng 100% việc xem lại bài thi và phân tích sư phạm.
* **Khuyến nghị kỹ thuật:** **Bắt buộc chọn Phương án A.** Không có phương án A thì không thể làm giáo dục trực tuyến chuẩn mực.
* **Mức ưu tiên:** KHẨN CẤP.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 4: Nguồn dữ liệu học tập thống nhất (Single Source of Truth)
* **Mô tả vấn đề:** Tiếp tục duy trì fallback file tĩnh `mockData.ts` hay chuyển dịch 100% sang Dynamic Repository (Database)?
* **Hành vi hiện tại:** Các màn hình học sinh fallback liên tục về `mockData.ts` khi không tìm thấy ID trong storage.
* **Các phương án:**
  * *Phương án A:* Xóa bỏ hoàn toàn việc import `mockData.ts` trên UI học sinh; 100% dữ liệu phải nạp qua Repository Service.
  * *Phương án B:* Duy trì dữ liệu tĩnh làm offline fallback nếu mạng mất kết nối.
* **Tác động Database:** Phương án A đòi hỏi toàn bộ dữ liệu mẫu ban đầu phải được seed đầy đủ vào Database.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A.** Loại bỏ hoàn toàn static import để tránh lỗi rò rỉ hoặc không đồng bộ giữa GV và HS.
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 5: Phạm vi xuất bản và Giao bài theo Lớp (Class Targeting)
* **Mô tả vấn đề:** Nội dung học tập được xuất bản chung cho toàn khối hay phân tách nghiêm ngặt theo từng lớp?
* **Hành vi hiện tại:** Trên giao diện GV có chọn lớp, nhưng code `App.tsx` truyền nhầm `grade` vào `classId`, dẫn tới nội dung bị xem chung hoặc lọc sai.
* **Các phương án:**
  * *Phương án A:* Mọi bài giảng mặc định dùng chung cho toàn bộ học sinh cùng Khối (`grade = 7`); chỉ riêng Bài tập về nhà (`homework`) mới giao đích danh theo lớp hoặc từng học sinh.
  * *Phương án B:* Phân quyền nghiêm ngặt: Học sinh lớp nào chỉ nhìn thấy bài học và bài kiểm tra do chính giáo viên lớp đó xuất bản cho lớp mình.
* **Tác động Database:** Ảnh hưởng trực tiếp đến chính sách RLS (Row Level Security) trên các bảng `topics`, `videos`, `quizzes`.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A cho MVP**, vì kho học liệu Ngữ văn 7 dùng chung chương trình GDPT 2018; chỉ BTVN và bài kiểm tra đánh giá mới cần phân lớp.
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 6: Quản lý Phiên bản nội dung (Content Versioning)
* **Mô tả vấn đề:** Khi giáo viên cập nhật bài kiểm tra đã có học sinh làm, hệ thống xử lý các bài làm cũ như thế nào?
* **Hành vi hiện tại:** Tự tăng `version = version + 1` và ghi đè nội dung câu hỏi cũ.
* **Các phương án:**
  * *Phương án A (Immutable Snapshot):* Khi sửa đề thi đã có lượt làm, hệ thống tự động khóa đề cũ và tạo một bản ghi đề thi mới (bản sao phiên bản $N+1$). Lượt làm cũ gắn chặt với version cũ.
  * *Phương án B (Overwriting with Flag):* Cho phép sửa trực tiếp, nhưng gắn cờ cảnh báo giáo viên rằng kết quả cũ sẽ không còn khớp đề bài.
* **Tác động Database:** Phương án A cần thiết kế bảng versioning hoặc cột snapshot JSON.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A.** Đảm bảo tính toàn vẹn sư phạm và không bị khiếu nại điểm thi.
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 7: Chính sách làm lại bài kiểm tra (Retake Policy)
* **Mô tả vấn đề:** Cho phép làm lại bao nhiêu lần? Điểm số lưu vào học bạ lấy lần cao nhất, lần đầu tiên hay lần gần nhất?
* **Hành vi hiện tại:** Cho làm lại vô hạn lần; điểm Mastery lấy trung bình có trọng số suy giảm thời gian; XP chỉ cộng ở lần làm đầu tiên.
* **Các phương án:**
  * *Phương án A:* Giữ nguyên: Không giới hạn lượt làm; điểm Mastery tính trọng số suy giảm; XP chỉ cộng lần đầu.
  * *Phương án B:* Giới hạn tối đa 3 lần làm cho bài kiểm tra nhanh và Mastery Check; bài thi học kỳ chỉ làm 1 lần duy nhất.
* **Tác động Database:** Cần trường `max_attempts` trên bảng `quizzes` và logic kiểm tra số lượng bản ghi trong `quiz_attempts`.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A cho bài Luyện tập, Phương án B cho Bài kiểm tra chính thức.**
* **Mức ưu tiên:** TRUNG BÌNH.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 8: Quyền truy cập nội dung đã lưu trữ (Archived Content)
* **Mô tả vấn đề:** Khi giáo viên bấm "Lưu trữ" (Archive) một bài học, học sinh đã từng học bài đó có được xem lại không?
* **Hành vi hiện tại:** Khi `status === 'archived'`, bài học biến mất hoàn toàn khỏi danh mục học sinh.
* **Các phương án:**
  * *Phương án A:* Ẩn hoàn toàn khỏi tất cả học sinh (kể cả học sinh đã hoàn thành).
  * *Phương án B:* Ẩn với học sinh chưa học; học sinh đã hoàn thành vẫn được xem lại trong mục "Bài đã học" để ôn tập.
* **Tác động Database:** Logic query: `status = 'published' OR (status = 'archived' AND id IN (SELECT item_id FROM student_completed_steps WHERE student_id = ...))`.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A cho MVP** để đơn giản hóa logic; nâng cấp lên B sau.
* **Mức ưu tiên:** TRUNG BÌNH.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 9: Cơ chế lưu tiến trình học dở (Draft Progress Saving)
* **Mô tả vấn đề:** Khi đang làm bài kiểm tra hoặc xem video dở mà gặp sự cố mạng/mất điện, hệ thống phục hồi thế nào?
* **Hành vi hiện tại:** Video nhớ giây học gần nhất (nếu đã qua bước 1); bài kiểm tra mất trắng toàn bộ câu trả lời.
* **Các phương án:**
  * *Phương án A (Auto-save câu trả lời):* Mỗi khi học sinh chọn 1 đáp án, tự động lưu ngay vào localStorage và đồng bộ định kỳ 10 giây/lần lên server. Khi vào lại tự động khôi phục đúng câu đang làm dở.
  * *Phương án B:* Giữ nguyên: Học sinh phải làm lại từ đầu nếu chưa bấm nộp bài.
* **Tác động Database:** Bảng `quiz_attempts` cần trạng thái `in_progress` và cập nhật đáp án real-time.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A.** Đây là tiêu chuẩn bắt buộc cho trải nghiệm học tập ổn định của học sinh.
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 10: Xử lý video khi nền tảng phát không hỗ trợ theo dõi chính xác (Video Tracking Fallback)
* **Mô tả vấn đề:** Nếu video nhúng từ YouTube bị chặn cookie bên thứ 3 hoặc học sinh dùng trình duyệt không hỗ trợ theo dõi từng giây duy nhất, quy tắc xem đủ 80% xử lý ra sao?
* **Hành vi hiện tại:** Chuyển sang "Khung phát mô phỏng thông minh" tự động chạy timer ảo để học sinh không bị kẹt bài học.
* **Các phương án:**
  * *Phương án A:* Tích hợp YouTube Player API chính thức; nếu không theo dõi được thời gian thực, yêu cầu học sinh trả lời 1 câu hỏi kiểm tra nhanh nội dung video trước khi cho phép mở khóa nút "Tóm tắt".
  * *Phương án B:* Cho phép giáo viên bật chế độ "Bỏ qua yêu cầu 80%" cho các học sinh gặp sự cố thiết bị.
* **Tác động Database:** Cấu hình `allow_skip_video` trên `system_settings` hoặc `classes`.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án A.** Giải pháp câu hỏi xác nhận sư phạm tốt hơn việc chạy timer ảo tự động.
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

### Quyết định 11: Dữ liệu phân tích giáo viên (Analytics Data Segregation)
* **Mô tả vấn đề:** Dashboard Analytics của Giáo viên hiện đang gộp chung 35 học sinh ảo (demo seed) với học sinh thật. Xử lý việc phân tách thế nào khi đưa vào hoạt động thực tế?
* **Hành vi hiện tại:** Đọc toàn bộ `attemptRepo.getAllStates()`, hiển thị lẫn lộn số liệu thật và số liệu demo.
* **Các phương án:**
  * *Phương án A:* Khi triển khai production, xóa sạch toàn bộ seed ảo; chỉ hiển thị dữ liệu của học sinh thực tế thuộc các lớp của giáo viên.
  * *Phương án B:* Thêm một công tắc trên thanh Filter Bar: *"Xem dữ liệu thử nghiệm (Demo Mode)"* và *"Xem dữ liệu lớp thực tế"*.
* **Tác động Database:** Thêm cờ `is_demo: boolean` trên bảng `students` và `classes`; bộ lọc SQL mặc định luôn có `WHERE is_demo = false`.
* **Khuyến nghị kỹ thuật:** **Chọn Phương án B cho giai đoạn Pilot/Thử nghiệm và Phương án A khi bàn giao Production.**
* **Mức ưu tiên:** CAO.
* **Trạng thái:** **CHƯA CHỐT**.

---

## BỘ KỊCH BẢN KIỂM THỬ QA (EDGE CASES & REGRESSION SCENARIOS)

Các kịch bản kiểm thử tĩnh và kiểm thử biên dành cho đội ngũ QA nhằm thẩm định hệ thống dữ liệu:

### Test Case 1: Kiểm tra chống gian lận tua nhanh Video (Anti-scrubbing)
* **Mục tiêu:** Đảm bảo học sinh không thể kéo thanh tua từ giây 0 đến giây cuối để nhận +5 XP ngay lập tức.
* **Quy trình:**
  1. Mở bài giảng video `video_tho_1` (thời lượng 600 giây).
  2. Kéo thanh tua video đến giây thứ 550. Để video chạy 10 giây.
  3. Quan sát tỷ lệ `watchedRatio` và nút "Tiếp tục sang tóm tắt".
* **Kỳ vọng:** `watchedSecondsSet.size` chỉ bằng khoảng 10 giây. Tỷ lệ xem $\approx 10/600 = 1.6\% (< 80\%)$. Nút chuyển bước bị khóa mờ (`disabled`). Không được cộng XP.

### Test Case 2: Kiểm tra trần XP ngày khi học liên tục qua 45 phút và 90 phút
* **Mục tiêu:** Kiểm tra cơ chế chặn trần XP lũy tiến theo thời gian học tích cực.
* **Quy trình:**
  1. Dùng DevPanel chỉnh thời gian học tích cực `activeSecondsToday = 2000s` (~33 phút).
  2. Cho học sinh hoàn thành các bài tập để tích lũy 130 XP.
  3. Cố gắng hoàn thành thêm 1 bài luyện tập nữa.
  4. Sau đó, tăng `activeSecondsToday = 3000s` (50 phút). Hoàn thành thêm bài tập.
* **Kỳ vọng:**
  * Ở phút 33: Khi đạt 130 XP, bài tập tiếp theo nhận `0 XP`, hiện thông báo đạt trần 130 XP ngày.
  * Ở phút 50: Hệ thống mở thêm hạn mức 20 XP (tổng trần thành 150 XP). Học sinh nhận được tiếp tối đa 20 XP.
  * Khi qua 90 phút: Mọi hoạt động tiếp theo đều nhận `0 XP`.

### Test Case 3: Kiểm tra tính toán Mastery theo thuật toán suy giảm thời gian
* **Mục tiêu:** Xác minh 5 câu làm gần nhất có ảnh hưởng lớn hơn các câu làm trong quá khứ.
* **Quy trình:**
  1. Nạp lịch sử học sinh có 5 câu "Nhận biết" ban đầu đều sai (`scoreRatio = 0`). Trạng thái là `NEEDS_REVIEW`.
  2. Học sinh làm liên tiếp 5 câu "Nhận biết" mới đều đúng (`scoreRatio = 1`).
  3. Kiểm tra kết quả `calculateLevelMastery(..., 'NHAN_BIET')`.
* **Kỳ vọng:** Do hệ số suy giảm $0.88^k$ ưu tiên các lần làm mới, điểm phần trăm tính toán phải đạt $> 70\%$ và trạng thái chuyển từ `NEEDS_REVIEW` sang `PROGRESSING` thay vì bị kéo tụt xuống mức trung bình cộng đơn thuần (50%).

### Test Case 4: Kiểm tra đồng bộ đa tab khi Giáo viên duyệt quà
* **Mục tiêu:** Xác minh học sinh nhận được rương mở quà ngay lập tức mà không cần F5 khi giáo viên phê duyệt ở tab khác.
* **Quy trình:**
  1. Mở Tab 1: Học sinh (đủ điều kiện) bấm gửi yêu cầu đổi rương quà `reward_bookmark`.
  2. Mở Tab 2: Giáo viên vào màn hình `TeacherRewardsScreen.tsx`, bấm "Duyệt yêu cầu" và "Đã trao quà".
  3. Quan sát màn hình Tab 1 của học sinh.
* **Kỳ vọng:** BroadcastChannel phát sự kiện `reward`, Tab 1 của học sinh tự động cập nhật trạng thái rương sang `GIVEN` và nút *"Mở rương bí mật"* bừng sáng sẵn sàng tương tác.
