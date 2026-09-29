# MẦM VĂN – PHASE 2.1
# TÀI LIỆU 09: ĐÁNH GIÁ SẴN SÀNG & CỔNG PHÊ DUYỆT CHUYỂN GIAO PHASE 2.2
# (PHASE 2.2 READINESS EVALUATION & DECISION GATE REPORT)

---

## THÔNG TIN KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Mục | Nội dung |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Giai đoạn** | Phase 2.1 sang Phase 2.2 Gate Review |
| **Phiên bản** | v1.0 (Readiness & Decision Gate Baseline) |
| **Tác giả** | Principal Software Architect, Security Architect, QA Lead |
| **Nguồn quy chuẩn** | `docs/phase-1/MAM_VAN_BUSINESS_DATA_SPEC_V1.1.md` và `docs/phase-2/08_CROSS_DOCUMENT_CONSISTENCY_REVIEW.md` |
| **Trạng thái Gate** | **CONDITIONAL NO-GO (CẦN THÁO GỠ 3 BLOCKERS KỸ THUẬT TRƯỚC KHI CODE)** |

---

## 1. TỔNG KẾT TRẠNG THÁI NGHIỆP VỤ & QUYẾT ĐỊNH KIẾN TRÚC

### 1.1. 11 Quyết định Nghiệp vụ Cốt lõi (BR-01 đến BR-11)
Toàn bộ 11 Business Rules đã được Product Owner phê duyệt chính thức ở Phase 1 và được bảo toàn 100% trong toàn bộ thiết kế kiến trúc Phase 2:
- **BR-01 [APPROVED]:** Giáo viên quản lý học liệu; UI đọc qua Repository; mock/seed chỉ là dữ liệu ban đầu.
- **BR-02 [APPROVED]:** Học sinh chủ động điểm danh nhận +2 XP; không tự điểm danh khi đăng nhập.
- **BR-03 [APPROVED]:** Essay nằm trong Quiz; nộp bài nhận XP Quiz; Mastery essay chỉ cập nhật sau khi giáo viên chốt điểm.
- **BR-04 [APPROVED]:** Lưu đầy đủ mỗi lượt làm bài, câu trả lời chi tiết, điểm số, phiên bản và mốc thời gian.
- **BR-05 [APPROVED]:** Nội dung đã xuất bản phải bất biến (Immutable Versioning); chỉnh sửa tạo bản nháp mới.
- **BR-06 [APPROVED]:** Dữ liệu Demo/Mock và dữ liệu Production cô lập tuyệt đối; Analytics không trộn lẫn.
- **BR-07 [APPROVED]:** Kho học liệu chung khối 7; bài kiểm tra/BTVN giao theo lớp hoặc cá nhân.
- **BR-08 [APPROVED]:** Luyện tập tự do không giới hạn; bài kiểm tra chính thức giới hạn lượt do giáo viên cấu hình.
- **BR-09 [APPROVED]:** Học liệu lưu trữ (Archived) ẩn khỏi danh mục chung nhưng học sinh từng học vẫn xem lại được.
- **BR-10 [APPROVED]:** Tự lưu và khôi phục tiến trình làm bài; F5 giữ nguyên đồng hồ đếm ngược phía server.
- **BR-11 [APPROVED]:** Video yêu cầu xem tích lũy đủ $\ge 80\%$ thời lượng thực tế (unique playback intervals); cấm timer ảo.

### 1.2. Trạng thái ADR-08 (Đã được Product Owner Phê duyệt)
- **Mã:** `ADR-08: Attendance XP & Daily/Weekly Cap Integration`
- **Trạng thái:** **`[APPROVED BY PRODUCT OWNER]`**
- **Nội dung phê duyệt chính thức:**
  1. Điểm danh chủ động nhận định mức `raw_xp = 2`.
  2. XP điểm danh nằm trọn vẹn trong trần ngày và trần tuần; **không có quỹ XP điểm danh riêng biệt**.
  3. Bỏ hoàn toàn số liệu trần 50 XP/ngày cũ.
  4. Trần ngày áp dụng linh hoạt theo thời gian học tích cực:
     - 45 phút đầu: tối đa 130 XP.
     - Phút 45 đến 90: mở thêm tối đa 20 XP.
     - Tổng trần tối đa trong ngày: **150 XP/ngày**.
  5. Trần tuần tối đa: **900 XP/tuần**.
  6. Khi học sinh đã đạt trần ngày/tuần trước khi điểm danh, hệ thống vẫn ghi nhận điểm danh thành công nhưng `actual_xp = 0`.
  7. Toàn bộ logic điểm danh và ghi sổ cái XP thực thi trong một Database Transaction duy nhất, có Idempotency chống double-click.

