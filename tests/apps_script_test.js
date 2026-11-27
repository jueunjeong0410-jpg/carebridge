// Apps Script(Code.gs) 단위 테스트 — 구글 서비스를 가짜로 흉내 내서 실행: node tests/apps_script_test.js
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(require('path').join(__dirname,'..','apps-script','Code.gs'),'utf8');
function makeEnv(initialRows){
  const sheet={rows:initialRows? initialRows.map(r=>r.slice()):null,
    appendRow(r){this.rows.push(r)}, setFrozenRows(){},
    getLastColumn(){return Math.max(0,...this.rows.map(r=>r.length))},
    insertColumnBefore(c){ this.rows.forEach(row=>{ while(row.length<c-1) row.push(''); row.splice(c-1,0,''); }); },
    getRange(r,c,nr,nc){ const sh=this; return {
      getValue(){return (sh.rows[r-1]||[])[c-1]},
      getValues(){ const row=sh.rows[r-1]||[]; return [Array.from({length:nc||1},(_,k)=> row[c-1+k]===undefined?'':row[c-1+k])]; },
      setFontWeight(){return this}, setBackground(){return this},
      setValues(v){ const row=sh.rows[r-1]; v[0].forEach((x,k)=>row[c-1+k]=x); return this}}; } };
  const ss={getSheetByName(){return sheet.rows?sheet:null}, insertSheet(){sheet.rows=[]; return sheet}, getUrl(){return 'https://sheet'}};
  const mails=[]; const cache={};
  const ctx={console, String, JSON, Date, Error, Math,
    SpreadsheetApp:{openById:()=>ss, getActiveSpreadsheet:()=>null},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>({NOTIFY_EMAIL:'me@x.com',SHEET_ID:'id'})[k]})},
    CacheService:{getScriptCache:()=>({get:k=>cache[k], put:(k,v)=>cache[k]=v})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    Utilities:{base64EncodeWebSafe:s=>Buffer.from(s).toString('base64'), formatDate:()=> '2026-11-28 01:20'},
    MailApp:{sendEmail:o=>mails.push(o)},
    ContentService:{createTextOutput:t=>({t, setMimeType(){return JSON.parse(t)}}), MimeType:{JSON:'json'}}};
  vm.createContext(ctx); vm.runInContext(code,ctx); return {ctx,sheet,mails};
}
let fails=0; const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++;};
const NEW=['접수 시각','이름','이메일','전화번호','거주 국가','병원 방문 희망일','여행 기간','동행 유형','문의 내용','접수 페이지','처리 상태'];
const ok={name:'Jane',email:'jane@x.com',phone:'+65 9123 4567',country:'SG',visit_date:'2027-03-05',travel_dates:'3-10 Mar',service:'Dental care, Health screening & check-up',message:'m',page:'pg'};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// 1) 지금 시트(전화번호 있음, 방문 희망일 없음, 10칸) 이전
let E=makeEnv([['접수 시각','이름','이메일','전화번호','거주 국가','방문 예정 시기','동행 유형','문의 내용','접수 페이지','처리 상태'],
               ['t','A','a@x.com',"'+65 1","KR",'Mar','Dental care','hi','p','신규']]);
check(E.ctx.doPost({parameter:ok}).code==='OK','valid submission OK');
check(eq(E.sheet.rows[0],NEW),'current sheet: headers migrated to 11 columns');
check(eq(E.sheet.rows[1],['t','A','a@x.com',"'+65 1",'KR','','Mar','Dental care','hi','p','신규']),'current sheet: old row stays aligned (empty visit date, travel dates kept)');
const nr=E.sheet.rows[2]; check(nr[5]==='2027-03-05' && nr[6]==='3-10 Mar' && nr[7]==='Dental care, Health screening & check-up' && nr[3]==="'+65 9123 4567",'new row: visit date, travel dates, types, phone in right columns');
check(E.mails[0].htmlBody.includes('병원 방문 희망일') && E.mails[0].htmlBody.includes('2027-03-05') && E.mails[0].subject.includes('2027-03-05'),'email shows visit date (body + subject)');
check(E.mails[0].replyTo==='jane@x.com','email reply-to is customer');

// 2) 아주 예전 시트(전화번호도 없음, 9칸) 이전
E=makeEnv([['접수 시각','이름','이메일','거주 국가','방문 예정 시기','관심 서비스','문의 내용','접수 페이지','처리 상태'],['t','B','b@x.com','KR','Mar','Personal accompaniment','hi','p','신규']]);
E.ctx.doPost({parameter:{...ok,email:'j9@x.com'}});
check(eq(E.sheet.rows[0],NEW),'oldest sheet: headers migrated');
check(eq(E.sheet.rows[1],['t','B','b@x.com','','KR','','Mar','Personal accompaniment','hi','p','신규']),'oldest sheet: old row aligned');

// 3) 새 시트 + 검증
E=makeEnv(null);
check(E.ctx.doPost({parameter:{...ok,email:'n1@x.com',visit_date:''}}).code==='ERROR','missing visit date rejected');
check(E.ctx.doPost({parameter:{...ok,email:'n2@x.com',visit_date:'next week'}}).code==='ERROR','bad visit date rejected');
check(E.ctx.doPost({parameter:{...ok,email:'n3@x.com',phone:''}}).code==='ERROR','missing phone rejected');
check(E.ctx.doPost({parameter:{...ok,email:'n4@x.com',travel_dates:''}}).code==='OK','travel dates optional');
check(eq(E.sheet.rows[0],NEW) && E.sheet.rows.length===2,'new sheet created with 11 headers, 1 row');
check(E.ctx.doPost({parameter:{...ok,email:'n4@x.com'}}).code==='ERROR','1-minute duplicate blocked');
check(E.ctx.doPost({parameter:{...ok,email:'bot@x.com',contact_alt:'x'}}).code==='OK' && E.sheet.rows.length===2,'honeypot silently ignored');

// 4) 이미 새 형식이면 그대로
E=makeEnv([NEW.slice()]); E.ctx.doPost({parameter:{...ok,email:'k@x.com'}});
check(eq(E.sheet.rows[0],NEW) && E.sheet.rows[1].length===11,'no double migration');
console.log(fails?`${fails} FAIL`:'ALL PASS');
