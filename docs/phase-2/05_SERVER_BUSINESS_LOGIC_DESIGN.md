# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 05: THIẾT KẾ LOGIC PHÍA SERVER (SERVER-AUTHORITATIVE BUSINESS LOGIC)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | v1.0 (Server-Side Logic Specification) |
| **Trạng thái** | **PROPOSED TECHNICAL DESIGN – PENDING PO REVIEW** |
| **Tác giả** | Senior Software & Database Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md` |
| **Nguyên tắc cốt lõi** | **ZERO-TRUST FRONTEND – SERVER NẮM TOÀN QUYỀN PHÊ DUYỆT ĐIỂM & XP** |

---

## 1. NGUYÊN TẮC THỰC THI PHÍA SERVER (SERVER-AUTHORITATIVE PRINCIPLES)

1. **Zero-Trust Frontend:** Trình duyệt của học sinh chỉ gửi dữ liệu đầu vào thô (ví dụ: mảng chỉ số đáp án chọn, bài văn, tín hiệu xem video). Trình duyệt tuyệt đối **không được tự tính điểm**, **không tự cộng XP**, **không tự cập nhật Mastery** và **không được gửi `studentId` tùy ý**.
2. **Xác thực Định danh Tự động (`auth.uid()`):** Mọi thao tác ghi nhận nghiệp vụ của học sinh đều trích xuất `student_id` trực tiếp từ JWT xác thực của Supabase Gateway, ngăn chặn hoàn toàn việc giả mạo danh tính bạn học.
3. **Tính Toàn vẹn Giao dịch (ACID Transactions):** Các thao tác liên quan đến Điểm danh, Chấm bài, Thưởng XP và Mở quà phải được bọc trong một Database Transaction (`BEGIN ... COMMIT`). Nếu một bước thất bại, toàn bộ trạng thái phải được Rollback.
4. **Chống Gửi Lặp (Idempotency Control):** Mọi giao dịch cộng XP hoặc nộp bài đều yêu cầu `idempotency_key` duy nhất để ngăn ngừa việc gửi liên tiếp nhiều request (Double-click / Network retry).

---

## 2. CHI TIẾT ĐẶC TẢ TÁM THAO TÁC NGHIỆP VỤ CỐT LÕI (8 CORE OPERATIONS)

---

### THAO TÁC 1: ĐIỂM DANH CHỦ ĐỘNG (`claim_daily_attendance`)

- **Ý nghĩa nghiệp vụ:** Học sinh chủ động bấm điểm danh để nhận +2 XP (Tuân thủ nghiêm ngặt **BR-02**; không tự động điểm danh khi đăng nhập).
- **Hình thức thực thi đề xuất:** PostgreSQL Stored Procedure (RPC) `SECURITY DEFINER`.
- **Đầu vào (Input):**
  - Không cần tham số đầu vào (hoặc tùy chọn `client_timestamp`).
- **Tác nhân xác thực (Authenticated Actor):** Người dùng có role `student`.
- **Ủy quyền (Authorization):** `auth.uid() IS NOT NULL` và tồn tại trong `student_profiles`.
- **Kiểm tra hợp lệ (Validation):**
  1. Xác định ngày học tập hiện tại theo múi giờ nghiệp vụ:
     `current_business_date := (timezone('Asia/Ho_Chi_Minh', now()))::DATE`
  2. Kiểm tra xem học sinh đã điểm danh trong ngày này chưa:
     `SELECT 1 FROM attendance_records WHERE student_id = auth.uid() AND attendance_date = current_business_date`
  3. Nếu đã tồn tại $\rightarrow$ Trả về lỗi nghiệp vụ: `ALREADY_CLAIMED_TODAY`.
- **Ranh giới giao dịch (Transaction Boundary):**
  1. `INSERT INTO attendance_records(student_id, attendance_date, awarded_xp) VALUES (auth.uid(), current_business_date, 2) RETURNING id INTO v_att_id;`
  2. Tạo idempotency key: `att_<student_id>_<current_business_date>`
  3. `INSERT INTO xp_ledger(student_id, action_type, raw_xp, actual_xp, idempotency_key, reference_id) VALUES (auth.uid(), 'daily_attendance', 2, 2, v_key, v_att_id);`
  4. Cập nhật hồ sơ học sinh:
     `UPDATE student_profiles SET total_xp = total_xp + 2, streak_days = streak_days + 1, last_active_date = current_business_date WHERE id = auth.uid();`
- **Xử lý sự cố (Failure Handling):** Lỗi ràng buộc `UNIQUE (student_id, attendance_date)` sẽ tự động rollback giao dịch và báo lỗi an toàn.
- **Đầu ra mong đợi (Expected Output):**
  `{ success: true, awarded_xp: 2, streak_days: 5, message: "Điểm danh thành công! Bạn nhận được +2 XP." }`

---

### THAO TÁC 2: GIAO DỊCH THƯỞNG XP & ÁP TRẦN NGÀY (`award_xp_transaction`)

- **Ý nghĩa nghiệp vụ:** Sổ cái XP trung tâm xử lý cộng điểm cho các hoạt động học tập, phân biệt rõ `raw_xp` và `actual_xp` sau khi áp dụng chính sách trần ngày (Daily Cap).
- **Hình thức thực thi:** Internal Database Function (được gọi từ các RPC khác).
- **Đầu vào (Input):**
  - `p_student_id UUID`
  - `p_action_type VARCHAR` (`quiz_practice`, `quiz_formal`, v.v.)
  - `p_raw_xp INTEGER`
  - `p_idempotency_key VARCHAR`
  - `p_reference_id UUID`
- **Kiểm tra trần ngày (Daily Cap Logic):**
  1. Lấy tổng `actual_xp` học sinh đã nhận trong ngày hôm nay (`Asia/Ho_Chi_Minh`):
     `v_today_xp := COALESCE(SUM(actual_xp), 0) FROM xp_ledger WHERE student_id = p_student_id AND (timezone('Asia/Ho_Chi_Minh', created_at))::DATE = current_business_date;`
  2. Giả sử trần ngày được cấu hình là 50 XP:
     - Nếu `v_today_xp >= 50` $\rightarrow$ `v_actual_xp := 0;`
     - Nếu `v_today_xp + p_raw_xp > 50` $\rightarrow$ `v_actual_xp := 50 - v_today_xp;`
     - Ngược lại $\rightarrow$ `v_actual_xp := p_raw_xp;`
- **Ghi nhận dữ liệu:**
  1. `INSERT INTO xp_ledger (student_id, action_type, raw_xp, actual_xp, idempotency_key, reference_id) VALUES (p_student_id, p_action_type, p_raw_xp, v_actual_xp, p_idempotency_key, p_reference_id);`
  2. `UPDATE student_profiles SET total_xp = total_xp + v_actual_xp WHERE id = p_student_id;`
- **Đầu ra:** Trả về `v_actual_xp` thực tế được ghi nhận.

---

### THAO TÁC 3: NỘP VÀ CHẤM BÀI QUIZ TRẮC NGHIỆM (`submit_quiz_attempt`)

- **Ý nghĩa nghiệp vụ:** Chấm điểm trắc nghiệm server-side, bảo mật đáp án, cập nhật kết quả bài làm, tính thưởng XP và cập nhật Mastery cho câu trắc nghiệm (Tuân thủ **BR-03, BR-04, BR-08, BR-10**).
- **Hình thức thực thi đề xuất:** PostgreSQL Stored Procedure (RPC) `SECURITY DEFINER`.
- **Đầu vào (Input):**
  - `p_attempt_id UUID` (Lượt làm bài đang ở trạng thái `in_progress`)
  - `p_answers JSONB` (Mảng câu trả lời: `[ { question_version_id: UUID, answer: JSONB }, ... ]`)
  - `p_idempotency_key VARCHAR`
- **Tác nhân xác thực (Authenticated Actor):** Học sinh (`auth.uid()`).
- **Kiểm tra hợp lệ (Validation):**
  1. Kiểm tra lượt làm bài: `SELECT quiz_version_id, student_id, started_at, status FROM quiz_attempts WHERE id = p_attempt_id;`
  2. Bắt buộc: `student_id = auth.uid()` và `status = 'in_progress'`.
  3. Kiểm tra thời gian làm bài (Server-side Timer): Nếu đề thi có `time_limit_minutes`, đối soát `now() - started_at` có vượt quá thời gian cho phép kèm độ trễ mạng hợp lệ (+30s grace period) hay không.
- **Quy trình chấm điểm trong Giao dịch (Execution Flow):**
  1. Duyệt qua từng câu hỏi trong `p_answers`:
     - Lấy đáp án chuẩn từ bảng bảo mật:
       `SELECT correct_answer_payload, max_score FROM secure_answer_keys JOIN question_versions ... WHERE question_version_id = ...;`
     - Đối chiếu câu trả lời của học sinh:
       - Nếu là trắc nghiệm/điền khuyết/sắp xếp: Kiểm tra khớp tuyệt đối $\rightarrow$ Gán `is_correct := true; awarded_score := max_score;`
       - Nếu là câu tự luận (Essay): Gán `is_correct := NULL; awarded_score := 0;` (Chờ giáo viên chấm theo BR-03).
     - Ghi nhận vào bảng chi tiết:
       `INSERT INTO attempt_answers(attempt_id, question_version_id, student_answer_payload, is_correct, awarded_score) VALUES (...);`
     - Nếu là câu tự luận $\rightarrow$ `INSERT INTO essay_submissions(attempt_id, attempt_answer_id, student_id, essay_text, word_count, status) VALUES (...);`
  2. Tính tổng điểm trắc nghiệm đạt được (`v_total_score`) và điểm tối đa có thể đạt (`v_max_score`).
  3. Tính toán tỷ lệ đạt: `v_score_ratio := v_total_score / v_max_score;`
  4. Xác định XP thưởng của Quiz:
     - Nếu đạt tỷ lệ qua bài ($\ge 60\%$): Thưởng `raw_xp = 10`.
     - Gọi `award_xp_transaction` để ghi vào `xp_ledger`.
  5. Cập nhật lượt làm bài:
     `UPDATE quiz_attempts SET status = 'submitted', submitted_at = now(), total_score = v_total_score, max_possible_score = v_max_score, score_ratio = v_score_ratio, earned_xp = v_actual_xp WHERE id = p_attempt_id;`
  6. Ghi bằng chứng Mastery cho các câu hỏi trắc nghiệm vào `mastery_evidence`.
- **Đầu ra mong đợi:**
  `{ success: true, total_score: 8.0, max_score: 10.0, score_ratio: 0.8, earned_xp: 10, has_pending_essay: true }`

---

### THAO TÁC 4: GIÁO VIÊN CHẤM BÀI TỰ LUẬN (`grade_essay_submission`)

- **Ý nghĩa nghiệp vụ:** Giáo viên ghi nhận điểm chính thức và nhận xét cho bài tự luận; cập nhật năng lực Viết (Mastery Writing) chỉ sau khi chốt điểm (Tuân thủ **BR-03**).
- **Hình thức thực thi đề xuất:** PostgreSQL Stored Procedure (RPC) `SECURITY DEFINER`.
- **Đầu vào (Input):**
  - `p_submission_id UUID`
  - `p_final_score NUMERIC(4,2)` (Thang điểm 0 - 10)
  - `p_feedback TEXT`
  - `p_is_final_round BOOLEAN`
- **Tác nhân xác thực (Authenticated Actor):** Giáo viên (`auth.uid()` có role `teacher`).
- **Ủy quyền (Authorization):** Giáo viên phải là người phụ trách lớp học của học sinh nộp bài.
- **Ranh giới giao dịch (Transaction Boundary):**
  1. Ghi nhận nhận xét của giáo viên:
     `INSERT INTO essay_teacher_reviews(submission_id, teacher_id, final_score, teacher_feedback, is_final_round) VALUES (p_submission_id, auth.uid(), p_final_score, p_feedback, p_is_final_round) RETURNING id INTO v_review_id;`
  2. Cập nhật trạng thái bài tự luận:
     `UPDATE essay_submissions SET status = 'teacher_graded' WHERE id = p_submission_id;`
  3. Cập nhật lại điểm của câu tự luận trong `attempt_answers`:
     `UPDATE attempt_answers SET awarded_score = (p_final_score / 10.0) * max_score, is_correct = (p_final_score >= 5.0) WHERE id = (SELECT attempt_answer_id FROM essay_submissions WHERE id = p_submission_id);`
  4. Nếu `p_is_final_round = true`:
     - Ghi nhận bằng chứng năng lực viết vào `mastery_evidence`:
       `INSERT INTO mastery_evidence(student_id, topic_id, skill_category, evidence_source, source_id, score_ratio) VALUES (v_student_id, v_topic_id, 'writing', 'teacher_essay_review', v_review_id, p_final_score / 10.0);`
     - Kích hoạt tính lại `student_mastery_snapshots`.
- **Đầu ra mong đợi:**
  `{ success: true, submission_id: p_submission_id, final_score: p_final_score, mastery_updated: true }`

---

### THAO TÁC 5: TÍNH TOÁN LẠI CHỈ SỐ THÀNH THẠO MASTERY (`recalculate_student_mastery`)

- **Ý nghĩa nghiệp vụ:** Tổng hợp các bằng chứng năng lực gần nhất để xác định tỷ lệ thành thạo và danh hiệu Cây Trưởng Thành theo chủ đề (Tuân thủ **BR-03**).
- **Công thức tính toán:**
  - Lấy trung bình trọng số của 4 nhóm kỹ năng trong `mastery_evidence` (ví dụ: Nhận biết 25%, Thông hiểu 25%, Vận dụng/Phân tích 25%, Viết 25%).
  - Xác định danh hiệu:
    - $\ge 90\%$: Trạng Nguyên
    - $\ge 80\%$: Tiến Sĩ
    - $\ge 65\%$: Cử Nhân
    - $\ge 50\%$: Tú Kép
    - $< 50\%$: Khoa Bảng
- **Ghi nhận:**
  `INSERT INTO student_mastery_snapshots(student_id, topic_id, mastery_percentage, mastery_level, last_recalculated_at) VALUES (p_student_id, p_topic_id, v_percentage, v_level, now()) ON CONFLICT (student_id, topic_id) DO UPDATE SET mastery_percentage = EXCLUDED.mastery_percentage, mastery_level = EXCLUDED.mastery_level, last_recalculated_at = now();`

---

### THAO TÁC 6: XUẤT BẢN PHIÊN BẢN HỌC LIỆU BẤT BIẾN (`publish_quiz_version`)

- **Ý nghĩa nghiệp vụ:** Đóng băng bản nháp thành phiên bản chính thức bất biến, đảm bảo giáo viên sửa đề không làm thay đổi lịch sử thi cũ (Tuân thủ **BR-05**).
- **Đầu vào:** `p_quiz_id UUID`, `p_title VARCHAR`, `p_question_list JSONB`.
- **Quy trình:**
  1. Xác định số phiên bản tiếp theo: `v_next_version := COALESCE(MAX(version_number), 0) + 1 FROM quiz_versions WHERE quiz_id = p_quiz_id;`
  2. Tạo bản ghi bất biến trong `quiz_versions`:
     `INSERT INTO quiz_versions(quiz_id, version_number, title, published_by) VALUES (p_quiz_id, v_next_version, p_title, auth.uid()) RETURNING id INTO v_qv_id;`
  3. Đóng băng từng câu hỏi:
     - Tạo `question_versions` và `secure_answer_keys` mới tương ứng.
     - Ánh xạ vào `quiz_version_questions(quiz_version_id, question_version_id, order_index)`.
  4. Ghi nhận hành vi quản trị vào `audit_logs`.
- **Đầu ra:** `{ success: true, quiz_version_id: v_qv_id, version_number: v_next_version }`

---

### THAO TÁC 7: XÁC MINH HOÀN THÀNH VIDEO BÀI GIẢNG (`verify_video_completion`)

- **Ý nghĩa nghiệp vụ:** Xác minh học sinh đã xem tích lũy đủ $\ge 80\%$ thời lượng thực tế của video (Tuân thủ **BR-11**; cấm hoàn toàn timer ảo).
- **Đầu vào:** `p_video_id UUID`, `p_new_interval JSONB` (Ví dụ: `[120, 150]`).
- **Quy trình:**
  1. Đọc danh sách các khoảng thời gian đã xem trong `video_watch_progress`:
     `SELECT watched_intervals, accumulated_seconds, is_completed FROM video_watch_progress WHERE student_id = auth.uid() AND video_id = p_video_id;`
  2. Thuật toán hợp nhất khoảng thời gian (Interval Merging Algorithm):
     - Gộp khoảng thời gian mới vào mảng hiện có: `merged_intervals := merge_time_intervals(watched_intervals, p_new_interval);`
     - Tính tổng số giây duy nhất không trùng lặp: `unique_seconds := calculate_unique_duration(merged_intervals);`
  3. Lấy thời lượng chuẩn của video: `SELECT duration_seconds, min_watch_ratio FROM video_lessons WHERE id = p_video_id;`
  4. Kiểm tra điều kiện hoàn thành:
     - Nếu `(unique_seconds / duration_seconds) >= min_watch_ratio` và `is_completed = false`:
       - Đánh dấu `is_completed := true; completed_at := now();`
       - Ghi nhận thưởng XP xem video (nếu có chính sách).
  5. Cập nhật `video_watch_progress`.
- **Đầu ra:** Trả về `{ is_completed: true, accumulated_seconds: unique_seconds, ratio: 0.85 }`.

---

### THAO TÁC 8: MỞ KHÓA QUÀ TẶNG BÍ MẬT (`unlock_reward_secret`)

- **Ý nghĩa nghiệp vụ:** Kiểm tra số dư XP, trừ điểm trong sổ cái và trả về nội dung quà bí mật an toàn (Bảo vệ bí mật quà tặng).
- **Đầu vào:** `p_reward_id UUID`.
- **Quy trình trong Giao dịch:**
  1. Kiểm tra quà tặng: `SELECT cost_xp, is_secret FROM reward_catalog WHERE id = p_reward_id AND is_active = true;`
  2. Kiểm tra số dư XP của học sinh:
     `SELECT total_xp FROM student_profiles WHERE id = auth.uid() FOR UPDATE;`
  3. Nếu `total_xp < cost_xp` $\rightarrow$ Báo lỗi `INSUFFICIENT_XP`.
  4. Trừ XP trong sổ cái:
     `INSERT INTO xp_ledger(student_id, action_type, raw_xp, actual_xp, idempotency_key, reference_id) VALUES (auth.uid(), 'reward_claim_deduct', -cost_xp, -cost_xp, gen_random_uuid(), p_reward_id);`
  5. Cập nhật số dư: `UPDATE student_profiles SET total_xp = total_xp - cost_xp WHERE id = auth.uid();`
  6. Lấy bí mật từ bảng bảo mật:
     `SELECT secret_real_name, secret_payload FROM reward_secrets WHERE reward_id = p_reward_id;`
  7. Ghi nhận vào `reward_claims` và trả về kết quả cho học sinh một lần duy nhất.
- **Đầu ra:** `{ success: true, spent_xp: cost_xp, secret_name: "Thẻ Đọc Sách VIP", secret_code: "MAMVAN-VIP-99" }`.

---
*(Xem tiếp Tài liệu 06 để biết Kế hoạch Triển khai Chi tiết theo từng Giai đoạn Phase 2.2 đến 2.6).*
