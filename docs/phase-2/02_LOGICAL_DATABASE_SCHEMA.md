# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 02: THIẾT KẾ SCHEMA CƠ SỞ DỮ LIỆU LOGIC (LOGICAL DATABASE SCHEMA)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | v1.0 (Logical Schema Specification) |
| **Trạng thái** | **PROPOSED TECHNICAL SCHEMA – PENDING PO REVIEW** |
| **Tác giả** | Senior Database Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md` |
| **Quy tắc bảo vệ dữ liệu** | **KHÔNG DÙNG CASCADE TRÊN DỮ LIỆU LỊCH SỬ HỌC TẬP** |

---

## 1. NGUYÊN TẮC THIẾT KẾ ĐỊNH DANH & MIGRATION MAPPING

### 1.1. Chuẩn hóa Khóa chính (Primary Key Standard)
1. Toàn bộ các bảng sử dụng kiểu dữ liệu `UUID` làm Khóa chính (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`).
2. Sử dụng UUIDv4 bảo đảm tính phân tán, ngẫu nhiên và không làm lộ số lượng bản ghi hoặc tuần tự giao dịch ra ngoài trình duyệt.

### 1.2. Ánh xạ Mã định danh Cũ (Legacy/Mock ID Mapping)
Ứng dụng hiện tại có các mã nghiệp vụ tự nhiên trong `mockData.ts` (ví dụ: học sinh `hs001`, giáo viên `gv001`, chủ đề `topic_tho_bon_nam`, câu hỏi `q_tn01`). Để đảm bảo quá trình chuyển đổi và viết seed script an toàn:
- Mọi bảng tương ứng đều có cột mã tự nhiên `code VARCHAR(50) UNIQUE` hoặc `legacy_id VARCHAR(50) UNIQUE`.
- Mã này có chỉ mục `UNIQUE INDEX`, dùng để truy vết trong quá trình đối soát giữa hệ thống cũ và mới, đồng thời cho phép import dữ liệu mẫu mà không làm thay đổi các ID nghiệp vụ đã quen thuộc với người dùng.

### 1.3. Chính sách Xóa và Toàn vẹn Dữ liệu (Delete Policy)
- **Tuyệt đối cấm `ON DELETE CASCADE`** đối với mọi mối quan hệ liên quan đến:
  - `students → quiz_attempts`
  - `quiz_attempts → attempt_answers`
  - `students → xp_ledger`
  - `students → attendance_records`
  - `students → essay_submissions`
  - `quiz_versions → quiz_attempts`
  - `question_versions → attempt_answers`
  - `teachers → audit_logs`
- Sử dụng **`ON DELETE RESTRICT`** để ngăn chặn việc xóa vật lý các bản ghi danh tính gốc khi đã có lịch sử sư phạm gắn liền.
- Áp dụng cơ chế **Soft Delete** (`deleted_at TIMESTAMPTZ`) và **Account Suspension** (`account_status = 'suspended' | 'archived'`).

---

## 2. DANH MỤC CÁC BẢNG THEO MIỀN DỮ LIỆU (SCHEMA INVENTORY)

Hệ thống gồm tổng cộng **32 bảng dữ liệu logic** được phân bổ trong 7 miền nghiệp vụ:

| Domain | Mã bảng | Tên bảng logic | Mức độ ưu tiên | Vai trò chính |
| :--- | :--- | :--- | :--- | :--- |
| **A. Identity & Classroom** | `TBL_A01` | `user_profiles` | Core MVP | Hồ sơ thông tin chung người dùng |
| | `TBL_A02` | `user_roles` | Core MVP | Bảng phân quyền vai trò (Role-Based Access) |
| | `TBL_A03` | `teacher_profiles` | Core MVP | Thông tin chuyên môn giáo viên |
| | `TBL_A04` | `student_profiles` | Core MVP | Thông tin học sinh, điểm kinh nghiệm, chuỗi học |
| | `TBL_A05` | `classes` | Core MVP | Danh sách lớp học (Khối 7) |
| | `TBL_A06` | `class_memberships` | Core MVP | Thành viên lớp học (Gắn học sinh vào lớp) |
| **B. Learning Content** | `TBL_B01` | `topics` | Core MVP | Chủ đề bài học khối 7 |
| | `TBL_B02` | `video_lessons` | Core MVP | Bài học Video và cấu hình xác minh xem |
| | `TBL_B03` | `video_focus_points` | Supporting | Điểm dừng tương tác/chú thích trên dòng thời gian video |
| | `TBL_B04` | `theory_lessons` | Core MVP | Bài học lý thuyết |
| | `TBL_B05` | `theory_blocks` | Supporting | Các khối nội dung của bài lý thuyết |
| **C. Question Bank & Versioning** | `TBL_C01` | `questions` | Core MVP | Danh tính logic câu hỏi |
| | `TBL_C02` | `question_versions` | Core MVP | Nội dung câu hỏi bất biến theo phiên bản |
| | `TBL_C03` | `secure_answer_keys` | Core MVP | Bảng bảo mật đáp án đúng và thang chấm (Tách rời RLS) |
| | `TBL_C04` | `quizzes` | Core MVP | Danh tính logic bài kiểm tra / bộ câu hỏi |
| | `TBL_C05` | `quiz_versions` | Core MVP | Phiên bản đề kiểm tra bất biến |
| | `TBL_C06` | `quiz_version_questions` | Core MVP | Bảng ánh xạ câu hỏi vào phiên bản đề |
| | `TBL_C07` | `quiz_assignments` | Core MVP | Giao bài tập cho lớp hoặc học sinh cụ thể |
| **D. Attempt & Grading** | `TBL_D01` | `quiz_attempts` | Core MVP | Lượt làm bài kiểm tra của học sinh |
| | `TBL_D02` | `attempt_answers` | Core MVP | Chi tiết câu trả lời từng câu trong lượt làm |
| | `TBL_D03` | `essay_submissions` | Core MVP | Bài làm tự luận của học sinh |
| | `TBL_D04` | `essay_ai_evaluations` | Core MVP | Đánh giá gợi ý của AI (Bảo mật tách rời RLS) |
| | `TBL_D05` | `essay_teacher_reviews` | Core MVP | Điểm và nhận xét chính thức từ giáo viên |
| **E. Learning Progress** | `TBL_E01` | `video_watch_progress` | Core MVP | Tiến trình và khoảng thời gian xem video thực tế |
| | `TBL_E02` | `attendance_records` | Core MVP | Nhật ký điểm danh chủ động (+2 XP) |
| | `TBL_E03` | `xp_ledger` | Core MVP | Sổ cái biến động XP toàn diện |
| | `TBL_E04` | `mastery_evidence` | Core MVP | Bằng chứng năng lực chi tiết cho từng kỹ năng |
| | `TBL_E05` | `student_mastery_snapshots` | Supporting | Ảnh chụp trạng thái Mastery phục vụ hiển thị nhanh |
| **F. Rewards & Gamification** | `TBL_F01` | `reward_catalog` | Core MVP | Danh mục quà tặng công khai |
| | `TBL_F02` | `reward_secrets` | Core MVP | Nội dung bí mật của quà tặng (Bảo mật tách rời RLS) |
| | `TBL_F03` | `reward_claims` | Core MVP | Lịch sử đổi quà của học sinh |
| **G. Administration & Audit** | `TBL_G01` | `system_settings` | Supporting | Cấu hình tham số hệ thống toàn cục |
| | `TBL_G02` | `audit_logs` | Supporting | Nhật ký kiểm toán hành vi của giáo viên |

---

## 3. CHI TIẾT ĐẶC TẢ TỪNG BẢNG (DETAILED TABLE SPECIFICATIONS)

---

### DOMAIN A: IDENTITY & CLASSROOM

