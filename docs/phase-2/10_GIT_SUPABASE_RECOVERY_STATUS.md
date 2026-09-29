# MẦM VĂN – PHASE 2.1 / 2.2
# BÁO CÁO KIỂM SOÁT TRẠNG THÁI THỰC TẾ DỰ ÁN
## (GIT WORKSPACE, SUPABASE INTEGRATION, ADR-01 & SAFETY AUDIT)

---

## THÔNG TIN TỔNG QUAN (EXECUTIVE METADATA)

| Tiêu chí | Thông tin ghi nhận thực tế |
| :--- | :--- |
| **Dự án** | Mầm Văn – Nền tảng Học Ngữ văn Lớp 7 (EdTech) |
| **Workspace Git kiểm tra** | `e:\APP_Education\MamVan_Git_Workspace` |
| **Thời điểm kiểm tra** | 2026-09-29 11:15 (Giờ hệ thống) |
| **Mục đích tài liệu** | Báo cáo kiểm định độc lập, khách quan 100% dựa trên lệnh hệ thống thực tế để bàn giao cho Product Owner và chuyển tiếp cho ChatGPT hỗ trợ Phase 2.2 |
| **Nguyên tắc kiểm tra** | **READ-ONLY AUDIT**: Không chỉnh sửa mã nguồn, không tự ý commit/push, không chạy migration, không tác động cơ sở dữ liệu Supabase, che giấu toàn bộ API key/mật khẩu |

---

## 1. KIỂM TOÁN TRẠNG THÁI GIT (GIT REPOSITORY AUDIT)

