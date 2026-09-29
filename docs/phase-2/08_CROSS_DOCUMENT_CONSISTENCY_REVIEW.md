# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 08: BÁO CÁO KIỂM TOÁN TÍNH NHẤT QUÁN TOÀN DIỆN
# (CROSS-DOCUMENT CONSISTENCY REVIEW & AUDIT REPORT)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | v1.0 (Audit & Reconciliation Baseline) |
| **Tác giả** | Principal Software Architect, Security & Database Architect, QA Lead |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md` và Quyết định phê duyệt ADR-08 của Product Owner |
| **Quy tắc an toàn** | **DOCUMENTATION ONLY** – Giữ nguyên v1.0, không sửa `src/`, không tạo migration |

---

## 1. TỔNG QUAN KIỂM TOÁN & XÁC MINH BASELINE

### 1.1. Kiểm tra Git & Source Baseline
- **Current Working Directory:** `e:\APP_Education\MamVan_Education-main\MamVan_Education-main`
- **Tình trạng Git:** **`SOURCE SNAPSHOT – GIT COMMIT UNVERIFIED`** (Thư mục làm việc giải nén từ tệp ZIP, hoàn toàn không chứa thư mục `.git` hoặc Git metadata; không thể coi là Git HEAD).
- **Kho lưu trữ chính thức (Remote Target):** `https://github.com/DuongDADEV/MamVan_Education.git`
- **Phiên bản Runtime & Framework thực tế (`package.json`):**
  - **React:** `^19.0.1` và `react-dom: ^19.0.1` (Tài liệu 01 cũ ghi nhầm là React 18).
  - **Vite:** `^8.3.0` (Tailwind CSS v4 `@tailwindcss/vite: ^4.3.3`).
  - **React-Is:** `^19.3.0` (Đã giải quyết tương thích Recharts).
- **Cấu trúc Tầng Dịch vụ (Service Layer Structure):**
  - Không tồn tại tệp `src/services/repository.ts` nguyên khối.
  - Cấu trúc thực tế là **Kiến trúc Repository Module hóa**:
    - `src/services/types.ts`: Định nghĩa 10 Interface Contracts riêng biệt (`AuthRepository`, `ClassRepository`, `StudentRepository`, `ContentRepository`, `QuizRepository`, `AttemptRepository`, `EssayRepository`, `RewardRepository`, `AuditRepository`, `SettingRepository`).
    - `src/services/index.ts`: Export các service instances (`authService`, `classService`, v.v.) và hook phản ứng thời gian thực đa tab `useLiveQuery`.
    - `src/services/mock/mockRepositories.ts`: Triển khai mock data trên LocalStorage.

---

## 2. MA TRẬN PHÁT HIỆN SAI LỆCH TOÀN BỘ 7 TÀI LIỆU (FINDINGS MATRIX)

Kiểm toán đối chiếu chéo giữa 7 tài liệu Phase 2.1 (01 đến 07) đối chiếu với Phase 1 v1.1 và mã nguồn phát hiện **12 nhóm sai lệch**:

