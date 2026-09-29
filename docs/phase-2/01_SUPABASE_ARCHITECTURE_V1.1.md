# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 01 (PHIÊN BẢN HIỆU CHỈNH V1.1): KIẾN TRÚC TỔNG THỂ SUPABASE
# (RECONCILED SUPABASE ARCHITECTURE SPECIFICATION)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | **v1.1 (Reconciled Architecture Specification)** |
| **Trạng thái** | **PROPOSED TECHNICAL ARCHITECTURE – PENDING PO REVIEW** |
| **Tác giả** | Principal Software Architect, Security Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md`, `docs/phase-2/08_CROSS_DOCUMENT_CONSISTENCY_REVIEW.md` và Quyết định phê duyệt ADR-08 |

---

## 1. BASELINE VERIFICATION & HIỆU CHỈNH FRAMEWORK THỰC TẾ

### 1.1. Thông tin Git Baseline
- **Current Working Directory:** `e:\APP_Education\MamVan_Education-main\MamVan_Education-main`
- **Trạng thái Git:** **`SOURCE SNAPSHOT – GIT COMMIT UNVERIFIED`** (Không có `.git`, snapshot từ ZIP).
- **Kho lưu trữ chính thức:** `https://github.com/DuongDADEV/MamVan_Education.git`

### 1.2. Hiệu chỉnh Thông tin Runtime & Tầng Dịch vụ (Service Layer)
- **Framework thực tế:** **React 19** (`react: ^19.0.1`, `react-dom: ^19.0.1`), **Vite 8** (`vite: ^8.3.0`), **Tailwind CSS v4** (`@tailwindcss/vite: ^4.3.3`).
- **Kiến trúc Tầng Dịch vụ (Service Architecture):**
  - Không sử dụng một file `repository.ts` nguyên khối.
  - Hệ thống sử dụng **Kiến trúc 10 Repository Interfaces Module hóa** trong `src/services/types.ts`:
    1. `AuthRepository`
    2. `ClassRepository`
    3. `StudentRepository`
    4. `ContentRepository`
    5. `QuizRepository`
    6. `AttemptRepository`
    7. `EssayRepository`
    8. `RewardRepository`
    9. `AuditRepository`
    10. `SettingRepository`
  - Các service instances được export tập trung tại `src/services/index.ts` (`authService`, `classService`, v.v.) và được các UI Screens tiêu thụ thông qua hook thời gian thực phản ứng đa tab: `useLiveQuery`.
  - **Mục tiêu chuyển đổi:** Từng bước thay thế các implementation từ `mockRepositories.ts` sang `SupabaseRepository` module hóa mà vẫn duy trì tính tương thích 100% với hook `useLiveQuery` và các component giao diện.

---

## 2. NGUYÊN TẮC BẢO VỆ DỮ LIỆU & TỔNG SỐ BẢNG LOGIC

1. **Tổng số bảng dữ liệu logic chuẩn hóa:** **34 bảng** (Phân bổ trong 7 miền nghiệp vụ, bổ sung bảng `student_learning_progress` để lưu vết `completed_steps` và trạng thái khôi phục bài học).
2. **Tích hợp Quyết định ADR-08:**
   - Điểm danh chủ động nhận định mức `raw_xp = 2`.
   - XP điểm danh nằm trọn trong trần ngày linh hoạt (130 XP cho 45 phút đầu; mở thêm 20 XP cho phút 45-90; tối đa 150 XP/ngày) và trần tuần 900 XP.
   - Hết trần vẫn điểm danh thành công với `actual_xp = 0`.
3. **Chuẩn hóa 4 Cột Năng lực (Mastery):** `NHAN_BIET`, `THONG_HIEU`, `PHAN_TICH`, `VAN_DUNG` (Không tạo cột thứ 5 `VIET`).
4. **Cô lập Bảng Vật lý cho Dữ liệu Bí mật:** Tách riêng `secure_answer_keys`, `reward_secrets` và `essay_ai_evaluations` để giải quyết giới hạn không giấu được cột của PostgreSQL RLS.

---
*(Xem tiếp Tài liệu 02 v1.1 để biết đặc tả chi tiết 34 bảng dữ liệu logic).*