---

## 2. MA TRẬN ĐÁNH GIÁ CÁC QUYẾT ĐỊNH KIẾN TRÚC MỞ (ADR MATRIX)

Để tránh tạo ra các rào cản giả (false blockers), các quyết định kỹ thuật được phân loại rõ ràng theo mức độ ảnh hưởng và giai đoạn bắt buộc phải chốt:

| Mã ADR | Tiêu đề quyết định | Trạng thái hiện tại | Đề xuất kỹ thuật tối ưu | Rủi ro & Đánh đổi | Đầu vào cần từ PO | Giai đoạn bắt buộc chốt | Có thể hoãn đến |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: | :---: |
| **ADR-01** | **Xác thực học sinh THCS** | `PENDING PO INPUT` | **Phương án B:** Ánh xạ Username (`<hs_code>@student.mamvan.edu.vn`). Không yêu cầu email thật. | Cần Edge Function cấp tài khoản hàng loạt cho lớp. | PO xác nhận áp dụng Phương án B cho học sinh lớp 7. | **Phase 2.2** | Không thể hoãn |
| **ADR-02** | **Quản lý phiên bản bất biến (Content Versioning)** | `PROPOSED DESIGN` | Mô hình 3 cấp: `quiz_versions`, `question_versions`, `quiz_version_questions`. | Tăng số lượng bảng nhưng bảo toàn 100% lịch sử thi cử. | PO thông qua cấu trúc DDL ở Phase 2.3. | **Phase 2.3** | Phase 2.3 bắt đầu |
| **ADR-03** | **Hạ tầng lưu trữ Video** | `PENDING EVALUATION` | MVP dùng YouTube Unlisted (nhúng iframe có bảo mật domain). Chuẩn bị sẵn adapter Supabase Storage. | YouTube miễn phí băng thông nhưng phụ thuộc YouTube Player API để track xem. | PO xác nhận nguồn lưu trữ video ban đầu của giáo viên. | **Phase 2.3** | Phase 2.5 (Tracking) |
| **ADR-04** | **Lưu trữ & Xác minh xem Video** | `PROPOSED DESIGN` | Hợp nhất khoảng thời gian `watched_intervals` phía server; fallback bằng Quick Check Quiz nếu player không track được. | Cần Stored Procedure thuật toán gộp khoảng thời gian. | Duyệt tiêu chí xác minh $\ge 80\%$ thời lượng thực tế. | **Phase 2.5** | Phase 2.5 bắt đầu |
| **ADR-05** | **Auto-save & Server Timer bài thi** | `PROPOSED DESIGN` | Client tự lưu LocalStorage debounce 500ms; đồng bộ ngầm; timer tính từ `started_at` phía server kèm 30s độ trễ mạng. | Client mất mạng tạm thời vẫn làm bài tiếp được. | Duyệt khoảng thời gian độ trễ mạng cho phép (30s). | **Phase 2.4** | Phase 2.4 bắt đầu |
| **ADR-06** | **Tần suất tính Mastery Snapshot** | `PROPOSED DESIGN` | **Event-driven:** Tính lại ngay khi học sinh nộp bài quiz hoặc giáo viên chốt điểm essay. | Không cần cấu hình cronjob chạy ngầm; UI cập nhật tức thì. | Duyệt trải nghiệm học sinh thấy Cây Trưởng Thành đổi ngay. | **Phase 2.4** | Phase 2.5 bắt đầu |
| **ADR-07** | **Lưu trữ dữ liệu & Trẻ em (Child Privacy)** | `PROPOSED DESIGN` | Lưu trữ trong thời gian học; lưu hồ sơ thi 5 năm; ẩn danh hóa dữ liệu sau 12 tháng không hoạt động. Cấm CASCADE. | Tuân thủ Nghị định 13/2023/NĐ-CP; tăng chi phí dung lượng lưu trữ dài hạn. | PO và ban cố vấn pháp lý phê duyệt chính sách lưu trữ. | **Trước Production** | Trước khi Go-Live |
| **ADR-08** | **Tương tác XP Điểm danh & Trần ngày** | **`APPROVED`** | **Tích hợp trần ngày 130-150 XP, trần tuần 900 XP.** Hết trần `actual_xp = 0`. | Bảo vệ sức khỏe học sinh không cày điểm quá 90 phút/ngày. | **ĐÃ PHÊ DUYỆT** | **ĐÃ XONG** | N/A |
| **ADR-09** | **Đồng hồ đếm ngược & Deadline thi** | `PROPOSED DESIGN` | Server-authoritative timer: `started_at + time_limit_minutes`. Nộp trễ quá 30s ghi nhận trạng thái `timed_out`. | Ngăn chặn gian lận chỉnh giờ máy tính client. | Duyệt quy tắc nộp muộn (thu bài tự động hay từ chối). | **Phase 2.4** | Phase 2.4 bắt đầu |
| **ADR-10** | **Cô lập môi trường Demo / Production** | `PROPOSED DESIGN` | Hai Supabase Project độc lập hoàn toàn (Khác Project ID, DB URL, JWT). Seed data riêng biệt. | Tốn công quản lý 2 projects nhưng bảo đảm 100% Analytics trong sạch. | PO tạo 2 Supabase Projects (Staging & Production). | **Phase 2.2** | Trước khi seed data |
| **ADR-11** | **Bảo vệ Đáp án & Quà bí mật** | `PROPOSED DESIGN` | Tách bảng vật lý `secure_answer_keys` và `reward_secrets`. Cấm học sinh SELECT; mở qua RPC. | Vượt qua giới hạn không che được cột của PostgreSQL RLS. | Phê duyệt mô hình phân tách bảng và RPC bảo mật. | **Phase 2.2** | Phase 2.3 bắt đầu |

