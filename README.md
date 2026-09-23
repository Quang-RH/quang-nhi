# Thiệp cưới online — Đắc Quang & Trúc Nhi

Thiệp mời lễ thành hôn dạng trang web, có mã QR **cố định vĩnh viễn** để in lên thiệp giấy.

**Link thiệp:** https://quang-rh.github.io/quang-nhi/

---

## ⭐ Điều quan trọng nhất cần nhớ

Mã QR chỉ mã hoá **đường link**, không chứa nội dung thiệp.

Nghĩa là: sửa tên, đổi ngày, đổi địa điểm, thêm ảnh cưới, đổi số tài khoản...
rồi đẩy lên GitHub → **mã QR đã in vẫn dùng được**, khách quét sẽ thấy nội dung mới nhất.
In thiệp giấy trước, hoàn thiện nội dung sau — hoàn toàn được.

**Chỉ có 3 việc này làm hỏng mã QR đã in.** Tuyệt đối tránh sau khi đã đem thiệp đi in:

| Việc | Hậu quả |
|---|---|
| Đổi tên repo `quang-nhi` thành tên khác | Link chết → QR đã in vô dụng |
| Đổi tên tài khoản GitHub `Quang-RH` | Link chết → QR đã in vô dụng |
| Xoá repo | Link chết → QR đã in vô dụng |

Gắn thêm tên miền riêng thì **vẫn an toàn**, miễn là giữ link `quang-rh.github.io/quang-nhi/`
hoạt động song song (GitHub Pages tự chuyển hướng sang tên miền mới).

---

## 1. Sửa nội dung thiệp

Mở file **`assets/js/config.js`** — toàn bộ chữ nghĩa của thiệp nằm trong đó.
Không cần đụng file nào khác.

```
assets/js/config.js
├── 1. site          → tiêu đề tab, ảnh hiện khi chia sẻ Zalo/Facebook
├── 2. couple        → tên cô dâu chú rể, tên cha mẹ hai bên
├── 3. hero          → màn mở đầu: ảnh nền, ngày dương, ngày âm
├── 4. countdown     → mốc đếm ngược
├── 5. invitation    → lời mời
├── 6. events        → các buổi lễ: giờ, địa điểm, link bản đồ
├── 7. album         → danh sách ảnh cưới
├── 8. rsvp          → xác nhận tham dự
├── 9. gift          → QR chuyển khoản hai bên
├── 10. guestbook    → sổ lưu bút
├── 11. music        → nhạc nền
└── 12. footer       → lời kết
```

**Quy tắc sửa an toàn:**

- Chỉ đổi phần chữ nằm giữa hai dấu nháy `"..."`
- **Đừng xoá dấu phẩy** ở cuối dòng
- Muốn ẩn hẳn một mục: đổi `show: true` → `show: false`
- Chữ có sẵn dấu nháy kép bên trong thì bọc ngoài bằng nháy đơn

Những chỗ còn dấu `......` là **chưa điền** — chỗ nào chưa điền thì trang tự bỏ qua,
không hiện ra dòng trống xấu xí.

Sửa xong, xem thử trên máy trước khi đẩy lên (xem mục 4).

---

## 2. Bỏ ảnh vào thiệp

| Bỏ vào | Tên file | Dùng làm gì | Cỡ nên dùng |
|---|---|---|---|
| `images/` | `hero.jpg` | Ảnh nền màn mở đầu | ngang, 2000px, < 500KB |
| `images/` | `groom.jpg` · `bride.jpg` | Ảnh chân dung hai bạn | vuông, 800px |
| `images/` | `share-cover.jpg` | Ảnh hiện khi dán link vào Zalo/FB | 1200×630 |
| `images/` | `favicon.png` | Icon nhỏ trên tab trình duyệt | 64×64 |
| `images/album/` | `01.jpg`, `02.jpg`... | Ảnh cưới trong album | < 400KB mỗi tấm |
| `images/qr/` | `groom.png` · `bride.png` | QR chuyển khoản | vuông |
| `assets/` | `music.mp3` | Nhạc nền | < 5MB |

Thêm ảnh album thì nhớ khai thêm dòng trong `config.js` mục 7.
**Ảnh nào chưa có thì trang tự giấu ô đó đi**, không để lòi ô ảnh vỡ.

QR chuyển khoản tạo miễn phí tại **vietqr.io** — chọn ngân hàng, nhập số tài khoản, tải ảnh về.

**Nhớ nén ảnh trước khi bỏ vào** (dùng squoosh.app hoặc tinypng.com).
Ảnh chụp từ máy ảnh thường nặng 5–8MB/tấm, để nguyên thì khách mở thiệp bằng 4G sẽ đợi rất lâu.

---

## 3. Bật xác nhận tham dự (RSVP)

