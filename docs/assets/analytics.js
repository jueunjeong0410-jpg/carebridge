// ─────────────────────────────────────────────────────────────
// 방문 통계 (Google Analytics 4)
// - 측정 ID는 config.js의 CAREBRIDGE_GA_ID (공개돼도 되는 값)
// - 실제 주소(carebridge.seoul.kr)에서만 구글로 전송하고, 테스트·로컬에서는 기록만 함
// - 문의 내용·이름·이메일·전화번호 같은 개인정보는 절대 보내지 않음
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';
  var id = window.CAREBRIDGE_GA_ID;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var live = location.hostname === 'carebridge.seoul.kr';

  if (id) {
    if (live) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(s);
    }
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  // 다른 스크립트에서 쓰는 이벤트 기록 함수
  window.cbTrack = function (name, params) {
    try { window.gtag('event', name, params || {}); } catch (_) {}
  };

  var pageType = (function () {
    var p = location.pathname.replace(/\/+$/, '/');
    if (/\/services\/[^/]+\/$/.test(p)) return 'service_detail';
    if (/\/services\/$/.test(p)) return 'services';
    return 'home';
  })();

  // 상담 신청 버튼·링크 클릭 (어느 위치의 버튼이 많이 눌리는지)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    if (href.indexOf('#consultation') !== -1) {
      var where = a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : 'page';
      window.cbTrack('cta_click', { cta_label: label, cta_location: where, page_type: pageType });
    } else if (a.closest('#services-menu')) {
      window.cbTrack('service_menu_click', { service_name: label, page_type: pageType });
    }
  }, true);

  // 페이지를 어디까지 읽었는지 (25·50·75·100%) — 기본 스크롤 측정(90%)보다 자세히
  var marks = [25, 50, 75, 100], sent = {};
  var onScroll = function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    var pct = Math.round((window.scrollY / h) * 100);
    marks.forEach(function (m) {
      if (pct >= m && !sent[m]) { sent[m] = true; window.cbTrack('scroll_depth', { percent: m, page_type: pageType }); }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
