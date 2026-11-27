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
        posted=[]
        async def handler(r):
            u=r.request.url
            if EP in u: posted.append(r.request.post_data); await r.fulfill(status=200, headers={'Access-Control-Allow-Origin':'*'}, body='{"code":"OK"}')
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
        pg=await b.new_page(viewport={'width':390,'height':800}); await pg.route('**/*',handler); await pg.goto(BASE+'/')
        await pg.click('#menu-toggle'); check(await pg.get_attribute('#menu-toggle','aria-expanded')=='true','mobile menu opens')
        await pg.set_viewport_size({'width':1440,'height':900})
        await pg.click('[data-review-next]'); check(await pg.text_content('#review-name')=='Daniel K.','review next')
        await pg.click('[data-review-dot="4"]'); check(await pg.text_content('#review-count')=='05 / 05','review dot')
        await pg.click('[data-gallery-open="0"]'); check(await pg.is_visible('#gallery-modal'),'gallery opens')
        await pg.keyboard.press('Escape'); check(not await pg.is_visible('#gallery-modal'),'gallery closes')
        check((await pg.evaluate('window.CAREBRIDGE_FORM_ENDPOINT')).endswith('/exec'),'endpoint configured')
        await pg.fill('#cb-name','Jane'); await pg.fill('#cb-email','jane@example.com'); await pg.click('#form-submit'); await pg.wait_for_timeout(500)
        check(len(posted)==1 and 'email=jane%40example.com' in posted[0],'form posts to Apps Script endpoint')
        check(await pg.is_visible('#form-success'),'success message shown')
        await b.close()
    print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
asyncio.run(main())
