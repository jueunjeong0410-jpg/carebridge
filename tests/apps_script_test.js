// Apps Script(Code.gs) 단위 테스트 — 구글 서비스를 가짜로 흉내 내서 실행: node tests/apps_script_test.js
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(require('path').join(__dirname,'..','apps-script','Code.gs'),'utf8');
function makeEnv(initialRows){
  const sheet={rows:initialRows? initialRows.map(r=>r.slice()):null, appendRow(r){this.rows.push(r)}, setFrozenRows(){}, 
    getRange(r,c,nr,nc){ const sh=this; return {getValue(){return (sh.rows[r-1]||[])[c-1]}, setFontWeight(){return this}, setBackground(){return this}, setValues(v){ sh.rows[r-1]=v[0].slice(); return this}}; },
    insertColumnAfter(c){ this.rows.forEach(row=>row.splice(c,0,'')); }};
  const ss={getSheetByName(n){return sheet.rows?sheet:null}, insertSheet(){sheet.rows=[]; return sheet}, getUrl(){return 'https://sheet'}};
  const mails=[]; const cache={};
  const ctx={console, String, JSON, Date, Error,
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
// 1) 기존(전화번호 없는) 시트 이전
const old=[['접수 시각','이름','이메일','거주 국가','방문 예정 시기','관심 서비스','문의 내용','접수 페이지','처리 상태'],['t','A','a@x.com','KR','Mar','Personal accompaniment','hi','p','신규']];
let E=makeEnv(old);
let r=E.ctx.doPost({parameter:{name:'Jane',email:'jane@x.com',phone:'+65 9123 4567',country:'SG',travel_dates:'Mar',service:'Dental care',message:'m',page:'pg'}});
check(r.code==='OK','valid submission OK');
check(E.sheet.rows[0][3]==='전화번호' && E.sheet.rows[0][6]==='동행 유형','header migrated (phone col + 동행 유형)');
check(E.sheet.rows[1][2]==='a@x.com' && E.sheet.rows[1][3]==='' && E.sheet.rows[1][4]==='KR','old row stays aligned');
const nr=E.sheet.rows[2]; check(nr[3]==="'+65 9123 4567" && nr[6]==='Dental care' && nr[1]==='Jane','new row has phone (text-safe) and escort type');
check(E.mails.length===1 && E.mails[0].htmlBody.includes('+65 9123 4567') && E.mails[0].htmlBody.includes('동행 유형') && E.mails[0].replyTo==='jane@x.com','email includes phone + escort type, reply-to customer');
// 2) 검증
E=makeEnv(null);
check(E.ctx.doPost({parameter:{name:'J',email:'j@x.com',phone:''}}).code==='ERROR','missing phone rejected');
check(E.ctx.doPost({parameter:{name:'J',email:'j2@x.com',phone:'abc'}}).code==='ERROR','bad phone rejected');
check(E.ctx.doPost({parameter:{name:'J',email:'j3@x.com',phone:'010-1234-5678'}}).code==='OK','KR phone accepted');
check(E.sheet.rows[0].length===10 && E.sheet.rows[0][3]==='전화번호','new sheet created with 10 headers');
check(E.ctx.doPost({parameter:{name:'J',email:'j3@x.com',phone:'010-1234-5678'}}).code==='ERROR','1-minute duplicate blocked');
check(E.ctx.doPost({parameter:{name:'J',email:'bot@x.com',contact_alt:'x'}}).code==='OK' && E.sheet.rows.length===2,'honeypot silently ignored');
// 3) 이미 이전된 시트는 다시 끼워넣지 않음
E=makeEnv([['접수 시각','이름','이메일','전화번호','거주 국가','방문 예정 시기','동행 유형','문의 내용','접수 페이지','처리 상태']]);
E.ctx.doPost({parameter:{name:'K',email:'k@x.com',phone:'+1 555 123 4567'}});
check(E.sheet.rows[0].length===10 && E.sheet.rows[1].length===10,'no double migration');
console.log(fails?`${fails} FAIL`:'ALL PASS');
