// Apps Script 통계 대시보드(Dashboard.gs) 단위 테스트 — 구글 서비스를 가짜로 흉내 내서 실행: node tests/dashboard_test.js
const fs = require('fs'); const vm = require('vm'); const path = require('path');
const src = ['Code.gs', 'Dashboard.gs'].map(f => fs.readFileSync(path.join(__dirname, '..', 'apps-script', f), 'utf8')).join('\n');
let fails = 0; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

function makeSheet(name) {
  const sh = { name, cells: {}, formulas: {}, formats: {}, frozen: 0,
    clear() { this.cells = {}; this.formulas = {}; },
    getLastRow() { return Math.max(0, ...Object.keys(this.cells).map(k => +k.split(',')[0])); },
    setFrozenRows(n) { this.frozen = n; }, autoResizeColumns() {}, setColumnWidth() {}, setColumnWidths() {},
    getRange(r, c, nr = 1, nc = 1) { const s = this; const chain = { setFontWeight: () => chain, setFontSize: () => chain, clearContent() { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) delete s.cells[(r + i) + ',' + (c + j)]; return chain; }, setFontColor: () => chain, setBackground: () => chain, setWrap: () => chain,
      setNumberFormat(f) { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) s.formats[(r + i) + ',' + (c + j)] = f; return chain; },
      setValue(v) { s.cells[r + ',' + c] = v; return chain; },
      setValues(v) { if (v.length !== nr || v.some(x => x.length !== nc)) throw new Error(`setValues size mismatch on ${s.name} ${r},${c} ${nr}x${nc} got ${v.length}x${v[0] && v[0].length}`); v.forEach((row, i) => row.forEach((x, j) => s.cells[(r + i) + ',' + (c + j)] = x)); return chain; },
      setFormulas(v) { if (v.length !== nr) throw new Error('formula size'); v.forEach((row, i) => row.forEach((x, j) => s.formulas[(r + i) + ',' + (c + j)] = x)); return chain; },
      getValues() { const out = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) row.push(s.cells[(r + i) + ',' + (c + j)]); out.push(row); } return out; } };
      return chain; } };
  return sh;
}