---

## 3. DANH MỤC CÁC RÀO CẢN BẮT BUỘC TRƯỚC KHI BẮT ĐẦU CODE PHASE 2.2 (BLOCKERS)

> [!CAUTION]
> Đội ngũ kiến trúc khuyến nghị trạng thái **`CONDITIONAL NO-GO`** cho đến khi 3 rào cản kỹ thuật thực tế sau đây được Product Owner và Quản trị viên hệ thống tháo gỡ:

1. **BLOCKER 1: Xác minh và Chuyển giao Môi trường làm việc sang Git Repository chính thức:**
   - **Hiện trạng:** Thư mục hiện tại là bản snapshot giải nén từ tệp ZIP, **không có metadata `.git`** (`SOURCE SNAPSHOT – GIT COMMIT UNVERIFIED`).
   - **Yêu cầu:** Product Owner clone kho lưu trữ chính thức `https://github.com/DuongDADEV/MamVan_Education.git`, tạo branch làm việc mới (ví dụ: `feature/phase-2-supabase-foundation`) và thiết lập thư mục làm việc chuẩn xác để mọi thay đổi từ Phase 2.2 trở đi được kiểm soát bằng Git Commit rõ ràng.
2. **BLOCKER 2: Khởi tạo Supabase Project Môi trường Phát triển (Development/Staging):**
   - **Hiện trạng:** Chưa có Supabase Project nào được kết nối; chưa có biến môi trường.
   - **Yêu cầu:** Product Owner khởi tạo một Supabase Project mới (môi trường Dev), lấy các khóa truy cập an toàn và đưa vào tệp `.env.local` (tuyệt đối không đưa vào Git hay tài liệu công khai):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
3. **BLOCKER 3: Phê duyệt Chính thức Phương án Xác thực Học sinh (ADR-01):**
   - **Hiện trạng:** Đề xuất Phương án B (Tên đăng nhập nội bộ) đã sẵn sàng nhưng cần PO gật đầu để đội ngũ tiến hành sinh mã script DDL và hàm cấp tài khoản hàng loạt cho lớp học.

---

## 4. BỘ 12 KỊCH BẢN KIỂM THỬ CHẤP NHẬN THIẾT KẾ (ACCEPTANCE TEST DESIGNS)

Bộ kịch bản kiểm thử thiết kế được xây dựng làm tiêu chí nghiệm thu tự động cho các giai đoạn lập trình tiếp theo (Phase 2.2 đến 2.6):

