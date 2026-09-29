# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 05 (PHIÊN BẢN HIỆU CHỈNH V1.1): THIẾT KẾ LOGIC PHÍA SERVER
# (RECONCILED SERVER-AUTHORITATIVE BUSINESS LOGIC DESIGN)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | **v1.1 (Reconciled Server-Side Logic Specification)** |
| **Trạng thái** | **PROPOSED TECHNICAL DESIGN – PENDING PO REVIEW** |
| **Tác giả** | Senior Software & Security Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md`, `docs/phase-2/08_CROSS_DOCUMENT_CONSISTENCY_REVIEW.md` và Quyết định phê duyệt ADR-08 |
| **Quy tắc an toàn** | **GIỮ NGUYÊN BẢN V1.0**; Tài liệu v1.1 tích hợp toàn diện ADR-08 và chuẩn hóa Mastery |

---

## 1. NGUYÊN TẮC AN NINH STORED PROCEDURE & RPC (SECURITY HARDENING)

Mọi Database Stored Procedure (RPC) chạy với đặc quyền cao `SECURITY DEFINER` bắt buộc phải tuân thủ nghiêm ngặt 3 nguyên tắc bảo mật sau:
1. **Khóa Search Path (Search Path Hijacking Protection):** Bắt buộc phải có mệnh đề `SET search_path = public, pg_temp;` để ngăn chặn kẻ tấn công tạo các hàm giả mạo trong schema tạm.
2. **Thu hồi quyền thực thi mặc định (Revoke Public Execution):**
   `REVOKE EXECUTE ON FUNCTION <func_name> FROM PUBLIC;`
   `GRANT EXECUTE ON FUNCTION <func_name> TO authenticated;`
3. **Xác thực danh tính từ JWT (`auth.uid()`):** Tuyệt đối không nhận `student_id` do client tự gửi lên trong tham số hàm. Định danh học sinh luôn được lấy trực tiếp từ `auth.uid()`.

---

## 2. HIỆU CHỈNH CÁC THAO TÁC NGHIỆP VỤ CỐT LÕI (RECONCILED CORE OPERATIONS)

---

### THAO TÁC 1: ĐIỂM DANH CHỦ ĐỘNG TÍCH HỢP TRẦN XP (ADR-08) (`claim_daily_attendance`)

- **Ý nghĩa nghiệp vụ:** Học sinh chủ động bấm điểm danh nhận định mức `raw_xp = 2`. XP điểm danh nằm trọn trong trần ngày (130 - 150 XP) và trần tuần (900 XP). Khi học sinh đã đạt trần ngày trước khi điểm danh, hệ thống vẫn ghi nhận điểm danh thành công nhưng `actual_xp = 0` (Tuân thủ nghiêm ngặt **BR-02 và ADR-08**).
- **Hình thức thực thi đề xuất:** PostgreSQL RPC `SECURITY DEFINER` với `SET search_path = public, pg_temp;`.
- **Đầu vào (Input):** Không nhận tham số định danh từ client.
- **Tác nhân xác thực:** Học sinh (`auth.uid()`).
- **Quy trình trong Giao dịch (Transaction Execution Flow):**
  1. Xác định ngày học tập hiện tại theo múi giờ nghiệp vụ Việt Nam:
     `v_today := (timezone('Asia/Ho_Chi_Minh', now()))::DATE;`
  2. Kiểm tra xem học sinh đã điểm danh trong ngày chưa:
     `IF EXISTS (SELECT 1 FROM attendance_records WHERE student_id = auth.uid() AND attendance_date = v_today) THEN`
       `RAISE EXCEPTION 'ALREADY_CLAIMED_TODAY';`
     `END IF;`
  3. Tính toán hạn mức XP còn lại trong ngày và tuần thông qua hàm `calculate_effective_xp(auth.uid(), 2)`:
     - Lấy tổng thời gian học tích cực trong ngày từ `student_profiles.active_seconds_today`.
     - Xác định trần ngày: Nếu $\le 45$ phút $\rightarrow$ trần 130 XP; nếu $45 - 90$ phút $\rightarrow$ trần 150 XP; nếu $> 90$ phút $\rightarrow$ khóa trần.
     - Lấy XP đã nhận trong ngày (`v_xp_today`) và trong tuần (`v_xp_week`).
     - `v_remaining_daily := GREATEST(0, v_daily_cap - v_xp_today);`
     - `v_remaining_weekly := GREATEST(0, 900 - v_xp_week);`
     - `v_actual_xp := LEAST(2, v_remaining_daily, v_remaining_weekly);`
  4. Ghi nhận nhật ký điểm danh:
     `INSERT INTO attendance_records(student_id, attendance_date, awarded_xp, claimed_at) VALUES (auth.uid(), v_today, v_actual_xp, now()) RETURNING id INTO v_att_id;`
  5. Ghi sổ cái XP:
     `INSERT INTO xp_ledger(student_id, action_type, raw_xp, actual_xp, idempotency_key, reference_id, created_at) VALUES (auth.uid(), 'daily_attendance', 2, v_actual_xp, 'att_' || auth.uid() || '_' || v_today, v_att_id, now());`
  6. Cập nhật hồ sơ học sinh:
     `UPDATE student_profiles SET total_xp = total_xp + v_actual_xp, streak_days = streak_days + 1, last_active_date = v_today, updated_at = now() WHERE id = auth.uid();`
- **Đầu ra mong đợi:**
  - Nếu còn trần XP: `{ success: true, actual_xp: 2, streak_days: 5, message: "Điểm danh thành công! Bạn nhận được +2 XP." }`
  - Nếu đã chạm trần XP: `{ success: true, actual_xp: 0, streak_days: 5, message: "Điểm danh thành công! Bạn đã hoàn thành chuỗi ngày học nhưng đã đạt trần XP hôm nay." }`

---

### THAO TÁC 2: SỔ CÁI XP TRUNG TÂM & ÁP TRẦN LINH HOẠT (`award_xp_transaction`)

- **Ý nghĩa nghiệp vụ:** Thực thi cộng XP theo quy tắc hoàn thành lần đầu (First-completion rule), áp dụng trần học tích cực 130 - 150 XP/ngày và trần 900 XP/tuần (Không sử dụng trần 50 XP cũ).
- **Logic kiểm tra trần (Cap Evaluation Logic):**
  ```sql
  -- Giả mã logic bên trong Stored Procedure
  v_active_minutes := FLOOR(v_active_seconds_today / 60);
  
  -- Xác định trần ngày theo thời gian học tích cực
  IF v_active_minutes >= 90 THEN
      v_daily_cap := 150;
      v_is_time_exhausted := true;
  ELSIF v_active_minutes >= 45 THEN
      v_daily_cap := 150;
      v_is_time_exhausted := false;
  ELSE
      v_daily_cap := 130;
      v_is_time_exhausted := false;
  END IF;

  IF v_is_time_exhausted THEN
      v_actual_xp := 0;
  ELSE
      v_remaining_daily := GREATEST(0, v_daily_cap - v_xp_today);
      v_remaining_weekly := GREATEST(0, 900 - v_xp_week);
      v_actual_xp := LEAST(p_raw_xp, v_remaining_daily, v_remaining_weekly);
  END IF;
  ```

---

### THAO TÁC 3: NỘP VÀ CHẤM BÀI QUIZ TRẮC NGHIỆM (`submit_quiz_attempt`)

- **Ý nghĩa nghiệp vụ:** Chấm trắc nghiệm server-side đối chiếu `secure_answer_keys`, kiểm tra đồng hồ đếm ngược phía server (có hỗ trợ trạng thái `timed_out` nếu quá giờ quy định +30s grace period), ghi nhận bằng chứng Mastery 4 mức cho trắc nghiệm và bảo lưu câu tự luận chờ giáo viên chấm (Tuân thủ **BR-03, BR-04, BR-10**).
- **Xử lý Thời gian Thi phía Server:**
  - `SELECT started_at, time_limit_minutes FROM quiz_attempts qa JOIN quiz_versions qv ON qa.quiz_version_id = qv.id WHERE qa.id = p_attempt_id;`
  - Nếu đề thi có giới hạn thời gian:
    - `v_allowed_seconds := (time_limit_minutes * 60) + 30; -- Cộng 30 giây độ trễ mạng`
    - `IF EXTRACT(EPOCH FROM (now() - started_at)) > v_allowed_seconds THEN`
        `-- Quá thời gian cho phép: Đánh dấu timed_out hoặc thu bài tại mốc hết giờ`
        `v_attempt_status := 'timed_out';`
    - `ELSE`
        `v_attempt_status := 'submitted';`
    - `END IF;`
- **Xử lý Câu hỏi Tự luận (Essay) trong Quiz:**
  - Đối với các câu hỏi tự luận trong đề: Ghi nhận `attempt_answers.awarded_score := 0`, `is_correct := NULL`.
  - Tạo bản ghi `essay_submissions` ở trạng thái `submitted`.
  - **Tuyệt đối không tính điểm 0 cho câu tự luận vào điểm tổng kết cuối cùng**; điểm số hiển thị của lượt làm bài là điểm tạm thời của phần trắc nghiệm kèm cờ `has_pending_essay: true`.
  - **Không cập nhật Mastery năng lực Viết** tại thời điểm học sinh nộp bài quiz (Tuân thủ triệt để BR-03).

---

### THAO TÁC 4: GIÁO VIÊN CHẤM TỰ LUẬN & CẬP NHẬT MASTERY CHUẨN (`grade_essay_submission`)

- **Ý nghĩa nghiệp vụ:** Giáo viên ghi nhận điểm chính thức và nhận xét cho bài tự luận; cập nhật năng lực `PHAN_TICH` hoặc `VAN_DUNG` trong `mastery_evidence` thông qua cơ chế UPSERT chống trùng lặp khi chấm lại (Tuân thủ **BR-03**).
- **Ranh giới giao dịch (Transaction Boundary):**
  1. Ghi nhận đánh giá của giáo viên:
     `INSERT INTO essay_teacher_reviews(submission_id, teacher_id, final_score, teacher_feedback, review_round, is_final_round, reviewed_at) VALUES (p_submission_id, auth.uid(), p_final_score, p_feedback, p_round, p_is_final, now()) RETURNING id INTO v_review_id;`
  2. Cập nhật trạng thái bài tự luận:
     `UPDATE essay_submissions SET status = 'teacher_graded' WHERE id = p_submission_id;`
  3. Cập nhật lại câu trả lời trong `attempt_answers`:
     `UPDATE attempt_answers SET awarded_score = (p_final_score / 10.0) * max_score, is_correct = (p_final_score >= 5.0) WHERE id = (SELECT attempt_answer_id FROM essay_submissions WHERE id = p_submission_id);`
  4. Nếu `p_is_final = true`:
     - Xác định mức năng lực của câu tự luận: `v_skill_level` (thuộc `PHAN_TICH` hoặc `VAN_DUNG`).
     - **Cập nhật bằng chứng Mastery chống trùng lặp (UPSERT):**
       ```sql
       INSERT INTO mastery_evidence (
           student_id, topic_id, skill_level, source_evidence_key, score_ratio, updated_at
       ) VALUES (
           v_student_id, v_topic_id, v_skill_level, 'essay_submission:' || p_submission_id, p_final_score / 10.0, now()
       )
       ON CONFLICT (student_id, topic_id, skill_level, source_evidence_key)
       DO UPDATE SET 
           score_ratio = EXCLUDED.score_ratio,
           updated_at = now();
       ```
     - Kích hoạt tính toán lại `student_mastery_snapshots` cho học sinh theo chủ đề này.

---
*(Bản v1.1 này là quy chuẩn kỹ thuật cho việc hiện thực hóa các Stored Procedures trong Phase 2.4 và 2.5).*
