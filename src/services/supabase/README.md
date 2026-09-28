# Kiến trúc Cơ sở Dữ liệu Supabase (PostgreSQL) dự kiến

Thư mục này chuẩn bị sẵn sàng cho việc kết nối Supabase sau khi hoàn thiện giao diện Mock.

---

## 1. Bảng `classes` (Lớp học)
- `id`: `uuid primary key default gen_random_uuid()`
- `name`: `varchar(50) not null` (vd: '7A2', '7A3')
- `grade`: `varchar(20) not null default 'Lớp 7'`
- `school_year`: `varchar(20) not null default '2026-2027'`
- `teacher_id`: `uuid references auth.users(id)`
- `description`: `text`
- `status`: `varchar(20) default 'active' check (status in ('active', 'archived'))`
- `created_at`: `timestamptz default now()`
- `updated_at`: `timestamptz default now()`
- `deleted_at`: `timestamptz`

---

## 2. Bảng `students` (Hồ sơ học sinh)
- `id`: `uuid primary key default gen_random_uuid()`
- `auth_user_id`: `uuid references auth.users(id)`
- `name`: `varchar(100) not null`
- `username`: `varchar(50) unique not null`
- `class_id`: `uuid not null references classes(id)`
- `student_code`: `varchar(50)`
- `dob`: `date`
- `status`: `varchar(20) default 'active' check (status in ('active', 'locked'))`
- `has_logged_in`: `boolean default false`
- `last_active_at`: `timestamptz`
- `avatar_seed`: `varchar(50)`
- `created_at`: `timestamptz default now()`
- `updated_at`: `timestamptz default now()`
- `deleted_at`: `timestamptz`

---

## 3. Bảng `student_states` (Tiến độ học tập & XP)
- `student_id`: `uuid primary key references students(id) on delete cascade`
- `xp_today`: `int default 0`
- `xp_week`: `int default 0`
- `total_xp`: `int default 0`
- `active_seconds_today`: `int default 0`
- `active_seconds_continuous`: `int default 0`
- `last_attendance_date`: `date`
- `attendance_days_this_week`: `int default 0`
- `attendance_history`: `jsonb default '[]'::jsonb`
- `consecutive_weeks`: `int default 0`
- `completed_steps`: `jsonb default '[]'::jsonb`
- `question_results`: `jsonb default '[]'::jsonb`
- `flagged_topic_ids`: `jsonb default '[]'::jsonb`
- `unlocked_badge_ids`: `jsonb default '[]'::jsonb`
- `xp_logs`: `jsonb default '[]'::jsonb`
- `preferences`: `jsonb default '{"sound": true, "animations": true, "fontSize": "normal"}'::jsonb`
- `current_progress`: `jsonb`
- `updated_at`: `timestamptz default now()`

---

## 4. Bảng `topics`, `video_lessons`, `theory_lessons` (Nội dung học)
- `id`: `varchar(100) primary key`
- `class_ids`: `text[] default array['all']`
- `status`: `varchar(20) default 'published' check (status in ('draft', 'published', 'archived'))`
- `version`: `int default 1`
- `payload`: `jsonb not null`
- `created_at`: `timestamptz default now()`
- `updated_at`: `timestamptz default now()`
- `deleted_at`: `timestamptz`

---

## 5. Bảng `quizzes` & `questions` (Đề luyện tập & Ngân hàng câu hỏi)
- `id`: `varchar(100) primary key`
- `topic_id`: `varchar(100) references topics(id)`
- `class_ids`: `text[] default array['all']`
- `kind`: `varchar(30)`
- `level`: `varchar(30)`
- `payload`: `jsonb not null`
- `status`: `varchar(20) default 'published'`
- `version`: `int default 1`
- `created_at`: `timestamptz default now()`
- `updated_at`: `timestamptz default now()`
- `deleted_at`: `timestamptz`

---

## 6. Bảng `essay_submissions` (Bài làm văn tự luận)
- `id`: `uuid primary key default gen_random_uuid()`
- `question_id`: `varchar(100) not null`
- `student_id`: `uuid not null references students(id)`
- `class_id`: `uuid references classes(id)`
- `content`: `text not null`
- `word_count`: `int not null`
- `status`: `varchar(30) default 'PENDING_TEACHER' check (status in ('PENDING_TEACHER', 'GRADED'))`
- `teacher_feedback`: `text`
- `rubric_scores`: `jsonb`
- `total_score`: `numeric(4, 2)`
- `final_ratio`: `numeric(4, 2)`
- `graded_by`: `uuid references auth.users(id)`
- `submitted_at`: `timestamptz default now()`
- `graded_at`: `timestamptz`

---

## 7. Bảng `reward_requests` (Yêu cầu nhận quà)
- `id`: `uuid primary key default gen_random_uuid()`
- `student_id`: `uuid not null references students(id)`
- `reward_id`: `varchar(100) not null`
- `status`: `varchar(30) default 'PENDING_APPROVAL'`
- `reject_reason`: `text`
- `requested_at`: `timestamptz default now()`
- `approved_at`: `timestamptz`
- `given_at`: `timestamptz`
- `opened_at`: `timestamptz`

---

## 8. Bảng `audit_logs` (Nhật ký kiểm toán hoạt động)
- `id`: `uuid primary key default gen_random_uuid()`
- `actor_id`: `varchar(100) not null`
- `actor_name`: `varchar(100) not null`
- `actor_role`: `varchar(20) not null`
- `action`: `varchar(100) not null` (CREATE_STUDENT, RESET_PASSWORD, LOCK_ACCOUNT, ...)
- `target_type`: `varchar(50) not null`
- `target_id`: `varchar(100) not null`
- `target_name`: `varchar(200) not null`
- `details`: `jsonb`
- `created_at`: `timestamptz default now()`

---

## Chính sách bảo mật hàng (Row-Level Security - RLS)
- Học sinh chỉ có quyền đọc nội dung đã `published` thuộc lớp của mình.
- Học sinh chỉ đọc/ghi `student_states` và `reward_requests` của chính mình.
- Giáo viên có quyền đọc và quản lý toàn bộ học sinh, bài nộp, nhật ký trong các lớp do mình phụ trách.
