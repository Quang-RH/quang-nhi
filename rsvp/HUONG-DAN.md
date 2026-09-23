# Cách bật xác nhận tham dự (RSVP) + sổ lưu bút

Làm một lần, khoảng 10 phút. Sau khi xong, khách bấm "Gửi xác nhận" trên thiệp thì:

1. Dòng dữ liệu tự rơi vào **Google Sheet** của bạn
2. Một **email báo** gửi về hộp thư ngay lập tức

Tất cả đều miễn phí, dùng chính tài khoản Google của bạn.

---

## Bước 1 — Tạo Google Sheet

1. Vào [sheets.new](https://sheets.new) để tạo một bảng tính mới
2. Đặt tên, ví dụ **"Xác nhận tham dự đám cưới"**
3. Nhìn lên thanh địa chỉ, copy lấy **đoạn ID** nằm giữa `/d/` và `/edit`:

```
https://docs.google.com/spreadsheets/d/1FRP0NQsvSMLtAoKgYRBWr_jDI/edit
                                        └────────── ID ──────────┘
```

Giữ đoạn ID đó lại, lát nữa cần dùng.

> Không cần tự tạo cột hay tiêu đề. Script tự tạo 2 tab
> (*Xác nhận tham dự* và *Sổ lưu bút*) kèm tiêu đề khi có dòng đầu tiên.

---

## Bước 2 — Dán code vào Apps Script

1. Ngay trong Sheet vừa tạo, vào menu **Tiện ích mở rộng → Apps Script**
   *(Extensions → Apps Script)*
2. Xoá sạch nội dung có sẵn trong ô soạn thảo
3. Mở file **`Code.gs`** cùng thư mục này, copy **toàn bộ**, dán vào
4. Sửa 2 dòng ở đầu file:

```javascript
var NOTIFY_EMAIL = "email-cua-ban@gmail.com";        // nơi nhận email báo
var SHEET_ID     = "ID_SHEET_COPY_Ở_BƯỚC_1";         // dán ID vừa copy
```

5. Bấm biểu tượng **đĩa mềm** để lưu

---

## Bước 3 — Chạy thử

1. Trên thanh công cụ, chọn hàm **`chayThu`** trong ô danh sách
2. Bấm **Run** (▶)
3. Lần đầu Google sẽ hỏi quyền:
   - Bấm **Review permissions** → chọn tài khoản của bạn
   - Gặp màn hình *"Google hasn't verified this app"* → bấm **Advanced**
     → **Go to ... (unsafe)** → **Allow**
   - *(Đây là script do chính bạn viết nên an toàn. Google cảnh báo vì nó chưa được
     đăng ký công khai.)*
4. Quay lại Sheet kiểm tra: phải thấy **2 dòng thử** ở 2 tab, và **2 email** trong hộp thư
5. Xem xong thì **xoá 2 dòng thử đó đi**

Nếu bước này chạy được thì phần khó nhất đã xong.

---

## Bước 4 — Deploy ra link

1. Góc phải trên, bấm **Deploy → New deployment**
2. Bấm biểu tượng **bánh răng** cạnh chữ "Select type" → chọn **Web app**
3. Điền:

| Ô | Chọn |
|---|---|
| Description | `Thiệp cưới` (gì cũng được) |
| Execute as | **Me** (chính bạn) |
| Who has access | **Anyone** ⚠️ |

> ⚠️ Phải là **Anyone**, không phải "Anyone with Google account".
> Chọn sai thì khách không có tài khoản Google sẽ không gửi được.

4. Bấm **Deploy**
5. Copy **Web app URL** — link kết thúc bằng `/exec`:

```
https://script.google.com/macros/s/AKfycb...rất-dài.../exec
```

**Kiểm tra nhanh:** dán link đó vào trình duyệt. Thấy dòng chữ
*"Thiệp cưới ... — cổng nhận phản hồi đang chạy"* là đúng.

---

## Bước 5 — Gắn vào thiệp

Mở **`assets/js/config.js`**, tìm mục 8, dán link vừa copy vào:

```javascript
rsvp: {
  show:     true,
  endpoint: "https://script.google.com/macros/s/AKfycb.../exec",   // ← dán vào đây
  ...
}
```

Lưu lại, đẩy lên GitHub:

```powershell
git add -A
git commit -m "Bật xác nhận tham dự"
git push
```

Đợi 1 phút, vào thiệp gửi thử một lượt để chắc chắn.

---

## Khi sửa lại code sau này

Sửa `Code.gs` xong **phải deploy lại**, nếu không link cũ vẫn chạy code cũ:

**Deploy → Manage deployments → biểu tượng bút chì → Version: New version → Deploy**

> Làm đúng cách này thì **link `/exec` giữ nguyên**, không phải sửa `config.js`.
> Nếu bấm "New deployment" (tạo mới) thì sẽ ra link khác, phải dán lại vào config.

---

## Gặp trục trặc

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| Thiệp báo "Gửi chưa được" | `endpoint` trong config dán thiếu/sai, hoặc không kết thúc bằng `/exec` |
| Gửi xong nhưng Sheet trống | `SHEET_ID` dán sai, hoặc sửa code rồi mà quên deploy lại |
| Sheet có dòng nhưng không có email | `NOTIFY_EMAIL` gõ sai — kiểm tra cả hộp thư Spam |
| Khách báo không gửi được | "Who has access" đang để *Anyone with Google account*, phải đổi thành **Anyone** |
| Chữ tiếng Việt trong email bị rời dấu | Đã xử lý sẵn trong `Code.gs`. Nếu tự đổi font email thì đừng dùng Georgia |

---

## Về riêng tư

- Sheet và script nằm trong tài khoản Google của bạn, **chỉ bạn xem được**
- "Anyone" chỉ cho phép người lạ **gửi dữ liệu vào**, không cho phép họ **đọc** ra
- Muốn ngừng nhận sau đám cưới: **Deploy → Manage deployments → Archive**
