# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 06 (PHIÊN BẢN HIỆU CHỈNH V1.1): LỘ TRÌNH TRIỂN KHAI CHI TIẾT
# (RECONCILED PHASE 2 IMPLEMENTATION ROADMAP)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | **v1.1 (Reconciled Implementation Roadmap)** |
| **Trạng thái** | **PROPOSED TECHNICAL ROADMAP – PENDING PO REVIEW** |
| **Tác giả** | Technical Lead & Principal Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md`, `docs/phase-2/08_CROSS_DOCUMENT_CONSISTENCY_REVIEW.md` và Quyết định phê duyệt ADR-08 |

---

## 1. CHIẾN LƯỢC CHUYỂN GIAO MODULE HÓA (BOUNDED WORKFLOW CUTOVER)

1. **Chuyển đổi theo Bounded Repository Contracts:**
   - Thay vì chuyển đổi một khối `Repository` khổng lồ duy nhất, hệ thống thực hiện chuyển giao độc lập theo 10 Interface Contracts trong `src/services/types.ts`:
     - **Chặng 1 (Phase 2.2):** Chuyển đổi `AuthRepository`, `ClassRepository`, `StudentRepository`.
     - **Chặng 2 (Phase 2.3):** Chuyển đổi `ContentRepository` (Chủ đề, Video, Lý thuyết) và `QuizRepository` (Ngân hàng câu hỏi, đề kiểm tra bất biến).
     - **Chặng 3 (Phase 2.4):** Chuyển đổi `AttemptRepository` và `EssayRepository`.
     - **Chặng 4 (Phase 2.5):** Chuyển đổi Logic Điểm danh, XP Ledger và Mastery Engine.
     - **Chặng 5 (Phase 2.6):** Chuyển đổi `RewardRepository`, `AuditRepository`, `SettingRepository`.
2. **Bảo tồn Phản ứng Thời gian thực (`useLiveQuery`):**
   - Hook `useLiveQuery` trong `src/services/index.ts` tiếp tục hoạt động trong suốt quá trình chuyển đổi. Khi chuyển sang Supabase, tầng dịch vụ kích hoạt Supabase Realtime để đồng bộ dữ liệu vào `syncEventBus`, bảo đảm trải nghiệm đa tab và cập nhật tức thì của UI.
3. **Chiến lược Rollback An toàn & Đối soát Dữ liệu (Data Reconciliation):**
   - Nếu xảy ra sự cố nghiêm trọng trên Supabase, cờ `VITE_DATA_SOURCE = 'mock'` được kích hoạt để đưa ứng dụng về chế độ dự phòng.
   - **Quy tắc an toàn dữ liệu:** Dữ liệu học sinh thật đã ghi nhận trên Supabase tuyệt đối **không được âm thầm ghi đè bằng dữ liệu mock**. Hệ thống có quy trình lưu vết lỗi và script đối soát để khôi phục dữ liệu học tập khi kết nối Supabase hoạt động trở lại.

---

## 2. PHÂN KỲ TRIỂN KHAI CHI TIẾT (TỔNG HỢP)

- **Phase 2.2 (Identity & Classroom - Domain A):** 6 bảng (`user_profiles`, `user_roles`, `teacher_profiles`, `student_profiles`, `classes`, `class_memberships`). Thiết lập Supabase Auth Foundation (Ánh xạ Username nội bộ theo ADR-01).
- **Phase 2.3 (Learning Content & Immutable Versioning - Domain B & C):** 12 bảng (Topics, Videos, Theory, Questions, Quizzes, Versioning, Secure Answer Keys). Stored procedure đóng băng đề thi.
- **Phase 2.4 (Attempts & Server-side Grading - Domain D):** 5 bảng (Attempts, Answers, Essays, AI Evals, Reviews). Chấm trắc nghiệm server-side, bảo lưu essay, xử lý `timed_out` cho bài thi.
- **Phase 2.5 (Progress, Attendance & XP Ledger - Domain E):** 6 bảng (Bổ sung `student_learning_progress`, Attendance records, XP Ledger tích hợp trần ngày 130-150 XP theo ADR-08, Mastery 4 mức chống trùng lặp khi chấm lại).
- **Phase 2.6 (Rewards, Analytics & Security Hardening - Domain F & G):** 5 bảng (Reward catalog, secrets, claims, system settings, audit logs). Rà soát bảo mật RLS và tối ưu hóa view Analytics.

---
*(Xem tiếp Tài liệu 09 để biết các tiêu chí nghiệm thu Acceptance Tests chi tiết và điều kiện vượt qua Decision Gate).*
