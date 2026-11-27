/**
 * CareBridge 홈페이지 통계 대시보드 (Google Analytics 4 → 구글 시트)
 *
 * 처음 한 번: 편집기에서 setupAnalytics 실행 (권한 허용)
 *   - 'Care Bridge' GA4 속성을 찾아 스크립트 속성 GA_PROPERTY에 저장
 *   - 문의 완료(generate_lead)를 '주요 이벤트(전환)'로 등록
 *   - 버튼 위치·서비스명 같은 이벤트 정보를 보고서에 쓸 수 있게 맞춤 측정기준 등록
 *   - 15분마다 자동 갱신 예약 → 바로 한 번 갱신
 * 이후: refreshDashboard가 15분마다 시트를 새로 채움 (수동 실행도 가능)
 *   · '지금 접속 중' 칸은 최근 30분 실시간 데이터, 나머지 보고서는 GA 처리 시간 때문에 몇 시간 늦을 수 있음
 *
 * 필요한 고급 서비스: AnalyticsData, AnalyticsAdmin (편집기 왼쪽 '서비스'에서 추가)
 */

const GA_PROPERTY_NAME = 'Care Bridge';
const DASH = {
  summary: '📊 대시보드',
  daily: '일별 지표',
  pages: '페이지별',
  sources: '유입 경로',
  clicks: '버튼 클릭',
  audience: '국가·기기',
  utm: 'UTM 링크',
  guide: '운영 가이드',
};
const CUSTOM_DIMS = [
  ['cta_location', '버튼 위치'],
  ['cta_label', '버튼 문구'],
  ['service_name', '메뉴 서비스명'],
  ['page_type', '페이지 종류'],
];
const SITE = 'https://carebridge.seoul.kr';

// ───────────── 설정 ─────────────
function setupAnalytics() {
  const prop = findProperty_();
  PropertiesService.getScriptProperties().setProperty('GA_PROPERTY', prop);
  ensureKeyEvent_(prop, 'generate_lead');
  ensureCustomDims_(prop);
  ensureTrigger_();
  writeUtmSheet_();
  writeGuideSheet_();
  refreshDashboard();
  Logger.log('완료: ' + prop);
}

function findProperty_() {
  let token = null;
  do {
    const res = AnalyticsAdmin.AccountSummaries.list({ pageSize: 200, pageToken: token });
    const list = res.accountSummaries || [];
    for (let i = 0; i < list.length; i++) {
      const ps = list[i].propertySummaries || [];
      for (let j = 0; j < ps.length; j++) {
        if (ps[j].displayName === GA_PROPERTY_NAME) return ps[j].property; // 'properties/123'
      }
    }
    token = res.nextPageToken;
  } while (token);
  throw new Error("GA4에서 '" + GA_PROPERTY_NAME + "' 속성을 찾지 못했습니다.");
}

function ensureKeyEvent_(prop, name) {
  const have = (AnalyticsAdmin.Properties.KeyEvents.list(prop).keyEvents || []).some(function (k) { return k.eventName === name; });
  if (!have) AnalyticsAdmin.Properties.KeyEvents.create({ eventName: name, countingMethod: 'ONCE_PER_EVENT' }, prop);
}

function ensureCustomDims_(prop) {
  const have = (AnalyticsAdmin.Properties.CustomDimensions.list(prop).customDimensions || []).map(function (d) { return d.parameterName; });
  CUSTOM_DIMS.forEach(function (d) {
    if (have.indexOf(d[0]) === -1) {
      AnalyticsAdmin.Properties.CustomDimensions.create({ parameterName: d[0], displayName: d[1], scope: 'EVENT' }, prop);
    }
  });
}