function env({ propCreated = false, withRows = true, oldDaily = false } = {}) {
  const sheets = {}; const order = [];
  const ss = { getSheetByName: n => sheets[n] || null, insertSheet: (n) => { sheets[n] = makeSheet(n); order.push(n); return sheets[n]; }, setActiveSheet() {}, moveActiveSheet() {} };
  // 문의 시트: 최근 7일 안 2건, 오래된 1건
  const inq = ss.insertSheet('Inquiries'); inq.cells['1,1'] = '접수 시각';
  const now = new Date(); const d = n => { const x = new Date(now); x.setDate(x.getDate() - n); return x; };
  inq.cells['2,1'] = d(1); inq.cells['3,1'] = d(3); inq.cells['4,1'] = d(20);
  const props = { SHEET_ID: 'id' }; const keyEvents = []; const dims = []; const triggers = []; const reqs = []; const rt = [];
  if (oldDaily) triggers.push({ h: 'refreshDashboard', days: 1 });
  const day = n => { const x = d(n); return x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0'); };
  const rows = (arr) => ({ rows: arr.map(r => ({ dimensionValues: r[0].map(value => ({ value })), metricValues: r[1].map(v => ({ value: String(v) })) })) });
  const ctx = { console, String, JSON, Date, Error, Math, Number, Logger: { log() {} },
    SpreadsheetApp: { openById: () => ss, getActiveSpreadsheet: () => null },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k], setProperty: (k, v) => { props[k] = v; } }) },
    Utilities: { formatDate: (dt) => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0') },
    ScriptApp: { getProjectTriggers: () => triggers.map(t => ({ getHandlerFunction: () => t.h, _t: t })), deleteTrigger: x => { triggers.splice(triggers.indexOf(x._t), 1); },
      newTrigger: h => { const t = { h }; const b = { timeBased: () => b, everyDays: n => (t.days = n, b), atHour: () => b, inTimezone: () => b, everyMinutes: n => (t.minutes = n, b), create: () => triggers.push(t) }; return b; } },
    AnalyticsAdmin: {
      AccountSummaries: { list: () => ({ accountSummaries: [{ propertySummaries: [{ displayName: '싸이웰시스템', property: 'properties/1' }, { displayName: 'Care Bridge', property: 'properties/999' }] }] }) },
      Properties: {
        KeyEvents: { list: () => ({ keyEvents: keyEvents.slice() }), create: (b, p) => { keyEvents.push(b); } },
        CustomDimensions: { list: () => ({ customDimensions: dims.slice() }), create: (b, p) => { dims.push(b); } } } },
    AnalyticsData: { Properties: {
      runRealtimeReport: (req, prop) => { rt.push({ req, prop }); const dn = req.dimensions.map(x => x.name).join('|');
        if (!withRows) return {};
        if (dn === '') return rows([[[], [3]]]);
        if (dn === 'unifiedScreenName') return rows([[['Our services | Care Bridge'], [2]], [['Care Bridge | Home'], [5]]]);
        if (dn === 'country') return rows([[['Japan'], [1]], [['South Korea'], [2]]]);
        if (dn === 'deviceCategory') return rows([[['mobile'], [3]]]);
        throw new Error('unexpected realtime ' + dn); },
      runReport: (req, prop) => {
      reqs.push({ req, prop }); const dn = req.dimensions.map(x => x.name).join('|');
      if (!withRows) return {};
      if (dn === 'date') return rows([[[day(0)], [10, 8, 12, 30, 600, 0.6]], [[day(1)], [5, 5, 6, 10, 120, 0.5]], [[day(8)], [4, 4, 4, 8, 80, 0.4]]]);
      if (dn === 'date|eventName') return rows([[[day(0), 'form_start'], [4]], [[day(0), 'generate_lead'], [2]], [[day(1), 'generate_lead'], [1]]]);
      if (dn === 'pagePath') return rows([[['/'], [30, 10, 900, 0.6]], [['/services/'], [12, 6, 240, 0.5]]]);
      if (dn.startsWith('sessionSource')) return rows([[['instagram', 'social', 'bio'], [10, 9, 0.7, 2]], [['(direct)', '(none)', '(direct)'], [12, 10, 0.4, 1]]]);
      if (dn.startsWith('eventName|customEvent')) return rows([[['cta_click', 'header', 'Enquire', '(not set)'], [7]]]);
      if (dn === 'country|deviceCategory') return rows([[['South Korea', 'mobile'], [15, 12, 3]]]);
      throw new Error('unexpected report ' + dn);
    } } } };
  vm.createContext(ctx); vm.runInContext(src, ctx);
  return { ctx, sheets, props, keyEvents, dims, triggers, reqs, rt };
}

// 1) 처음 설정
let E = env();
E.ctx.setupAnalytics();
check(E.props.GA_PROPERTY === 'properties/999', "finds the 'Care Bridge' property (not the other one)");
check(E.keyEvents.length === 1 && E.keyEvents[0].eventName === 'generate_lead', 'generate_lead registered as key event');
check(E.dims.map(x => x.parameterName).join() === 'cta_location,cta_label,service_name,page_type' && E.dims.every(x => x.scope === 'EVENT'), 'custom dimensions registered');
check(E.triggers.length === 1 && E.triggers[0].h === 'refreshDashboard' && E.triggers[0].minutes === 15, 'refresh scheduled every 15 minutes');
const tabs = ['📊 대시보드', '일별 지표', '페이지별', '유입 경로', '버튼 클릭', '국가·기기', 'UTM 링크', '운영 가이드'];
check(tabs.every(t => E.sheets[t]), 'all dashboard tabs created');
check(E.reqs.every(r => r.prop === 'properties/999'), 'reports query the Care Bridge property');

