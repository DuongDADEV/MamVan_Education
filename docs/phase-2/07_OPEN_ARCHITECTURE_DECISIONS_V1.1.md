# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 07 (PHIÊN BẢN HIỆU CHỈNH V1.1): DANH MỤC CÁC QUYẾT ĐỊNH KIẾN TRÚC MỞ
# (RECONCILED OPEN ARCHITECTURE DECISIONS - ADR REGISTER)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 – Supabase Architecture & Logical Database Design |
| **Phiên bản** | **v1.1 (Reconciled ADR Register)** |
| **Trạng thái** | **APPROVED BUSINESS RULES + PENDING TECHNICAL REVIEW** |
| **Tác giả** | Technical Lead & Enterprise Architect |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md`, `docs/phase-2/08_CROSS_DOCUMENT_CONSISTENCY_REVIEW.md` và Quyết định phê duyệt ADR-08 |
| **Quy tắc an toàn** | **GIỮ NGUYÊN BẢN V1.0**; Tài liệu v1.1 cập nhật ADR-08 thành APPROVED và phân định rõ ràng các Blocking Phases |

---

## 1. PHÂN LOẠI TRẠNG THÁI QUYẾT ĐỊNH (DECISION CATEGORIES)

- **`[APPROVED BUSINESS DECISION]`**: Quyết định nghiệp vụ đã được Product Owner phê duyệt chính thức (Gồm BR-01 đến BR-11, **ADR-01: Mô hình Xác thực Học sinh & Giáo viên**, và **ADR-08: Tích hợp Trần XP Điểm danh**). Bắt buộc kỹ thuật phải tuân thủ tuyệt đối, không được tự ý thay đổi.
- **`[PROPOSED TECHNICAL DESIGN]`**: Đề xuất kỹ thuật tối ưu từ đội ngũ Kiến trúc phần mềm, đã được rà soát đối soát chéo ở tài liệu 08, đang chờ PO và Tech Lead thông qua trước khi sinh mã DDL.
- **`[PENDING TECHNICAL DECISION]`**: Vấn đề kỹ thuật cần thêm thông tin đầu vào từ Product Owner hoặc đối tác công nghệ bên ngoài.
- **`[BLOCKER]`**: Điều kiện tiên quyết thực tế bắt buộc phải hoàn thành trước khi chuyển sang giai đoạn kế tiếp.

---

## 2. BẢNG TỔNG HỢP TOÀN BỘ 11 QUYẾT ĐỊNH KIẾN TRÚC (RECONCILED ADR REGISTER)

| Mã ADR | Tiêu đề quyết định | Trạng thái hiện tại | Phương án đề xuất tối ưu | Rủi ro & Đánh đổi kỹ thuật | Đầu vào cần từ PO | Giai đoạn Bắt buộc chốt (Blocking Phase) | Có thể hoãn đến (Can Defer Until) |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: | :---: |
| **ADR-01** | **Xác thực học sinh THCS & Giáo viên** | **`APPROVED PRODUCT REQUIREMENT`** | **Phê duyệt mô hình phân quyền:** Giáo viên tự đăng ký Email+Password (cần phê duyệt quyền); Học sinh đăng nhập bằng Username cấp phát (không cần email thật, cấm tự đăng ký). Áp dụng **Phương án B (Internal Identifier Mapping)**. | Yêu cầu Edge Function chạy phía trusted server để cấp tài khoản bằng Service Role, không lộ Admin API cho client. | **PRODUCT OWNER ĐÃ PHÊ DUYỆT CHÍNH THỨC.** | **ĐÃ HOÀN TẤT** | N/A |
| **ADR-02** | **Quản lý phiên bản bất biến (Content Versioning)** | `PROPOSED DESIGN` | Mô hình 3 cấp: `quiz_versions`, `question_versions`, `quiz_version_questions`. Bản Published bất biến. | Tăng số lượng bảng nhưng bảo toàn 100% lịch sử thi cử sư phạm. | Duyệt mô hình schema Domain C. | **Phase 2.3** | Phase 2.3 bắt đầu |
| **ADR-03** | **Hạ tầng lưu trữ Video** | `PENDING EVALUATION` | MVP dùng YouTube Unlisted (nhúng iframe an toàn domain). Chuẩn bị sẵn adapter Supabase Storage. | Tiết kiệm băng thông nhưng phụ thuộc YouTube Player API để track tiến trình. | PO xác nhận nguồn lưu trữ video ban đầu của giáo viên. | **Phase 2.3** | Phase 2.5 (Tracking) |
| **ADR-04** | **Lưu trữ & Xác minh xem Video** | `PROPOSED DESIGN` | Hợp nhất khoảng thời gian `watched_intervals` phía server; fallback bằng Quick Check Quiz nếu player không track được. | Cần Stored Procedure thuật toán gộp khoảng thời gian. | Duyệt tiêu chí xác minh $\ge 80\%$ thời lượng thực tế (BR-11). | **Phase 2.5** | Phase 2.5 bắt đầu |
| **ADR-05** | **Auto-save & Server Timer bài thi** | `PROPOSED DESIGN` | Client tự lưu LocalStorage debounce 500ms; đồng bộ ngầm; timer tính từ `started_at` phía server kèm 30s độ trễ mạng. | Client mất mạng tạm thời vẫn làm bài tiếp được. | Duyệt khoảng thời gian độ trễ mạng cho phép (30s). | **Phase 2.4** | Phase 2.4 bắt đầu |
| **ADR-06** | **Tần suất tính Mastery Snapshot** | `PROPOSED DESIGN` | **Event-driven:** Tính lại ngay khi học sinh nộp bài quiz hoặc giáo viên chốt điểm essay. | Không cần cấu hình cronjob chạy ngầm; UI cập nhật tức thì. | Duyệt trải nghiệm học sinh thấy Cây Trưởng Thành đổi ngay. | **Phase 2.4** | Phase 2.5 bắt đầu |
| **ADR-07** | **Lưu trữ dữ liệu & Trẻ em (Child Privacy)** | `PROPOSED DESIGN` | Lưu trữ trong thời gian học; lưu hồ sơ thi 5 năm; ẩn danh hóa dữ liệu sau 12 tháng không hoạt động. Cấm CASCADE. | Tuân thủ Nghị định 13/2023/NĐ-CP; tăng chi phí dung lượng lưu trữ dài hạn. | PO và ban cố vấn pháp lý phê duyệt chính sách lưu trữ. | **Trước Production** | Trước khi Go-Live |
| **ADR-08** | **Tương tác XP Điểm danh & Trần ngày/tuần** | **`APPROVED BUSINESS DECISION`** | **Tích hợp trần ngày 130-150 XP, trần tuần 900 XP.** Hết trần vẫn ghi nhận điểm danh, `actual_xp = 0`. | **Không có quỹ XP điểm danh riêng; bảo vệ học sinh không cày điểm quá 90 phút/ngày.** | **PRODUCT OWNER ĐÃ PHÊ DUYỆT CHÍNH THỨC.** | **ĐÃ HOÀN TẤT** | N/A |
| **ADR-09** | **Đồng hồ đếm ngược & Deadline thi** | `PROPOSED DESIGN` | Server-authoritative timer: `started_at + time_limit_minutes`. Nộp trễ quá 30s ghi nhận trạng thái `timed_out`. | Ngăn chặn gian lận chỉnh giờ máy tính client. | Duyệt quy tắc nộp muộn (thu bài tự động hay từ chối). | **Phase 2.4** | Phase 2.4 bắt đầu |
| **ADR-10** | **Cô lập môi trường Demo / Production** | `PROPOSED DESIGN` | Hai Supabase Project độc lập hoàn toàn (Khác Project ID, DB URL, JWT). Seed data riêng biệt. | Tốn công quản lý 2 projects nhưng bảo đảm 100% Analytics trong sạch (BR-06). | PO tạo 2 Supabase Projects (Staging & Production). | **Phase 2.2** | Trước khi seed data |
| **ADR-11** | **Bảo vệ Đáp án & Quà bí mật** | `PROPOSED DESIGN` | Tách bảng vật lý `secure_answer_keys` và `reward_secrets`. Cấm học sinh SELECT; mở qua RPC. | Vượt qua giới hạn không che được cột của PostgreSQL RLS. | Phê duyệt mô hình phân tách bảng và RPC bảo mật. | **Phase 2.2** | Phase 2.3 bắt đầu |

---

## 3. CHI TIẾT QUYẾT ĐỊNH ĐÃ PHÊ DUYỆT: ADR-08

### Bối cảnh & Thảo luận trước đây:
Tài liệu v1.0 từng ghi nhận câu hỏi mở: *"+2 XP điểm danh có bị tính vào trần 50 XP hay không?"*. Sau đó, qua kiểm toán mã nguồn tại `src/logic/xpEngine.ts` và `src/config.ts`, trần 50 XP được phát hiện là một giả định cũ không chính xác.

### Quyết định Chính thức từ Product Owner:
1. **+2 XP điểm danh nằm trọn vẹn trong trần XP ngày và trần tuần.** Không có quỹ XP điểm danh riêng.
2. **Loại bỏ vĩnh viễn trần 50 XP/ngày.**
3. **Quy tắc trần ngày theo thời gian học tích cực:**
   - 45 phút học tích cực đầu tiên: Trần tối đa **130 XP**.
   - Từ phút 45 đến phút 90: Mở thêm tối đa 20 XP (Tổng trần: **150 XP/ngày**).
   - Quá 90 phút học tích cực trong ngày: Tạm dừng cộng XP (vẫn cho phép học bình thường).
4. **Trần tuần tối đa:** **900 XP/tuần**.
5. **Hành vi khi đã chạm trần:**
   - Học sinh bấm điểm danh: Hệ thống vẫn ghi nhận điểm danh thành công (`attendance_records` được chèn, chuỗi ngày `streak_days` tăng lên).
   - Ghi sổ cái `xp_ledger`: `raw_xp = 2`, `actual_xp = 0`.
   - Thông báo UI: *"Điểm danh thành công! Bạn đã hoàn thành chuỗi ngày học nhưng đã đạt trần XP hôm nay."*

---

## 4. TÌNH TRẠNG CÁC ĐIỀU KIỆN TIÊN QUYẾT TRƯỚC PHASE 2.2 (PREREQUISITES & RESOLUTION)

1. **ĐIỀU KIỆN 1 (Môi trường Git):** Đang xử lý: Đã clone Git repository chính thức `https://github.com/DuongDADEV/MamVan_Education.git` vào workspace riêng, đối chiếu source code và chuẩn bị branch commit.
2. **ĐIỀU KIỆN 2 (Supabase Dev Project):** Đang xử lý: Đã có Project Reference `rhtyxtjqwwbipkbbwvzc`, tiến hành liên kết local CLI và cấu hình môi trường `.env.local`.
3. **ĐIỀU KIỆN 3 (Phê duyệt ADR-01):** **`[ĐÃ HOÀN TẤT & PHÊ DUYỆT]`** Product Owner đã phê duyệt chính thức yêu cầu sản phẩm: Giáo viên tự đăng ký Email+Password (phê duyệt quyền qua hệ thống tin cậy); Học sinh đăng nhập bằng Username cấp phát (cấm tự đăng ký); Phụ huynh dành cho tương lai.

---
*(Bản v1.1 này đã cập nhật toàn diện quyết định ADR-01 và ADR-08, đóng vai trò là căn cứ pháp lý kỹ thuật chính thức cho Phase 2.2).*
