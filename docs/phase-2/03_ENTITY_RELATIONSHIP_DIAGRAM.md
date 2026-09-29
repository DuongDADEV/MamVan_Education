# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 03: SƠ ĐỒ QUAN HỆ THỰC THỂ (ENTITY RELATIONSHIP DIAGRAMS - ERD)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | v1.0 (ERD Specification) |
| **Trạng thái** | **PROPOSED TECHNICAL DESIGN – PENDING PO REVIEW** |
| **Tác giả** | Senior Database Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md` |

---

## 1. SƠ ĐỒ LIÊN MIỀN TỔNG THỂ (HIGH-LEVEL DOMAIN RELATIONSHIP)

```mermaid
flowchart TB
    subgraph DomainA ["Domain A: Identity & Classroom"]
        Users["user_profiles / user_roles"]
        Teachers["teacher_profiles"]
        Students["student_profiles"]
        Classes["classes / class_memberships"]
    end

    subgraph DomainB ["Domain B: Learning Content"]
        Topics["topics"]
        Videos["video_lessons"]
        Theories["theory_lessons"]
    end

    subgraph DomainC ["Domain C: Question Bank & Versioning"]
        Quizzes["quizzes / quiz_versions"]
        Questions["questions / question_versions"]
        SecureKeys["secure_answer_keys (Hidden)"]
        Assignments["quiz_assignments"]
    end

    subgraph DomainD ["Domain D: Attempt & Grading"]
        Attempts["quiz_attempts"]
        Answers["attempt_answers"]
        Essays["essay_submissions"]
        AI_Eval["essay_ai_evaluations (Hidden)"]
        Reviews["essay_teacher_reviews"]
    end

    subgraph DomainE ["Domain E: Learning Progress"]
        WatchProg["video_watch_progress"]
        Attendance["attendance_records"]
        XPLedger["xp_ledger"]
        Mastery["mastery_evidence / snapshots"]
    end

    subgraph DomainF ["Domain F: Rewards"]
        Catalog["reward_catalog"]
        Secrets["reward_secrets (Hidden)"]
        Claims["reward_claims"]
    end

    subgraph DomainG ["Domain G: Administration"]
        Audit["audit_logs"]
        Settings["system_settings"]
    end

    Teachers --> Classes
    Teachers --> Topics
    Teachers --> Quizzes
    Teachers --> Reviews
    Students --> Classes
    Students --> Attempts
    Students --> Attendance
    Students --> Claims

    Topics --> Videos
    Topics --> Theories
    Topics --> Questions
    Topics --> Quizzes

    Quizzes --> Assignments
    Assignments --> Attempts
    Quizzes --> Attempts

    Questions --> Answers
    Attempts --> Answers
    Answers --> Essays
    Essays --> AI_Eval
    Essays --> Reviews

    Attempts --> XPLedger
    Attendance --> XPLedger
    Claims --> XPLedger

    Attempts --> Mastery
    Reviews --> Mastery

    Catalog --> Secrets
    Catalog --> Claims
    Students --> Audit
    Teachers --> Audit