| Mã Test | Tên kịch bản kiểm thử | Mô tả hành vi & Điều kiện đầu vào | Kết quả mong đợi (Expected Outcome) | Giai đoạn kiểm thử |
| :---: | :--- | :--- | :--- | :---: |
| **TEST-01** | **Điểm danh khi đã đạt trần XP ngày** | Học sinh đã học tích cực và đạt trần ngày (130 hoặc 150 XP), sau đó bấm nút "Điểm danh". | Bản ghi `attendance_records` được tạo; `streak_days` tăng; `xp_ledger` ghi nhận `raw_xp = 2`, `actual_xp = 0`. Thông báo: *"Điểm danh thành công nhưng đã chạm trần XP hôm nay"*. | Phase 2.5 |
| **TEST-02** | **Chống gian lận hai request điểm danh đồng thời** | Học sinh mở hai tab trình duyệt và bấm "Điểm danh" cùng một giây hoặc kích hoạt mạng song song. | Chỉ duy nhất 1 giao dịch thành công (nhận XP nếu còn trần). Request thứ 2 bị chặn bởi ràng buộc `UNIQUE (student_id, attendance_date)` và trả về lỗi an toàn `ALREADY_CLAIMED_TODAY`. | Phase 2.5 |
| **TEST-03** | **Nộp cùng một attempt hai lần (Double Submit)** | Học sinh kích đúp nhanh nút "Nộp bài" hoặc gửi lại request nộp bài cho một lượt làm bài đã ở trạng thái `submitted`. | Lượt nộp đầu tiên xử lý chấm điểm và ghi XP. Lượt nộp thứ 2 bị chặn bởi kiểm tra `status = 'in_progress'` và Idempotency key, không tính điểm lần hai và không cộng trùng XP. | Phase 2.4 |
| **TEST-04** | **Giáo viên chấm lại bài tự luận lần 2 (Regrading)** | Giáo viên vào sửa điểm và nhận xét cho bài tự luận đã chấm trước đó (`review_round = 2`). | Bản ghi `essay_teacher_reviews` ghi nhận vòng chấm mới; bản ghi `mastery_evidence` được cập nhật theo `essay_submission_id` cũ, **tuyệt đối không sinh thêm bản ghi bằng chứng thứ 2** làm sai lệch trung bình năng lực. | Phase 2.4 |
| **TEST-05** | **Tạo Quiz v2 khi học sinh đang làm dở v1** | Học sinh A đang làm bài thi v1. Giáo viên ở tài khoản khác bấm xuất bản phiên bản v2 cho đề thi đó. Học sinh A bấm F5 rồi nộp bài. | F5 khôi phục đúng đề bài v1; khi nộp bài hệ thống đối soát với `secure_answer_keys` của v1; kết quả bài thi gắn cứng với `quiz_versions (v1)`, không bị lỗi hay nhảy đề. | Phase 2.4 |
| **TEST-06** | **Kiểm tra an ninh mạng trình duyệt (Network Inspector Audit)** | Học sinh mở DevTools tab Network khi tải đề thi Quiz và khi làm bài tự luận có AI chấm gợi ý. | Trong gói tin tải về: Không chứa trường `correct_answer_payload` hay đáp án đúng; bảng `essay_ai_evaluations` bị chặn quyền SELECT, không có bất kỳ thông tin điểm gợi ý AI nào lộ ra client. | Phase 2.3 & 2.4 |
| **TEST-07** | **Cách ly dữ liệu liên lớp học (Multi-tenant RLS)** | Học sinh lớp 7A2 truy vấn danh sách học sinh hoặc bài kiểm tra được giao riêng cho lớp 7A3. | RLS trả về mảng rỗng `[]`; không thể đọc được tên, điểm số, bài làm hoặc đề thi của học sinh lớp khác. | Phase 2.2 & 2.3 |
| **TEST-08** | **F5 làm mới trình duyệt khi đang thi** | Học sinh đang làm bài thi có giới hạn 15 phút, đã trôi qua 5 phút thì bấm F5 tải lại trang. | Toàn bộ câu trả lời đã tích được khôi phục nguyên vẹn; đồng hồ đếm ngược hiển thị đúng 10 phút còn lại (tính toán dựa trên `started_at` phía server, không reset về 15 phút). | Phase 2.4 |
| **TEST-09** | **Xác minh xem Video khi Player không track được** | Video được nhúng qua nền tảng bên ngoài không thể gửi về mảng `watched_intervals` hợp lệ. | Hệ thống chuyển sang cơ chế xác minh thay thế: Yêu cầu học sinh làm một bài kiểm tra ngắn 3 câu trọng tâm (Quick Check) đạt $\ge 80\%$ để được công nhận hoàn thành bài học. | Phase 2.5 |
| **TEST-10** | **Cô lập hoàn toàn Analytics Demo và Production** | Giáo viên thực hiện thao tác xem báo cáo tiến độ học tập trên trang Quản lý Lớp học thật. | Kết quả thống kê chỉ tổng hợp từ dữ liệu học sinh thật trong lớp; các bài làm của tài khoản seed demo (`hs001`, lớp thử nghiệm) không xuất hiện trong báo cáo. | Phase 2.6 |
| **TEST-11** | **Chống Race Condition khi thi giới hạn lượt** | Bài kiểm tra chính thức chỉ cho phép làm tối đa 1 lượt (`max_attempts = 1`). Học sinh cố tình gửi 2 request tạo attempt đồng thời. | Cơ sở dữ liệu sử dụng khóa giao dịch hoặc chỉ mục ràng buộc đảm bảo chỉ có duy nhất 1 attempt được khởi tạo; request song song bị từ chối với lỗi `MAX_ATTEMPTS_EXCEEDED`. | Phase 2.4 |
| **TEST-12** | **Truy cập học liệu lưu trữ (Archived Content Retention)** | Giáo viên chuyển một chủ đề cũ sang trạng thái `archived`. Học sinh mới vào hệ thống tìm kiếm; học sinh cũ đã học chủ đề đó mở lại lịch sử. | Học sinh mới không nhìn thấy chủ đề trong danh mục bài học; học sinh cũ mở phần "Nhật ký học tập" vẫn có thể xem lại bài giảng và các câu hỏi mình đã hoàn thành. | Phase 2.3 |

