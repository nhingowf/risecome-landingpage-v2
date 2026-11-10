# Tự sửa website Rise Ads

Website là HTML tĩnh, có hai cách sửa:

1. **Qua trang quản trị `risecom.vn/admin`** (không cần biết lập trình): đăng và sửa bài blog, sửa thông tin dùng chung (số Zalo, địa chỉ, giờ làm việc, số liệu nổi bật, giá vé và lịch workshop). Hướng dẫn: `docs/HUONG-DAN-DANG-BAI-BLOG.md`.
2. **Sửa file trong thư mục `src/`** (cần VS Code, cho người sửa nội dung trang): sửa câu chữ cố định, thêm khối, đổi bố cục.

## 1. Việc nào làm ở đâu

| Muốn làm | Làm ở đâu |
|---|---|
| Đăng, sửa, ẩn, xoá bài blog | `risecom.vn/admin` → **Bài blog** |
| Đổi số Zalo, địa chỉ, giờ làm việc | `risecom.vn/admin` → **Thông tin website** → Liên hệ chung |
| Đổi các số liệu nổi bật (74+, 560+, 100+, 17 ngành, 43 nhánh, 14,27×, 5 tỷ) | `risecom.vn/admin` → **Thông tin website** → Số liệu nổi bật |
| Đổi học phí, giá nhóm, số Zalo, lịch của workshop | `risecom.vn/admin` → **Thông tin website** → Workshop GMV Max |
| Sửa một câu chữ cố định trên trang chính | Sửa file trong `src/` (mục 3), rồi dựng lại |
| Thêm khối, đổi bố cục, đổi ảnh, thêm brand | Sửa file trong `src/` hoặc thư mục `assets/` |

Mọi thay đổi ở trang quản trị tự lên web sau 1 đến 3 phút. Chi tiết cách hoạt động ở `docs/CAI-DAT-CMS-CHO-DEV.md`.

## 2. File nào là gì

| File hoặc thư mục | Là gì | Sửa tay? |
|---|---|---|
| `src/*.html` | **7 trang chính** (Trang chủ, Công ty, Dịch vụ, Shopee Ads, Khách hàng, Workshop, Liên hệ). Có các ô điền kiểu `{{zalo_display}}` lấy thông tin từ trang quản trị | **Có**, đây là nơi sửa chữ cố định |
| `index.html`, `company.html`, `services.html`, `shopee-ads.html`, `clients.html`, `workshop.html`, `contact.html` | Bản dựng từ `src/`. Đây là file thật chạy trên web | **Không**, lần dựng sau sẽ ghi đè |
| `content/settings/site.json` | Thông tin dùng chung, sửa qua trang quản trị | Qua trang quản trị |
| `content/blog/*.json` | Mỗi bài blog một file | Qua trang quản trị |
| `blog.html`, `blog-*.html`, `sitemap.xml` | Tự sinh từ `content/blog` | Không |
| `admin/` | Trang quản trị (Decap CMS) và 2 file đăng nhập GitHub | Chỉ dev |
| `tools/build_site.py` | Bộ dựng cả website: `src/` + thông tin chung + blog | Chỉ dev |
| `docs/` | Hướng dẫn đăng bài, hướng dẫn cài đặt cho dev | |
| `styles.css`, `app.js` | Giao diện và chức năng | Thường không cần đụng |
| `assets/` | Ảnh, logo | Có |
| `robots.txt` | Sửa tay nếu đổi tên miền | Có |

## 3. Sửa chữ cố định trên trang chính (dành cho người dùng VS Code)

1. Mở cả thư mục `site-v2.1` bằng **Visual Studio Code** (File › Open Folder). Không dùng Word. Notepad chỉ dùng được nếu lưu ở dạng UTF-8.
2. Tìm câu cần sửa trong **`src/`** (Ctrl + Shift + F). Sửa phần chữ nằm giữa hai thẻ, ví dụ giữa `<p>` và `</p>`. Không xoá thẻ và không đụng các chữ `{{...}}` (đó là ô lấy thông tin từ trang quản trị).
3. Dựng lại để file thật được cập nhật. Mở terminal trong thư mục `site-v2.1`, gõ:

```bash
python tools/build_site.py
```

4. Mở `index.html` bằng trình duyệt xem thử. Bấm **Ctrl + F5** để chắc chắn xem bản mới.
5. Đưa lên GitHub (commit và push). Hệ thống tự dựng lại và đưa lên hosting.

Nếu quên bước 3, thay đổi trong `src/` sẽ chưa hiện ở trang thật cho tới khi ai đó dựng lại. Khi đã nối với GitHub, bước dựng chạy tự động mỗi lần đưa lên, nên bước 3 chủ yếu để xem thử trên máy.

Mỗi file đọc từ trên xuống đúng thứ tự trang hiện ra. Mỗi khối có một dòng ghi chú `<!-- Tên khối -->` ở đầu để tìm nhanh.

## 4. Việc hay làm