```

---

## 2. CHI TIẾT ERD TOÀN DIỆN HỆ THỐNG (DETAILED MERMAID ERD)

```mermaid
erDiagram
    %% DOMAIN A: IDENTITY & CLASSROOM
    user_profiles ||--o| user_roles : "has"
    user_profiles ||--o| teacher_profiles : "is a"
    user_profiles ||--o| student_profiles : "is a"
    teacher_profiles ||--o{ classes : "manages"
    classes ||--o{ class_memberships : "contains"
    student_profiles ||--o{ class_memberships : "enrolled in"

    %% DOMAIN B: LEARNING CONTENT
    topics ||--o{ video_lessons : "contains"
    topics ||--o{ theory_lessons : "contains"
    video_lessons ||--o{ video_focus_points : "has"
    theory_lessons ||--o{ theory_blocks : "has"

    %% DOMAIN C: QUESTION BANK & VERSIONING
    topics ||--o{ questions : "categorizes"
    topics ||--o{ quizzes : "categorizes"
    teacher_profiles ||--o{ questions : "authors"
    teacher_profiles ||--o{ quizzes : "authors"

    questions ||--o{ question_versions : "versions"
    question_versions ||--|| secure_answer_keys : "has secret"

    quizzes ||--o{ quiz_versions : "versions"
    quiz_versions ||--o{ quiz_version_questions : "includes"
    question_versions ||--o{ quiz_version_questions : "mapped to"

    quiz_versions ||--o{ quiz_assignments : "pinned in"
    classes ||--o{ quiz_assignments : "assigned to"
    student_profiles ||--o{ quiz_assignments : "individually assigned"

    %% DOMAIN D: ATTEMPT & GRADING
    student_profiles ||--o{ quiz_attempts : "takes (RESTRICT)"
    quiz_versions ||--o{ quiz_attempts : "attempted against"
    quiz_assignments ||--o{ quiz_attempts : "fulfills"

    quiz_attempts ||--o{ attempt_answers : "records"
    question_versions ||--o{ attempt_answers : "answers question version"

    attempt_answers ||--o| essay_submissions : "contains essay"
    student_profiles ||--o{ essay_submissions : "submits"
    essay_submissions ||--o{ essay_ai_evaluations : "evaluated by AI"
    essay_submissions ||--o{ essay_teacher_reviews : "graded by teacher"
    teacher_profiles ||--o{ essay_teacher_reviews : "reviews"

    %% DOMAIN E: LEARNING PROGRESS
    student_profiles ||--o{ video_watch_progress : "tracks"
    video_lessons ||--o{ video_watch_progress : "watched on"

    student_profiles ||--o{ attendance_records : "claims daily"
    student_profiles ||--o{ xp_ledger : "ledger entries"
    student_profiles ||--o{ mastery_evidence : "evidences"
    topics ||--o{ mastery_evidence : "mastery topic"
    student_profiles ||--o{ student_mastery_snapshots : "snapshots"

    %% DOMAIN F: REWARDS
    reward_catalog ||--|| reward_secrets : "has secret"
    student_profiles ||--o{ reward_claims : "claims"
    reward_catalog ||--o{ reward_claims : "claimed item"

    %% DOMAIN G: ADMINISTRATION & AUDIT
    user_profiles ||--o{ audit_logs : "performed action"

    user_profiles {
        uuid id PK
        varchar username UK
        varchar full_name
        varchar account_status
        timestamptz created_at
    }

    student_profiles {
        uuid id PK,FK
        varchar student_code UK
        int total_xp
        varchar tree_level
        int streak_days
    }

    teacher_profiles {
        uuid id PK,FK
        varchar teacher_code UK
        varchar subject
    }

    classes {
        uuid id PK
        varchar code UK
        varchar name
        int grade
        uuid teacher_id FK
    }

    quizzes {
        uuid id PK
        varchar code UK
        uuid topic_id FK
        varchar quiz_type
        varchar status
    }

    quiz_versions {
        uuid id PK
        uuid quiz_id FK
        int version_number
        varchar title
        int time_limit_minutes
        timestamptz published_at
    }

    questions {
        uuid id PK
        varchar code UK
        uuid topic_id FK
    }

    question_versions {
        uuid id PK
        uuid question_id FK
        int version_number
        varchar question_type
        text prompt
        jsonb public_payload
        numeric max_score
    }

    secure_answer_keys {
        uuid question_version_id PK,FK
        jsonb correct_answer_payload
        text explanation
    }

    quiz_attempts {
        uuid id PK
        uuid quiz_version_id FK
        uuid student_id FK
        int attempt_number
        varchar status
        timestamptz started_at
        timestamptz submitted_at
        numeric total_score
        int earned_xp
    }

    attempt_answers {
        uuid id PK
        uuid attempt_id FK
        uuid question_version_id FK
        jsonb student_answer_payload
        boolean is_correct
        numeric awarded_score
    }

    essay_submissions {
        uuid id PK
        uuid attempt_id FK
        uuid student_id FK
        text essay_text
        varchar status
    }

    essay_ai_evaluations {
        uuid id PK
        uuid submission_id FK
        numeric suggested_score
        text feedback_content
    }

    essay_teacher_reviews {
        uuid id PK
        uuid submission_id FK
        uuid teacher_id FK
        numeric final_score
        text teacher_feedback
    }

    attendance_records {
        uuid id PK
        uuid student_id FK
        date attendance_date
        int awarded_xp
    }

    xp_ledger {
        uuid id PK
        uuid student_id FK
        varchar action_type
        int raw_xp
        int actual_xp
        varchar idempotency_key UK
    }

    reward_catalog {
        uuid id PK
        varchar code UK
        varchar title
        int cost_xp
        boolean is_secret
    }

    reward_secrets {
        uuid reward_id PK,FK
        varchar secret_real_name
        text secret_payload
    }
```

---

## 3. THIẾT KẾ CHUYÊN BIỆT: IMMUTABLE VERSIONING ARCHITECTURE

Cơ chế này hiện thực hóa toàn diện **BR-04, BR-05 và BR-10**, giải quyết dứt điểm lỗi nghiêm trọng của Mock Data cũ (sửa nội dung làm thay đổi đề thi lịch sử và làm sai lệch bài thi của học sinh đang làm dở).

### 3.1. Sơ đồ Luồng Dữ liệu Phiên bản Bất biến (Data Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giáo viên (gv001)
    participant System as Server / RPC (publish_quiz_version)
    participant DB_Draft as Quizzes (Draft State)
    participant DB_Versions as Quiz_Versions & Question_Versions (Immutable)
    actor Student as Học sinh (hs001)
    participant DB_Attempts as Quiz_Attempts & Attempt_Answers

    Note over Teacher, DB_Draft: Giai đoạn 1: Soạn thảo và Xuất bản v1
    Teacher->>DB_Draft: Soạn thảo Quiz Q1 và Question Q_tn01
    Teacher->>System: Gọi lệnh xuất bản (Publish v1)
    System->>DB_Versions: Đóng băng Version 1: quiz_version_id = V1_UUID, question_version_id = Q1_V1_UUID

    Note over Student, DB_Attempts: Giai đoạn 2: Học sinh bắt đầu làm bài v1
    Student->>DB_Attempts: Khởi tạo Lượt làm bài (Attempt 1) -> Liên kết V1_UUID
    Student->>DB_Attempts: Tự lưu tiến trình làm bài (F5 khôi phục đúng đề v1)

    Note over Teacher, DB_Versions: Giai đoạn 3: Giáo viên sửa đổi câu hỏi & xuất bản v2
    Teacher->>DB_Draft: Sửa đáp án hoặc câu chữ của Q_tn01
    Teacher->>System: Gọi lệnh xuất bản (Publish v2)
    System->>DB_Versions: Tạo Version 2 mới: quiz_version_id = V2_UUID, question_version_id = Q1_V2_UUID
    Note over DB_Versions: Version 1 hoàn toàn bất biến, không bị sửa đè!

    Note over Student, DB_Attempts: Giai đoạn 4: Học sinh nộp bài
    Student->>System: Nộp bài Attempt 1
    System->>DB_Attempts: Chấm điểm Attempt 1 đối chiếu với secure_answer_keys của Q1_V1_UUID
    Note over Student, System: Kết quả làm bài và lịch sử sư phạm được bảo toàn 100%!
```

### 3.2. Hai Kịch bản Kiểm chứng Tính Bất biến (Validation Scenarios)

#### Kịch bản 1: Giáo viên sửa đáp án sau khi đã có học sinh làm bài
- **Thực tế:** Giáo viên phát hiện câu hỏi trắc nghiệm số 3 trong đề Kiểm tra 15 phút (v1) bị sai đáp án. Đã có 10 học sinh hoàn thành bài làm trên v1.
- **Cách xử lý của hệ thống:**
  1. Bản ghi `quiz_versions (v1)` và `question_versions (v1)` cùng `secure_answer_keys (v1)` không bị thay đổi.
  2. Kết quả điểm số, đáp án chọn và bài thi của 10 học sinh cũ vẫn giữ nguyên tính toàn vẹn lịch sử.
  3. Giáo viên tạo phiên bản mới `question_versions (v2)` với `secure_answer_keys (v2)` đã sửa đáp án đúng, sau đó phát hành `quiz_versions (v2)`.
  4. Các lượt làm bài mới kể từ thời điểm này sẽ liên kết với `v2`.
  5. Nếu giáo viên muốn phúc khảo hoặc tính lại điểm cho 10 học sinh cũ, hệ thống cung cấp công cụ tính lại có ghi nhật ký kiểm toán trong `audit_logs`, tuyệt đối không ghi đè dữ liệu gốc.

#### Kịch bản 2: Xuất bản v2 khi học sinh đang làm dở v1
- **Thực tế:** Học sinh A đang làm bài thi giữa kỳ (v1) được 15 phút (còn 30 phút). Giáo viên bất ngờ xuất bản v2 để sửa một lỗi chính tả.
- **Cách xử lý của hệ thống:**
  1. Lượt làm bài của học sinh A trong `quiz_attempts` đang gắn cứng với `quiz_version_id = V1_UUID`.
  2. Khi học sinh A ấn F5 hoặc gửi yêu cầu auto-save, hệ thống truy vấn theo `quiz_version_id` của lượt làm bài hiện tại, do đó học sinh vẫn tiếp tục làm đề v1 với đồng hồ đếm ngược được tính từ `started_at` phía server.
  3. Khi học sinh A nộp bài, hệ thống đối soát với `secure_answer_keys` của v1. Học sinh hoàn toàn không bị ảnh hưởng hay văng bài thi giữa chừng.

---

## 4. QUY TẮC RÀNG BUỘC TOÀN VẸN (CARDINALITY & NO-CASCADE RULES)

| Cặp Quan hệ (Relationship) | Bậc quan hệ (Cardinality) | Khóa ngoại | Chính sách Xóa (Delete Policy) | Giải thích lý do sư phạm |
| :--- | :--- | :--- | :--- | :--- |
| `student_profiles` $\rightarrow$ `quiz_attempts` | 1 - Nhiều ($1:N$) | `student_id` | **`ON DELETE RESTRICT`** | Bài thi là hồ sơ học tập pháp lý của học sinh, cấm xóa cascade khi xóa tài khoản. |
| `quiz_attempts` $\rightarrow$ `attempt_answers` | 1 - Nhiều ($1:N$) | `attempt_id` | **`ON DELETE RESTRICT`** | Từng câu trả lời phải được bảo tồn cùng lượt làm bài để phục vụ phúc khảo. |
| `student_profiles` $\rightarrow$ `xp_ledger` | 1 - Nhiều ($1:N$) | `student_id` | **`ON DELETE RESTRICT`** | Sổ cái tài chính gamification; biến động điểm phải bất biến vĩnh viễn. |
| `student_profiles` $\rightarrow$ `attendance_records` | 1 - Nhiều ($1:N$) | `student_id` | **`ON DELETE RESTRICT`** | Nhật ký chuyên cần của học sinh không được phép biến mất. |
| `quiz_versions` $\rightarrow$ `quiz_attempts` | 1 - Nhiều ($1:N$) | `quiz_version_id` | **`ON DELETE RESTRICT`** | Không cho phép xóa phiên bản đề thi khi đã có học sinh làm bài. |
| `question_versions` $\rightarrow$ `attempt_answers` | 1 - Nhiều ($1:N$) | `question_version_id` | **`ON DELETE RESTRICT`** | Đáp án học sinh phải luôn soi chiếu được nội dung câu hỏi tại thời điểm làm. |
| `teacher_profiles` $\rightarrow$ `audit_logs` | 1 - Nhiều ($1:N$) | `actor_id` | **`ON DELETE RESTRICT`** | Nhật ký kiểm toán hành vi của giáo viên phải tồn tại độc lập để điều tra sự cố. |

---
*(Xem tiếp Tài liệu 04 để biết chi tiết Thiết kế Xác thực Authentication và Ma trận Quyền RLS).*