---

## 5. KHUYẾN NGHỊ CUỐI CÙNG CHO GATE REVIEW (GO / NO-GO RECOMMENDATION)

| Tiêu chuẩn Đánh giá Gate | Kết quả kiểm tra | Đánh giá |
| :--- | :--- | :---: |
| **1. Tính toàn vẹn Nghiệp vụ** | 11 Business Rules được bảo toàn 100%; ADR-08 được tích hợp chuẩn xác. | **PASS** |
| **2. Độ hoàn thiện Schema DDL** | 34 bảng dữ liệu logic đã được đối soát, chuẩn hóa kiểu dữ liệu và ràng buộc khóa ngoại. | **PASS** |
| **3. Mô hình An ninh & RLS** | Đã xử lý giới hạn không giấu cột của PostgreSQL bằng cách tách bảng vật lý; Zero-Trust RPC. | **PASS** |
| **4. Kịch bản Kiểm thử Nghiệm thu** | 12 kịch bản Acceptance Tests chi tiết đã sẵn sàng cho QA. | **PASS** |
| **5. Rào cản Môi trường Git & Supabase** | **Chưa có Git repo chính thức (.git); Chưa có Supabase Dev Project; Chưa phê duyệt ADR-01.** | **BLOCKED** |

### KẾT LUẬN CỦA TECHNICAL LEAD & ARCHITECT:
> **KHUYẾN NGHỊ: `CONDITIONAL NO-GO FOR CODING` – `READY FOR ENVIRONMENT SETUP`**
> 
> Giai đoạn thiết kế Phase 2.1 đã hoàn tất xuất sắc 100% về mặt lý thuyết và tài liệu đặc tả kỹ thuật. Tuy nhiên, để tuân thủ quy tắc bảo vệ source code và đảm bảo chất lượng kỹ thuật cao nhất:
> 
> **Tuyệt đối KHÔNG viết mã nguồn hoặc chạy script SQL lên môi trường không xác định.**
> 
> **HÀNH ĐỘNG TIẾP THEO DÀNH CHO PRODUCT OWNER:**
> 1. Thiết lập thư mục làm việc trên Git Repository chính thức.
> 2. Khởi tạo một Supabase Project mới cho môi trường Dev/Staging và cấu hình `.env.local`.
> 3. Phê duyệt chính thức **ADR-01 (Phương án B: Tên đăng nhập nội bộ cho học sinh lớp 7)**.
> 
> *Ngay sau khi Product Owner hoàn tất 3 bước trên, dự án sẽ chính thức chuyển sang Phase 2.2 (Lập trình Schema Domain A và thiết lập Supabase Auth Foundation).*

---
**BÁO CÁO CỔNG PHÊ DUYỆT ĐẾN ĐÂY LÀ KẾT THÚC. KÍNH TRÌNH PRODUCT OWNER PHÊ DUYỆT.**
