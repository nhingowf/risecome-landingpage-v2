# Rise Ads Agency · website v2.1 · bàn giao dev

Dựng ngày 03/11/2026 từ `02_Bo-noi-dung-chuan.md` bản 2.1 (nội dung) và Phần I (spec hình thức, màu Mariner + quy tắc taste-skill).

## Cấu trúc

| File | Trang |
|---|---|
| `index.html` | Trang chủ: hero + Command Center, 3 bài toán, bộ chọn ngành (live thing), dịch vụ, 4 trụ cột, kết quả, giá trị, khách hàng, CTA |
| `company.html` | Công ty: câu chuyện, nền tảng vận hành, năng lực lõi, đội ngũ, 5 giá trị |
| `services.html` | Dịch vụ: Shopee Ads Management, Audit 1 lần, 3 năng lực, sắp ra mắt, phí (không giá), 7 ngày, chuẩn bị, FAQ |
| `shopee-ads.html` | Hub: bài toán, 8 hoạt động, 6 bước, 4 trụ cột (bảng 17 ngành), nhịp vận hành, hướng 2026, kết quả |
| `clients.html` | Khách hàng: portfolio + bảng ngành, 3 tab (38 brand, trọn gói, 42 shop Mall), 3 giai đoạn, 3 case |
| `contact.html` | Liên hệ: form đầy đủ, thông tin, chính sách bảo mật |
| `workshop.html` | Workshop Shopee GMV Max: landing bán vé, máy tính hoàn học phí, form giữ chỗ (service = workshop-gmv-max), 5 ảnh thật trong `assets/workshop/`. Chỗ cần chốt (ngày, giá vé, số Zalo, chức danh giảng viên) có HTML comment W1–W5, xem `03_Phan-tich-workshop.md` |
| `blog.html` + `blog-*.html` | Tab Blog để kéo impression (SEO) và engagement: trang danh sách có lọc chủ đề, tìm không dấu, form nhận bài qua email (service = blog-dang-ky); 6 bài mẫu có mục lục, tóm tắt, bảng, CTA, chia sẻ, bài liên quan, JSON-LD Article + BreadcrumbList. Ngày đăng 04/11/2026 và tác giả "Rise Ads" là dữ liệu mẫu. Kế hoạch nội dung: `04_Ke-hoach-blog.md` |
| `src/*.html` | **Nguồn thật của 7 trang chính** (index, company, services, shopee-ads, clients, contact, workshop), có ô điền `{{...}}`. Các file cùng tên ở thư mục gốc là bản dựng, đừng sửa tay |
| `content/settings/site.json` | Thông tin dùng chung (Zalo, địa chỉ, giờ làm việc, số liệu nổi bật, giá và lịch workshop), sửa ở `risecom.vn/admin` → Thông tin website |
| `tools/build_site.py` | Dựng cả website: `src/` + `content/settings` → 7 trang chính, rồi gọi `tools/build_blog.py` dựng blog |
| `content/blog/*.json`, `tools/build_blog.py` | Nguồn của Blog: mỗi bài một file JSON, bộ dựng sinh ra `blog.html`, `blog-*.html`, `sitemap.xml`. Chỉ dùng thư viện chuẩn Python |
| `admin/` | Trang soạn bài Decap CMS (`risecom.vn/admin`): `config.yml` (các ô nhập), `index.html`, `oauth/` (2 file PHP đăng nhập GitHub, `config.php` chứa khoá nằm riêng trên hosting) |
| `.github/workflows/deploy.yml` | Mỗi lần có bài mới: dựng blog rồi đưa lên hosting qua FTP/FTPS. Cần 4 secret FTP |
| `docs/` | `HUONG-DAN-DANG-BAI-BLOG.md` (cho người viết), `CAI-DAT-CMS-CHO-DEV.md` (cho dev, kèm tin nhắn mẫu) |
| `sitemap.xml` (tự sinh), `robots.txt` | Giả định tên miền `https://risecom.vn/`; đổi nếu tên miền khác |
| `styles.css` | Token màu, 5 cỡ chữ, lưới 12 cột, component |
| `app.js` | Menu, modal, bộ chọn ngành, tính ROAS, tabs, mục lục, chuyển động, gửi form |
| `favicon.svg` | Favicon tạm |
| `_shots/` | Ảnh chụp kiểm tra ở 1440px (Chrome headless) để Nhi xem không cần chạy server |

Mở thử tại máy: chạy `python -m http.server 8765` trong thư mục này rồi vào `http://127.0.0.1:8765`.

## Việc bắt buộc trước khi publish

