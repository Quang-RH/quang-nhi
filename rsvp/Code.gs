/**
 * Code.gs — NHẬN XÁC NHẬN THAM DỰ + LỜI CHÚC TỪ THIỆP CƯỚI ONLINE
 * =============================================================================
 * Dán toàn bộ file này vào Google Apps Script, deploy ra link /exec,
 * rồi dán link đó vào  CONFIG.rsvp.endpoint  trong assets/js/config.js.
 *
 * Các bước làm chi tiết: đọc file HUONG-DAN.md cùng thư mục.
 * =============================================================================
 */

/* =============================================================================
   PHẦN CẦN SỬA
   ========================================================================== */

// Hộp thư nhận báo. Nhiều người thì ngăn bằng dấu phẩy.
var NOTIFY_EMAIL = "hodacquang8182@gmail.com";

// ID của Google Sheet nhận dữ liệu.
// Lấy từ link Sheet, là đoạn nằm giữa  /d/  và  /edit
//   https://docs.google.com/spreadsheets/d/  ĐOẠN_NÀY  /edit
var SHEET_ID = "DÁN_ID_SHEET_VÀO_ĐÂY";

var EVENT_NAME = "Lễ thành hôn Đắc Quang & Trúc Nhi";
var EVENT_DATE = "Chủ Nhật, 01.11.2026";

/* =============================================================================
   PHẦN KHÔNG CẦN SỬA
   ========================================================================== */

var TIMEZONE   = "Asia/Ho_Chi_Minh";
var TAB_RSVP   = "Xác nhận tham dự";
var TAB_WISH   = "Sổ lưu bút";

var HEAD_RSVP  = ['Thời gian', 'Quý danh', 'Tham dự', 'Số người', 'Lời nhắn'];
var HEAD_WISH  = ['Thời gian', 'Quý danh', 'Lời chúc'];

/* Màu lấy đúng theo tông thiệp để email báo và thiệp cùng một bộ */
var C_INK   = '#16181C';
var C_GOLD  = '#B08D4F';
var C_IVORY = '#FBF8F3';
var C_LINE  = '#E3DCCF';
var C_TEXT  = '#2A2D33';
var C_SOFT  = '#6B6F78';
var C_OK    = '#5B7A5B';
var C_MISS  = '#A5715E';

/* Font email: KHÔNG dùng Georgia — font đó thiếu ký tự tiếng Việt dựng sẵn
   (ế ề ễ) nên chữ "đến" sẽ bị rời dấu thành "đế´n". Palatino/Times có đủ
   và là font có sẵn trên mọi máy (Gmail lược bỏ webfont nên phải dùng font máy). */
var F_SERIF = "'Palatino Linotype','Book Antiqua',Palatino,'Times New Roman',Times,serif";
var F_SANS  = "Arial,Helvetica,sans-serif";


/* =============================================================================
   NHẬN DỮ LIỆU
   ========================================================================== */
function doPost(e) {
  // Nhiều khách bấm gửi cùng lúc thì xếp hàng ghi lần lượt, không đè mất dòng.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    var data = JSON.parse(e.postData.contents);
    var isWish = (data.kind === 'wish');

    var sheet = laySheet(isWish ? TAB_WISH : TAB_RSVP, isWish ? HEAD_WISH : HEAD_RSVP);
    var now = new Date();

    if (isWish) {
      sheet.appendRow([now, data.name || '', data.message || '']);
    } else {
      sheet.appendRow([
        now,
        data.name   || '',
        data.attend || '',
        Number(data.guests) || 0,
        data.message || ''
      ]);
    }

    // Ghi xong nhả khoá ngay, khách kế tiếp không phải chờ bước gửi mail.
    lock.releaseLock();

    // Gửi mail hỏng thì KHÔNG được làm mất dòng vừa ghi vào Sheet.
    try { baoTin(data, now, sheet, isWish); } catch (mailErr) { /* bỏ qua */ }

    return traLoi({ ok: true });

  } catch (err) {
    try { lock.releaseLock(); } catch (e2) {}
    return traLoi({ ok: false, error: String(err) });
  }
}

/* Mở trực tiếp link /exec trên trình duyệt sẽ thấy dòng này — dùng để kiểm tra
   deploy đã sống chưa. */
function doGet() {
  return ContentService
    .createTextOutput('Thiệp cưới ' + EVENT_NAME + ' — cổng nhận phản hồi đang chạy.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function traLoi(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Lấy đúng tab, chưa có thì tạo mới kèm dòng tiêu đề đã kẻ sẵn.
   Gắn SHEET_ID cứng để script chạy được cả khi nó đứng độc lập —
   getActiveSpreadsheet() chỉ có giá trị khi script nằm trong chính Sheet đó. */
function laySheet(tabName, headers) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var head = sheet.getRange(1, 1, 1, headers.length);
    head.setFontWeight('bold').setBackground(C_IVORY);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(headers.length, 320);
  }
  return sheet;
}


