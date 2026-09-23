/* =====================================================================
   config.js — TOÀN BỘ NỘI DUNG THIỆP NẰM Ở ĐÂY
   ---------------------------------------------------------------------
   ⭐ ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA khi muốn đổi nội dung thiệp.
      Sửa xong → git push → trang tự cập nhật, QR GIỮ NGUYÊN.

   QUY TẮC AN TOÀN khi sửa:
     • Chỉ đổi phần chữ nằm giữa hai dấu nháy, ĐỪNG xoá dấu phẩy cuối dòng.
     • Muốn ẩn hẳn một mục: đổi  show: true  thành  show: false
     • Trong chữ mà có sẵn dấu nháy kép thì bọc ngoài bằng dấu nháy đơn.
   ===================================================================== */

const CONFIG = {

  /* ---------------------------------------------------------------
     1. THÔNG TIN CHUNG — hiện ở tab trình duyệt & khi chia sẻ Zalo/FB
     --------------------------------------------------------------- */
  site: {
    title:       "Đắc Quang & Trúc Nhi — Thiệp mời lễ thành hôn",
    description: "Trân trọng kính mời quý vị đến dự lễ thành hôn của chúng tôi.",
    // Ảnh hiện ra khi dán link vào Zalo/Facebook (nên là ảnh ngang 1200×630)
    shareImage:  "images/share-cover.jpg",
    // Link gốc của thiệp — QR mã hoá đúng chuỗi này. ĐỪNG ĐỔI SAU KHI ĐÃ IN.
    url:         "https://quang-rh.github.io/quang-nhi/"
  },

  /* ---------------------------------------------------------------
     2. CÔ DÂU & CHÚ RỂ
     --------------------------------------------------------------- */
  couple: {
    groom: {
      fullName:  "Hồ Đắc Quang",
      shortName: "Đắc Quang",
      role:      "Chú rể",
      photo:     "images/groom.jpg",
      intro:     "Con trai",
      father:    "Ông Hồ Văn ......",
      mother:    "Bà Nguyễn Thị ......",
      address:   "...... , Tây Ninh"
    },
    bride: {
      fullName:  "Bùi Trúc Nhi",
      shortName: "Trúc Nhi",
      role:      "Cô dâu",
      photo:     "images/bride.jpg",
      intro:     "Con gái",
      father:    "Ông Bùi Văn ......",
      mother:    "Bà Trần Thị ......",
      address:   "...... , ......"
    },
    // Chữ lồng hiện trên màn mở đầu
    monogram: "Q & N"
  },

  /* ---------------------------------------------------------------
     3. MÀN MỞ ĐẦU
     --------------------------------------------------------------- */
  hero: {
    eyebrow:   "Save the date",
    // Ảnh nền màn mở đầu. Để rỗng "" thì dùng nền mực đen trơn có khung vàng,
    // cũng rất sang — dùng tạm được cho tới khi có ảnh cưới.
    background: "images/hero.jpg",
    // Ngày hiển thị cho người đọc
    dateText:  "Chủ Nhật, 15 · 11 · 2026",
    lunarText: "Nhằm ngày 27 tháng 9 năm Bính Ngọ",
    scrollCue: "Kéo xuống để xem thiệp"
  },

  /* ---------------------------------------------------------------
     4. NGÀY GIỜ CHÍNH — dùng cho ĐỒNG HỒ ĐẾM NGƯỢC
     Viết đúng dạng: "NĂM-THÁNG-NGÀY GIỜ:PHÚT"  (giờ Việt Nam)
     --------------------------------------------------------------- */
  countdown: {
    show:      true,
    target:    "2026-11-15 11:00",
    title:     "Đếm ngược đến ngày chung đôi",
    doneText:  "Hôm nay là ngày chúng tôi về chung một nhà."
  },

  /* ---------------------------------------------------------------
     5. LỜI MỜI
     --------------------------------------------------------------- */
  invitation: {
    show:    true,
    eyebrow: "Thiệp mời",
    title:   "Trân trọng kính mời",
    body:    "Sự hiện diện của quý vị là niềm vinh hạnh cho gia đình chúng tôi, và là lời chúc phúc quý giá nhất cho ngày chung đôi của hai con.",
    // Dòng "Kính mời: ..." — tự điền khi link có kèm tên khách (xem README mục 5)
    guestFallback: "Quý khách"
  },

  /* ---------------------------------------------------------------
     6. CHƯƠNG TRÌNH — THỜI GIAN & ĐỊA ĐIỂM
     Thêm/bớt buổi lễ bằng cách thêm/bớt một khối { ... } trong ngoặc vuông.
     --------------------------------------------------------------- */
  events: {
    show:    true,
    eyebrow: "Chương trình",
    title:   "Thời gian & Địa điểm",
    items: [
      {
        name:    "Lễ Vu Quy",
        side:    "Nhà gái",
        time:    "09:00",
        date:    "Chủ Nhật, 15.11.2026",
        venue:   "Tư gia nhà gái",
        address: "...... , ...... , ......",
        mapUrl:  ""
      },
      {
        name:    "Lễ Thành Hôn",
        side:    "Nhà trai",
        time:    "11:00",
        date:    "Chủ Nhật, 15.11.2026",
        venue:   "Tư gia nhà trai",
        address: "...... , ...... , Tây Ninh",
        mapUrl:  ""
      },
      {
        name:    "Tiệc mừng",
        side:    "Nhà hàng",
        time:    "17:30",
        date:    "Chủ Nhật, 15.11.2026",
        venue:   "Trung tâm tiệc cưới ......",
        address: "...... , ...... , ......",
        mapUrl:  ""
      }
    ]
  },

  /* ---------------------------------------------------------------
     7. ALBUM ẢNH CƯỚI
     Bỏ ảnh vào thư mục images/album/ rồi khai tên file ở đây.
     Ảnh nên nén xuống dưới 400KB mỗi tấm cho trang tải nhanh.
     size: "tall" = ô cao, "wide" = ô rộng, "" = ô vuông thường.
     --------------------------------------------------------------- */
  album: {
    show:    true,
    eyebrow: "Album",
    title:   "Khoảnh khắc của chúng tôi",
    note:    "Chạm vào ảnh để xem lớn",
    photos: [
      { src: "images/album/01.jpg", alt: "Ảnh cưới 1", size: "tall" },
      { src: "images/album/02.jpg", alt: "Ảnh cưới 2", size: "wide" },
      { src: "images/album/03.jpg", alt: "Ảnh cưới 3", size: "" },
      { src: "images/album/04.jpg", alt: "Ảnh cưới 4", size: "" },
      { src: "images/album/05.jpg", alt: "Ảnh cưới 5", size: "tall" },
      { src: "images/album/06.jpg", alt: "Ảnh cưới 6", size: "wide" }
    ]
  },

  /* ---------------------------------------------------------------
     8. XÁC NHẬN THAM DỰ (RSVP)
     endpoint: dán link /exec của Google Apps Script vào đây.
     Cách lấy link: đọc rsvp/HUONG-DAN.md
     Để rỗng "" thì form vẫn hiện nhưng KHÔNG gửi đi đâu (chế độ thử).
     --------------------------------------------------------------- */
  rsvp: {
    show:     true,
    eyebrow:  "Xác nhận",
    title:    "Quý vị sẽ đến chứ?",
    note:     "Xin quý vị phản hồi trước ngày 01.11.2026 để gia đình tiện sắp xếp chỗ ngồi.",
    endpoint: "",
    thanks:   "Cảm ơn quý vị. Gia đình chúng tôi đã nhận được xác nhận và rất mong ngày gặp mặt."
  },

  /* ---------------------------------------------------------------
     9. MỪNG CƯỚI — QR chuyển khoản
     Ảnh QR: tự tạo ở vietqr.io rồi lưu vào images/qr/
     --------------------------------------------------------------- */
  gift: {
    show:    true,
    eyebrow: "Mừng cưới",
    title:   "Hộp mừng cưới",
    note:    "Sự có mặt của quý vị đã là món quà lớn nhất. Nếu ở xa không tiện đến, đây là đôi dòng gửi gắm yêu thương.",
    accounts: [
      {
        side:   "Nhà trai",
        owner:  "HO DAC QUANG",
        bank:   "Vietcombank",
        number: "0123456789",
        qr:     "images/qr/groom.png"
      },
      {
        side:   "Nhà gái",
        owner:  "BUI TRUC NHI",
        bank:   "Techcombank",
        number: "9876543210",
        qr:     "images/qr/bride.png"
      }
    ]
  },

  /* ---------------------------------------------------------------
     10. SỔ LƯU BÚT — lời chúc khách gửi (đi chung endpoint với RSVP)
     --------------------------------------------------------------- */
  guestbook: {
    show:    true,
    eyebrow: "Lưu bút",
    title:   "Gửi lời chúc phúc",
    note:    "Mỗi lời chúc đều được gia đình đọc và giữ lại.",
    placeholder: "Chúc hai bạn trăm năm hạnh phúc..."
  },

  /* ---------------------------------------------------------------
     11. NHẠC NỀN
     Bỏ file .mp3 vào thư mục assets/ rồi khai ở đây.
     Trình duyệt CHẶN tự phát nhạc — nhạc chỉ chạy khi khách chạm màn hình.
     --------------------------------------------------------------- */
  music: {
    show:  true,
    src:   "assets/music.mp3",
    title: "Nhạc nền"
  },

  /* ---------------------------------------------------------------
     12. LỜI KẾT
     --------------------------------------------------------------- */
  footer: {
    message:   "Trân trọng cảm ơn quý vị.",
    signature: "Đắc Quang & Trúc Nhi"
  }
};