| Mã lỗi | Mức độ | Tài liệu liên quan | Nội dung sai lệch hiện tại | Quy chuẩn phê duyệt chính thức | Hành động hiệu chỉnh bắt buộc | Trạng thái |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **FIND-01** | **P0** | 02, 05, 07 | Giả định trần 50 XP/ngày và để ngỏ ADR-08 là Pending. | **ADR-08 APPROVED BY PO:** +2 XP điểm danh nằm trong trần ngày/tuần. Trần: 130 XP (0-45p), +20 XP (45-90p), max 150 XP/ngày, 900 XP/tuần. Hết trần vẫn ghi nhận điểm danh với `actual_xp = 0`. | Xóa bỏ hoàn toàn số liệu 50 XP. Cập nhật logic `claim_daily_attendance` và `award_xp_transaction`. Đổi ADR-08 thành APPROVED. | **RECONCILED IN V1.1** |
| **FIND-02** | **P0** | 02, 05 | Schema và RPC dùng `skill_category (recalling, understanding, analyzing, writing)` và tự tạo mức thứ 5 "VIET". | Phê duyệt chuẩn môn Ngữ văn lớp 7 có **đúng 4 mức năng lực**: `NHAN_BIET`, `THONG_HIEU`, `PHAN_TICH`, `VAN_DUNG`. Câu tự luận thuộc `PHAN_TICH` hoặc `VAN_DUNG`. | Sửa CHECK constraint thành 4 mức tiếng Việt chuẩn. Loại bỏ mức `VIET`. Áp dụng công thức suy giảm theo thời gian (recency decay factor). | **RECONCILED IN V1.1** |
| **FIND-03** | **P1** | 02, 03, 04 | Schema 02 công bố 32 bảng nhưng bảng Inventory thực tế liệt kê 33 bảng. Thiếu bảng theo dõi tiến trình học tổng quát (`completedSteps`, resume state). | Hệ thống cần chuẩn hóa danh mục bảng, phân tách rõ ràng và bổ sung `student_learning_progress` để lưu vết các bước đã hoàn thành. | Bổ sung bảng `student_learning_progress` (TBL_E06). Chuẩn hóa tổng số bảng logic là **34 bảng**. Đồng bộ toàn bộ ERD, Schema và RLS Matrix. | **RECONCILED IN V1.1** |
| **FIND-04** | **P1** | 02, 03, 05 | Trạng thái `quiz_attempts.status` thiếu `timed_out` (chỉ có `in_progress`, `submitted`, `abandoned`). | Bài thi chính thức giới hạn thời gian khi hết giờ mà học sinh chưa bấm nộp cần chuyển sang `timed_out` hoặc tự động nộp bài có kiểm soát. | Bổ sung trạng thái `timed_out` vào CHECK constraint và xử lý trong RPC `submit_quiz_attempt`. | **RECONCILED IN V1.1** |
| **FIND-05** | **P1** | 02, 05 | Khóa nguồn trong `mastery_evidence` dùng `review_id`, khiến việc giáo viên chấm lại (regrade round 2) sinh ra bằng chứng trùng lặp. | Bằng chứng năng lực của câu tự luận phải gắn với danh tính bài làm ổn định (`attempt_answer_id` hoặc `essay_submission_id`). Chấm lại chỉ cập nhật điểm của bằng chứng cũ. | Thêm ràng buộc `UNIQUE (student_id, topic_id, skill_level, source_evidence_key)` để ngăn chặn việc nhân đôi bằng chứng Mastery. | **RECONCILED IN V1.1** |
| **FIND-06** | **P1** | 02 | Sử dụng `DEFAULT timezone('utc'::text, now())` cho cột `TIMESTAMPTZ`. | Hàm `timezone('utc', now())` trả về kiểu `TIMESTAMP WITHOUT TIME ZONE`. Khi ép lại sang `TIMESTAMPTZ` sẽ gây sai lệch múi giờ. | Đổi toàn bộ giá trị mặc định của `TIMESTAMPTZ` thành `DEFAULT now()`. Việc chuyển đổi sang múi giờ `Asia/Ho_Chi_Minh` chỉ thực hiện khi tính ngày nghiệp vụ. | **RECONCILED IN V1.1** |
| **FIND-07** | **P1** | 05 | Điều kiện nhận XP của Quiz bị ghi là "phải đạt tỷ lệ qua bài >= 60% thì mới thưởng 10 XP". | Theo BR-03 và BR-04, nộp bài Quiz hợp lệ được nhận XP hoàn thành (First-completion XP) độc lập với điểm số sư phạm của câu hỏi. | Tách bạch XP thưởng hoàn thành bài học với điểm số và Mastery. Quiz hoàn thành hợp lệ lần đầu được nhận XP định mức nếu còn trần ngày. | **RECONCILED IN V1.1** |
| **FIND-08** | **P1** | 01, 06 | Tài liệu 01 và 06 mô tả chuyển đổi một `Repository.ts` nguyên khối duy nhất và ghi nhầm phiên bản React 18. | Ứng dụng thực tế chạy React 19 và sử dụng 10 Repository interfaces module hóa trong `src/services/types.ts`. | Cập nhật tài liệu 01 và 06: Chuyển đổi theo từng interface module hóa (`ContentRepository`, `QuizRepository`, v.v.), bảo đảm hook `useLiveQuery` hoạt động thông suốt. | **RECONCILED IN V1.1** |
| **FIND-09** | **P2** | 04, 05 | An ninh RPC: Chưa đặc tả đầy đủ `SET search_path = public` và quyền `EXECUTE` cho các hàm `SECURITY DEFINER`. | Các hàm `SECURITY DEFINER` không khóa `search_path` có nguy cơ bị tấn công ghi đè hàm (Search Path Hijacking). | Bổ sung quy chuẩn an ninh: Mọi Stored Procedure `SECURITY DEFINER` bắt buộc phải có `SET search_path = public, pg_temp;` và thu hồi quyền `EXECUTE` từ `PUBLIC`. | **RECONCILED IN V1.1** |
| **FIND-10** | **P2** | 05 | Xác minh Video: Chỉ dựa vào mảng `watched_intervals` do client gửi lên mà chưa tính đến trường hợp video provider không hỗ trợ theo dõi. | Cần cơ chế dự phòng: Xác minh bằng bài kiểm tra trọng tâm ngắn (Quick Check Quiz) hoặc xác nhận sư phạm của giáo viên nếu player bên ngoài không bắt được sự kiện. | Phân loại 3 mức xác minh: `watch_tracking_intervals`, `content_quiz_verification`, `teacher_manual_override`. | **RECONCILED IN V1.1** |
| **FIND-11** | **P2** | 06 | Chiến lược Rollback: Đề xuất chuyển ngược về MockRepository mà chưa tính đến việc đồng bộ dữ liệu thật đã ghi trên Supabase. | Rollback khẩn cấp sang Mock chỉ là giải pháp tạm thời hiển thị; không được coi dữ liệu mock là dữ liệu thật tương đương; cần quy trình đối soát dữ liệu (Data Reconciliation). | Bổ sung quy trình bảo toàn giao dịch và đối soát dữ liệu khi kích hoạt cờ fallback. | **RECONCILED IN V1.1** |
| **FIND-12** | **P2** | 02, 07 | Chưa làm rõ thời hạn lưu trữ dữ liệu cá nhân của học sinh THCS theo Nghị định 13/2023/NĐ-CP. | Quy định pháp luật không cho phép lưu trữ dữ liệu cá nhân vĩnh viễn mà không có sự đồng ý hoặc vượt quá mục đích giáo dục. | Đề xuất khung lưu trữ: Lưu trữ hoạt động trong thời gian học sinh theo học; lưu trữ hồ sơ sư phạm tối thiểu 5 năm sau tốt nghiệp THCS; ẩn danh hóa dữ liệu phân tích sau 12 tháng không hoạt động. | **RECONCILED IN V1.1** |