1. **Nối form.** Phần nhận đã viết sẵn trong `backend/apps-script.gs` (Google Sheet + email báo PIC), làm theo `backend/HUONG-DAN-NOI-FORM.md` khoảng 10 phút, rồi dán Web app URL vào `FORM_ENDPOINT` trong `app.js`. Payload JSON: name, phone, email, service, industry, shop_url, shop_revenue, ads_spend, ads_revenue, issue, page, utm, ts, ua. Gửi dạng `text/plain` để không bị preflight với Apps Script; có đường lùi `no-cors` và thông báo thành công sau 8 giây nếu mạng chậm. Khi `FORM_ENDPOINT` trống, form chạy chế độ dự phòng: sao chép nội dung vào clipboard và mở Zalo, có thông báo rõ cho khách. Honeypot là ô `website_url`. Đã thử đường gửi với máy chủ giả lập: payload đủ trường, thông báo thành công hiện đúng, số điện thoại sai bị chặn.
2. **Ảnh thật** (taste-skill yêu cầu ít nhất 4 ảnh thật mỗi trang; hiện tại là 0, mọi "ảnh" đều là mảnh giao diện dựng bằng HTML có `data-ui`):
   - Ảnh chụp Command Center thật (ẩn tên shop) thay khối `data-ui` ở hero trang chủ.
   - Ảnh team, văn phòng 280B1 Lương Định Của, buổi review với khách.
   - Chân dung 5 thành viên thay ô chữ viết tắt ở `company.html`.
   - Logo 38 brand + 42 shop Mall, một tông, nền trong suốt: thay chữ trong `ul.brands` bằng `<img>` cao 40px. Theo quyết định 03/11, brand chưa có logo không hiện ở trang chủ; bản này tạm để chữ để trang không trống.
   - OG image 1200×630 cho mỗi trang vào thư mục `og/` (đã khai báo trong `<head>`).
3. **Số liệu chờ xác nhận** (xem Phần J của file 02): kỳ tính bảng ngành, cột "Vùng đề xuất", hệ số intent, 3.000+ shop Mall, bảng tuần Dincox, chức danh team, câu trả lời FAQ hợp đồng. Mọi chỗ liên quan có HTML comment `<!-- ... chờ Q... -->`.
4. **Redirect** `/pricing` → `/services.html#bat-dau` (301) nếu route cũ đã index.
5. **Kiểm định taste-skill.** Máy dựng không có Node 22 nên chưa chạy được `lint.mjs` và `inspect.mjs`. Dev chạy từ gốc dự án:
   `node <skill>/scripts/lint.mjs site-v2.1/` và `node <skill>/scripts/inspect.mjs site-v2.1/index.html`, sửa mọi FAIL ở 1440 / 768 / 390.

## Đã kiểm tra ở máy dựng

- Font Space Grotesk 500 và Be Vietnam Pro 400/500 nạp thật (document.fonts).
- Không tràn ngang ở 375px trên cả 6 trang; không tiêu đề nào quá 2 dòng ở 375px và 800px.
- Bộ chọn ngành, modal, tính ROAS trong form, tabs, menu điện thoại hoạt động; nội dung đầy đủ khi tắt JS (bảng tĩnh thay bộ chọn, 3 tab xếp dọc).
- Ảnh chụp 1440px toàn trang trong `_shots/`.

## Mức công khai số liệu (quyết định Nhi 03/11)

- Không đưa lên web: số shop theo ngành, tỷ trọng GMV, ROAS gộp và median theo ngành, GMV / Spend tuyệt đối, giá gói, mã số thuế. Bảng chi tiết 17 ngành chỉ nằm trong file `02_Bo-noi-dung-chuan.md` (A7.1) để dùng nội bộ.
- Được đưa lên web: 3 nhóm ngành với vùng ROAS tham chiếu, 74+ shop đang vận hành, 14,27× ROAS gộp toàn danh mục, 17 ngành hàng, 100+ shop Ads, 560+ gian hàng.
- `app.js` chỉ chứa vùng và nhóm của từng ngành. Không thêm số thật vào JS vì người xem đọc được mã nguồn.

## Quy ước khi sửa

- Màu chỉ qua token trong `:root`. Không gradient, không bóng (trừ modal), không đường kẻ ngoài bảng thật và `data-ui`.
- Hai font, năm cỡ (`--step-small/body/lead/head/display`). Không thêm cỡ.
- Tiêu đề tối đa 2 dòng ở mọi khổ; H2 dưới 40 ký tự.
- Không eyebrow, không đánh số 01/02, không chữ mono, không icon, không emoji.
- Mỗi section một bố cục khác hàng xóm; nhịp section 144–256px desktop.
