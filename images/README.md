# Thư mục ảnh

Bỏ ảnh vào đây theo đúng tên file bên dưới. **Ảnh nào chưa có thì thiệp tự giấu ô đó đi**,
không để lòi ô ảnh vỡ — nên cứ đẩy thiệp lên trước, bổ sung ảnh sau cũng được.

| Tên file | Dùng làm gì | Cỡ nên dùng |
|---|---|---|
| `hero.jpg` | Ảnh nền màn mở đầu | ngang, rộng 2000px, < 500KB |
| `groom.jpg` | Ảnh chú rể (hiện dạng tròn) | vuông, 800×800 |
| `bride.jpg` | Ảnh cô dâu (hiện dạng tròn) | vuông, 800×800 |
| `share-cover.jpg` | Ảnh hiện khi dán link vào Zalo/Facebook | 1200×630 |
| `favicon.png` | Icon nhỏ trên tab trình duyệt | 64×64 |
| `album/01.jpg` ... | Ảnh cưới trong album | < 400KB mỗi tấm |
| `qr/groom.png` · `qr/bride.png` | QR chuyển khoản hai bên | vuông |

## Nhớ nén ảnh trước khi bỏ vào

Ảnh chụp từ máy ảnh thường nặng 5–8MB một tấm. Để nguyên thì khách mở thiệp bằng 4G
sẽ phải đợi rất lâu — nhiều người sẽ thoát ra trước khi thiệp hiện xong.

Nén miễn phí tại **squoosh.app** hoặc **tinypng.com**, kéo thả ảnh vào là xong.

## Ảnh nền màn mở đầu

Chọn ảnh có **khoảng trống ở giữa** (trời, tường, phông nền) vì tên cô dâu chú rể
sẽ nằm đè lên đó. Ảnh mà mặt người nằm chính giữa thì chữ sẽ đè lên mặt.

Trang đã phủ sẵn một lớp tối mờ lên ảnh để chữ luôn đọc được, nên ảnh sáng hay tối
đều dùng được.

## QR chuyển khoản

Tạo miễn phí tại **vietqr.io** — chọn ngân hàng, nhập số tài khoản và tên,
tải ảnh về rồi đổi tên thành `groom.png` / `bride.png`, bỏ vào thư mục `qr/`.

## Thêm ảnh album

Bỏ file vào `album/` rồi khai thêm một dòng trong `assets/js/config.js` mục 7:

```javascript
{ src: "images/album/07.jpg", alt: "Ảnh cưới 7", size: "" },
```

- `size: "tall"` → ô cao gấp đôi (hợp ảnh dọc)
- `size: "wide"` → ô rộng gấp đôi (hợp ảnh ngang)
- `size: ""` → ô vuông thường