---

## 3. ĐỐI SOÁT VÀ HIỆU CHỈNH CHI TIẾT TỪNG MIỀN DỮ LIỆU

### 3.1. Hiệu chỉnh Danh mục Bảng Dữ liệu (Table Inventory Reconciliation)
Sau khi đối soát và bổ sung bảng tiến trình học tập tổng quát `student_learning_progress`, toàn hệ thống bao gồm chính xác **34 bảng dữ liệu logic**:

```
DOMAIN A: IDENTITY & CLASSROOM (6 bảng)
  1. user_profiles
  2. user_roles
  3. teacher_profiles
  4. student_profiles
  5. classes
  6. class_memberships

DOMAIN B: LEARNING CONTENT (5 bảng)
  7. topics
  8. video_lessons
  9. video_focus_points
 10. theory_lessons
 11. theory_blocks

DOMAIN C: QUESTION BANK & VERSIONING (7 bảng)
 12. questions
 13. question_versions
 14. secure_answer_keys (Bảo mật tách rời)
 15. quizzes
 16. quiz_versions
 17. quiz_version_questions
 18. quiz_assignments

DOMAIN D: ATTEMPT & GRADING (5 bảng)
 19. quiz_attempts
 20. attempt_answers
 21. essay_submissions
 22. essay_ai_evaluations (Bảo mật tách rời)
 23. essay_teacher_reviews

DOMAIN E: LEARNING PROGRESS (6 bảng - Bổ sung bảng 29)
 24. video_watch_progress
 25. attendance_records
 26. xp_ledger
 27. mastery_evidence
 28. student_mastery_snapshots
 29. student_learning_progress (Mới: Lưu completed_steps và resume state)

DOMAIN F: REWARDS & GAMIFICATION (3 bảng)
 30. reward_catalog
 31. reward_secrets (Bảo mật tách rời)
 32. reward_claims

DOMAIN G: ADMINISTRATION & AUDIT (2 bảng)
 33. system_settings
 34. audit_logs
```