const REFRESH_MINUTES = 15; // 하루 자동 실행 한도(90분) 안에서 여유 있게
function ensureTrigger_() {
  const prev = PropertiesService.getScriptProperties().getProperty('DASH_TRIGGER');
  const mine = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'refreshDashboard'; });
  if (mine.length === 1 && prev === 'every' + REFRESH_MINUTES + 'min') return;
  mine.forEach(function (t) { ScriptApp.deleteTrigger(t); }); // 예전 '하루 1번' 예약 등 정리
  ScriptApp.newTrigger('refreshDashboard').timeBased().everyMinutes(REFRESH_MINUTES).create();
  PropertiesService.getScriptProperties().setProperty('DASH_TRIGGER', 'every' + REFRESH_MINUTES + 'min');
}

// ───────────── 보고서 ─────────────
function report_(dims, mets, start, end, filterEvents, limit) {
  const req = {
    dimensions: dims.map(function (n) { return { name: n }; }),
    metrics: mets.map(function (n) { return { name: n }; }),
    dateRanges: [{ startDate: start, endDate: end }],
    limit: limit || 1000,
  };
  if (filterEvents) req.dimensionFilter = { filter: { fieldName: 'eventName', inListFilter: { values: filterEvents } } };
  const prop = PropertiesService.getScriptProperties().getProperty('GA_PROPERTY');
  if (!prop) throw new Error('먼저 setupAnalytics를 실행하세요.');
  const res = AnalyticsData.Properties.runReport(req, prop);
  return (res.rows || []).map(function (r) {
    return (r.dimensionValues || []).map(function (v) { return v.value; })
      .concat((r.metricValues || []).map(function (v) { return Number(v.value); }));
  });
}

function writeTable_(name, title, headers, rows, formats) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1).setValue(title).setFontWeight('bold').setFontSize(13);
  sh.getRange(2, 1).setValue('마지막 갱신: ' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm')).setFontColor('#888888');
  sh.getRange(4, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#1f3a2e').setFontColor('#ffffff');
  if (rows.length) {
    sh.getRange(5, 1, rows.length, headers.length).setValues(rows);
    (formats || []).forEach(function (f, i) { if (f) sh.getRange(5, i + 1, rows.length, 1).setNumberFormat(f); });
  } else {
    sh.getRange(5, 1).setValue('아직 데이터가 없습니다. (GA4는 수집 시작 후 하루 정도 지나야 보고서에 나타납니다)').setFontColor('#888888');
  }
  sh.setFrozenRows(4);
  sh.autoResizeColumns(1, headers.length);
  return sh;
}

const ymd_ = function (s) { return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8); };
const div_ = function (a, b) { return b ? a / b : 0; };

