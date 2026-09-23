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
          '" target="_blank" rel="noopener">Xem bản đồ</a></p>'
        : '';
      return '<article class="event">' +
        '<p class="event__side">' + esc(e.side || '') + '</p>' +
        '<h3 class="event__name">' + esc(e.name || '') + '</h3>' +
        '<p class="event__time">' + esc(e.time || '') + '</p>' +
        '<p class="event__date">' + esc(e.date || '') + '</p>' +
        (filled(e.venue)   ? '<p class="event__venue">' + esc(e.venue) + '</p>' : '') +
        (filled(e.address) ? '<p class="event__address">' + esc(e.address) + '</p>' : '') +
        map +
        '</article>';
    }).join('');
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


  /* ===================================================================
     9. MỪNG CƯỚI — bấm vào số tài khoản là chép luôn
     =================================================================== */
  function buildGift() {
    var c = CONFIG.gift;
    if (!c || !c.show || !c.accounts || !c.accounts.length) return;
    $('#gift').hidden = false;

    $('#giftGrid').innerHTML = c.accounts.map(function (a) {
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
        '</div>';
    }).join('');

    $('#giftGrid').addEventListener('click', function (e) {
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
     11. HIỆN DẦN KHI CUỘN TỚI
     =================================================================== */
  function wireReveal() {
    var targets = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }
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
    wireLightbox();
    wireReveal();
    wireEnvelope();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
