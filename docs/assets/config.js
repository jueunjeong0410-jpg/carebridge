// ─────────────────────────────────────────────────────────────
// 문의 접수 주소 (Google Apps Script 웹앱 URL)
// apps-script/README.md 안내대로 배포한 뒤, 받은 URL을 아래 따옴표 안에 붙여넣으세요.
// 예: 'https://script.google.com/macros/s/AKfycb.../exec'
// ─────────────────────────────────────────────────────────────
window.CAREBRIDGE_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2sM3Yo2qOOEJSVyAXoI34MWbL98fzXsrOhH_4WEtxBNMJgbFftGYQpN1QeKgETMuO/exec';

// 휴대폰 푸시(ntfy 앱) 토픽 — 문의가 접수되면 이 토픽으로 "새 문의 도착" 알림을 보냅니다.
// 홈페이지 코드에 보이는 값이라, 알림에는 고객 이름·이메일 같은 개인정보를 넣지 않습니다.
window.CAREBRIDGE_PUSH_TOPIC = 'carebridge-oszufbatef';

// 방문 통계(Google Analytics 4) 측정 ID — 모든 웹사이트 코드에 공개되는 값이라 비밀값이 아닙니다.
window.CAREBRIDGE_GA_ID = 'G-415VN0PMW0';