#### `TBL_A01: user_profiles`
- **Mục đích nghiệp vụ:** Lưu trữ thông tin hồ sơ cơ bản của người dùng, liên kết 1-1 với tài khoản xác thực `auth.users`.
- **Domain:** Identity & Classroom | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID` (Khớp trực tiếp với `auth.users.id`).
- **Các trường dữ liệu:**
  - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT`
  - `username VARCHAR(50) NOT NULL UNIQUE` (Mã đăng nhập của học sinh hoặc email của giáo viên)
  - `full_name VARCHAR(100) NOT NULL` (Họ và tên hiển thị)
  - `avatar_url TEXT NULL` (Đường dẫn ảnh đại diện)
  - `account_status VARCHAR(20) NOT NULL DEFAULT 'active'` (CHECK: `active`, `suspended`, `archived`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `deleted_at TIMESTAMPTZ NULL`
- **Chỉ mục:** `CREATE INDEX idx_user_profiles_username ON user_profiles(username);`
- **Quyền truy cập:** User tự đọc hồ sơ của mình; Giáo viên đọc được danh sách học sinh thuộc lớp phụ trách.
- **Retention & Delete Policy:** `ON DELETE RESTRICT`. Không xóa vật lý tài khoản đã có dữ liệu học tập; chỉ cập nhật `account_status = 'archived'`.
- **Liên quan:** BR-06.

#### `TBL_A02: user_roles`
- **Mục đích nghiệp vụ:** Phân quyền vai trò hệ thống độc lập với `auth.users.raw_user_meta_data`, ngăn chặn triệt để hành vi leo thang đặc quyền (Role Spoofing).
- **Domain:** Identity & Classroom | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT`
  - `role VARCHAR(20) NOT NULL` (CHECK: `teacher`, `student`, `admin`)
  - `granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `granted_by UUID NULL REFERENCES user_profiles(id)`
- **Ràng buộc:** `UNIQUE (user_id, role)`
- **Chỉ mục:** `CREATE INDEX idx_user_roles_lookup ON user_roles(user_id, role);`
- **Quyền:** Chỉ `admin` hoặc `service_role` được ghi. Client chỉ đọc vai trò của chính mình.
- **Liên quan:** BR-01, BR-06.

#### `TBL_A03: teacher_profiles`
- **Mục đích nghiệp vụ:** Thông tin mở rộng dành riêng cho giáo viên (trường học, tổ chuyên môn).
- **Domain:** Identity & Classroom | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE RESTRICT`
- **Các trường dữ liệu:**
  - `teacher_code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `gv001` ánh xạ mock data)
  - `subject VARCHAR(50) NOT NULL DEFAULT 'Ngữ văn'`
  - `school_name VARCHAR(150) NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01.

#### `TBL_A04: student_profiles`
- **Mục đích nghiệp vụ:** Thông tin hồ sơ học sinh, tổng XP tích lũy, cấp độ Cây Trưởng Thành và chuỗi học tập (Streak).
- **Domain:** Identity & Classroom | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE RESTRICT`
- **Các trường dữ liệu:**
  - `student_code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `hs001` ánh xạ mock data)
  - `total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0)`
  - `tree_level VARCHAR(30) NOT NULL DEFAULT 'Hạt mầm'`
  - `tree_stage INTEGER NOT NULL DEFAULT 1 CHECK (tree_stage BETWEEN 1 AND 5)`
  - `streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0)`
  - `last_active_date DATE NULL` (Ngày hoạt động gần nhất theo múi giờ `Asia/Ho_Chi_Minh`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_student_profiles_code ON student_profiles(student_code);`
- **Quyền:** Học sinh chỉ đọc; chỉ có Database Triggers / RPC được cập nhật `total_xp` thông qua giao dịch từ `xp_ledger`.
- **Liên quan:** BR-02, BR-03.

#### `TBL_A05: classes`
- **Mục đích nghiệp vụ:** Danh sách lớp học do giáo viên quản lý.
- **Domain:** Identity & Classroom | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `class_7a2` ánh xạ mock)
  - `name VARCHAR(100) NOT NULL` (Ví dụ: 'Lớp 7A2')
  - `grade INTEGER NOT NULL DEFAULT 7 CHECK (grade = 7)` (MVP tập trung khối 7)
  - `academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026'`
  - `teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `deleted_at TIMESTAMPTZ NULL`
- **Chỉ mục:** `CREATE INDEX idx_classes_teacher ON classes(teacher_id);`
- **Liên quan:** BR-01, BR-07.

#### `TBL_A06: class_memberships`
- **Mục đích nghiệp vụ:** Ánh xạ học sinh trực thuộc lớp học nào.
- **Domain:** Identity & Classroom | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT`
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `status VARCHAR(20) NOT NULL DEFAULT 'enrolled'` (CHECK: `enrolled`, `transferred`, `left`)
- **Ràng buộc:** `UNIQUE (class_id, student_id)`
- **Chỉ mục:** `CREATE INDEX idx_class_memberships_student ON class_memberships(student_id);`
- **Liên quan:** BR-07.

---

### DOMAIN B: LEARNING CONTENT