**Sửa một con số dùng ở nhiều trang** (74+, 14,27×, 560+, 43, 100+, 17 ngành, 5 tỷ): vào trang quản trị, mục Thông tin website, đổi một lần là mọi trang đổi theo. Danh sách số chuẩn ở bảng A1 trong `02_Bo-noi-dung-chuan.md`. Chỉ đổi khi số mới đã được duyệt công khai.

**Workshop: ngày, giá, số Zalo.** Vào trang quản trị, mục Thông tin website, nhóm Workshop GMV Max. Có hai dòng lịch (đầu trang Workshop và phần Giữ chỗ). Máy tính hoàn học phí tự tính theo học phí mới.

**Header và footer** lặp lại trong 7 file `src/`. Muốn đổi menu hay chân trang thì sửa ở cả 7 file (Replace in Files, Ctrl + Shift + H, tìm nguyên văn đoạn cũ), rồi dựng lại. Các trang blog tự lấy header và footer từ `index.html` nên khớp theo.

**Sửa `styles.css` hoặc `app.js` mà trình duyệt vẫn hiện bản cũ.** Trình duyệt giữ bản cũ của hai file này. Mọi trang gọi chúng kèm số phiên bản (`styles.css?v=20261104e`). Sau khi sửa CSS hoặc JS, dùng Replace in Files đổi `20261104e` thành số mới (ví dụ `20261105a`) trên cả thư mục, rồi dựng lại. Trang nào cũng tải bản mới ngay, không cần Ctrl + F5.

**Đổi ảnh.** Chép ảnh mới vào `assets/workshop/`, đặt đúng tên file cũ (ví dụ `photo-1.jpg`) là thay xong. Ảnh lớp nên ngang tỷ lệ 4:3, ảnh giảng viên và ảnh đội ngũ vuông (ảnh đội ngũ ở `assets/team/`).

**Thêm hoặc bớt brand ở trang Khách hàng.** Trong `src/clients.html`, tìm `<ul class="brands"`, mỗi brand là một dòng `<li>Tên brand</li>`. Có logo thì đổi thành `<li><img src="assets/logos/ten-file.png" alt="Tên brand"></li>`. Trang chủ có bản rút gọn 15 brand, tìm cùng chữ `class="brands"` trong `src/index.html`.

**Nối form vào Google Sheet.** Mở `app.js`, 3 dòng đầu trong mục CẤU HÌNH GỬI FORM. Dán Web app URL vào `FORM_ENDPOINT`. Cách tạo URL trong `backend/HUONG-DAN-NOI-FORM.md`.

**Thêm một câu hỏi vào FAQ, một hàng vào danh sách.** Trong `src/`, chép nguyên một khối `<div>...</div>` (FAQ) hoặc `<li class="reveal">...</li>` có sẵn, dán ngay dưới, sửa chữ bên trong.

## 5. Không nên đụng

- Các chữ trong `class="..."`: đó là tên kiểu dáng, đổi là mất định dạng.
- Thuộc tính `data-...`, `id="..."`, `aria-...`: JS và link neo dựa vào đó.
- Các ô `{{...}}` trong `src/`: đó là chỗ trang quản trị đổ thông tin vào.
- Khối Command Center (`data-ui`), bộ chọn ngành (`data-picker`), máy tính (`data-calc`), form (`data-form`): sửa chữ bên trong được, không đổi cấu trúc.
- Số liệu vùng ROAS theo ngành nằm trong `app.js` (mảng `INDUSTRIES`). Chỉ có vùng và nhóm, không đưa số shop hay ROAS thật vào đây vì ai cũng đọc được file này.

## 6. Quy tắc giữ cho trang đẹp

- Tiêu đề H2 dưới 40 ký tự, H1 dưới 30 ký tự. Dài hơn sẽ xuống 3 dòng trên điện thoại.
- Không thêm màu mới, không thêm chữ in hoa cách chữ, không icon, không emoji.
- Thẻ trạng thái chỉ có 3 lớp: `tag-ok` (nhẹ), `tag-warn` (vừa), `tag-risk` (đậm), đều là xanh.
- Mỗi màn hình một nút chính, nút phụ là link chữ.

## 7. Đưa lên hosting

Cách chính: hệ thống tự đưa lên khi có thay đổi trên GitHub (xem `docs/CAI-DAT-CMS-CHO-DEV.md`). risecom.vn hiện chạy một ứng dụng Next.js nên trước khi triển khai lần đầu cần gỡ hoặc đổi thư mục gốc, việc này nhờ người đang quản trị hosting làm một lần.

Cách thủ công (khi chưa nối GitHub): dựng lại bằng `python tools/build_site.py`, rồi tải nội dung thư mục `site-v2.1` (trừ `_shots`, `src`, `content`, `tools`, `docs`, `backend`) lên thư mục gốc của hosting bằng FTP.

## 8. Trước khi đưa lên

- Mở file vừa sửa trong trình duyệt, thu nhỏ cửa sổ bằng điện thoại xem có vỡ không.
- Tìm toàn thư mục chữ `XÁC NHẬN`: còn là còn việc chưa chốt.
- Lưu lại một bản sao thư mục trước khi sửa lớn.
