# 회귀테스트: docs/ 를 로컬 서버(python3 -m http.server 8765 --directory docs)로 띄운 뒤 실행
# python3 tests/regress.py http://localhost:8765
import asyncio, sys
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765'
EP='script.google.com/macros/s/AKfycbw2sM3Yo2qOOEJSVyAXoI34MWbL98fzXsrOhH_4WEtxBNMJgbFftGYQpN1QeKgETMuO/exec'
fails=[]
def check(c,msg): print(('PASS ' if c else 'FAIL ')+msg); (None if c else fails.append(msg))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        posted=[]; pushed=[]
        async def handler(r):
            u=r.request.url
            if EP in u: posted.append(r.request.post_data); await r.fulfill(status=200, headers={'Access-Control-Allow-Origin':'*'}, body='{"code":"OK"}')
            elif u.startswith('https://ntfy.sh/'): pushed.append(r.request.post_data); await r.fulfill(status=200, headers={'Access-Control-Allow-Origin':'*'}, body='{}')
            elif 'localhost' in u: await r.continue_()
            else: await r.abort()
        for path in ['/','/services/','/services/medical-coordination/','/services/personal-accompaniment/','/services/a-seamless-stay/']:
            pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
            await pg.route('**/*',handler); r=await pg.goto(BASE+path)
            check(r.status==200 and not errs, f'page {path} loads (status {r.status}, js errors {errs})')
            # every internal link resolves
            hrefs=await pg.eval_on_selector_all('a[href]','as=>as.map(a=>a.href)')
            for h in set(hrefs):
                if h.startswith(BASE):
                    rr=await pg.request.get(h.split('#')[0]); check(rr.status==200, f'  link {h.replace(BASE,"")} -> {rr.status}')
            await pg.close()
        pg=await b.new_page(viewport={'width':1440,'height':800}); await pg.route('**/*',handler); await pg.goto(BASE+'/')
        logo=await pg.evaluate("(()=>{const i=document.querySelector('#site-header img');return [i.getAttribute('src'), i.naturalWidth, i.getBoundingClientRect().height]})()")
        check(logo[0].endswith('assets/logo.svg') and logo[1]>0 and logo[2]>=28,'header logo loads, shown large (%dpx tall)'%logo[2])
        htxt=(await pg.text_content('#site-header a')).strip().upper()
        check('CARE BRIDGE' not in htxt and 'MEDICAL' in htxt,'header: no "Care Bridge" text, small Medical Concierge label')
        flogo=await pg.evaluate("(()=>{const i=document.querySelector('footer img');return [i.getAttribute('src'), i.naturalWidth]})()")
        check(flogo[0].endswith('logo-light.svg') and flogo[1]>0,'footer light logo loads')
        fav=await pg.get_attribute('link[rel=icon]','href'); rr=await pg.request.get(BASE+'/'+fav.lstrip('./')); check(rr.status==200,'favicon loads')
        svg=(await (await pg.request.get(BASE+'/assets/logo.svg')).text())
        check('255,255,255' not in svg,'logo has no white background')
        await pg.close()
        pg=await b.new_page(viewport={'width':390,'height':800}); await pg.route('**/*',handler); await pg.goto(BASE+'/')
        await pg.click('#menu-toggle'); check(await pg.get_attribute('#menu-toggle','aria-expanded')=='true','mobile menu opens')
        await pg.set_viewport_size({'width':1440,'height':900})
        await pg.click('[data-review-next]'); check(await pg.text_content('#review-name')=='Daniel K.','review next')
        await pg.click('[data-review-dot="4"]'); check(await pg.text_content('#review-count')=='05 / 05','review dot')
        await pg.click('[data-gallery-open="0"]'); check(await pg.is_visible('#gallery-modal'),'gallery opens')
        await pg.keyboard.press('Escape'); check(not await pg.is_visible('#gallery-modal'),'gallery closes')
        check((await pg.evaluate('window.CAREBRIDGE_FORM_ENDPOINT')).endswith('/exec'),'endpoint configured')
        opts = await pg.eval_on_selector_all('#cb-service option','os=>os.map(o=>o.value)')
        check(opts[0]=='' and 'Aesthetic procedures & cosmetic surgery' in opts and 'Health screening & check-up' in opts and len(opts)==11,'escort type list (10 types + placeholder)')
        await pg.fill('#cb-name','Jane'); await pg.fill('#cb-email','jane@example.com')
        await pg.click('#form-submit'); await pg.wait_for_timeout(300)
        check(len(posted)==0,'phone is required (blocked without phone)')
        await pg.fill('#cb-phone','abc'); await pg.click('#form-submit'); await pg.wait_for_timeout(300)
        check(len(posted)==0,'invalid phone blocked')
        await pg.fill('#cb-phone','+65 9123 4567'); await pg.select_option('#cb-service','Dental care')
        await pg.click('#form-submit'); await pg.wait_for_timeout(500)
        check(len(posted)==1 and 'email=jane%40example.com' in posted[0] and 'phone=%2B65+9123+4567' in posted[0] and 'service=Dental+care' in posted[0],'form posts name/email/phone/type to Apps Script')
        check(await pg.is_visible('#form-success'),'success message shown')
        await pg.wait_for_timeout(300)
        import json as _j
        check(len(pushed)==1 and _j.loads(pushed[0])['topic']=='carebridge-oszufbatef','phone push sent to ntfy topic')
        check(len(pushed)==1 and 'jane' not in pushed[0].lower() and '9123' not in pushed[0],'push contains no name/email/phone')
        check(len(pushed)==1 and 'Dental care' in _j.loads(pushed[0])['message'],'push shows escort type')
        # 스팸봇(숨은 칸 채움)은 서버 전송·푸시 모두 안 함
        await pg.click('#form-again'); await pg.fill('#cb-name','Bot'); await pg.fill('#cb-email','bot@example.com'); await pg.fill('#cb-phone','+1 555 000 0000')
        await pg.evaluate("document.getElementById('cb-website-alt').value='spam'")
        await pg.click('#form-submit'); await pg.wait_for_timeout(500)
        check(len(posted)==1 and len(pushed)==1,'honeypot submission is not sent or pushed')
        await b.close()
    print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
asyncio.run(main())