function refreshDashboard() {
  // 1) 일별 지표 (최근 90일)
  const base = report_(['date'], ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'userEngagementDuration', 'engagementRate'], '90daysAgo', 'today');
  const ev = report_(['date', 'eventName'], ['eventCount'], '90daysAgo', 'today', ['form_start', 'generate_lead']);
  const evBy = {};
  ev.forEach(function (r) { (evBy[r[0]] = evBy[r[0]] || {})[r[1]] = r[2]; });
  const daily = base.map(function (r) {
    const e = evBy[r[0]] || {}, fs = e.form_start || 0, gl = e.generate_lead || 0;
    return [ymd_(r[0]), r[1], r[2], r[3], r[4], Math.round(div_(r[5], r[3])), r[6], fs, gl, div_(gl, r[3]), div_(gl, fs)];
  }).sort(function (a, b) { return a[0] < b[0] ? 1 : -1; });
  writeTable_(DASH.daily, '일별 지표 (최근 90일)',
    ['날짜', '방문자', '신규 방문자', '방문(세션)', '페이지뷰', '방문당 평균 체류(초)', '참여율', '신청서 작성 시작', '문의 완료(전환)', '전환율(문의÷방문)', '작성 완료율(완료÷시작)'],
    daily, [null, '0', '0', '0', '0', '0', '0.0%', '0', '0', '0.0%', '0.0%']);

  // 2) 페이지별 (최근 30일)
  const pages = report_(['pagePath'], ['screenPageViews', 'activeUsers', 'userEngagementDuration', 'engagementRate'], '30daysAgo', 'today')
    .map(function (r) { return [r[0], r[1], r[2], Math.round(div_(r[3], r[1])), r[4]]; })
    .sort(function (a, b) { return b[1] - a[1]; });
  writeTable_(DASH.pages, '페이지별 조회수·체류 시간 (최근 30일)',
    ['페이지 주소', '조회수', '방문자', '조회당 평균 체류(초)', '참여율'], pages, [null, '0', '0', '0', '0.0%']);

  // 3) 유입 경로 (최근 30일)
  const src = report_(['sessionSource', 'sessionMedium', 'sessionCampaignName'], ['sessions', 'activeUsers', 'engagementRate', 'keyEvents'], '30daysAgo', 'today')
    .map(function (r) { return [r[0], r[1], r[2], r[3], r[4], r[5], r[6], div_(r[6], r[3])]; })
    .sort(function (a, b) { return b[3] - a[3]; });
  writeTable_(DASH.sources, '어디서 들어왔나 — 유입 경로 (최근 30일)',
    ['출처', '매체', '캠페인', '방문(세션)', '방문자', '참여율', '문의 완료', '전환율'], src, [null, null, null, '0', '0', '0.0%', '0', '0.0%']);

  // 4) 버튼 클릭 (최근 30일) — 맞춤 측정기준 등록 후 하루 정도 지나야 값이 채워짐
  let clicks = [];
  try {
    clicks = report_(['eventName', 'customEvent:cta_location', 'customEvent:cta_label', 'customEvent:service_name'], ['eventCount'], '30daysAgo', 'today', ['cta_click', 'service_menu_click'])
      .map(function (r) { return [r[0] === 'cta_click' ? '상담 신청 버튼' : '서비스 메뉴', r[1], r[2], r[3], r[4]]; })
      .sort(function (a, b) { return b[4] - a[4]; });
  } catch (err) { Logger.log('버튼 클릭 보고서 대기 중: ' + err); }
  writeTable_(DASH.clicks, '어떤 버튼·메뉴가 눌렸나 (최근 30일)', ['종류', '버튼 위치', '버튼 문구', '서비스명', '클릭 수'], clicks, [null, null, null, null, '0']);

  // 5) 국가·기기 (최근 30일)
  const aud = report_(['country', 'deviceCategory'], ['sessions', 'activeUsers', 'keyEvents'], '30daysAgo', 'today')
    .map(function (r) { return [r[0], r[1], r[2], r[3], r[4], div_(r[4], r[2])]; })
    .sort(function (a, b) { return b[2] - a[2]; });
  writeTable_(DASH.audience, '누가 보나 — 국가·기기 (최근 30일)', ['국가', '기기', '방문(세션)', '방문자', '문의 완료', '전환율'], aud, [null, null, '0', '0', '0', '0.0%']);

  writeSummary_(daily);
  writeRealtime_();
}

// ───────────── 지금 접속 중 (최근 30분, 실시간) ─────────────
function realtime_(dims, mets) {
  const prop = PropertiesService.getScriptProperties().getProperty('GA_PROPERTY');
  const req = { dimensions: dims.map(function (n) { return { name: n }; }), metrics: mets.map(function (n) { return { name: n }; }), limit: 10 };
  const res = AnalyticsData.Properties.runRealtimeReport(req, prop);
  return (res.rows || []).map(function (r) {
    return (r.dimensionValues || []).map(function (v) { return v.value; })
      .concat((r.metricValues || []).map(function (v) { return Number(v.value); }));
  });
}