/* =============================================================================
   EMAIL BÁO VỀ
   ========================================================================== */
function baoTin(data, now, sheet, isWish) {
  if (!NOTIFY_EMAIL) return;

  var gio = Utilities.formatDate(now, TIMEZONE, "HH:mm 'ngày' dd/MM/yyyy");
  var ten = data.name || '(không ghi tên)';
  var den = (data.attend || '').indexOf('Không') === 0 ? false : true;

  var tieuDe = isWish
    ? 'Lời chúc mới từ ' + ten
    : (den ? 'Sẽ đến — ' : 'Không đến được — ') + ten;

  var soDong = Math.max(sheet.getLastRow() - 1, 0);

  var rows = '';
  rows += hang('Quý danh', ten);
  if (!isWish) {
    rows += hang('Tham dự', data.attend || '', den ? C_OK : C_MISS);
    if (den) rows += hang('Số người', String(Number(data.guests) || 1));
  }
  if (data.message) rows += hang(isWish ? 'Lời chúc' : 'Lời nhắn', data.message);
  rows += hang('Lúc', gio);

  var html =
  '<div style="margin:0;padding:24px 12px;background:' + C_IVORY + ';font-family:' + F_SANS + ';">' +
    '<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid ' + C_LINE + ';">' +

      '<div style="padding:28px 24px;background:' + C_INK + ';text-align:center;">' +
        '<div style="font-family:' + F_SERIF + ';font-size:13px;letter-spacing:4px;' +
             'text-transform:uppercase;color:' + C_GOLD + ';">' +
          (isWish ? 'Sổ lưu bút' : 'Xác nhận tham dự') +
        '</div>' +
        '<div style="font-family:' + F_SERIF + ';font-size:24px;color:#F2EDE4;padding-top:8px;">' +
          EVENT_NAME +
        '</div>' +
        '<div style="font-size:11px;letter-spacing:2px;color:#A9A6A0;padding-top:6px;">' +
          EVENT_DATE +
        '</div>' +
      '</div>' +

      '<table role="presentation" cellpadding="0" cellspacing="0" ' +
             'style="width:100%;border-collapse:collapse;">' + rows + '</table>' +

      '<div style="padding:16px 24px 24px;text-align:center;font-size:12px;color:' + C_SOFT + ';">' +
        'Tổng cộng đã nhận <b style="color:' + C_TEXT + ';">' + soDong + '</b> lượt phản hồi.' +
        '<div style="padding-top:12px;">' +
          '<a href="' + sheet.getParent().getUrl() + '" ' +
             'style="display:inline-block;padding:10px 22px;border:1px solid ' + C_GOLD + ';' +
             'color:' + C_GOLD + ';text-decoration:none;font-size:11px;letter-spacing:2px;' +
             'text-transform:uppercase;">Mở bảng tổng hợp</a>' +
        '</div>' +
      '</div>' +

    '</div>' +
  '</div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: '[Thiệp cưới] ' + tieuDe,
    htmlBody: html,
    name: 'Thiệp cưới online'
  });
}

function hang(nhan, giaTri, mauChu) {
  return '<tr>' +
    '<td style="padding:14px 24px;border-bottom:1px solid ' + C_LINE + ';width:34%;' +
        'font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + C_SOFT + ';' +
        'vertical-align:top;">' + escapeHtml(nhan) + '</td>' +
    '<td style="padding:14px 24px;border-bottom:1px solid ' + C_LINE + ';' +
        'font-size:15px;line-height:1.6;color:' + (mauChu || C_TEXT) + ';">' +
        escapeHtml(giaTri).replace(/\n/g, '<br>') + '</td>' +
  '</tr>';
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/* =============================================================================
   CHẠY THỬ — bấm Run hàm này trong Apps Script để kiểm tra trước khi deploy.
   Nó sẽ ghi 2 dòng thử vào Sheet và gửi 2 email. Xoá 2 dòng đó sau khi xem xong.
   ========================================================================== */
function chayThu() {
  doPost({ postData: { contents: JSON.stringify({
    kind: 'rsvp', name: 'Nguyễn Văn Thử', attend: 'Có đến', guests: 2,
    message: 'Chúc hai cháu trăm năm hạnh phúc.'
  })}});

  doPost({ postData: { contents: JSON.stringify({
    kind: 'wish', name: 'Trần Thị Thử',
    message: 'Mừng hạnh phúc hai bạn.'
  })}});

  Logger.log('Đã ghi 2 dòng thử. Mở Sheet kiểm tra rồi xoá đi.');
}