#### `TBL_B01: topics`
- **Mục đích nghiệp vụ:** Danh mục chủ đề học tập chung cho khối 7 (ví dụ: Thơ bốn chữ - năm chữ, Nghị luận xã hội...).
- **Domain:** Learning Content | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `topic_tho_bon_nam`)
  - `title VARCHAR(200) NOT NULL`
  - `description TEXT NULL`
  - `order_index INTEGER NOT NULL DEFAULT 0`
  - `status VARCHAR(20) NOT NULL DEFAULT 'published'` (CHECK: `draft`, `published`, `archived`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01, BR-07, BR-09.

#### `TBL_B02: video_lessons`
- **Mục đích nghiệp vụ:** Bài giảng video trong một chủ đề, cấu hình thời lượng và quy tắc xác minh hoàn thành.
- **Domain:** Learning Content | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `video_tho_bon_chu_01`)
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `title VARCHAR(200) NOT NULL`
  - `description TEXT NULL`
  - `provider VARCHAR(30) NOT NULL DEFAULT 'youtube'` (CHECK: `youtube`, `supabase_storage`, `external_cdn`)
  - `provider_asset_id TEXT NOT NULL` (Video ID hoặc Storage Object Path)
  - `duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0)`
  - `min_watch_ratio NUMERIC(3,2) NOT NULL DEFAULT 0.80 CHECK (min_watch_ratio BETWEEN 0.10 AND 1.00)`
  - `status VARCHAR(20) NOT NULL DEFAULT 'published'` (CHECK: `draft`, `published`, `archived`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_video_lessons_topic ON video_lessons(topic_id);`
- **Liên quan:** BR-01, BR-11.

#### `TBL_B03: video_focus_points`
- **Mục đích nghiệp vụ:** Các mốc chú giải hoặc điểm dừng tương tác trên dòng thời gian video.
- **Domain:** Learning Content | **Phân loại:** Supporting.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `video_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE`
  - `timestamp_seconds INTEGER NOT NULL CHECK (timestamp_seconds >= 0)`
  - `title VARCHAR(150) NOT NULL`
  - `content TEXT NOT NULL`
  - `order_index INTEGER NOT NULL DEFAULT 0`
- **Chỉ mục:** `CREATE INDEX idx_focus_points_video ON video_focus_points(video_id, timestamp_seconds);`
- **Liên quan:** BR-01.

#### `TBL_B04: theory_lessons`
- **Mục đích nghiệp vụ:** Bài đọc lý thuyết theo chủ đề.
- **Domain:** Learning Content | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE`
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `title VARCHAR(200) NOT NULL`
  - `reading_time_minutes INTEGER NOT NULL DEFAULT 5 CHECK (reading_time_minutes > 0)`
  - `status VARCHAR(20) NOT NULL DEFAULT 'published'` (CHECK: `draft`, `published`, `archived`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01, BR-07, BR-09.

#### `TBL_B05: theory_blocks`
- **Mục đích nghiệp vụ:** Các khối kiến thức có cấu trúc bên trong bài lý thuyết (ví dụ: khái niệm, ví dụ minh họa, ghi chú).
- **Domain:** Learning Content | **Phân loại:** Supporting.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `theory_lesson_id UUID NOT NULL REFERENCES theory_lessons(id) ON DELETE CASCADE`
  - `block_type VARCHAR(30) NOT NULL` (CHECK: `concept`, `example`, `quote`, `rule`, `callout`)
  - `title VARCHAR(150) NULL`
  - `content TEXT NOT NULL`
  - `order_index INTEGER NOT NULL DEFAULT 0`
- **Chỉ mục:** `CREATE INDEX idx_theory_blocks_lesson ON theory_blocks(theory_lesson_id, order_index);`
- **Liên quan:** BR-01.

---

### DOMAIN C: QUESTION BANK & IMMUTABLE VERSIONING

#### `TBL_C01: questions`
- **Mục đích nghiệp vụ:** Định danh logic dài hạn của câu hỏi trong ngân hàng học liệu.
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `q_tn01` ánh xạ mock)
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `created_by UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01, BR-05.

#### `TBL_C02: question_versions`
- **Mục đích nghiệp vụ:** Nội dung câu hỏi bất biến theo phiên bản (Payload công khai học sinh được xem).
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT`
  - `version_number INTEGER NOT NULL CHECK (version_number >= 1)`
  - `question_type VARCHAR(30) NOT NULL` (CHECK: `multiple_choice`, `reorder`, `fill_in_blank`, `essay`)
  - `prompt TEXT NOT NULL`
  - `public_payload JSONB NOT NULL` (Chứa danh sách options trắc nghiệm, các token reorder xáo trộn, placeholder điền khuyết; **tuyệt đối không chứa đáp án đúng**)
  - `max_score NUMERIC(5,2) NOT NULL DEFAULT 1.0 CHECK (max_score > 0)`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Ràng buộc:** `UNIQUE (question_id, version_number)`
- **Chỉ mục:** `CREATE INDEX idx_question_versions_lookup ON question_versions(question_id, version_number);`
- **Liên quan:** BR-04, BR-05.

#### `TBL_C03: secure_answer_keys`
- **Mục đích nghiệp vụ:** Lưu trữ đáp án đúng, giải thích sư phạm và thang điểm chi tiết. Bảng này được cô lập quyền và **tách rời hoàn toàn khỏi `question_versions`**.
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `question_version_id UUID PRIMARY KEY REFERENCES question_versions(id) ON DELETE RESTRICT`
- **Các trường dữ liệu:**
  - `correct_answer_payload JSONB NOT NULL` (Chỉ số đáp án đúng `correct_index`, thứ tự sắp xếp chuẩn `correct_order`, hoặc đáp án điền chuẩn `correct_words`)
  - `explanation TEXT NULL` (Lời giải thích sư phạm)
  - `rubric_payload JSONB NULL` (Thang tiêu chí chấm câu tự luận)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Bảo mật:** Không cấp quyền `SELECT` cho role `student`. Chỉ có hàm RPC chấm điểm hoặc role `teacher` mới được đọc.
- **Liên quan:** BR-03, BR-05.

#### `TBL_C04: quizzes`
- **Mục đích nghiệp vụ:** Định danh logic dài hạn của một bài tập hoặc bài kiểm tra.
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `quiz_tho_bon_chu`)
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `created_by UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT`
  - `quiz_type VARCHAR(30) NOT NULL DEFAULT 'practice'` (CHECK: `practice`, `formal_exam`)
  - `status VARCHAR(20) NOT NULL DEFAULT 'draft'` (CHECK: `draft`, `published`, `archived`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01, BR-05, BR-08, BR-09.

#### `TBL_C05: quiz_versions`
- **Mục đích nghiệp vụ:** Phiên bản đề kiểm tra bất biến đã được xuất bản (Published Snapshot).
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE RESTRICT`
  - `version_number INTEGER NOT NULL CHECK (version_number >= 1)`
  - `title VARCHAR(200) NOT NULL`
  - `description TEXT NULL`
  - `time_limit_minutes INTEGER NULL CHECK (time_limit_minutes > 0)` (NULL nếu là luyện tập tự do)
  - `passing_score_ratio NUMERIC(3,2) NOT NULL DEFAULT 0.60 CHECK (passing_score_ratio BETWEEN 0.10 AND 1.00)`
  - `published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `published_by UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT`
- **Ràng buộc:** `UNIQUE (quiz_id, version_number)`
- **Chỉ mục:** `CREATE INDEX idx_quiz_versions_lookup ON quiz_versions(quiz_id, version_number);`
- **Liên quan:** BR-04, BR-05, BR-08, BR-10.

#### `TBL_C06: quiz_version_questions`
- **Mục đích nghiệp vụ:** Ánh xạ danh sách các phiên bản câu hỏi cố định thuộc về một phiên bản đề thi cụ thể.
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `quiz_version_id UUID NOT NULL REFERENCES quiz_versions(id) ON DELETE RESTRICT`
  - `question_version_id UUID NOT NULL REFERENCES question_versions(id) ON DELETE RESTRICT`
  - `order_index INTEGER NOT NULL DEFAULT 0`
- **Ràng buộc:** `UNIQUE (quiz_version_id, question_version_id)`
- **Chỉ mục:** `CREATE INDEX idx_qvq_quiz_version ON quiz_version_questions(quiz_version_id, order_index);`
- **Liên quan:** BR-04, BR-05.

#### `TBL_C07: quiz_assignments`
- **Mục đích nghiệp vụ:** Quản lý việc giao bài tập/bài kiểm tra cho một lớp học hoặc một học sinh cụ thể với phiên bản đề được ghim cố định.
- **Domain:** Question Bank | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE RESTRICT`
  - `pinned_quiz_version_id UUID NOT NULL REFERENCES quiz_versions(id) ON DELETE RESTRICT`
  - `class_id UUID NULL REFERENCES classes(id) ON DELETE RESTRICT`
  - `student_id UUID NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `assigned_by UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT`
  - `start_time TIMESTAMPTZ NOT NULL`
  - `deadline TIMESTAMPTZ NOT NULL`
  - `max_attempts INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts >= 1)`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Ràng buộc:** `CHECK (class_id IS NOT NULL OR student_id IS NOT NULL)`
- **Chỉ mục:** `CREATE INDEX idx_assignments_class ON quiz_assignments(class_id);`
- **Liên quan:** BR-07, BR-08.

---

### DOMAIN D: ATTEMPT & GRADING

#### `TBL_D01: quiz_attempts`
- **Mục đích nghiệp vụ:** Lưu vết từng lượt làm bài của học sinh, liên kết chính xác với phiên bản đề bất biến.
- **Domain:** Attempt & Grading | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `assignment_id UUID NULL REFERENCES quiz_assignments(id) ON DELETE RESTRICT`
  - `quiz_version_id UUID NOT NULL REFERENCES quiz_versions(id) ON DELETE RESTRICT`
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number >= 1)`
  - `status VARCHAR(20) NOT NULL DEFAULT 'in_progress'` (CHECK: `in_progress`, `submitted`, `abandoned`)
  - `started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `submitted_at TIMESTAMPTZ NULL`
  - `total_score NUMERIC(5,2) NULL CHECK (total_score >= 0)`
  - `max_possible_score NUMERIC(5,2) NULL CHECK (max_possible_score > 0)`
  - `score_ratio NUMERIC(4,3) NULL CHECK (score_ratio BETWEEN 0 AND 1.0)`
  - `earned_xp INTEGER NOT NULL DEFAULT 0 CHECK (earned_xp >= 0)`
  - `client_metadata JSONB NULL` (User-agent, IP hash phục vụ chống gian lận)