### 1.1. Workspace Git chính thức
- **Đường dẫn thư mục đang hoạt động:** [MamVan_Git_Workspace](file:///e:/APP_Education/MamVan_Git_Workspace)
- **Thư mục ZIP đối chiếu ban đầu:** [MamVan_Education-main](file:///e:/APP_Education/MamVan_Education-main/MamVan_Education-main) và tệp nén `MamVan_Education-main.zip` (được bảo tồn nguyên vẹn 100%, không bị xóa hay sửa đổi).

### 1.2. Branch, Commit Hash, Remote Origin & Git Status
Kết quả kiểm tra trực tiếp từ `git`:

```text
$ git status
On branch chore/phase-2-2-foundation-preparation
Your branch is up to date with 'origin/chore/phase-2-2-foundation-preparation'.
nothing to commit, working tree clean

$ git remote -v
origin  https://github.com/DuongDADEV/MamVan_Education.git (fetch)
origin  https://github.com/DuongDADEV/MamVan_Education.git (push)
```

- **Branch hiện tại:** `chore/phase-2-2-foundation-preparation`
- **Tình trạng đồng bộ:** Nhánh local đang đồng bộ 1:1 với `origin/chore/phase-2-2-foundation-preparation` trên GitHub.
- **Trạng thái Working Tree:** Hoàn toàn sạch (`working tree clean`), không có tệp nào bị sửa đổi dở dang.

### 1.3. Lịch sử Commit và các tệp đã Commit & Push thành công
Nhánh làm việc gồm 3 commits (1 commit base trên `main` và 2 commits trên nhánh chuẩn bị):

| STT | Commit Hash | Tiêu đề Commit | Chi tiết tệp đã commit & push |
| :---: | :---: | :--- | :--- |
| 1 | `d3018c5` | `chore: initialize MamVan project baseline before Supabase integration` | **123 files** (Toàn bộ mã nguồn ứng dụng, mock data, tests, scripts, public assets gốc từ dự án Mầm Văn). Commit này nằm trên nhánh `main` và làm gốc rẽ nhánh. |
| 2 | `38389f4` | `docs(phase-2): reconcile architecture and prepare supabase foundation` | **21 files**:<br/>- 5 tệp tài liệu kiểm toán dữ liệu Phase 1 (`docs/phase-1/*`)<br/>- 15 tệp thiết kế kiến trúc Phase 2 (`docs/phase-2/*`) bao gồm cả phiên bản v1.0 và v1.1<br/>- [`.env.example`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.example) (bổ sung placeholder Supabase) |
| 3 | `03eac0d` (HEAD) | `chore(supabase): initialize development configuration` | **4 files**:<br/>- [`package.json`](file:///e:/APP_Education/MamVan_Git_Workspace/package.json) (thêm `supabase: ^2.118.0` vào `devDependencies`)<br/>- `package-lock.json`<br/>- [`supabase/.gitignore`](file:///e:/APP_Education/MamVan_Git_Workspace/supabase/.gitignore)<br/>- [`supabase/config.toml`](file:///e:/APP_Education/MamVan_Git_Workspace/supabase/config.toml) |

> [!NOTE]
> Cả 3 commit trên đã được push thành công lên remote GitHub `origin/chore/phase-2-2-foundation-preparation`. Không có commit nào bị treo ở local.

### 1.4. Đối chiếu mã nguồn Git với bản ZIP giải nén cũ (Code Reconciliation)
Đã thực hiện so sánh nội dung từng ký tự (checksum & content diff) giữa toàn bộ thư mục `src/` của Git workspace với thư mục `src/` giải nén từ bản ZIP:

- **Số lượng tệp trong `src/` của Git workspace:** 105 tệp.
- **Số lượng tệp trong `src/` của bản ZIP:** 105 tệp.
- **Số lượng tệp khác biệt nội dung trong `src/`:** **0 tệp (Giống nhau 100%)**.
- **Khác biệt tại thư mục gốc (Root):**
  - [`.env.example`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.example): Git workspace có thêm dòng placeholder Supabase URL và Publishable Key.
  - [`.env.local`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.local): Chỉ có tại Git workspace (được gitignore).
  - [`package.json`](file:///e:/APP_Education/MamVan_Git_Workspace/package.json) & `package-lock.json`: Git workspace có thêm công cụ CLI `supabase: ^2.118.0` ở `devDependencies`.
  - Thư mục [`supabase/`](file:///e:/APP_Education/MamVan_Git_Workspace/supabase): Chỉ có tại Git workspace.
  - Thư mục [`docs/`](file:///e:/APP_Education/MamVan_Git_Workspace/docs): Chứa bộ tài liệu thiết kế Phase 1 và Phase 2.

### 1.5. Thay đổi chưa commit hoặc chưa push
- **Thay đổi chưa commit (Uncommitted changes):** **KHÔNG CÓ (0)**.
- **Commit chưa push (Unpushed commits):** **KHÔNG CÓ (0)**.

---

## 2. KIỂM TOÁN TÌNH TRẠNG SUPABASE (SUPABASE STATUS AUDIT)

### 2.1. Khởi tạo Supabase CLI & Liên kết Dự án (Linking)
- **Cài đặt Supabase CLI:** **ĐÃ CÀI ĐẶT** trong `devDependencies` (`supabase: ^2.118.0`).
- **Khởi tạo cấu hình Local:** **ĐÃ KHỞI TẠO** qua `npx supabase init`. Tệp cấu hình [`supabase/config.toml`](file:///e:/APP_Education/MamVan_Git_Workspace/supabase/config.toml) và [`supabase/.gitignore`](file:///e:/APP_Education/MamVan_Git_Workspace/supabase/.gitignore) đã sẵn sàng.
- **Liên kết Project remote `mamvan-dev` (Project Ref: `rhtyxtjqwwbipkbbwvzc`):** **CHƯA LIÊN KẾT (NOT LINKED)**.
  - *Bằng chứng kiểm tra thực tế:*
    1. Tệp `supabase/.temp/project-ref` **chưa tồn tại** (`Test-Path` trả về `False`).
    2. Chạy lệnh kiểm tra `npx supabase projects list` trả về mã lỗi:
       `AccessTokenRequiredError: Access token not provided. Supply an access token by running 'supabase login' or setting the SUPABASE_ACCESS_TOKEN environment variable.`
    3. Điều này xác nhận máy trạm hiện tại chưa được đăng nhập tài khoản Supabase của Product Owner và chưa thực hiện lệnh `supabase link`.

### 2.2. Kiểm tra `.env.local`, `.env.example` và `.gitignore`
- **[`.env.example`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.example):**
  - Chứa mẫu cấu hình công khai:
    ```ini
    # Supabase Configuration (mamvan-dev)
    VITE_SUPABASE_URL=https://rhtyxtjqwwbipkbbwvzc.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key_here

    # AI Service Configuration
    GEMINI_API_KEY=
    ```
- **[`.env.local`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.local):**
  - Tệp tồn tại ở root của Git workspace.
  - Biến `VITE_SUPABASE_URL` đã trỏ đúng domain project: `https://rhtyxtjqwwbipkbbwvzc.supabase.co`.
  - Biến `VITE_SUPABASE_PUBLISHABLE_KEY` **vẫn đang ở giá trị placeholder** (`your_supabase_publishable_anon_key_here`), chưa được thay bằng Anon Key thật.
- **[`.gitignore`](file:///e:/APP_Education/MamVan_Git_Workspace/.gitignore):**
  - Đã có quy tắc:
    ```gitignore
    # Environment files
    .env
    .env.*
    !.env.example
    ```
  - Kiểm tra an toàn: Lệnh `git check-ignore -v .env.local` xác nhận tệp `.env.local` được bỏ qua bởi dòng 11 của `.gitignore`. Không có nguy cơ rò rỉ secret lên Git.

### 2.3. Kiểm tra cài đặt thư viện `@supabase/supabase-js`
- **Kết quả:** **CHƯA CÀI ĐẶT (NOT INSTALLED)**.
- *Bằng chứng thực tế:*
  - Trong [`package.json`](file:///e:/APP_Education/MamVan_Git_Workspace/package.json), mục `dependencies` không có `@supabase/supabase-js`.
  - Chạy `npm list @supabase/supabase-js` trả về: `(empty)`.
  - Gói duy nhất liên quan đến Supabase hiện có là CLI trong `devDependencies`.

### 2.4. Kiểm tra Database: Bảng, Migration, RLS và Supabase Client trong Source
- **Thư mục migration:** Thư mục `supabase/migrations/` **chưa tồn tại**. Số lượng tệp `.sql` trong toàn bộ workspace là **0**.
- **Tạo bảng trên Remote Database:** **CHƯA TẠO BẢNG**. Cơ sở dữ liệu remote `mamvan-dev` chưa chạy bất kỳ kịch bản DDL nào từ local CLI.
- **RLS (Row-Level Security) trên Database:** **CHƯA THIẾT LẬP TRÊN DB**. Các chính sách RLS hiện mới chỉ tồn tại ở dạng tài liệu đặc tả thiết kế kỹ thuật tại [`docs/phase-2/04_AUTHENTICATION_AND_RLS_DESIGN_V1.1.md`](file:///e:/APP_Education/MamVan_Git_Workspace/docs/phase-2/04_AUTHENTICATION_AND_RLS_DESIGN_V1.1.md).
- **Kết nối Supabase Client trong source code:** **CHƯA KẾT NỐI**.
  - Thư mục [`src/services/supabase/`](file:///e:/APP_Education/MamVan_Git_Workspace/src/services/supabase) hiện chỉ có tệp thiết kế [`README.md`](file:///e:/APP_Education/MamVan_Git_Workspace/src/services/supabase/README.md), hoàn toàn không có mã nguồn `.ts`.
  - Tệp điều hướng dịch vụ [`src/services/index.ts`](file:///e:/APP_Education/MamVan_Git_Workspace/src/services/index.ts) vẫn đang xuất các mock repository (`authRepo`, `classRepo`, `studentRepo`,...) chạy trên LocalStorage và BroadcastChannel.

---

## 3. ĐỐI CHIẾU THIẾT KẾ XÁC THỰC ADR-01 & CÁC QUYẾT ĐỊNH MỞ

### 3.1. Xác nhận cập nhật mô hình đăng nhập trong tài liệu
Mô hình đăng nhập do Product Owner phê duyệt đã được đồng bộ chính thức vào 2 tài liệu quy chuẩn kiến trúc:
1. [`docs/phase-2/04_AUTHENTICATION_AND_RLS_DESIGN_V1.1.md`](file:///e:/APP_Education/MamVan_Git_Workspace/docs/phase-2/04_AUTHENTICATION_AND_RLS_DESIGN_V1.1.md) (Mục 1, 2, 3, 4).
2. [`docs/phase-2/07_OPEN_ARCHITECTURE_DECISIONS_V1.1.md`](file:///e:/APP_Education/MamVan_Git_Workspace/docs/phase-2/07_OPEN_ARCHITECTURE_DECISIONS_V1.1.md) (Bảng mục 2, dòng ADR-01).

**Nội dung cốt lõi đã được ghi nhận thành quy chuẩn bắt buộc:**
- **Giáo viên:** Tự đăng ký bằng Email và Mật khẩu qua giao diện (`supabase.auth.signUp()`). Khi mới đăng ký, tài khoản chưa được phân quyền truy cập học sinh cho đến khi được phê duyệt quyền phụ trách lớp học cụ thể (`classes.teacher_id`) từ hệ thống tin cậy. (Google Login dành cho tương lai).
- **Học sinh:** **Tuyệt đối không có form tự đăng ký công khai**. Giáo viên có thẩm quyền khởi tạo tài khoản học sinh theo danh sách lớp và cấp phát Username + Mật khẩu tạm thời. Học sinh chỉ thực hiện Đăng nhập và bắt buộc đổi mật khẩu lần đầu. Không bắt buộc học sinh phải có email hay số điện thoại cá nhân.
- **Phụ huynh:** Tài khoản độc lập, liên kết với học sinh, không dùng chung mật khẩu. **Không triển khai trong Phase 2.2** (dành cho Phase 3+).
- **Kiến trúc an ninh:** Cấp phát tài khoản học sinh (`auth.admin.createUser`) bắt buộc chạy qua **Supabase Edge Function** phía server tin cậy với `service_role` key. Tuyệt đối không nhúng Service Role Key vào React Client. Sử dụng cơ chế mapping định danh kỹ thuật nội bộ (`<hs_code>@student.mamvan.edu.vn`) không nhận thư thật và không dùng để gửi email kích hoạt/reset.

### 3.2. Danh mục 9 quyết định kiến trúc còn mở (Open ADRs)
Theo tài liệu [`docs/phase-2/07_OPEN_ARCHITECTURE_DECISIONS_V1.1.md`](file:///e:/APP_Education/MamVan_Git_Workspace/docs/phase-2/07_OPEN_ARCHITECTURE_DECISIONS_V1.1.md), hiện có 2 quyết định đã phê duyệt chính thức (**ADR-01** và **ADR-08**), còn lại 9 quyết định kỹ thuật đang mở với lộ trình chốt như sau:

| Mã ADR | Tiêu đề quyết định | Trạng thái kỹ thuật | Phương án đề xuất | Giai đoạn chặn bắt buộc (Blocking Phase) |
| :---: | :--- | :---: | :--- | :---: |
| **ADR-02** | Quản lý phiên bản bất biến (Content Versioning) | `PROPOSED DESIGN` | Mô hình 3 cấp: `quiz_versions`, `question_versions`, `quiz_version_questions`. Bản Published bất biến. | **Phase 2.3** |
| **ADR-03** | Hạ tầng lưu trữ Video | `PENDING EVALUATION` | MVP dùng YouTube Unlisted (nhúng iframe an toàn); chuẩn bị sẵn adapter Supabase Storage. | **Phase 2.3** |
| **ADR-04** | Lưu trữ & Xác minh xem Video | `PROPOSED DESIGN` | Hợp nhất khoảng thời gian xem `watched_intervals` phía server; kiểm tra $\ge 80\%$ thời lượng thực tế (BR-11). | **Phase 2.5** |
| **ADR-05** | Auto-save & Server Timer bài thi Quiz | `PROPOSED DESIGN` | Client debounce 500ms lưu LocalStorage; đồng bộ ngầm; timer tính từ `started_at` server + 30s độ trễ mạng. | **Phase 2.4** |
| **ADR-06** | Tần suất tính Mastery Snapshot | `PROPOSED DESIGN` | Event-driven: Tính toán và cập nhật cây năng lực ngay khi nộp quiz hoặc chốt điểm bài viết. | **Phase 2.4** |
| **ADR-07** | Lưu trữ dữ liệu & Bảo vệ dữ liệu trẻ em | `PROPOSED DESIGN` | Tuân thủ Nghị định 13/2023/NĐ-CP; lưu hồ sơ thi 5 năm; ẩn danh hóa sau 12 tháng không hoạt động; cấm xóa CASCADE. | **Trước Production** |
| **ADR-09** | Đồng hồ đếm ngược & Deadline nộp bài | `PROPOSED DESIGN` | Server-authoritative timer: quá deadline + 30s ghi nhận trạng thái `timed_out`. | **Phase 2.4** |
| **ADR-10** | Cô lập môi trường Demo / Production | `PROPOSED DESIGN` | Hai Supabase Project độc lập hoàn toàn để không làm ô nhiễm dữ liệu Analytics (BR-06). | **Phase 2.2** (trước khi seed) |
| **ADR-11** | Bảo vệ Đáp án đúng & Quà bí mật | `PROPOSED DESIGN` | Tách bảng vật lý `secure_answer_keys` và `reward_secrets`, cấm học sinh SELECT; mở qua RPC Stored Procedure. | **Phase 2.2** (DDL Domain A) / **Phase 2.3** |

---

## 4. BÁO CÁO KIỂM TOÁN AN TOÀN (SAFETY AUDIT)

| Tiêu chí an toàn | Kết quả kiểm toán | Bằng chứng kiểm tra thực tế |
| :--- | :---: | :--- |
| **1. Mã nguồn ngoài phạm vi có bị sửa đổi không?** | **AN TOÀN TUYỆT ĐỐI (KHÔNG)** | Toàn bộ 105 tệp trong thư mục `src/` trùng khớp 100% với bản ZIP gốc. Không có bất kỳ logic màn hình hay business logic nào bị can thiệp. |
| **2. Có Secret / API Key nào bị Git theo dõi không?** | **AN TOÀN TUYỆT ĐỐI (KHÔNG)** | Đã quét toàn bộ lịch sử commit (`git log -p`) và lệnh `git check-ignore`. Tệp `.env.local` đã bị gitignore chặn. Trong Git chỉ có placeholder công khai, không có Service Role Key, JWT secret, Database password hay API key thật nào. |
| **3. Có dữ liệu hoặc Database nào bị thay đổi không?** | **AN TOÀN TUYỆT ĐỐI (KHÔNG)** | Chưa chạy Docker Supabase local (`supabase start`), chưa liên kết remote project (`supabase link`), chưa tạo bảng hay thực thi câu lệnh SQL/DDL nào lên project Supabase `rhtyxtjqwwbipkbbwvzc`. Dữ liệu remote hoàn toàn chưa bị tác động. |

---

## 5. KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO

### 5.1. Những việc ĐÃ HOÀN THÀNH (Kèm bằng chứng)
1. **Thiết lập Git Workspace chuẩn:** Thư mục [MamVan_Git_Workspace](file:///e:/APP_Education/MamVan_Git_Workspace) đã kết nối remote `https://github.com/DuongDADEV/MamVan_Education.git`.
2. **Branch & Commit đồng bộ lên GitHub:**
   - Tạo nhánh `chore/phase-2-2-foundation-preparation`.
   - Commit `38389f4`: Đồng bộ 21 tệp tài liệu đặc tả Phase 1 & Phase 2 v1.1.
   - Commit `03eac0d`: Bổ sung `supabase` CLI vào `devDependencies`, sinh `config.toml` và `.gitignore`.
   - Đã push đầy đủ lên GitHub remote.
3. **Đối chiếu bảo toàn mã nguồn gốc:** Xác nhận 105/105 tệp trong `src/` giống hệt bản ZIP gốc.
4. **Cấu hình an toàn môi trường:** Tạo file [`.env.local`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.local) chứa URL project, đảm bảo `.gitignore` che chắn an toàn.
5. **Cập nhật hồ sơ kiến trúc ADR-01 & ADR-08:** Hoàn tất văn bản hóa mô hình xác thực tài khoản giáo viên/học sinh và trần XP điểm danh theo đúng phê duyệt của Product Owner.

### 5.2. Những việc CHƯA HOÀN THÀNH
1. Chưa điền Publishable Anon Key thật của `mamvan-dev` vào `.env.local`.
2. Chưa thực hiện đăng nhập tài khoản Supabase trên máy (`supabase login`).
3. Chưa liên kết CLI với remote project `rhtyxtjqwwbipkbbwvzc` (`supabase link`).
4. Chưa cài đặt thư viện client `@supabase/supabase-js` trong `package.json`.
5. Chưa viết tệp migration DDL ban đầu và chưa tạo bảng trên Supabase.
6. Chưa tạo tệp khởi tạo kết nối Supabase client (`client.ts`) trong mã nguồn `src/`.

### 5.3. Thao tác Product Owner cần tự thực hiện
Vì lý do bảo mật tài khoản và xác thực hai lớp (2FA/Browser OTP), AI không được phép và không thể can thiệp vào tài khoản cá nhân của bạn. Product Owner cần tự thực hiện 3 thao tác đơn giản sau:

1. **Cập nhật Publishable Key thật:**
   - Truy cập **Supabase Dashboard** > Project `mamvan-dev` (`rhtyxtjqwwbipkbbwvzc`) > **Project Settings** > **API**.
   - Copy mã `anon public` key.
   - Mở tệp [`.env.local`](file:///e:/APP_Education/MamVan_Git_Workspace/.env.local) và dán thay thế cho chuỗi `your_supabase_publishable_anon_key_here`.
2. **Đăng nhập Supabase CLI:**
   - Mở terminal tại thư mục `e:\APP_Education\MamVan_Git_Workspace` và gõ:
     ```bash
     npx supabase login
     ```
   - Trình duyệt sẽ mở ra để bạn nhấn nút chấp thuận cấp Access Token cho CLI một cách an toàn.
3. **Liên kết CLI với Project Remote:**
   - Trong cùng terminal, chạy lệnh:
     ```bash
     npx supabase link --project-ref rhtyxtjqwwbipkbbwvzc
     ```
   - Nhập **Database Password** của dự án `mamvan-dev` khi terminal yêu cầu.

### 5.4. Đánh giá điều kiện bắt đầu Phase 2.2
- **Tình trạng:** **CHƯA ĐỦ ĐIỀU KIỆN (NEAR READY - WAITING FOR PO AUTHENTICATION)**.
- **Lý do:** Phần việc của nhà phát triển và chuẩn bị cấu trúc đã đạt 100%. Tuy nhiên, cổng liên kết dự án (CLI Link & API Key) là điều kiện tiên quyết bắt buộc phải do Product Owner thực hiện trước khi có thể chạy bất kỳ lệnh migration nào.

### 5.5. Đề xuất chính xác bước tiếp theo sau khi PO hoàn tất xác thực
Ngay sau khi Product Owner hoàn thành 3 bước tại mục 5.3, bước thực thi đầu tiên của Phase 2.2 sẽ là:

1. **Cài đặt Client SDK:**
   ```bash
   npm install @supabase/supabase-js
   ```
2. **Tạo Migration DDL đầu tiên (Domain A: Identity & Classroom Management):**
   - Chạy lệnh: `npx supabase migration new init_domain_a_identity_and_classes`
   - Viết DDL tạo các bảng: `user_profiles`, `user_roles`, `teacher_profiles`, `student_profiles`, `classes`, `class_memberships`.
   - Áp dụng chính sách RLS theo đúng ma trận tại [`docs/phase-2/04_AUTHENTICATION_AND_RLS_DESIGN_V1.1.md`](file:///e:/APP_Education/MamVan_Git_Workspace/docs/phase-2/04_AUTHENTICATION_AND_RLS_DESIGN_V1.1.md).
3. **Đẩy migration lên Supabase Remote:**
   ```bash
   npx supabase db push
   ```
4. **Khởi tạo Supabase Client:**
   - Tạo `src/services/supabase/client.ts` kết nối biến môi trường an toàn từ `import.meta.env`.
   - Bắt đầu chuyển dịch từng Repository từ Mock sang Supabase Adapter.
