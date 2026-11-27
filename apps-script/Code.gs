/**
 * CareBridge 상담 문의 접수기 (Google Apps Script)
 *
 * 홈페이지 문의 폼 → ① 구글 시트에 저장 ② 내 Gmail로 메일 ③ ntfy 앱으로 휴대폰 푸시
 *
 * 설정값은 코드에 적지 않고 [프로젝트 설정 → 스크립트 속성]에 넣습니다.
 *   NOTIFY_EMAIL : 알림 받을 이메일 (예: me@gmail.com, 여러 명이면 쉼표로)
 *   NTFY_TOPIC   : ntfy 앱에서 구독할 비밀 토픽 이름 (예: carebridge-7f3k9q2x)
 */

const SHEET_NAME = 'Inquiries';
const HEADERS = ['접수 시각', '이름', '이메일', '거주 국가', '방문 예정 시기', '관심 서비스', '문의 내용', '접수 페이지', '처리 상태'];
const FIELDS = ['name', 'email', 'country', 'travel_dates', 'service', 'message'];
const LIMITS = { name: 100, email: 150, country: 80, travel_dates: 80, service: 60, message: 500, page: 300 };

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (String(p.contact_alt || '').trim()) return json_({ code: 'OK' }); // 스팸봇

    const d = {};
    FIELDS.concat(['page']).forEach(function (k) { d[k] = String(p[k] || '').trim().slice(0, LIMITS[k]); });

    if (!d.name) return json_({ code: 'ERROR', message: 'Please share your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json_({ code: 'ERROR', message: 'Please enter a valid email address.' });

    // 같은 이메일로 1분 안에 반복 전송 막기
    const cache = CacheService.getScriptCache();
    const key = 'rl_' + Utilities.base64EncodeWebSafe(d.email.toLowerCase()).slice(0, 200);
    if (cache.get(key)) return json_({ code: 'ERROR', message: 'Your request was already received. Please wait a moment before sending another.' });
    cache.put(key, '1', 60);

    const now = new Date();
    saveToSheet_(d, now);

    // 알림은 하나가 실패해도 접수 자체는 성공 처리
    try { sendEmail_(d, now); } catch (err) { console.error('email failed', err); }
    try { sendPush_(d); } catch (err) { console.error('push failed', err); }

    return json_({ code: 'OK' });
  } catch (err) {
    console.error(err);
    return json_({ code: 'ERROR', message: 'We could not send your request. Please try again shortly.' });
  }
}

function doGet() {
  return json_({ code: 'OK', message: 'CareBridge enquiry endpoint is running.' });
}

// ── 시트 저장 ──
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#e8efe9');
  }
  return sh;
}

function saveToSheet_(d, now) {
  const safe = function (v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }; // 수식 주입 방지
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([now].concat(FIELDS.map(function (k) { return safe(d[k]); }), [d.page, '신규']));
  } finally {
    lock.releaseLock();
  }
}

// ── 이메일 ──
function sendEmail_(d, now) {
  const to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  const esc = function (s) { return String(s || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'); };
  const rows = [['이름', d.name], ['이메일', d.email], ['거주 국가', d.country], ['방문 예정 시기', d.travel_dates], ['관심 서비스', d.service], ['문의 내용', d.message]];
  const when = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px">' +
    '<h2 style="color:#244a35;margin:0 0 4px">새 상담 문의가 접수되었습니다</h2>' +
    '<p style="color:#666;margin:0 0 16px">' + when + ' (한국시간)</p>' +
    '<table style="border-collapse:collapse;width:100%">' +
    rows.map(function (r) {
      return '<tr><td style="padding:8px 10px;border:1px solid #e3e3e3;background:#f6f7f4;width:120px;color:#555">' + r[0] +
        '</td><td style="padding:8px 10px;border:1px solid #e3e3e3">' + esc(r[1]) + '</td></tr>';
    }).join('') +
    '</table>' +
    '<p style="color:#666;margin-top:16px">이 메일에 바로 <b>답장</b>하면 고객(' + esc(d.email) + ')에게 전달됩니다.</p>' +
    '<p><a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">문의 시트 열기</a></p></div>';

  MailApp.sendEmail({
    to: to,
    replyTo: d.email,
    name: 'CareBridge 홈페이지',
    subject: '[CareBridge 문의] ' + d.name + (d.service ? ' · ' + d.service : ''),
    htmlBody: html,
    body: rows.map(function (r) { return r[0] + ': ' + (r[1] || '-'); }).join('\n'),
  });
}

// ── 휴대폰 푸시 (ntfy) ──
function sendPush_(d) {
  const topic = PropertiesService.getScriptProperties().getProperty('NTFY_TOPIC');
  if (!topic) return;
  const lines = [d.name + ' <' + d.email + '>'];
  if (d.country) lines.push('국가: ' + d.country);
  if (d.travel_dates) lines.push('시기: ' + d.travel_dates);
  if (d.service) lines.push('서비스: ' + d.service);
  if (d.message) lines.push('', d.message.slice(0, 300));
  UrlFetchApp.fetch('https://ntfy.sh/', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      topic: topic,
      title: 'CareBridge 새 상담 문의',
      message: lines.join('\n'),
      tags: ['bellhop_bell'],
      priority: 4,
      click: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    }),
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 처음 한 번 실행: 시트를 만들고, 메일·푸시가 오는지 테스트합니다. (권한 승인 창이 뜹니다) */
function setupAndTest() {
  getSheet_();
  const d = { name: '테스트 고객', email: 'test@example.com', country: 'Singapore', travel_dates: 'March 2027', service: 'Medical coordination', message: '설정 테스트입니다. 이 줄은 지워도 됩니다.', page: 'setup' };
  saveToSheet_(d, new Date());
  sendEmail_(d, new Date());
  sendPush_(d);
  console.log('완료! 시트, 메일함, ntfy 앱을 확인하세요.');
}