- **Ràng buộc:** `ON DELETE RESTRICT` cho toàn bộ FK.
- **Chỉ mục:** `CREATE INDEX idx_attempts_student_quiz ON quiz_attempts(student_id, quiz_version_id);`
- **Liên quan:** BR-03, BR-04, BR-08, BR-10.

#### `TBL_D02: attempt_answers`
- **Mục đích nghiệp vụ:** Lưu vết chi tiết từng câu trả lời của học sinh cho từng câu hỏi trong lượt làm bài.
- **Domain:** Attempt & Grading | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE RESTRICT`
  - `question_version_id UUID NOT NULL REFERENCES question_versions(id) ON DELETE RESTRICT`
  - `student_answer_payload JSONB NOT NULL` (Lựa chọn index của học sinh, chuỗi sắp xếp, hoặc văn bản điền)
  - `is_correct BOOLEAN NULL` (NULL đối với câu tự luận trước khi chấm)
  - `awarded_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (awarded_score >= 0)`
  - `answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Ràng buộc:** `UNIQUE (attempt_id, question_version_id)`
- **Chỉ mục:** `CREATE INDEX idx_attempt_answers_attempt ON attempt_answers(attempt_id);`
- **Liên quan:** BR-04.

#### `TBL_D03: essay_submissions`
- **Mục đích nghiệp vụ:** Lưu trữ bài viết tự luận của học sinh (liên kết với câu hỏi tự luận trong lượt làm bài).
- **Domain:** Attempt & Grading | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE RESTRICT`
  - `attempt_answer_id UUID NOT NULL REFERENCES attempt_answers(id) ON DELETE RESTRICT`
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `essay_text TEXT NOT NULL`
  - `word_count INTEGER NOT NULL CHECK (word_count >= 0)`
  - `status VARCHAR(20) NOT NULL DEFAULT 'submitted'` (CHECK: `submitted`, `ai_evaluated`, `teacher_graded`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_essay_submissions_status ON essay_submissions(status);`
