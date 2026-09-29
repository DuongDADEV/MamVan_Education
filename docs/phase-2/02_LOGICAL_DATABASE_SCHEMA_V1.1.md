# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 02 (PHIÊN BẢN HIỆU CHỈNH V1.1): THIẾT KẾ SCHEMA CƠ SỞ DỮ LIỆU LOGIC
# (RECONCILED LOGICAL DATABASE SCHEMA)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | **v1.1 (Reconciled Schema Specification)** |
| **Trạng thái** | **PROPOSED TECHNICAL SCHEMA – PENDING PO REVIEW** |
| **Tác giả** | Senior Database Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md`, `docs/phase-2/08_CROSS_DOCUMENT_CONSISTENCY_REVIEW.md` và Quyết định phê duyệt ADR-08 |
| **Quy tắc an toàn** | **GIỮ NGUYÊN BẢN V1.0**; Tài liệu v1.1 là bản hiệu chỉnh các sai lệch P0/P1 |

---

## 1. NGUYÊN TẮC HIỆU CHỈNH CHÍNH TRONG PHIÊN BẢN V1.1

1. **Chuẩn hóa Số lượng Bảng:** Bổ sung bảng theo dõi tiến trình học tổng quát `student_learning_progress` (TBL_E06), nâng tổng số bảng logic lên **34 bảng**.
2. **Chuẩn hóa Năng lực Ngữ văn (4 Mức):** Thay thế toàn bộ mã `recalling, understanding, analyzing, writing` và mức tự tạo `VIET` bằng 4 mức chuẩn giáo dục: `NHAN_BIET`, `THONG_HIEU`, `PHAN_TICH`, `VAN_DUNG`.
3. **Chống trùng lặp Bằng chứng Mastery khi Chấm lại:** Trong `mastery_evidence`, định danh bằng chứng gắn liền với `essay_submission_id` hoặc `attempt_answer_id`, ràng buộc `UNIQUE (student_id, topic_id, skill_level, source_evidence_key)`.
4. **Bổ sung trạng thái `timed_out` cho Lượt làm bài:** Trạng thái của `quiz_attempts` gồm: `in_progress`, `submitted`, `timed_out`, `abandoned`.
5. **Chuẩn hóa Timestamp:** Thay thế `timezone('utc', now())` bằng `DEFAULT now()` chuẩn cho các cột `TIMESTAMPTZ`.

---

## 2. DANH MỤC 34 BẢNG THEO MIỀN DỮ LIỆU (RECONCILED SCHEMA INVENTORY)

| Domain | Mã bảng | Tên bảng logic | Phân loại | Vai trò chính |
| :--- | :--- | :--- | :--- | :--- |
| **A. Identity & Classroom** | `TBL_A01` | `user_profiles` | Core MVP | Hồ sơ thông tin chung người dùng |
| | `TBL_A02` | `user_roles` | Core MVP | Phân quyền vai trò người dùng |
| | `TBL_A03` | `teacher_profiles` | Core MVP | Thông tin chuyên môn giáo viên |
| | `TBL_A04` | `student_profiles` | Core MVP | Hồ sơ học sinh, điểm kinh nghiệm, chuỗi streak |
| | `TBL_A05` | `classes` | Core MVP | Danh sách lớp học khối 7 |
| | `TBL_A06` | `class_memberships` | Core MVP | Thành viên lớp học |
| **B. Learning Content** | `TBL_B01` | `topics` | Core MVP | Chủ đề bài học khối 7 |
| | `TBL_B02` | `video_lessons` | Core MVP | Bài học Video và cấu hình xác minh xem |
| | `TBL_B03` | `video_focus_points` | Supporting | Điểm dừng tương tác/chú thích trên video |
| | `TBL_B04` | `theory_lessons` | Core MVP | Bài học lý thuyết |
| | `TBL_B05` | `theory_blocks` | Supporting | Các khối nội dung của bài lý thuyết |
| **C. Question Bank & Versioning** | `TBL_C01` | `questions` | Core MVP | Danh tính logic câu hỏi |
| | `TBL_C02` | `question_versions` | Core MVP | Nội dung câu hỏi bất biến theo phiên bản |
| | `TBL_C03` | `secure_answer_keys` | Core MVP | Bảng bảo mật đáp án đúng và thang chấm (Tách RLS) |
| | `TBL_C04` | `quizzes` | Core MVP | Danh tính logic đề kiểm tra |
| | `TBL_C05` | `quiz_versions` | Core MVP | Phiên bản đề kiểm tra bất biến |
| | `TBL_C06` | `quiz_version_questions` | Core MVP | Bảng ánh xạ câu hỏi vào phiên bản đề |
| | `TBL_C07` | `quiz_assignments` | Core MVP | Giao bài tập cho lớp hoặc học sinh cụ thể |
| **D. Attempt & Grading** | `TBL_D01` | `quiz_attempts` | Core MVP | Lượt làm bài kiểm tra (có `timed_out`) |
| | `TBL_D02` | `attempt_answers` | Core MVP | Chi tiết câu trả lời từng câu trong lượt làm |
| | `TBL_D03` | `essay_submissions` | Core MVP | Bài làm tự luận của học sinh |
| | `TBL_D04` | `essay_ai_evaluations` | Core MVP | Đánh giá gợi ý của AI (Bảo mật tách rời RLS) |
| | `TBL_D05` | `essay_teacher_reviews` | Core MVP | Điểm và nhận xét chính thức từ giáo viên |
| **E. Learning Progress** | `TBL_E01` | `video_watch_progress` | Core MVP | Tiến trình xem video thực tế (chống timer ảo) |
| | `TBL_E02` | `attendance_records` | Core MVP | Nhật ký điểm danh chủ động (+2 XP) |
| | `TBL_E03` | `xp_ledger` | Core MVP | Sổ cái biến động XP theo trần ngày 130-150 XP (ADR-08) |
| | `TBL_E04` | `mastery_evidence` | Core MVP | Bằng chứng năng lực chuẩn 4 mức, chống trùng lặp |
| | `TBL_E05` | `student_mastery_snapshots` | Supporting | Ảnh chụp trạng thái Mastery phục vụ hiển thị nhanh |
| | `TBL_E06` | **`student_learning_progress`** | **Core MVP** | **Tiến trình học tổng quát, completed steps & resume state** |
| **F. Rewards & Gamification** | `TBL_F01` | `reward_catalog` | Core MVP | Danh mục quà tặng công khai |
| | `TBL_F02` | `reward_secrets` | Core MVP | Nội dung bí mật của quà tặng (Bảo mật tách RLS) |
| | `TBL_F03` | `reward_claims` | Core MVP | Lịch sử đổi quà của học sinh |
| **G. Administration & Audit** | `TBL_G01` | `system_settings` | Supporting | Cấu hình tham số hệ thống toàn cục |
| | `TBL_G02` | `audit_logs` | Supporting | Nhật ký kiểm toán hành vi của giáo viên |

---

## 3. CÁC HIỆU CHỈNH ĐẶC TẢ CHI TIẾT TỪNG BẢNG

*(Chỉ nêu chi tiết các bảng có hiệu chỉnh so với v1.0, các bảng khác giữ nguyên theo v1.0).*

---

### `TBL_D01: quiz_attempts` (Đã bổ sung `timed_out` và chuẩn hóa timestamp)
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `assignment_id UUID NULL REFERENCES quiz_assignments(id) ON DELETE RESTRICT`
  - `quiz_version_id UUID NOT NULL REFERENCES quiz_versions(id) ON DELETE RESTRICT`
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number >= 1)`
  - `status VARCHAR(20) NOT NULL DEFAULT 'in_progress'` **`CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'abandoned'))`**
  - `started_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `submitted_at TIMESTAMPTZ NULL`
  - `total_score NUMERIC(5,2) NULL CHECK (total_score >= 0)`
  - `max_possible_score NUMERIC(5,2) NULL CHECK (max_possible_score > 0)`
  - `score_ratio NUMERIC(4,3) NULL CHECK (score_ratio BETWEEN 0 AND 1.0)`
  - `earned_xp INTEGER NOT NULL DEFAULT 0 CHECK (earned_xp >= 0)`
  - `client_metadata JSONB NULL` (User-agent, IP hash, local save snapshot)

---

### `TBL_E03: xp_ledger` (Đã tích hợp trần ngày 130-150 XP theo ADR-08)
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `action_type VARCHAR(50) NOT NULL` (CHECK: `daily_attendance`, `quiz_practice`, `quiz_formal`, `video_completion`, `theory_read`, `reward_claim_deduct`)
  - `raw_xp INTEGER NOT NULL` (Định mức XP của hành động, ví dụ điểm danh = 2)
  - `actual_xp INTEGER NOT NULL` (XP thực nhận sau khi áp dụng trần ngày 130-150 XP và trần tuần 900 XP; nếu chạm trần, actual_xp = 0)
  - `idempotency_key VARCHAR(100) NOT NULL UNIQUE` (Khóa chống cộng trùng lặp)
  - `reference_id UUID NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

