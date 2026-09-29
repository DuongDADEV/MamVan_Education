# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 07: DANH MỤC CÁC QUYẾT ĐỊNH KIẾN TRÚC MỞ (OPEN ARCHITECTURE DECISIONS - ADR)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | v1.0 (Architecture Decision Records) |
| **Trạng thái** | **PROPOSED TECHNICAL REGISTER – PENDING PO REVIEW** |
| **Tác giả** | Technical Lead & Enterprise Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md` |

---

## 1. PHÂN LOẠI TRẠNG THÁI QUYẾT ĐỊNH (DECISION CATEGORIES)

Toàn bộ các nội dung trong hệ thống tài liệu Phase 2 được phân định rành mạch theo 4 cấp độ:
- **`[APPROVED BUSINESS RULE]`**: Yêu cầu nghiệp vụ đã được Product Owner phê duyệt chính thức (BR-01 đến BR-11), bất biến, kỹ thuật phải tuân thủ tuyệt đối.
- **`[PROPOSED TECHNICAL DESIGN]`**: Đề xuất kỹ thuật tối ưu do đội ngũ Kiến trúc xây dựng, đang chờ PO và Tech Lead phê duyệt trước khi lập trình.
- **`[PENDING TECHNICAL DECISION]`**: Vấn đề kỹ thuật còn nhiều phương án mở, cần thêm phân tích hoặc quyết định cấu hình từ Product Owner.
- **`[BLOCKER]`**: Rào cản kỹ thuật hoặc môi trường bắt buộc phải tháo gỡ trước khi chuyển sang Phase 2.2.

---

## 2. MA TRẬN QUYẾT ĐỊNH KIẾN TRÚC (ARCHITECTURE DECISION RECORDS - ADR)

| Mã ADR | Tiêu đề quyết định | Trạng thái phân loại | Đề xuất kỹ thuật | Tác động tới Phase 2.2+ |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-01** | **Xác thực học sinh THCS (Student Authentication)** | `[PENDING TECHNICAL DECISION]` | Áp dụng **Phương án B: Internal Identifier Mapping** (`<student_code>@student.mamvan.edu.vn`). Không yêu cầu học sinh lớp 7 có email cá nhân thực. | Rất lớn (Quyết định cách thiết kế bảng `user_profiles` và logic đăng nhập). |
| **ADR-02** | **Quản lý phiên bản học liệu bất biến (Content Versioning)** | `[PROPOSED TECHNICAL DESIGN]` | Chuẩn hóa mô hình 3 cấp: `quiz_versions`, `question_versions`, `quiz_version_questions`. Bản Published bất biến, sửa đề tạo bản nháp mới. | Quyết định thiết kế DDL Domain B & C ở Phase 2.3. |
| **ADR-03** | **Hạ tầng lưu trữ Video (Video Provider Strategy)** | `[PENDING TECHNICAL DECISION]` | Trừu tượng hóa `video_lessons` với `provider` (`youtube`, `supabase_storage`, `external_cdn`) và `provider_asset_id`. MVP dùng YouTube Unlisted. | Phase 2.3 & 2.5 không bị phụ thuộc vào một nhà cung cấp storage duy nhất. |
| **ADR-04** | **Lưu trữ & Xác minh tiến trình xem Video** | `[PROPOSED TECHNICAL DESIGN]` | Lưu mảng khoảng thời gian thực tế `watched_intervals JSONB`. Thuật toán server hợp nhất khoảng thời gian, xác nhận hoàn thành khi $\ge 80\%$ thời lượng thực tế (BR-11). | Quyết định logic Stored Procedure ở Phase 2.5. |
| **ADR-05** | **Tự lưu & Chống mất bài khi F5 (Offline & Auto-save)** | `[PROPOSED TECHNICAL DESIGN]` | Client tự lưu tiến trình vào LocalStorage với debounce 500ms; đồng bộ định kỳ lên `quiz_attempts.client_metadata`. Thời gian làm bài tính từ `started_at` phía server. | Màn hình `QuizRunner` ở Phase 2.4. |
| **ADR-06** | **Tần suất tính toán Mastery Snapshot** | `[PENDING TECHNICAL DECISION]` | **Event-Driven Recalculation:** Tính lại ngay sau khi giáo viên chốt điểm bài tự luận hoặc học sinh nộp bài quiz trắc nghiệm. Không dùng cronjob chạy đêm. | Tối ưu tài nguyên database và trải nghiệm học sinh thấy ngay danh hiệu mới. |
| **ADR-07** | **Bảo vệ quyền riêng tư trẻ em & Lưu trữ dữ liệu (Child Privacy & Retention)** | `[PENDING TECHNICAL DECISION]` | Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Không áp dụng CASCADE. Tài khoản rời lớp chỉ bị `archived` hoặc ẩn danh hóa (Anonymization). | Ràng buộc khóa ngoại `ON DELETE RESTRICT` trên toàn hệ thống. |
| **ADR-08** | **Tương tác giữa XP Điểm danh và Trần ngày (Daily Cap)** | `[PENDING TECHNICAL DECISION]` | **Đề xuất:** +2 XP điểm danh là khoản thưởng chuyên cần độc lập, **không bị tính gộp vào trần ngày 50 XP** của việc luyện tập quiz. Cần PO xác nhận chính thức. | Quyết định logic điều kiện bên trong hàm `award_xp_transaction`. |
| **ADR-09** | **Đồng hồ đếm ngược bài thi & Độ trễ mạng (Exam Deadline)** | `[PROPOSED TECHNICAL DESIGN]` | Deadline kiểm tra tuyệt đối bằng `started_at + time_limit_minutes`. Cấp độ trễ mạng hợp lệ (Network Grace Period) 30 giây khi nộp bài. | Quyết định logic nộp bài ở Phase 2.4. |
| **ADR-10** | **Chiến lược cô lập môi trường Demo và Production** | `[PROPOSED TECHNICAL DESIGN]` | **Hai Supabase Project độc lập hoàn toàn** (Khác Project ID, DB URL, JWT Secret). Tuyệt đối không dùng chung một DB và dùng cờ `is_demo`. | Tuân thủ tuyệt đối BR-06. Analytics không bao giờ bị trộn lẫn. |
| **ADR-11** | **Bảo vệ Đáp án đúng và Quà tặng bí mật (Secret Vault)** | `[PROPOSED TECHNICAL DESIGN]` | Tách rời thành hai bảng độc lập `secure_answer_keys` và `reward_secrets`. Cấm tuyệt đối quyền SELECT của học sinh; chỉ giải mã qua RPC an toàn. | Giải quyết giới hạn không thể giấu cột của PostgreSQL RLS. |

---

## 3. DANH MỤC CÁC RÀO CẢN BẮT BUỘC TRƯỚC PHASE 2.2 (BLOCKERS & PREREQUISITES)

> [!WARNING]
> Trước khi bắt đầu lập trình Phase 2.2 (viết file SQL DDL và cấu hình Supabase Client), các điều kiện tiên quyết sau đây bắt buộc phải được Product Owner phê duyệt và thiết lập:

1. **BLOCKER 1: Xác nhận Git Baseline & Chuyển sang Repository chính thức:**
   - Thư mục hiện tại là bản ZIP snapshot không có Git metadata (`SOURCE SNAPSHOT – GIT COMMIT UNVERIFIED`).
   - Yêu cầu: Product Owner xác nhận hoặc hỗ trợ đồng bộ thư mục làm việc với kho lưu trữ chính thức `https://github.com/DuongDADEV/MamVan_Education.git` trước khi tạo các branch tính năng mới.