- **Liên quan:** BR-03, BR-04.

#### `TBL_D04: essay_ai_evaluations`
- **Mục đích nghiệp vụ:** Lưu kết quả gợi ý chấm điểm từ Gemini AI. **Học sinh tuyệt đối không được đọc bảng này.**
- **Domain:** Attempt & Grading | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `submission_id UUID NOT NULL REFERENCES essay_submissions(id) ON DELETE RESTRICT`
  - `suggested_score NUMERIC(4,2) NOT NULL CHECK (suggested_score BETWEEN 0 AND 10)`
  - `feedback_structure TEXT NULL`
  - `feedback_vocabulary TEXT NULL`
  - `feedback_content TEXT NULL`
  - `evaluation_model VARCHAR(50) NOT NULL DEFAULT 'gemini-1.5-flash'`
  - `evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Bảo mật:** Không có RLS policy cho role `student`. Chỉ `service_role` (Edge Function) ghi và role `teacher` đọc.
- **Liên quan:** BR-03.

#### `TBL_D05: essay_teacher_reviews`
- **Mục đích nghiệp vụ:** Lưu trữ kết quả chấm điểm chính thức và nhận xét của giáo viên (hỗ trợ lịch sử chấm lại).
- **Domain:** Attempt & Grading | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `submission_id UUID NOT NULL REFERENCES essay_submissions(id) ON DELETE RESTRICT`
  - `teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT`
  - `final_score NUMERIC(4,2) NOT NULL CHECK (final_score BETWEEN 0 AND 10)`
  - `teacher_feedback TEXT NOT NULL`
  - `review_round INTEGER NOT NULL DEFAULT 1 CHECK (review_round >= 1)`
  - `is_final_round BOOLEAN NOT NULL DEFAULT true`
  - `reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_teacher_reviews_submission ON essay_teacher_reviews(submission_id);`
- **Liên quan:** BR-03.

---

### DOMAIN E: LEARNING PROGRESS

#### `TBL_E01: video_watch_progress`
- **Mục đích nghiệp vụ:** Lưu trữ tiến trình xem video thực tế, các khoảng thời gian xem duy nhất (`watched_intervals`) nhằm chống timer ảo.
- **Domain:** Learning Progress | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `video_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE RESTRICT`
  - `watched_intervals JSONB NOT NULL DEFAULT '[]'` (Mảng các khoảng thời gian `[[start, end], ...]`)
  - `accumulated_seconds INTEGER NOT NULL DEFAULT 0 CHECK (accumulated_seconds >= 0)`
  - `is_completed BOOLEAN NOT NULL DEFAULT false`
  - `completed_at TIMESTAMPTZ NULL`
  - `last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Ràng buộc:** `UNIQUE (student_id, video_id)`