#### Chi tiết bảng bổ sung `TBL_E06: student_learning_progress`:
- **Khóa chính:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Các trường:**
  - `student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT`
  - `topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT`
  - `last_active_step_key VARCHAR(100) NULL` (Ví dụ: `video_watch:v1`, `theory_read:t1`)
  - `completed_step_keys JSONB NOT NULL DEFAULT '[]'::jsonb` (Mảng lưu các mốc hoàn thành lần đầu để tính XP)
  - `is_topic_completed BOOLEAN NOT NULL DEFAULT false`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Ràng buộc:** `UNIQUE (student_id, topic_id)`

---

### 3.2. Hiệu chỉnh Toàn diện Mô hình Mastery (Năng lực Ngữ văn)
- **Chuẩn hóa 4 Cột Năng lực:**
  1. `NHAN_BIET`: Nhớ và chỉ ra được các thể thơ, từ láy, biện pháp tu từ, chi tiết văn bản.
  2. `THONG_HIEU`: Hiểu và giải thích được tác dụng nghệ thuật, ý nghĩa hình ảnh, tư tưởng đoạn trích.
  3. `PHAN_TICH`: Phân tích được tâm lý nhân vật, nét đặc sắc cấu tứ và biện pháp tu từ trong ngữ cảnh.
  4. `VAN_DUNG`: Vận dụng viết đoạn văn biểu cảm, ghi lại cảm nghĩ và liên hệ thực tế đời sống.
- **Ràng buộc câu tự luận:** Bài viết đoạn văn (Essay) được phân loại vào `PHAN_TICH` hoặc `VAN_DUNG`, **tuyệt đối không tạo cột năng lực `VIET`**.
- **Chống trùng lặp khi chấm lại:** Trong bảng `mastery_evidence`:
  `source_id UUID NOT NULL` liên kết với `attempt_answers.id` (cho trắc nghiệm) hoặc `essay_submissions.id` (cho tự luận).
  Khi giáo viên chấm lại lần 2 (`review_round = 2`), hệ thống thực hiện `UPSERT` cập nhật `score_ratio` của bản ghi bằng chứng cũ, không chèn bản ghi mới.

---

### 3.3. Tích hợp Quyết định ADR-08 (XP Engine & Điểm danh)
- **Công thức tính Trần XP ngày (`getCurrentDailyXpCap`):**
  - Thời gian học tích cực trong ngày $\le 45$ phút: Trần tối đa **130 XP**.
  - Thời gian học tích cực từ $45 - 90$ phút: Mở thêm tối đa **20 XP** (Tổng trần: **150 XP/ngày**).
  - Thời gian học tích cực $> 90$ phút: Không cộng thêm XP (Khóa trần ngày).
  - Trần tuần: Tối đa **900 XP/tuần**.
- **Quy trình Điểm danh:**
  - Điểm danh chủ động nhận định mức `raw_xp = 2`.
  - Nếu học sinh đã đạt trần ngày (130 hoặc 150 XP) hoặc trần tuần (900 XP) trước khi điểm danh:
    - Bản ghi `attendance_records` vẫn được ghi nhận thành công (chuỗi ngày `streak_days` tăng lên).
    - Bản ghi `xp_ledger` ghi nhận `raw_xp = 2` và `actual_xp = 0`.
    - Thông báo hiển thị: *"Điểm danh thành công! Bạn đã hoàn thành chuỗi ngày học nhưng đã đạt trần XP hôm nay."*

---

### 3.4. Chuẩn hóa Định dạng Timestamp & Múi giờ
- Thay thế toàn bộ cú pháp gây nhầm lẫn:
  - CŨ: `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - MỚI: `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Mọi mốc thời gian lưu trên PostgreSQL là `TIMESTAMPTZ` (lưu trữ giá trị UTC).
- Khi tính toán ngày học tập và chuỗi điểm danh:
  `business_date := (timezone('Asia/Ho_Chi_Minh', now()))::DATE`

---
*(Xem tiếp Tài liệu 09 để biết Đánh giá Cổng Phê duyệt Phase 2.2 và 12 Kịch bản Kiểm thử Chấp nhận).*