---

### `TBL_E04: mastery_evidence` (Đã chuẩn hóa 4 mức năng lực & chống trùng lặp)
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `skill_level VARCHAR(30) NOT NULL` **`CHECK (skill_level IN ('NHAN_BIET', 'THONG_HIEU', 'PHAN_TICH', 'VAN_DUNG'))`**
  - `source_evidence_key VARCHAR(100) NOT NULL` (Ví dụ: `attempt_answer:<id>` hoặc `essay_submission:<id>`)
  - `score_ratio NUMERIC(4,3) NOT NULL CHECK (score_ratio BETWEEN 0 AND 1.0)`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Ràng buộc duy nhất chống trùng lặp khi chấm lại:**
  **`UNIQUE (student_id, topic_id, skill_level, source_evidence_key)`**
- **Ghi chú sư phạm:** Khi giáo viên chấm lại bài tự luận lần 2, hệ thống thực hiện UPSERT theo ràng buộc duy nhất này, cập nhật `score_ratio` và `updated_at`, tuyệt đối không chèn thêm dòng mới.

---

### `TBL_E06: student_learning_progress` (BẢNG BỔ SUNG MỚI)
- **Mục đích nghiệp vụ:** Lưu trữ tiến trình học tập tổng quát của học sinh theo từng chủ đề, ghi nhớ bước học gần nhất (Resume State) và danh sách các bước đã hoàn thành lần đầu để xác định điều kiện thưởng XP (First-completion rule).
- **Domain:** Learning Progress | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `current_lesson_type VARCHAR(30) NOT NULL DEFAULT 'video'` (CHECK: `video`, `theory`, `quiz`)
  - `current_lesson_id UUID NULL`
  - `last_active_step_key VARCHAR(100) NULL` (Ví dụ: `video_watch:v1`, `theory_read:t1`, `quiz_completed:q1`)
  - `completed_step_keys JSONB NOT NULL DEFAULT '[]'::jsonb` (Mảng lưu các mốc hoàn thành lần đầu)
  - `flagged_need_review BOOLEAN NOT NULL DEFAULT false` (Học sinh đánh dấu "Chưa hiểu")
  - `is_topic_completed BOOLEAN NOT NULL DEFAULT false`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Ràng buộc:** `UNIQUE (student_id, topic_id)`
- **Chỉ mục:** `CREATE INDEX idx_learning_progress_student ON student_learning_progress(student_id);`
- **Quyền:** Học sinh đọc và cập nhật bước học của chính mình; Giáo viên đọc tiến trình của học sinh trong lớp mình quản lý.

---
*(Bản v1.1 này là nguồn chuẩn tham chiếu chính thức cho việc lập trình DDL tại Phase 2.2+).*
