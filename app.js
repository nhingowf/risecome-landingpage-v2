/* Rise Ads Agency · app.js v2.1
   Việc: menu điện thoại, modal liên hệ, bộ chọn ngành (live thing), tính ROAS trong form,
   tabs trang Khách hàng, mục lục hub, chuyển động vào màn hình, gửi form.
   Nội dung luôn có sẵn trong HTML; JS chỉ thêm tiện ích. */

(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ====== CẤU HÌNH GỬI FORM ======
     FORM_ENDPOINT: dán "Web app URL" của Apps Script (backend/apps-script.gs, hướng dẫn trong backend/HUONG-DAN-NOI-FORM.md),
     dạng https://script.google.com/macros/s/XXXX/exec. Cũng nhận mọi URL khác trả JSON {ok:true}.
     FORM_SECRET: tuỳ chọn, phải trùng CONFIG.SECRET trong Apps Script.
     Để FORM_ENDPOINT trống thì form chạy chế độ dự phòng: sao chép nội dung và mở Zalo. */
  var FORM_ENDPOINT = '';
  var FORM_SECRET = '';
  /* Số Zalo dự phòng lấy từ nút Zalo nổi của trang (số này đổi được ở risecom.vn/admin, mục Thông tin website) */
  var ZALO_URL = (function () {
    var a = document.querySelector('.zalo-fab');
    return (a && a.href) || 'https://zalo.me/0364191445';
  })();

  /* ====== VÙNG ROAS THAM CHIẾU THEO NGÀNH (bản công khai: chỉ vùng và nhóm, không số lượng shop, không ROAS thực)
     Rà lại theo số thật 05/10–03/11/2026 (xem 06_Baseline-ROAS-T11-2026.md): chỉ Thời trang đổi 11–15× → 10–14×. ====== */
  var INDUSTRIES = [
    { id: 'me-be',      name: 'Mẹ & Bé',                       zone: [9, 12],  group: 'Nền' },
    { id: 'the-thao',   name: 'Thể thao',                      zone: [11, 15], group: 'Trung' },
    { id: 'noi-that',   name: 'Nội thất / Bàn ghế',            zone: [25, 40], group: 'Cao' },
    { id: 'thoi-trang', name: 'Thời trang',                    zone: [10, 14], group: 'Trung' },
    { id: 'lam-dep',    name: 'Làm đẹp & Chăm sóc cá nhân',    zone: [11, 15], group: 'Trung' },
    { id: 'giay-dep',   name: 'Giày dép',                      zone: [17, 24], group: 'Cao' },
    { id: 'thuc-pham',  name: 'Thực phẩm & Đồ uống',           zone: [9, 12],  group: 'Nền' },
    { id: 'gia-dung',   name: 'Gia dụng & Nhà cửa',            zone: [11, 15], group: 'Trung' },
    { id: 'dien-tu',    name: 'Điện tử & Phụ kiện',            zone: [10, 14], group: 'Trung' },
    { id: 'chan-ga',    name: 'Chăn ga gối',                   zone: [14, 20], group: 'Cao' },
    { id: 'sach',       name: 'Sách',                          zone: [11, 15], group: 'Trung' },
    { id: 'thiet-bi',   name: 'Thiết bị điện / Văn phòng',     zone: [25, 35], group: 'Cao' },
    { id: 'dien-lanh',  name: 'Vật tư điện lạnh',              zone: [12, 16], group: 'Trung' },
    { id: 'hoc-tap',    name: 'Học tập & Đồ trẻ em',           zone: [10, 14], group: 'Trung' }
  ];
  var GROUP_NOTE = {
    'Nền': 'Nhiều người bán cùng từ khoá, CPC cao, mua lặp. Vùng này đã là vùng thắng.',
    'Trung': 'Cân bằng giữa độ phủ và hiệu quả.',
    'Cao': 'Giá trị đơn lớn, từ khoá hẹp. Dưới sàn vùng này là đang lãng phí.'
  };
  /* Hệ số mốc intent so với tâm vùng ngành (A7.2, chờ Thái xác nhận) */
  var INTENTS = [
    { name: 'Brand',       lo: 1.5, hi: 3.0,  note: 'Bảo vệ thị phần hiển thị 80–90%, ROAS cao là hệ quả' },
    { name: 'High Intent', lo: 1.0, hi: 1.25, note: 'Ưu tiên ngân sách, scale khi CVR đạt' },
    { name: 'Mid Intent',  lo: 0.7, hi: 1.0,  note: 'Chấp nhận thấp hơn để mở phủ, theo dõi CVR theo tuần' },
    { name: 'Competitor',  lo: 0.5, hi: 0.8,  note: 'Kiểm soát bid, cắt khi CPC vượt ngưỡng' }
  ];
  window.RISE_INDUSTRIES = INDUSTRIES;

  function fmt1(n) { return n.toFixed(1).replace('.', ','); }
  function fmt0(n) { return String(Math.round(n)); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ====== MENU ĐIỆN THOẠI ====== */
  var menuBtn = $('.menu-btn');
  var sheet = $('#sheet');
  if (menuBtn && sheet) {
    var closeBtn = $('.sheet-close', sheet);
    function openSheet() { sheet.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; (closeBtn || sheet).focus(); }
    function closeSheet() { sheet.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; menuBtn.focus(); }
    menuBtn.addEventListener('click', openSheet);
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    sheet.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
    $all('a', sheet).forEach(function (a) { a.addEventListener('click', closeSheet); });
  }

  /* ====== MODAL LIÊN HỆ ====== */
  var modal = $('#contact-modal');
  if (modal) {
    $all('[data-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var preset = btn.getAttribute('data-modal');
        var sel = $('select[name="service"]', modal);
        if (sel && preset) { sel.value = preset; }
        if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
        var first = $('input, select, textarea', modal); if (first) first.focus();
      });
    });
    $all('[data-modal-close]', modal).forEach(function (b) { b.addEventListener('click', function () { modal.close ? modal.close() : modal.removeAttribute('open'); }); });
    modal.addEventListener('click', function (e) { if (e.target === modal) { modal.close ? modal.close() : modal.removeAttribute('open'); } });
  }

  /* ====== BỘ CHỌN NGÀNH (live thing) ====== */
  $all('[data-picker]').forEach(function (root) {
    var select = $('select', root);
    var out = $('.p-out', root);
    if (!select || !out) return;
    select.innerHTML = INDUSTRIES.map(function (i) { return '<option value="' + i.id + '">' + i.name + '</option>'; }).join('');
    var params = new URLSearchParams(location.search);
    var initial = params.get('nganh');
    if (initial && INDUSTRIES.some(function (i) { return i.id === initial; })) select.value = initial;
    /* data-picker="compact": bảng mốc intent gập lại, mở sẵn khi khách đến từ link ?nganh= hoặc #h-roas */
    var compact = root.getAttribute('data-picker') === 'compact';
    var openMore = !!initial || location.hash === '#h-roas';
    function render() {
      var ind = INDUSTRIES.filter(function (i) { return i.id === select.value; })[0] || INDUSTRIES[0];
      var c = (ind.zone[0] + ind.zone[1]) / 2;
      var rows = INTENTS.map(function (t) {
        return '<tr><td class="k">' + t.name + '</td><td class="r">' + fmt0(c * t.lo) + '–' + fmt0(c * t.hi) + '×</td><td>' + t.note + '</td></tr>';
      }).join('') + '<tr><td class="k">Loại trừ</td><td class="r">Không chạy</td><td>Nhu cầu, vấn đề chung: loại khỏi campaign</td></tr>';
      var prev = $('details', out);
      if (prev) openMore = prev.open;
      var table = '<table class="tbl tbl-stack"><thead><tr><th>Nhóm intent</th><th class="r">Mốc Target ROAS</th><th>Rise Ads làm gì</th></tr></thead><tbody>' + rows + '</tbody></table>';
      if (compact) {
        table = '<details class="more"' + (openMore ? ' open' : '') + '><summary>Xem mốc theo nhóm từ khoá: Brand, High, Mid, Competitor</summary>' + table + '</details>';
      }
      out.innerHTML =
        '<div class="p-zone">' +
          '<div><b>' + ind.zone[0] + '–' + ind.zone[1] + '×</b><span>Vùng Target ROAS tham chiếu cho ' + ind.name + '</span></div>' +
          '<div><b>' + ind.group + '</b><span>Nhóm ngành. ' + GROUP_NOTE[ind.group] + '</span></div>' +
          '<div><b>' + fmt0(ind.zone[1] * 1.3) + '×</b><span>Trên mức này thường đã bị siết hiển thị, GMV đứng dù ROAS đẹp</span></div>' +
        '</div>' + table +
        '<p class="note mt-s">Vùng rút từ danh mục Rise Ads đang vận hành, đã gộp và ẩn danh. Đây là điểm xuất phát; mốc thật cho shop bạn chốt sau audit tuần 1.</p>';
      out.setAttribute('aria-live', 'polite');
    }
    select.addEventListener('change', render);
    render();
  });

  /* ====== TÍNH ROAS TRONG FORM ====== */
  function parseVND(s) {
    if (!s) return NaN;
    var t = String(s).toLowerCase().replace(/\s+/g, '');
    var mult = 1;
    if (/t[ỷy]|\bb\b/.test(t)) mult = 1e9;
    else if (/tr|triệu|trieu|m\b/.test(t)) mult = 1e6;
    else if (/k\b|nghìn|ngàn/.test(t)) mult = 1e3;
    var numStr = t.replace(/[^\d.,]/g, '');
    if (!numStr) return NaN;
    if (mult === 1) { // "400.000.000" hoặc "400,000,000"
      var digits = numStr.replace(/[.,]/g, '');
      return parseFloat(digits);
    }
    numStr = numStr.replace(/\./g, '').replace(',', '.');
    return parseFloat(numStr) * mult;
  }
  $all('form[data-form]').forEach(function (form) {
    var spend = $('[name="ads_spend"]', form);
    var rev = $('[name="ads_revenue"]', form);
    var ind = $('[name="industry"]', form);
    var outEl = $('.roas-out', form);
    if (ind && ind.tagName === 'SELECT' && ind.options.length <= 1) {
      INDUSTRIES.forEach(function (i) { var o = document.createElement('option'); o.value = i.id; o.textContent = i.name; ind.appendChild(o); });
      var other = document.createElement('option'); other.value = 'khac'; other.textContent = 'Ngành khác'; ind.appendChild(other);
    }
    function calc() {
      if (!spend || !rev || !outEl) return;
      var a = parseVND(spend.value), b = parseVND(rev.value);
      if (!(a > 0) || !(b > 0)) { outEl.textContent = ''; return; }
      var r = b / a;
      var msg = 'ROAS hiện tại khoảng ' + fmt1(r) + '×.';
      var sel = ind && INDUSTRIES.filter(function (i) { return i.id === ind.value; })[0];
      if (sel) {
        var pos = r > sel.zone[1] * 1.3 ? 'vượt xa trần vùng, có thể đang bị siết hiển thị' :
                  r >= sel.zone[0] ? 'trong hoặc trên vùng tham chiếu' :
                  r >= sel.zone[0] * 0.8 ? 'dưới sàn vùng 10–20%, mức biên' : 'dưới sàn vùng trên 20%, cần audit';
        msg += ' Vùng tham chiếu ngành ' + sel.name + ': ' + sel.zone[0] + '–' + sel.zone[1] + '×. Shop bạn ' + pos + '.';
      }
      outEl.textContent = msg;
    }
    [spend, rev, ind].forEach(function (el) { if (el) { el.addEventListener('input', calc); el.addEventListener('change', calc); } });

    /* Gửi form */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = $('[name="website_url"]', form);
      if (hp && hp.value) return; // honeypot
      var phone = $('[name="phone"]', form);
      var err = $('.err', form);
      if (phone) {
        var p = phone.value.replace(/[^\d+]/g, '');
        if (!/^(\+84|0)\d{9,10}$/.test(p)) { if (err) err.textContent = 'Số Zalo cần 10 số, ví dụ 036 419 1445.'; phone.focus(); return; }
      }
      var em = $('[name="email"]', form);
      if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())) { if (err) err.textContent = 'Email chưa đúng, ví dụ ten@congty.vn.'; em.focus(); return; }
      if (err) err.textContent = '';
      var data = {};
      $all('input, select, textarea', form).forEach(function (el) { if (el.name && el.name !== 'website_url') data[el.name] = el.value; });
      data.page = location.pathname; data.utm = location.search; data.ts = new Date().toISOString(); data.ua = navigator.userAgent;
      if (FORM_SECRET) data.secret = FORM_SECRET;
      var done = $('.f-done', form);
      var btn = $('button[type="submit"]', form);
      var okText = form.getAttribute('data-done') || 'Đã nhận yêu cầu. Người phụ trách của Rise Ads sẽ liên hệ qua Zalo trong 24 giờ làm việc.';
      function finish(text) { if (done) { done.textContent = text; done.hidden = false; done.focus && done.setAttribute('tabindex', '-1'); done.focus(); } form.reset(); if (outEl) outEl.textContent = ''; if (btn) btn.disabled = false; }
      if (btn) btn.disabled = true;
      if (FORM_ENDPOINT) {
        /* Gửi dạng text/plain để không bị preflight: Apps Script không trả lời OPTIONS. */
        var body = JSON.stringify(data);
        var sent = false;
        var timer = setTimeout(function () { if (!sent) { sent = true; finish(okText); } }, 8000);
        fetch(FORM_ENDPOINT, { method: 'POST', mode: 'cors', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body })
          .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
          .then(function (j) {
            if (sent) return; sent = true; clearTimeout(timer);
            if (j && j.ok) finish(okText);
            else throw new Error((j && j.error) || 'bad');
          })
          .catch(function () {
            if (sent) return; sent = true; clearTimeout(timer);
            /* Lần 2: no-cors, không đọc được phản hồi nhưng Apps Script vẫn ghi nhận */
            fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body })
              .then(function () { finish(okText); })
              .catch(function () { if (btn) btn.disabled = false; if (err) err.textContent = 'Chưa gửi được. Bạn nhắn Zalo 036 419 1445 giúp Rise Ads nhé.'; });
          });
      } else {
        var summary = Object.keys(data).filter(function (k) { return data[k] && ['page', 'utm', 'ts'].indexOf(k) < 0; }).map(function (k) { return k + ': ' + data[k]; }).join('\n');
        var text = 'Yêu cầu tư vấn Rise Ads\n' + summary;
        var copied = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject();
        copied.then(function () {
          finish('Form chưa nối máy chủ. Nội dung bạn điền đã được sao chép, Zalo của Rise Ads sẽ mở ở tab mới: dán vào và gửi, chúng tôi phản hồi trong 24 giờ làm việc.');
          window.open(ZALO_URL, '_blank', 'noopener');
        }).catch(function () {
          finish('Form chưa nối máy chủ. Bạn nhắn Zalo 036 419 1445 giúp Rise Ads nhé.');
          window.open(ZALO_URL, '_blank', 'noopener');
        });
      }
    });
  });

  /* ====== MÁY TÍNH HOÀN HỌC PHÍ (trang workshop) ====== */
  $all('[data-calc]').forEach(function (root) {
    var fee = parseFloat(root.getAttribute('data-fee') || '2'); // triệu đồng
    var sp = $('[name="c_spend"]', root), wa = $('[name="c_waste"]', root);
    if (!sp || !wa) return;
    function money(tr) { return tr >= 1000 ? (tr / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ' : tr.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu'; }
    function calc() {
      var s = +sp.value, w = +wa.value, loss = s * w / 100, perDay = loss / 30, days = perDay > 0 ? fee / perDay : 0;
      $('[data-out="spend"]', root).textContent = money(s);
      $('[data-out="waste"]', root).textContent = w + '%';
      $('[data-out="loss"]', root).textContent = money(loss);
      $('[data-out="days"]', root).textContent = days < 1 ? 'dưới 1 ngày' : Math.ceil(days) + ' ngày';
      $('[data-out="verdict"]', root).textContent = 'Mỗi tháng chần chừ là thêm ' + money(loss) + ' trả cho máy.';
    }
    sp.addEventListener('input', calc); wa.addEventListener('input', calc); calc();
  });

  /* ====== BLOG: LỌC THEO CHỦ ĐỀ + TÌM BÀI ====== */
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  $all('[data-blog]').forEach(function (root) {
    var chips = $all('[data-cat-btn]', root), search = $('[data-search]', root), items = $all('[data-post]', root), empty = $('[data-empty]', root);
    var cat = 'all';
    function apply() {
      var q = fold(search && search.value).trim(), shown = 0;
      items.forEach(function (it) {
        var okc = cat === 'all' || it.getAttribute('data-cat') === cat;
        var okq = !q || fold(it.getAttribute('data-text') || it.textContent).indexOf(q) >= 0;
        it.hidden = !(okc && okq);
        if (!it.hidden) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-cat-btn');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
  });

  /* ====== BLOG: SAO CHÉP LIÊN KẾT BÀI ====== */
  $all('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var note = b.parentNode.querySelector('[data-copy-note]');
      var url = location.href.split('#')[0];
      function msg(t) { if (note) note.textContent = t; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { msg('Đã sao chép liên kết'); }, function () { msg('Chưa sao chép được, hãy copy từ thanh địa chỉ'); });
      } else { msg('Hãy copy liên kết từ thanh địa chỉ'); }
    });
  });

  /* ====== PHÂN TRANG LƯỚI LOGO ====== */
  $all('[data-pager]').forEach(function (root) {
    var pages = $all('.pager-page', root);
    var prev = $('[data-prev]', root), next = $('[data-next]', root), dots = $('.pager-dots', root);
    if (pages.length < 2) { var nav = $('.pager-nav', root); if (nav) nav.hidden = true; return; }
    var i = 0;
    function show(n) {
      i = Math.max(0, Math.min(pages.length - 1, n));
      pages.forEach(function (p, j) { p.hidden = j !== i; });
      if (dots) dots.textContent = (i + 1) + ' / ' + pages.length;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === pages.length - 1;
    }
    if (prev) prev.addEventListener('click', function () { show(i - 1); });
    if (next) next.addEventListener('click', function () { show(i + 1); });
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1); x0 = null; }, { passive: true });
    show(0);
  });

  /* ====== TABS ====== */
  $all('.tabs').forEach(function (root) {
    var tabs = $all('[role="tab"]', root);
    var panels = $all('[role="tabpanel"]', root);
    function show(i) {
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = i !== j; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (n === null) return; n = (n + tabs.length) % tabs.length; show(n); tabs[n].focus();
      });
    });
    var idx = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    show(idx < 0 ? 0 : idx);
  });

  /* ====== MỤC LỤC HUB: đánh dấu mục đang đọc ====== */
  var toc = $('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = $all('a[href^="#"]', toc);
    var map = {};
    links.forEach(function (a) { var el = $(a.getAttribute('href')); if (el) map[el.id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { links.forEach(function (a) { a.classList.remove('cur'); }); if (map[en.target.id]) map[en.target.id].classList.add('cur'); } });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { io.observe($('#' + id)); });
  }

  /* ====== CHUYỂN ĐỘNG VÀO MÀN HÌNH ====== */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = $all('.reveal');
  if (!reduce && 'IntersectionObserver' in window && reveals.length) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', ((i % 4) * 70) + 'ms'); rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
  /* Ảnh hero trôi chậm theo cuộn */
  var drift = $('.drift');
  if (drift && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { var y = Math.min(window.scrollY, 900); drift.style.transform = 'translateY(' + (y * 0.08) + 'px)'; ticking = false; });
    }, { passive: true });
  }
})();