- **Chỉ mục:** `CREATE INDEX idx_video_watch_student ON video_watch_progress(student_id);`
- **Liên quan:** BR-11.

#### `TBL_E02: attendance_records`
- **Mục đích nghiệp vụ:** Nhật ký điểm danh chủ động của học sinh, ngăn chặn điểm danh nhiều lần trong một ngày.
- **Domain:** Learning Progress | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `attendance_date DATE NOT NULL` (Ngày học tập theo múi giờ `Asia/Ho_Chi_Minh`)
  - `claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `awarded_xp INTEGER NOT NULL DEFAULT 2 CHECK (awarded_xp >= 0)`
- **Ràng buộc:** `UNIQUE (student_id, attendance_date)`
- **Chỉ mục:** `CREATE INDEX idx_attendance_lookup ON attendance_records(student_id, attendance_date);`
- **Liên quan:** BR-02.

#### `TBL_E03: xp_ledger`
- **Mục đích nghiệp vụ:** Sổ cái ghi nhận mọi biến động điểm kinh nghiệm XP, đảm bảo tính bất biến và truy vết minh bạch.
- **Domain:** Learning Progress | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `action_type VARCHAR(50) NOT NULL` (CHECK: `daily_attendance`, `quiz_practice`, `quiz_formal`, `reward_claim_deduct`)
  - `raw_xp INTEGER NOT NULL` (XP định mức hành động)
  - `actual_xp INTEGER NOT NULL` (XP thực tế ghi nhận sau khi áp trần ngày)
  - `idempotency_key VARCHAR(100) NOT NULL UNIQUE` (Khóa chống cộng trùng lặp)
  - `reference_id UUID NULL` (Liên kết tới `attendance_records.id`, `quiz_attempts.id` hoặc `reward_claims.id`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_xp_ledger_student ON xp_ledger(student_id, created_at);`
- **Liên quan:** BR-02, BR-03.

#### `TBL_E04: mastery_evidence`
- **Mục đích nghiệp vụ:** Bằng chứng năng lực chi tiết cho từng kỹ năng/thước đo năng lực theo từng chủ đề.
- **Domain:** Learning Progress | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `skill_category VARCHAR(50) NOT NULL` (CHECK: `recalling`, `understanding`, `analyzing`, `writing`)
  - `evidence_source VARCHAR(30) NOT NULL` (CHECK: `quiz_attempt`, `teacher_essay_review`)
  - `source_id UUID NOT NULL` (Liên kết tới `attempt_answers.id` hoặc `essay_teacher_reviews.id`)
  - `score_ratio NUMERIC(4,3) NOT NULL CHECK (score_ratio BETWEEN 0 AND 1.0)`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_mastery_evidence_student ON mastery_evidence(student_id, topic_id, skill_category);`
- **Liên quan:** BR-03.

#### `TBL_E05: student_mastery_snapshots`
- **Mục đích nghiệp vụ:** Lưu trữ điểm Mastery tổng hợp hiện tại của học sinh theo từng chủ đề để UI hiển thị nhanh mà không cần tính toán nặng.
- **Domain:** Learning Progress | **Phân loại:** Supporting.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `mastery_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (mastery_percentage BETWEEN 0 AND 100)`
  - `mastery_level VARCHAR(30) NOT NULL DEFAULT 'Khoa Bảng'` (CHECK: `Tú Kép`, `Cử Nhân`, `Tiến Sĩ`, `Trạng Nguyên`, `Khoa Bảng`)
  - `last_recalculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Ràng buộc:** `UNIQUE (student_id, topic_id)`
