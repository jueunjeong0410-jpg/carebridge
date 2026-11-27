(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var toggleClasses = function (el, add, remove) {
    add.split(' ').forEach(function (c) { if (c) el.classList.add(c); });
    remove.split(' ').forEach(function (c) { if (c) el.classList.remove(c); });
  };

  // ── 사진이 못 불러와지면 깨진 아이콘·대체글 대신 뒤의 배경색이 보이게 숨김 ──
  var hideBroken = function (im) { im.style.visibility = 'hidden'; };
  $$('img').forEach(function (im) {
    if (im.complete && im.naturalWidth === 0 && im.getAttribute('src')) hideBroken(im);
    im.addEventListener('error', function () { hideBroken(im); });
    im.addEventListener('load', function () { im.style.visibility = ''; });
  });

  // ── 헤더: 스크롤 시 배경/테두리 진하게 ──
  var header = $('#site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) toggleClasses(header, 'bg-background-50/95 backdrop-blur-md border-foreground-950/10', 'bg-background-50/80 backdrop-blur-sm border-transparent');
      else toggleClasses(header, 'bg-background-50/80 backdrop-blur-sm border-transparent', 'bg-background-50/95 backdrop-blur-md border-foreground-950/10');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── 로고: 홈 화면에서 누르면 맨 위로 부드럽게, 다른 화면에서는 홈으로 이동 ──
  var logo = $('#logo-home');
  if (logo && logo.getAttribute('href') === './') {
    logo.addEventListener('click', function (e) {
      e.preventDefault();
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── 모바일 메뉴 ──
  var toggle = $('#menu-toggle'), menu = $('#mobile-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      $('i', toggle).className = 'text-2xl ' + (open ? 'ri-close-line' : 'ri-menu-line');
      if (open) toggleClasses(menu, 'max-h-96 opacity-100 border-foreground-950/10', 'max-h-0 opacity-0 border-transparent');
      else toggleClasses(menu, 'max-h-0 opacity-0 border-transparent', 'max-h-96 opacity-100 border-foreground-950/10');
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  // ── 갤러리 모달 ──
  var modal = $('#gallery-modal'), items = window.CB_GALLERY || [], cur = null;
  if (modal && items.length) {
    var show = function (i) {
      cur = (i + items.length) % items.length;
      $('#gallery-img').src = items[cur].src;
      $('#gallery-img').alt = items[cur].caption;
      $('#gallery-caption').textContent = items[cur].caption;
    };
    var open = function (i) { show(i); modal.classList.remove('hidden'); modal.classList.add('flex'); document.body.style.overflow = 'hidden'; };
    var close = function () { cur = null; modal.classList.add('hidden'); modal.classList.remove('flex'); document.body.style.overflow = ''; };
    $$('[data-gallery-open]').forEach(function (b) { b.addEventListener('click', function () { open(Number(b.getAttribute('data-gallery-open'))); }); });
    modal.addEventListener('click', close);
    $('[data-gallery-inner]', modal).addEventListener('click', function (e) { e.stopPropagation(); });
    $('[data-gallery-prev]', modal).addEventListener('click', function () { show(cur - 1); });
    $('[data-gallery-next]', modal).addEventListener('click', function () { show(cur + 1); });
    $('[data-gallery-close]', modal).addEventListener('click', close);
    window.addEventListener('keydown', function (e) {
      if (cur === null) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
  }

  // ── 후기 슬라이더 ──
  var reviews = window.CB_REVIEWS || [];
  if (reviews.length && $('#review-quote')) {
    var idx = 0, dots = $$('[data-review-dot]');
    var render = function () {
      var r = reviews[idx];
      $('#review-quote').textContent = r.quote;
      $('#review-name').textContent = r.name;
      $('#review-location').textContent = r.location;
      $('#review-service').textContent = r.service;
      $('#review-count').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(reviews.length).padStart(2, '0');
      dots.forEach(function (d, i) {
        if (i === idx) toggleClasses(d, 'w-7 bg-primary-600', 'w-1.5 bg-foreground-300 hover:bg-foreground-400');
        else toggleClasses(d, 'w-1.5 bg-foreground-300 hover:bg-foreground-400', 'w-7 bg-primary-600');
      });
    };
    $('[data-review-prev]').addEventListener('click', function () { idx = (idx - 1 + reviews.length) % reviews.length; render(); });
    $('[data-review-next]').addEventListener('click', function () { idx = (idx + 1) % reviews.length; render(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { idx = i; render(); }); });
  }

  // ── 상담 신청 폼 ──
  var form = $('#carebridge-consultation-form');
  if (form) {
    var success = $('#form-success'), errBox = $('#form-error'), btn = $('#form-submit');
    var sending = false;
    var setSending = function (on) {
      sending = on; btn.disabled = on;
      $('[data-label]', btn).textContent = on ? 'Sending…' : 'Send request';
      $('[data-arrow]', btn).style.display = on ? 'none' : '';
    };
    var showError = function (msg) { errBox.textContent = msg; errBox.classList.remove('hidden'); };
    var showSuccess = function () { form.reset(); form.classList.add('hidden'); success.classList.remove('hidden'); };
    // 접수 성공 후 운영자 휴대폰(ntfy 앱)에 알림 — 개인정보 없이 '새 문의 도착'만 알림
    var notifyPhone = function (service, visitDate) {
      var topic = window.CAREBRIDGE_PUSH_TOPIC;
      if (!topic) return;
      try {
        fetch('https://ntfy.sh/', {
          method: 'POST',
          keepalive: true,
          body: JSON.stringify({
            topic: topic,
            title: 'CareBridge 새 상담 문의',
            message: '병원 방문 희망일: ' + (visitDate || '-') + '\n방문 유형: ' + (service || '선택 안 함') + '\n자세한 내용은 메일함 또는 문의 시트를 확인하세요.',
            tags: ['bellhop_bell'],
            priority: 4
          })
        }).catch(function () {});
      } catch (_) {}
    };
    // 병원 방문 희망일: 오늘 이전 날짜는 고를 수 없게
    var visit = $('#cb-visit');
    if (visit) {
      var t = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
      visit.min = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    }
    $('#form-again').addEventListener('click', function () { success.classList.add('hidden'); form.classList.remove('hidden'); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      errBox.classList.add('hidden');
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new FormData(form);
      // 스팸봇이 숨은 칸을 채우면 조용히 성공 처리 (원본과 동일한 방식)
      if (String(data.get('contact_alt') || '').trim()) { showSuccess(); return; }

      var endpoint = window.CAREBRIDGE_FORM_ENDPOINT;
      if (!endpoint) { showError('Consultation requests are not connected yet. Please try again shortly.'); return; }

      var body = new URLSearchParams();
      // 같은 이름 칸(동행 유형 체크박스 여러 개)은 쉼표로 묶어 한 칸으로 보냄
      var services = data.getAll('service').join(', ');
      data.forEach(function (v, k) { if (k !== 'contact_alt' && k !== 'service' && typeof v === 'string') body.append(k, v); });
      body.append('service', services);
      body.append('page', location.href);

      setSending(true);
      // Content-Type을 지정하지 않으면(= 단순 요청) Apps Script로 CORS 문제 없이 전송됩니다.
      fetch(endpoint, { method: 'POST', body: body })
        .then(function (res) { return res.text().then(function (t) { return { ok: res.ok, text: t }; }); })
        .then(function (r) {
          var json = null; try { json = JSON.parse(r.text); } catch (_) {}
          if (!r.ok || !json || json.code !== 'OK') {
            showError((json && json.message) || 'We could not send your request. Please try again shortly.');
            return;
          }
          notifyPhone(services, data.get('visit_date'));
          showSuccess();
        })
        .catch(function () { showError('We could not send your request. Please check your connection and try again.'); })
        .then(function () { setSending(false); });
    });
  }
})();