function writeRealtime_() {
  const sh = getSpreadsheet_().getSheetByName(DASH.summary);
  if (!sh) return;
  let total = 0, pages = [], countries = [], devices = [];
  try {
    const t = realtime_([], ['activeUsers']); total = t.length ? t[0][0] : 0;
    pages = realtime_(['unifiedScreenName'], ['screenPageViews']).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    countries = realtime_(['country'], ['activeUsers']).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    devices = realtime_(['deviceCategory'], ['activeUsers']).sort(function (a, b) { return b[1] - a[1]; });
  } catch (err) { Logger.log('실시간 보고서 오류: ' + err); }
  const R = 20;
  sh.getRange(R, 1, 12, 5).clearContent();
  sh.getRange(R, 1).setValue('🟢 지금 접속 중 (최근 30분 · 실시간)').setFontWeight('bold').setFontSize(13);
  sh.getRange(R + 1, 1, 1, 2).setValues([['접속자 수', total]]).setFontWeight('bold');
  sh.getRange(R + 3, 1, 1, 5).setValues([['많이 보는 페이지', '조회', '', '나라 / 기기', '접속자']]).setFontWeight('bold').setBackground('#1f3a2e').setFontColor('#ffffff');
  const side = countries.map(function (c) { return [c[0], c[1]]; }).concat(devices.map(function (d) { return [d[0], d[1]]; }));
  const n = Math.max(pages.length, side.length, 1);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const p = pages[i] || ['', ''], q = side[i] || ['', ''];
    rows.push([p[0], p[1], '', q[0], q[1]]);
  }
  if (!pages.length && !side.length) rows[0] = ['지금은 접속자가 없어요', '', '', '', ''];
  sh.getRange(R + 4, 1, rows.length, 5).setValues(rows);
}

