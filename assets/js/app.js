/* =====================================================================
   app.js — BỘ MÁY DỰNG THIỆP
   ---------------------------------------------------------------------
   File này ĐỌC nội dung từ config.js rồi vẽ ra trang.
   Bình thường bạn KHÔNG cần sửa file này. Muốn đổi nội dung: sửa config.js.
   ===================================================================== */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Lấy giá trị lồng nhau theo đường dẫn "a.b.c" */
  function pick(path) {
    return path.split('.').reduce(function (o, k) {
      return (o && o[k] !== undefined) ? o[k] : undefined;
    }, CONFIG);
  }

  /* Chèn chữ an toàn (không cho HTML lọt vào) */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Ô nội dung còn để trống trong config thì coi như chưa điền */
  function filled(v) {
    return typeof v === 'string' && v.trim() !== '' && v.indexOf('......') === -1;
  }


  /* ===================================================================
     1. ĐỔ NỘI DUNG VÀO CÁC Ô data-bind
     =================================================================== */
  function bindText() {
    $$('[data-bind]').forEach(function (el) {
      var v = pick(el.getAttribute('data-bind'));
      if (v !== undefined && v !== null) el.textContent = v;
    });
    // Ngày dạng 20.10.2026 trong các dòng ghi chú (vd hạn xác nhận) → tô đỏ
    $$('.note[data-bind]').forEach(function (el) {
      el.innerHTML = esc(el.textContent).replace(/(\d{1,2}[.\/]\d{1,2}[.\/]\d{4})/g, '<strong class="hl">$1</strong>');
    });
  }

  /* Tiêu đề tab + thẻ chia sẻ Zalo/Facebook */
  function bindHead() {
    var s = CONFIG.site || {};
    if (s.title) document.title = s.title;

    var map = {
      'meta[name="description"]':        s.description,
      'meta[property="og:title"]':       s.title,
      'meta[property="og:description"]': s.description,
      'meta[property="og:url"]':         s.url,
      'meta[property="og:image"]':       s.url && s.shareImage ? s.url.replace(/\/?$/, '/') + s.shareImage : s.shareImage
    };
    Object.keys(map).forEach(function (sel) {
      var el = $(sel);
      if (el && map[sel]) el.setAttribute('content', map[sel]);
    });
  }


  /* ===================================================================
     2. MÀN MỞ ĐẦU
     =================================================================== */
  function buildHero() {
    var bg = pick('hero.background');
    if (filled(bg)) {
      // Chỉ gắn ảnh nền khi tải được — ảnh thiếu thì giữ nền ngà trơn,
      // KHÔNG để lòi ô ảnh vỡ giữa thiệp.
      var probe = new Image();
      probe.onload = function () {
        $('#heroBg').style.backgroundImage = 'url("' + bg + '")';
      };
      probe.src = bg;
    }
  }


  /* ===================================================================
     3. LỜI MỜI — tên khách lấy từ đuôi link ?ten=...
     Link trần (cái in trên QR) vẫn chạy bình thường, chỉ là không có tên.
     =================================================================== */
  function buildInvitation() {
    var c = CONFIG.invitation;
    if (!c || !c.show) return;
    $('#invitation').hidden = false;

    var p = new URLSearchParams(location.search);
    var guest = p.get('ten') || p.get('guest');
    if (guest && guest.trim()) {
      $('#guestName').textContent = guest.trim();
      $('#guestLine').hidden = false;
    }
  }


  /* ===================================================================
     4. HAI HỌ
     =================================================================== */
  function personCard(p) {
    var parents = '';
    if (filled(p.father) || filled(p.mother)) {
      parents = '<p class="family__parents">' +
        (filled(p.father) ? '<span>' + esc(p.father) + '</span>' : '') +
        (filled(p.mother) ? '<span>' + esc(p.mother) + '</span>' : '') +
        '</p>';
    }
    var photo = filled(p.photo)
      ? '<img class="family__photo" src="' + esc(p.photo) + '" alt="' + esc(p.fullName) + '" loading="lazy" onerror="this.remove()">'
      : '';

    return '<div class="family">' +
      photo +
      '<p class="family__role">' + esc(p.role || '') + '</p>' +
      '<h3 class="family__name">' + esc(p.fullName || '') + '</h3>' +
      parents +
      (filled(p.address) ? '<p class="family__address">' + esc(p.address) + '</p>' : '') +
      '</div>';
  }

  function buildFamilies() {
    var c = CONFIG.couple;
    if (!c) return;
    $('#familiesGrid').innerHTML =
      personCard(c.groom) +
      '<div class="families__divider" aria-hidden="true"></div>' +
      personCard(c.bride);
  }


  /* ===================================================================
     5. CHƯƠNG TRÌNH
     =================================================================== */
  function buildEvents() {
    var c = CONFIG.events;
    if (!c || !c.show || !c.items || !c.items.length) return;
    $('#events').hidden = false;

    $('#eventsGrid').innerHTML = c.items.map(function (e) {
      var map = filled(e.mapUrl)
        ? '<p class="event__map"><a class="btn" href="' + esc(e.mapUrl) +
          '" target="_blank" rel="noopener">Chỉ đường</a></p>'
        : '';
      var embed = filled(e.mapQuery)
        ? '<div class="event__embed"><iframe title="Bản đồ ' + esc(e.venue || '') + '" loading="lazy" ' +
          'referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' +
          encodeURIComponent(e.mapQuery) + '&hl=vi&z=16&output=embed"></iframe></div>'
        : '';
      return '<article class="event' + (e.calendar ? ' event--cal' : '') + '">' +
        '<p class="event__side">' + esc(e.side || '') + '</p>' +
        '<h3 class="event__name">' + esc(e.name || '') + '</h3>' +
        (e.calendar ? calendarHtml(e.calendar) : '') +
        '<p class="event__date">' + esc(e.date || '') + '</p>' +
        '<p class="event__time">' + esc(e.time || '') + '</p>' +
        (filled(e.lunar)   ? '<p class="event__lunar">' + esc(e.lunar) + '</p>' : '') +
        (filled(e.venue)   ? '<p class="event__venue">' + esc(e.venue) + '</p>' : '') +
        (filled(e.address) ? '<p class="event__address">' + esc(e.address) + '</p>' : '') +
        embed +
        (filled(e.routeMap) ? '<a class="event__route" href="' + esc(e.routeMap) + '" target="_blank" rel="noopener">' +
          '<img src="' + esc(e.routeMap) + '" alt="Sơ đồ đường đi tới ' + esc(e.venue || '') + '" loading="lazy">' +
          '<span>Chạm để xem sơ đồ lớn</span></a>' : '') +
        map +
        '</article>';
    }).join('');
  }


  /* Tờ lịch tháng (tuần bắt đầu Thứ Hai, giống thiệp giấy) — ngày cưới có trái tim đập */
  function calendarHtml(c) {
    var first = new Date(c.year, c.month - 1, 1).getDay();      // 0 = Chủ Nhật
    var lead  = (first + 6) % 7;                                 // số ô trống trước ngày 1
    var days  = new Date(c.year, c.month, 0).getDate();
    var head  = ['T2','T3','T4','T5','T6','T7','CN'].map(function (d) {
      return '<span class="cal__dow">' + d + '</span>';
    }).join('');
    var cells = '';
    for (var i = 0; i < lead; i++) cells += '<span></span>';
    for (var d = 1; d <= days; d++) {
      cells += d === c.day
        ? '<span class="cal__day cal__day--wed" aria-label="Ngày cưới"><svg viewBox="0 0 32 29" aria-hidden="true"><path d="M16 28.5S1 19.6 1 9.3C1 4.6 4.7 1 9.2 1c2.8 0 5.3 1.4 6.8 3.6C17.5 2.4 20 1 22.8 1 27.3 1 31 4.6 31 9.3 31 19.6 16 28.5 16 28.5z"/></svg><b>' + d + '</b></span>'
        : '<span class="cal__day">' + d + '</span>';
    }
    return '<div class="cal"><p class="cal__title">Tháng ' + c.month + ' · ' + c.year + '</p>' +
      '<div class="cal__grid">' + head + cells + '</div></div>';
  }


  /* ===================================================================
     6. ĐẾM NGƯỢC
     =================================================================== */
  function buildCountdown() {
    var c = CONFIG.countdown;
    if (!c || !c.show || !filled(c.target)) return;

    // "2026-11-15 11:00" → mốc giờ Việt Nam (+07:00), để khách ở múi giờ
    // khác vẫn đếm đúng theo giờ đám cưới, không lệch theo máy họ.
    var iso = c.target.trim().replace(' ', 'T');
    if (iso.length === 16) iso += ':00';
    var target = new Date(iso + '+07:00');
    if (isNaN(target.getTime())) {
      console.warn('[thiep] countdown.target sai định dạng:', c.target);
      return;
    }

    $('#countdown').hidden = false;
    var grid  = $('#countdownGrid');
    var units = [['Ngày', 86400000], ['Giờ', 3600000], ['Phút', 60000], ['Giây', 1000]];

    grid.innerHTML = units.map(function (u) {
      return '<div class="cd"><span class="cd__num">--</span>' +
             '<span class="cd__label">' + u[0] + '</span></div>';
    }).join('');
    var nums = $$('.cd__num', grid);

    function tick() {
      var left = target - Date.now();
      if (left <= 0) {
        grid.hidden = true;
        $('#countdownDone').hidden = false;
        clearInterval(timer);
        return;
      }
      units.forEach(function (u, i) {
        var v = Math.floor(left / u[1]);
        left -= v * u[1];
        nums[i].textContent = v < 10 ? '0' + v : String(v);
      });
    }
    tick();
    var timer = setInterval(tick, 1000);
  }


  /* ===================================================================
     7. ALBUM + XEM ẢNH LỚN
     =================================================================== */
  var lb = { list: [], i: 0 };

  function buildAlbum() {
    var c = CONFIG.album;
    if (!c || !c.show || !c.photos || !c.photos.length) return;
    $('#album').hidden = false;

    $('#galleryGrid').innerHTML = c.photos.map(function (p, i) {
      var mod = p.size ? ' photo--' + p.size : '';
      return '<button type="button" class="photo' + mod + '" data-i="' + i + '">' +
             '<img src="' + esc(p.src) + '" alt="' + esc(p.alt || '') + '" loading="lazy">' +
             '</button>';
    }).join('');

    // Ảnh nào hỏng/chưa có thì gỡ hẳn ô đó, tránh lưới bị lỗ đen.
    $$('#galleryGrid img').forEach(function (img) {
      img.addEventListener('error', function () {
        var btn = img.closest('.photo');
        if (btn) btn.remove();
        reindexPhotos();
      });
    });

    reindexPhotos();
    $('#galleryGrid').addEventListener('click', function (e) {
      var btn = e.target.closest('.photo');
      if (btn) openLightbox(Number(btn.dataset.i));
    });
  }

  /* Đánh số lại sau khi có ảnh bị gỡ, để nút trái/phải không nhảy lung tung */
  function reindexPhotos() {
    var btns = $$('#galleryGrid .photo');
    lb.list = btns.map(function (b, i) {
      b.dataset.i = i;
      var img = $('img', b);
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
    });
    if (!lb.list.length) $('#album').hidden = true;
  }

  function openLightbox(i) {
    if (!lb.list.length) return;
    lb.i = i;
    renderLightbox();
    $('#lightbox').hidden = false;
    document.body.classList.add('is-locked');
    $('#lbClose').focus();
  }
  function closeLightbox() {
    $('#lightbox').hidden = true;
    document.body.classList.remove('is-locked');
  }
  function stepLightbox(d) {
    lb.i = (lb.i + d + lb.list.length) % lb.list.length;
    renderLightbox();
  }
  function renderLightbox() {
    var p = lb.list[lb.i];
    $('#lbImg').src = p.src;
    $('#lbImg').alt = p.alt || '';
    $('#lbCount').textContent = (lb.i + 1) + ' / ' + lb.list.length;
    var one = lb.list.length < 2;
    $('#lbPrev').hidden = one;
    $('#lbNext').hidden = one;
  }

  function wireLightbox() {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', function () { stepLightbox(-1); });
    $('#lbNext').addEventListener('click', function () { stepLightbox(1); });
    $('#lightbox').addEventListener('click', function (e) {
      if (e.target.id === 'lightbox') closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if ($('#lightbox').hidden) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    // Vuốt trái/phải trên điện thoại
    var x0 = null;
    $('#lightbox').addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    $('#lightbox').addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }


  /* ===================================================================
     8. GỬI DỮ LIỆU VỀ GOOGLE SHEET
     Dùng Content-Type text/plain để trình duyệt KHÔNG bật bước kiểm tra
     CORS — Apps Script không trả header CORS nên bật lên là hỏng.
     =================================================================== */
  function send(payload) {
    var url = pick('rsvp.endpoint');
    if (!filled(url)) {
      console.warn('[thiep] CONFIG.rsvp.endpoint đang trống — dữ liệu KHÔNG được gửi đi đâu:', payload);
      return Promise.resolve('demo');
    }
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return 'sent'; });
  }

  function markError(el, bad) {
    el.classList.toggle('is-error', !!bad);
  }

  /* ---- Form xác nhận tham dự ---- */
  function buildRsvp() {
    var c = CONFIG.rsvp;
    if (!c || !c.show) return;
    $('#rsvp').hidden = false;

    var form   = $('#rsvpForm');
    var status = $('#rsvpStatus');
    var btn    = $('#rsvpSubmit');
    var guests = $('#guestsField');

    // Không đến được thì ẩn ô "số người" cho gọn
    form.addEventListener('change', function (e) {
      if (e.target.name === 'attend') {
        guests.hidden = e.target.value !== 'Có đến';
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#rsvpName');
      markError(name, false);
      status.className = 'form__status';

      if (!name.value.trim()) {
        markError(name, true);
        status.textContent = 'Xin quý vị cho biết quý danh.';
        status.classList.add('is-err');
        name.focus();
        return;
      }

      btn.disabled = true;
      status.textContent = 'Đang gửi...';

      var attend = $('input[name="attend"]:checked', form).value;
      send({
        kind:    'rsvp',
        name:    name.value.trim(),
        attend:  attend,
        guests:  attend === 'Có đến' ? Number($('#rsvpGuests').value || 1) : 0,
        message: $('#rsvpMessage').value.trim(),
        page:    location.href
      }).then(function () {
        var box = document.createElement('p');
        box.className = 'thanks';
        box.textContent = c.thanks || 'Cảm ơn quý vị.';
        form.replaceWith(box);
      }).catch(function () {
        btn.disabled = false;
        status.textContent = 'Gửi chưa được. Xin quý vị thử lại hoặc nhắn trực tiếp cho gia đình.';
        status.classList.add('is-err');
      });
    });
  }

  /* ---- Form lưu bút ---- */
  function buildGuestbook() {
    var c = CONFIG.guestbook;
    if (!c || !c.show) return;
    $('#guestbook').hidden = false;

    var text = $('#wishText');
    if (c.placeholder) text.placeholder = c.placeholder;

    var form   = $('#wishForm');
    var status = $('#wishStatus');
    var btn    = $('#wishSubmit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#wishName');
      markError(name, false); markError(text, false);
      status.className = 'form__status';

      if (!name.value.trim() || !text.value.trim()) {
        markError(name, !name.value.trim());
        markError(text, !text.value.trim());
        status.textContent = 'Xin quý vị điền quý danh và lời chúc.';
        status.classList.add('is-err');
        return;
      }

      btn.disabled = true;
      status.textContent = 'Đang gửi...';

      send({
        kind:    'wish',
        name:    name.value.trim(),
        attend:  '',
        guests:  0,
        message: text.value.trim(),
        page:    location.href
      }).then(function () {
        form.reset();
        btn.disabled = false;
        status.textContent = 'Gia đình đã nhận được lời chúc. Xin cảm ơn quý vị.';
        status.classList.add('is-ok');
      }).catch(function () {
        btn.disabled = false;
        status.textContent = 'Gửi chưa được. Xin quý vị thử lại.';
        status.classList.add('is-err');
      });
    });
  }


  /* Lưu mã QR: dựng 1 tấm ảnh gọn (QR + tên + ngân hàng + số TK) rồi
     • điện thoại hỗ trợ chia sẻ file → mở bảng "Lưu hình ảnh" (iPhone/Android)
     • còn lại → tải file .png về máy */
  function saveQr(a, btn) {
    if (!a || !filled(a.qr)) return;
    var label = $('span', btn), old = label.textContent;
    var img = new Image();
    img.onload = function () {
      var W = 900, H = 1180, cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var x = cv.getContext('2d');
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      x.strokeStyle = '#C8AE8E'; x.lineWidth = 3; x.strokeRect(24, 24, W - 48, H - 48);
      x.textAlign = 'center';
      x.fillStyle = '#A07E5A'; x.font = '600 30px "Be Vietnam Pro", Arial, sans-serif';
      x.fillText((a.side || '').toUpperCase(), W / 2, 110);
      x.drawImage(img, 130, 150, 640, 640);
      x.fillStyle = '#3E3128'; x.font = '600 44px "Be Vietnam Pro", Arial, sans-serif';
      x.fillText(a.owner || '', W / 2, 880);
      x.fillStyle = '#7F6D5F'; x.font = '400 34px "Be Vietnam Pro", Arial, sans-serif';
      x.fillText(a.bank || '', W / 2, 940);
      x.fillStyle = '#8B1E24'; x.font = '600 52px "Be Vietnam Pro", Arial, sans-serif';
      x.fillText(a.number || '', W / 2, 1020);
      x.fillStyle = '#A07E5A'; x.font = '400 26px "Be Vietnam Pro", Arial, sans-serif';
      x.fillText((CONFIG.footer && CONFIG.footer.signature) || '', W / 2, 1100);
      cv.toBlob(function (blob) {
        var name = 'QR-' + String(a.owner || 'mung-cuoi').replace(/\s+/g, '-') + '.png';
        var file = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: name }).catch(function () {});
        } else {
          var url = URL.createObjectURL(blob), link = document.createElement('a');
          link.href = url; link.download = name;
          document.body.appendChild(link); link.click(); link.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        }
        label.textContent = 'Đã lưu';
        setTimeout(function () { label.textContent = old; }, 1800);
      }, 'image/png');
    };
    img.onerror = function () { window.open(a.qr, '_blank'); };
    img.src = a.qr;
  }


  /* ===================================================================
     9. MỪNG CƯỚI — bấm vào số tài khoản là chép luôn
     =================================================================== */
  function buildGift() {
    var c = CONFIG.gift;
    if (!c || !c.show || !c.accounts || !c.accounts.length) return;
    $('#gift').hidden = false;

    $('#giftGrid').innerHTML = c.accounts.map(function (a, i) {
      // Chưa có số tài khoản (còn "......") → giữ chỗ thẻ, hiện ô "Đang cập nhật"
      if (!filled(a.number)) {
        return '<div class="gift__card gift__card--pending">' +
          '<p class="gift__side">' + esc(a.side || '') + '</p>' +
          '<div class="gift__qr gift__qr--pending" aria-hidden="true"><span>Đang cập nhật</span></div>' +
          (filled(a.owner) ? '<p class="gift__owner">' + esc(a.owner) + '</p>' : '') +
          '<p class="gift__bank">Thông tin sẽ được bổ sung sớm</p>' +
          '</div>';
      }
      var qr = filled(a.qr)
        ? '<img class="gift__qr" src="' + esc(a.qr) + '" alt="Mã QR chuyển khoản ' +
          esc(a.side) + '" loading="lazy" onerror="this.remove()">'
        : '';
      return '<div class="gift__card">' +
        '<p class="gift__side">' + esc(a.side || '') + '</p>' +
        qr +
        '<p class="gift__owner">' + esc(a.owner || '') + '</p>' +
        '<p class="gift__bank">' + esc(a.bank || '') + '</p>' +
        '<button type="button" class="gift__number" data-copy="' + esc(a.number || '') + '">' +
          esc(a.number || '') + ' <small>chép</small>' +
        '</button>' +
        (filled(a.qr) ? '<button type="button" class="gift__save" data-save="' + i + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14"/></svg>' +
          '<span>Lưu mã QR</span></button>' : '') +
        '</div>';
    }).join('');

    $('#giftGrid').addEventListener('click', function (e) {
      var sv = e.target.closest('[data-save]');
      if (sv) { saveQr(c.accounts[Number(sv.dataset.save)], sv); return; }
      var btn = e.target.closest('[data-copy]');
      if (!btn) return;
      var num   = btn.dataset.copy;
      var label = $('small', btn);
      var done  = function () {
        label.textContent = 'đã chép';
        setTimeout(function () { label.textContent = 'chép'; }, 1800);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(num).then(done).catch(fallback);
      } else {
        fallback();
      }

      // Trình duyệt cũ / trang mở bằng http thì dùng cách chép kiểu cũ
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = num;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* chịu */ }
        ta.remove();
      }
    });
  }


  /* ===================================================================
     10. NHẠC NỀN
     Trình duyệt chặn tự phát. Nhạc chỉ nổi khi khách bấm "Mở thiệp".
     =================================================================== */
  var music = { el: null, btn: null, ready: false };

  function buildMusic() {
    var c = CONFIG.music;
    if (!c || !c.show || !filled(c.src)) return;

    music.el  = $('#musicEl');
    music.btn = $('#musicBtn');
    music.el.src = c.src;
    music.el.volume = 0.55;

    // Phải tải phần đầu file thì trình duyệt mới biết file có tồn tại hay không.
    // Để preload="none" thì file thiếu cũng KHÔNG báo lỗi, nút nhạc sẽ hiện ra
    // nhưng bấm vào không kêu gì — khách tưởng thiệp hỏng.
    music.el.preload = 'metadata';

    // File nhạc chưa có thì giấu hẳn nút đi, đừng để khách bấm vào nút chết.
    music.el.addEventListener('error', function () {
      music.btn.hidden = true;
      music.ready = false;
    });
    music.el.addEventListener('canplay', function () { music.ready = true; });

    music.btn.hidden = false;
    music.btn.title = c.title || 'Nhạc nền';
    music.btn.addEventListener('click', function () {
      if (music.el.paused) playMusic(); else pauseMusic();
    });
  }

  function playMusic() {
    if (!music.el) return;
    var p = music.el.play();
    if (p && p.then) {
      p.then(function () { music.btn.setAttribute('aria-pressed', 'true'); })
       .catch(function () { music.btn.setAttribute('aria-pressed', 'false'); });
    }
  }
  function pauseMusic() {
    if (!music.el) return;
    music.el.pause();
    music.btn.setAttribute('aria-pressed', 'false');
  }


  /* ===================================================================
     11b. ẢNH XUYÊN TRANG — nền ảnh cho các khối đậm + dải ảnh giữa các mục
     =================================================================== */
  function setScene(el, src) {
    if (!el || !filled(src)) return;
    var probe = new Image();
    probe.onload = function () {
      // Đường dẫn tuyệt đối: url() trong biến CSS tính theo file .css, không theo trang
      el.style.setProperty('--scene', 'url("' + new URL(src, location.href).href + '")');
      el.classList.add('has-scene');
    };
    probe.src = src;
  }

  function buildScenery() {
    var c = CONFIG.scenery;
    if (!c || !c.show) return;
    setScene($('#envelope'),  c.envelope);
    setScene($('#countdown'), c.countdown);
    setScene($('.footer'),    c.footer);

    (c.bands || []).forEach(function (b) {
      var host = document.getElementById(b.after);
      if (!host || !filled(b.src)) return;
      var band = document.createElement('figure');
      band.className = 'band';
      band.innerHTML =
        '<img class="band__img" src="' + esc(b.src) + '" alt="" loading="lazy">' +
        '<figcaption class="band__text">' +
          (filled(b.quote) ? '<span class="band__quote">' + esc(b.quote) + '</span>' : '') +
          (filled(b.sub)   ? '<span class="band__sub">'   + esc(b.sub)   + '</span>' : '') +
        '</figcaption>';
      $('img', band).addEventListener('error', function () { band.remove(); });
      host.parentNode.insertBefore(band, host.nextSibling);
    });
  }

  /* Ảnh trong dải trôi chậm hơn trang một chút (parallax nhẹ) */
  function wireParallax() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var imgs = $$('.band__img');
    if (!imgs.length) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      imgs.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var shift = ((r.top + r.height / 2) - vh / 2) * -0.14;
        img.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(1.18)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }


  /* ===================================================================
     11. HIỆN DẦN KHI CUỘN TỚI
     =================================================================== */
  function wireReveal() {
    var targets = $$('.reveal');
    var singles = $$('.photo, .band, .family');
    if (!('IntersectionObserver' in window)) {
      targets.concat(singles).forEach(function (t) { t.classList.add('is-in'); });
      return;
    }
    // Ảnh album / dải ảnh / thẻ hai họ: hiện riêng từng cái, lệch nhịp theo cột
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains('photo')) el.style.transitionDelay = ((Number(el.dataset.i) % 3) * 110) + 'ms';
        el.classList.add('is-in');
        io2.unobserve(el);
      });
    }, { threshold: 0.15 });
    singles.forEach(function (t) { io2.observe(t); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        // Các phần trong một mục hiện lệch nhau một nhịp cho mềm mắt
        $$(':scope > *', en.target).forEach(function (child, i) {
          child.style.transitionDelay = (i * 90) + 'ms';
        });
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (t) { io.observe(t); });
  }


  /* ===================================================================
     12. MÀN CHÀO "MỞ THIỆP"
     Mở thiệp = cú chạm đầu tiên → đây là lúc duy nhất được phép bật nhạc.
     =================================================================== */
  function wireEnvelope() {
    var env  = $('#envelope');
    var card = $('#card');

    // Thêm ?xem vào cuối link thì vào thẳng nội dung, khỏi bấm "Mở thiệp".
    // Tiện khi bạn đang sửa nội dung và xem đi xem lại nhiều lần.
    if (new URLSearchParams(location.search).has('xem')) {
      env.hidden = true;
      card.setAttribute('aria-hidden', 'false');
      card.classList.add('is-shown');
      return;
    }

    env.hidden = false;
    document.body.classList.add('is-locked');

    $('#openCard').addEventListener('click', function () {
      env.classList.add('is-open');
      card.setAttribute('aria-hidden', 'false');
      card.classList.add('is-shown');
      document.body.classList.remove('is-locked');
      playMusic();
      setTimeout(function () { env.hidden = true; }, 950);
      window.scrollTo({ top: 0 });
    });
  }


  /* ===================================================================
     KHỞI ĐỘNG
     =================================================================== */
  function init() {
    if (typeof CONFIG === 'undefined') {
      console.error('[thiep] Không đọc được config.js — kiểm tra lại file assets/js/config.js.');
      return;
    }
    bindHead();
    bindText();
    buildHero();
    buildInvitation();
    buildFamilies();
    buildEvents();
    buildCountdown();
    buildAlbum();
    buildRsvp();
    buildGift();
    buildGuestbook();
    buildMusic();
    buildScenery();
    wireLightbox();
    wireReveal();
    wireParallax();
    wireEnvelope();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