2. **BLOCKER 2: Khởi tạo Supabase Project Môi trường Phát triển (Dev/Staging):**
   - Product Owner cần tạo một Supabase Project dành riêng cho môi trường Development/Staging.
   - Cung cấp các biến môi trường cấu hình an toàn qua `.env.local` (không đưa vào tài liệu hay git):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
3. **BLOCKER 3: Phê duyệt Phương án Xác thực Học sinh (ADR-01):**
   - Product Owner xác nhận áp dụng Phương án B (Tên đăng nhập nội bộ) để đội ngũ kiến trúc tiến hành sinh mã DDL cho bảng `user_profiles` và hàm cấp tài khoản.
4. **BLOCKER 4: Xác nhận Quy tắc Trần XP Điểm danh (ADR-08):**
   - Product Owner xác nhận +2 XP điểm danh có nằm ngoài trần ngày 50 XP hay không.

---

## 4. TỔNG KẾT BÀN GIAO THIẾT KẾ PHASE 2.1 (PHASE 2.1 HANDOFF SUMMARY)

Giai đoạn Phase 2.1 đã hoàn thành trọn vẹn việc thiết lập nền tảng kiến trúc lý thuyết và tài liệu thiết kế cơ sở dữ liệu logic, bao gồm:
- **7 tài liệu kiến trúc chuyên sâu** trong thư mục `docs/phase-2/`.
- **32 bảng dữ liệu logic** được định nghĩa đầy đủ khóa chính, khóa ngoại, kiểu dữ liệu, chỉ mục và chính sách bảo vệ dữ liệu lịch sử.
- **Sơ đồ ERD toàn diện** và sơ đồ chi tiết cho cơ chế Versioning bất biến bằng Mermaid.
- **Ma trận phân quyền RLS chi tiết** cho từng bảng và phương án giải quyết giới hạn che giấu cột của PostgreSQL.
- **Quy trình 8 thao tác nghiệp vụ cốt lõi** phía server đảm bảo nguyên tắc Zero-Trust.
- **Lộ trình 5 bước chuyển đổi dần dần (Dual-Repository)** bảo vệ toàn vẹn giao diện người dùng hiện tại.

**ĐỘI NGŨ THIẾT KẾ DỪNG TẠI ĐÂY, KÍNH MỜI PRODUCT OWNER RÀ SOÁT VÀ PHÊ DUYỆT BỘ TÀI LIỆU PHASE 2.1.**