// ───────────── 한눈에 보는 요약 ─────────────
function writeSummary_(daily) {
  const today = new Date();
  const key = function (d) { return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd'); };
  const daysAgo = function (n) { const d = new Date(today); d.setDate(d.getDate() - n); return key(d); };
  const sumRange = function (from, to) { // [from, to] 포함, 'yyyy-MM-dd'
    const s = { users: 0, sessions: 0, views: 0, eng: 0, fs: 0, leads: 0 };
    daily.forEach(function (r) {
      if (r[0] >= from && r[0] <= to) { s.users += r[1]; s.sessions += r[3]; s.views += r[4]; s.eng += r[5] * r[3]; s.fs += r[7]; s.leads += r[8]; }
    });
    s.avg = Math.round(div_(s.eng, s.sessions)); s.conv = div_(s.leads, s.sessions); s.done = div_(s.leads, s.fs);
    return s;
  };
  const cur = sumRange(daysAgo(6), daysAgo(0)), prev = sumRange(daysAgo(13), daysAgo(7)), m = sumRange(daysAgo(29), daysAgo(0));
  const sheetLeads = countSheetEnquiries_(daysAgo(6), daysAgo(0));
  const chg = function (a, b) { return b ? (a - b) / b : ''; };

  const rows = [
    ['방문자 수', cur.users, prev.users, chg(cur.users, prev.users), m.users],
    ['방문(세션) 수', cur.sessions, prev.sessions, chg(cur.sessions, prev.sessions), m.sessions],
    ['페이지뷰', cur.views, prev.views, chg(cur.views, prev.views), m.views],
    ['방문당 평균 체류(초)', cur.avg, prev.avg, chg(cur.avg, prev.avg), m.avg],
    ['신청서 작성 시작', cur.fs, prev.fs, chg(cur.fs, prev.fs), m.fs],
    ['문의 완료 (GA 기준)', cur.leads, prev.leads, chg(cur.leads, prev.leads), m.leads],
    ['전환율 (문의 ÷ 방문)', cur.conv, prev.conv, chg(cur.conv, prev.conv), m.conv],
    ['작성 완료율 (완료 ÷ 시작)', cur.done, prev.done, chg(cur.done, prev.done), m.done],
  ];
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(DASH.summary) || ss.insertSheet(DASH.summary, 0);
  sh.clear();
  sh.getRange(1, 1).setValue('CareBridge 홈페이지 성과 요약').setFontWeight('bold').setFontSize(15);
  sh.getRange(2, 1).setValue('마지막 갱신: ' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm') + ' · 15분마다 자동 갱신 · ' + SITE).setFontColor('#888888');
  sh.getRange(4, 1, 1, 5).setValues([['지표', '최근 7일', '그 전 7일', '변화', '최근 30일']]).setFontWeight('bold').setBackground('#1f3a2e').setFontColor('#ffffff');
  sh.getRange(5, 1, rows.length, 5).setValues(rows);
  sh.getRange(5, 2, 6, 2).setNumberFormat('#,##0'); sh.getRange(5, 5, 6, 1).setNumberFormat('#,##0');
  sh.getRange(11, 2, 2, 2).setNumberFormat('0.0%'); sh.getRange(11, 5, 2, 1).setNumberFormat('0.0%');
  sh.getRange(5, 4, rows.length, 1).setNumberFormat('+0%;-0%;0%');
  sh.getRange(14, 1, 1, 2).setValues([['실제 접수된 문의 (Inquiries 시트, 최근 7일)', sheetLeads]]).setFontWeight('bold');
  sh.getRange(15, 1).setValue('※ GA 숫자는 광고 차단기·쿠키 거부 방문자가 빠져 실제보다 적을 수 있어요. 문의 수는 Inquiries 시트가 정확합니다.').setFontColor('#888888');
  sh.getRange(17, 1).setValue('자세히 보기: 일별 지표 · 페이지별 · 유입 경로 · 버튼 클릭 · 국가·기기 탭 / 운영 방법: 운영 가이드 탭').setFontColor('#555555');
  sh.setColumnWidth(1, 330); sh.setColumnWidths(2, 4, 110);
  ss.setActiveSheet(sh); ss.moveActiveSheet(1);
}

function countSheetEnquiries_(from, to) {
  const sh = getSpreadsheet_().getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return 0;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  return vals.filter(function (r) {
    if (!(r[0] instanceof Date)) return false;
    const d = Utilities.formatDate(r[0], 'Asia/Seoul', 'yyyy-MM-dd');
    return d >= from && d <= to;
  }).length;
}

// ───────────── UTM 링크 · 운영 가이드 ─────────────
function writeUtmSheet_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(DASH.utm) || ss.insertSheet(DASH.utm);
  sh.clear();
  sh.getRange(1, 1).setValue('UTM 링크 — 어디서 온 방문인지 구분하려고 링크 끝에 붙이는 꼬리표').setFontWeight('bold').setFontSize(13);
  sh.getRange(2, 1).setValue('채널마다 아래 완성 링크를 쓰면 "유입 경로" 탭에 출처·캠페인 이름으로 따로 집계돼요. 새 줄을 추가하면 E열 링크가 자동으로 만들어져요.').setFontColor('#888888');
  sh.getRange(4, 1, 1, 5).setValues([['용도', 'utm_source (출처)', 'utm_medium (매체)', 'utm_campaign (캠페인)', '완성 링크']]).setFontWeight('bold').setBackground('#1f3a2e').setFontColor('#ffffff');
  const rows = [
    ['인스타그램 프로필 링크', 'instagram', 'social', 'bio'],
    ['인스타그램 게시물·스토리', 'instagram', 'social', 'cardnews_2026_11'],
    ['메타 광고 (영어)', 'meta', 'paid_social', 'expats_en_test'],
    ['메타 광고 (베트남어)', 'meta', 'paid_social', 'expats_vi_test'],
    ['페이스북 그룹 게시글', 'facebook', 'community', 'expat_groups'],
    ['Reddit', 'reddit', 'community', 'r_seoul'],
    ['카카오톡 오픈채팅', 'kakao', 'community', 'openchat'],
    ['이메일·인터뷰 요청', 'email', 'email', 'interview_request'],
  ];
  sh.getRange(5, 1, rows.length, 4).setValues(rows);
  const f = [];
  for (let i = 0; i < 40; i++) {
    const r = 5 + i;
    f.push(['=IF(B' + r + '="","","' + SITE + '/?utm_source="&B' + r + '&"&utm_medium="&C' + r + '&"&utm_campaign="&D' + r + '&"#consultation")']);
  }
  sh.getRange(5, 5, 40, 1).setFormulas(f);
  sh.setColumnWidth(1, 190); sh.setColumnWidths(2, 3, 170); sh.setColumnWidth(5, 620);
  sh.setFrozenRows(4);
}

function writeGuideSheet_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(DASH.guide) || ss.insertSheet(DASH.guide);
  sh.clear();
  const L = [
    ['CareBridge 홈페이지 운영 가이드 (마케터들이 쓰는 방법)', ''],
    ['', ''],
    ['■ 매주 월요일 10분 점검 루틴', ''],
    ['1. 📊 대시보드', '방문자·문의·전환율이 지난주보다 늘었는지 확인 (변화 칸)'],
    ['2. 유입 경로', '어느 채널(인스타·광고·커뮤니티)이 방문과 문의를 가장 많이 만들었는지 → 잘 되는 채널에 시간·예산 집중'],
    ['3. 페이지별', '체류 시간이 짧은 페이지 = 첫 화면 문구나 사진을 바꿔볼 후보'],
    ['4. 버튼 클릭', '어디 있는 상담 버튼이 많이 눌리는지 → 잘 눌리는 위치·문구를 다른 곳에도 적용'],
    ['5. 작성 완료율', '신청서를 시작하고 안 보낸 사람이 많으면 칸 수를 줄이거나 안내 문구를 다듬기'],
    ['', ''],
    ['■ 핵심 지표(KPI)와 초기 목표', ''],
    ['전환율 (문의 ÷ 방문)', '1~3%면 양호 (상담형 서비스 기준). 1% 미만이면 첫 화면·신청서 개선'],
    ['방문당 평균 체류', '60초 이상 목표. 짧으면 첫 화면에서 무엇을 하는 곳인지 더 분명하게'],
    ['작성 완료율 (완료 ÷ 시작)', '50% 이상 목표'],
    ['문의 1건당 비용 (광고 시)', '광고비 ÷ 문의 수. 3만원 이하면 좋음, 10만원 넘으면 광고 문구·타깃 변경'],
    ['', ''],
    ['■ 꼭 지킬 것', ''],
    ['UTM 링크 사용', '인스타·광고·커뮤니티에 링크를 올릴 땐 항상 UTM 링크 탭의 완성 링크를 사용'],
    ['한 번에 하나만 바꾸기', '문구·사진·버튼을 동시에 바꾸면 무엇 때문에 좋아졌는지 알 수 없어요. 1~2주 간격으로 하나씩'],
    ['문의는 12시간 안에 답장', 'Inquiries 시트의 처리 상태를 신규 → 답장 완료 → 상담 완료로 바꿔가며 관리'],
    ['개인정보 보호', '통계에는 이름·이메일·전화번호가 들어가지 않아요. 문의 내용은 Inquiries 시트에만 보관'],
    ['', ''],
    ['■ 다음 단계 (필요할 때)', ''],
    ['구글 서치 콘솔', '구글 검색에서 어떤 검색어로 들어오는지 확인 (도메인 인증 필요)'],
    ['Microsoft Clarity (무료)', '방문자가 어디를 클릭하고 어디서 나가는지 화면 녹화·히트맵으로 확인'],
    ['메타 픽셀', '메타 광고를 돌릴 때 광고별 문의 수를 정확히 측정'],
  ];
  sh.getRange(1, 1, L.length, 2).setValues(L);
  sh.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  L.forEach(function (r, i) { if (/^■/.test(r[0])) sh.getRange(i + 1, 1).setFontWeight('bold').setFontColor('#1f3a2e'); });
  sh.setColumnWidth(1, 260); sh.setColumnWidth(2, 720);
  sh.getRange(1, 2, L.length, 1).setWrap(true);
}