Mặc định form vẫn hiện nhưng **chưa gửi đi đâu**. Để nhận được phản hồi thật:
làm theo **`rsvp/HUONG-DAN.md`** (khoảng 10 phút), rồi dán link nhận được vào
`CONFIG.rsvp.endpoint` trong `config.js`.

Sổ lưu bút dùng chung cổng này, bật một lần là chạy cả hai.

---

## 4. Xem thử trên máy trước khi đẩy lên

Mở PowerShell tại thư mục này rồi chạy:

```powershell
python -m http.server 8080
```

Mở trình duyệt vào `http://localhost:8080`

> Đừng nhấp đúp thẳng vào `index.html`. Mở kiểu đó trình duyệt chặn vì lý do bảo mật,
> ảnh và nội dung sẽ không hiện đủ.

---

## 5. Đẩy nội dung mới lên (mã QR giữ nguyên)

```powershell
git add -A
git commit -m "Cập nhật nội dung thiệp"
git push
```

Đợi khoảng 1 phút để GitHub dựng lại trang. Khách quét QR cũ sẽ thấy nội dung mới.

> Nếu không thấy đổi: nhấn `Ctrl + F5` để trình duyệt tải lại, đừng dùng bản đã nhớ sẵn.

---

## 6. Tạo mã QR để đem in

Nhấp đúp mở file **`tools/qr.html`** bằng trình duyệt → bấm **Tải ảnh PNG**.

Mã sinh ra ngay trên máy, không gửi gì lên mạng. Chọn cỡ 1000px là đủ in đẹp.

**Khi đem in nhớ:**
- In mã màu **đen** trên nền **trắng** (vàng champagne đẹp nhưng máy quét cũ dễ đọc trượt)
- Cạnh mã in tối thiểu **2cm**
- Chừa viền trắng quanh mã, đừng để hoa văn đè lên
- Ghi dòng chữ nhỏ dưới mã: *Quét mã để xem thiệp mời*
- **In thử một tấm và quét thử bằng điện thoại trước khi in cả lô**

---

## 7. Gửi thiệp kèm tên khách

Dán thêm đuôi `?ten=` vào cuối link, thiệp sẽ hiện dòng *"Kính mời <tên khách>"*:

```
https://quang-rh.github.io/quang-nhi/?ten=Anh%20Nam
https://quang-rh.github.io/quang-nhi/?ten=Gia%20đình%20cô%20Bảy
```

Khoảng trắng viết thành `%20`.

Dùng khi gửi riêng qua Zalo/Messenger. **Đừng in mã QR loại này** — mỗi khách một mã
thì không in nổi. Mã in trên thiệp giấy phải là **link trần**.

---

## 8. Cấu trúc thư mục

```
quang-nhi/
├── index.html              khung trang, không chứa nội dung
├── assets/
│   ├── css/tokens.css      ⭐ đổi tông màu / font toàn trang ở đây
│   ├── css/styles.css      giao diện chi tiết
│   ├── js/config.js        ⭐⭐ TOÀN BỘ NỘI DUNG THIỆP Ở ĐÂY
│   ├── js/app.js           bộ máy dựng trang (không cần sửa)
│   └── music.mp3           nhạc nền (tự bỏ vào)
├── images/                 ảnh (tự bỏ vào)
│   ├── album/              ảnh cưới
│   └── qr/                 QR chuyển khoản
├── rsvp/
│   ├── Code.gs             backend nhận xác nhận tham dự
│   └── HUONG-DAN.md        cách cài đặt RSVP
├── tools/
│   └── qr.html             trang tạo mã QR để in
└── README.md               file bạn đang đọc
```

---

## 9. Đổi tông màu

Sửa file **`assets/css/tokens.css`**, phần `--c-...` ở đầu file.
Đổi vài dòng đó là cả trang đổi theo, không cần đụng `styles.css`.

Tông hiện tại: **Ivory · Ink · Champagne Gold** (trắng ngà · mực đen · vàng sâm panh).

> ⚠️ Nếu đổi font: phải chọn font **có bộ ký tự tiếng Việt**.
> Các font viết tay kiểu Great Vibes, Allura... **không có** — chữ "Đắc" sẽ bị vỡ dấu.
> Hai font đang dùng (Cormorant Garamond + Be Vietnam Pro) đều có đủ.

---

## 10. Kiểm tra trước ngày cưới

- [ ] Quét thử QR bằng **cả máy Android và iPhone**
- [ ] Mở thiệp bằng **4G** (không phải wifi) xem có lâu quá không
- [ ] Bấm thử **link bản đồ** từng buổi lễ
- [ ] Gửi thử một RSVP, kiểm tra Google Sheet có nhận được không
- [ ] Bấm thử nút **chép số tài khoản**
- [ ] Dán link vào Zalo xem **ảnh xem trước** hiện đúng không
- [ ] Nhờ một người lớn tuổi mở thử — họ đọc có rõ chữ không