- **Liên quan:** BR-03.

---

### DOMAIN F: REWARDS & GAMIFICATION

#### `TBL_F01: reward_catalog`
- **Mục đích nghiệp vụ:** Danh mục các món quà/phần thưởng công khai trong cửa hàng.
- **Domain:** Rewards | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `code VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `badge_kien_thuc`, `secret_box_01`)
  - `title VARCHAR(150) NOT NULL`
  - `description TEXT NOT NULL`
  - `icon_name VARCHAR(50) NOT NULL`
  - `cost_xp INTEGER NOT NULL CHECK (cost_xp >= 0)`
  - `reward_type VARCHAR(30) NOT NULL` (CHECK: `badge`, `title`, `secret_gift`)
  - `is_secret BOOLEAN NOT NULL DEFAULT false`
  - `stock_quantity INTEGER NULL` (NULL nếu là quà vô hạn số lượng)
  - `is_active BOOLEAN NOT NULL DEFAULT true`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01.

#### `TBL_F02: reward_secrets`
- **Mục đích nghiệp vụ:** Tách rời thông tin nhạy cảm của món quà bí mật. **Bảo mật tuyệt đối, không có RLS Policy SELECT cho role student.**
- **Domain:** Rewards | **Phân loại:** Core MVP.
- **Khóa chính:** `reward_id UUID PRIMARY KEY REFERENCES reward_catalog(id) ON DELETE RESTRICT`
- **Các trường dữ liệu:**
  - `secret_real_name VARCHAR(150) NOT NULL` (Tên thật của món quà bí mật)
  - `secret_payload TEXT NOT NULL` (Mã kích hoạt, lời chúc đặc biệt hoặc hướng dẫn nhận quà thật)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Quyền:** Chỉ có hàm RPC đổi quà hợp lệ mới giải mã và trả thông tin này về cho học sinh sau khi đã trừ XP thành công.
- **Liên quan:** BR-01.

#### `TBL_F03: reward_claims`
- **Mục đích nghiệp vụ:** Nhật ký đổi quà của học sinh.
- **Domain:** Rewards | **Phân loại:** Core MVP.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `reward_id UUID NOT NULL REFERENCES reward_catalog(id) ON DELETE RESTRICT`
  - `spent_xp INTEGER NOT NULL CHECK (spent_xp >= 0)`
  - `revealed_secret_payload TEXT NULL` (Lưu vết nội dung bí mật đã mở)
  - `claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_reward_claims_student ON reward_claims(student_id);`
- **Liên quan:** BR-01.

---

### DOMAIN G: ADMINISTRATION & AUDIT

#### `TBL_G01: system_settings`
- **Mục đích nghiệp vụ:** Bảng tham số cấu hình hệ thống toàn cục.
- **Domain:** Administration | **Phân loại:** Supporting.
- **Khóa chính:** `key VARCHAR(50) PRIMARY KEY`
- **Các trường dữ liệu:**
  - `value JSONB NOT NULL`
  - `description TEXT NULL`
  - `updated_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Liên quan:** BR-01.

#### `TBL_G02: audit_logs`
- **Mục đích nghiệp vụ:** Nhật ký kiểm toán mọi hành vi quản trị của giáo viên (tạo đề, sửa học liệu, chấm bài, giao bài).
- **Domain:** Administration | **Phân loại:** Supporting.
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường dữ liệu:**
  - `actor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT`
  - `action VARCHAR(50) NOT NULL` (Ví dụ: `publish_quiz_version`, `grade_essay`)
  - `target_entity VARCHAR(50) NOT NULL` (Ví dụ: `quizzes`, `essay_submissions`)
  - `target_id UUID NOT NULL`
  - `payload_diff JSONB NULL`
  - `client_ip VARCHAR(50) NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
- **Chỉ mục:** `CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at);`
- **Liên quan:** BR-01, BR-05.

---
*(Xem tiếp Tài liệu 03 để xem Sơ đồ Quan hệ Thực thể ERD chi tiết bằng Mermaid).*