// 2) 숫자 계산
const daily = E.sheets['일별 지표'];
check(daily.cells['4,1'] === '날짜' && daily.cells['5,2'] === 10 && daily.cells['5,6'] === 50 && daily.cells['5,8'] === 4 && daily.cells['5,9'] === 2, 'daily row: users, avg time 600/12=50s, form starts, leads');
check(Math.abs(daily.cells['5,10'] - 2 / 12) < 1e-9 && daily.cells['5,11'] === 0.5, 'daily conversion rate & completion rate');
const sum = E.sheets['📊 대시보드'];
const row = (label) => { for (let r = 5; r < 13; r++) if (sum.cells[r + ',1'] === label) return [sum.cells[r + ',2'], sum.cells[r + ',3'], sum.cells[r + ',4'], sum.cells[r + ',5']]; };
check(row('방문자 수')[0] === 15 && row('방문자 수')[1] === 4, 'summary: last 7 days vs previous 7 days users');
check(row('문의 완료 (GA 기준)')[0] === 3 && Math.abs(row('전환율 (문의 ÷ 방문)')[0] - 3 / 18) < 1e-9, 'summary: leads and conversion rate');
check(row('방문당 평균 체류(초)')[0] === Math.round((600 + 120) / 18), 'summary: weighted average engagement time');
check(sum.cells['14,2'] === 2, 'summary: real enquiries counted from Inquiries sheet (last 7 days)');
check(sum.formats['11,2'] === '0.0%' && sum.formats['10,2'] === '#,##0', 'summary: rate rows formatted as %, counts as numbers');
const pages = E.sheets['페이지별']; check(pages.cells['5,1'] === '/' && pages.cells['5,4'] === 30, 'pages: sorted by views, avg time per view 900/30=30s');
const srcs = E.sheets['유입 경로']; check(srcs.cells['5,1'] === '(direct)' && Math.abs(srcs.cells['6,8'] - 0.2) < 1e-9, 'sources: sorted by sessions, conversion per source');
check(E.sheets['버튼 클릭'].cells['5,1'] === '상담 신청 버튼' && E.sheets['버튼 클릭'].cells['5,5'] === 7, 'button clicks labelled in Korean');
const utm = E.sheets['UTM 링크']; check(/utm_source="&B5&"/.test(utm.formulas['5,5']) && utm.cells['5,2'] === 'instagram', 'UTM builder formulas');

// 3) 두 번째 실행해도 중복 등록 없음
E.ctx.setupAnalytics();
check(E.keyEvents.length === 1 && E.dims.length === 4 && E.triggers.length === 1, 'running setup twice creates no duplicates');

// 3-1) 예전 '하루 1번' 예약은 15분 예약으로 교체
E = env({ oldDaily: true }); E.ctx.setupAnalytics();
check(E.triggers.length === 1 && E.triggers[0].minutes === 15 && !E.triggers[0].days, 'old daily trigger replaced by 15-minute trigger');
// 3-2) 실시간 칸
const S = E.sheets['📊 대시보드'];
check(/지금 접속 중/.test(S.cells['20,1']) && S.cells['21,2'] === 3, 'realtime: active users in last 30 min shown');
check(S.cells['24,1'] === 'Care Bridge | Home' && S.cells['24,2'] === 5 && S.cells['24,4'] === 'South Korea' && S.cells['26,4'] === 'mobile', 'realtime: top pages, countries, devices sorted');
check(E.rt.every(r => r.prop === 'properties/999'), 'realtime queries the Care Bridge property');
check(/15분마다/.test(S.cells['2,1']), 'summary says refreshed every 15 minutes');

// 4) 데이터가 아직 없을 때도 오류 없이
E = env({ withRows: false }); E.ctx.setupAnalytics();
check(/아직 데이터가 없습니다/.test(E.sheets['일별 지표'].cells['5,1']) && E.sheets['📊 대시보드'].cells['5,2'] === 0, 'empty GA data handled gracefully');
check(E.sheets['📊 대시보드'].cells['21,2'] === 0 && /접속자가 없어요/.test(E.sheets['📊 대시보드'].cells['24,1']), 'realtime: no visitors handled');

// 5) 개인정보: 시트 이름·이메일 등은 보고서 요청에 없음
const fields = E.reqs.flatMap(r => r.req.dimensions.concat(r.req.metrics).map(x => x.name));
check(fields.length > 10 && !fields.some(f => /email|phone|customer|user_?name/i.test(f)), 'reports never request personal fields');
console.log(fails ? `${fails} FAIL` : 'ALL PASS');
