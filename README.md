# CareBridge 홈페이지

서울 프라이빗 메디컬 컨시어지 **Care Bridge** 홈페이지입니다.
GitHub Pages로 무료 배포하고, 상담 문의는 **메일 + 휴대폰 푸시(ntfy 앱) + 구글 시트**로 받습니다. 유지비 0원.

- 메일·시트: 구글 Apps Script(`apps-script/Code.gs`)가 처리
- 휴대폰 푸시: 접수 성공 직후 홈페이지가 ntfy로 바로 보냄 (구글 서버→ntfy는 공용 IP 한도 때문에 막힘). 토픽이 코드에 보이므로 푸시에는 개인정보를 넣지 않음

```
docs/                  ← 실제로 배포되는 홈페이지 (GitHub Pages가 이 폴더를 보여줌)
  index.html             홈
  services/              서비스 목록 + 상세 3개
  assets/config.js       ★ 문의 접수 주소(Apps Script URL)를 넣는 곳
  assets/site.js         메뉴·갤러리·후기 슬라이드·문의 폼 동작
src/                   ← 페이지를 만드는 원본 (문구 수정은 src/data.mjs)
apps-script/Code.gs    ← 문의를 받아 메일·푸시·시트로 보내는 구글 스크립트
```

---

## 1단계. 홈페이지 올리기 (GitHub Pages)

1. GitHub에서 **New repository** → 이름 `carebridge` → **Public** → Create
2. 이 폴더를 그 저장소에 올리기 (GitHub Desktop: *Add Existing Repository* → 이 폴더 선택 → *Publish*)
3. 저장소 **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, 폴더: **`/docs`** → Save
4. 1~2분 뒤 `https://<내 아이디>.github.io/carebridge/` 에서 열림

## 2단계. 휴대폰 푸시 앱 준비 (ntfy, 무료)

1. 휴대폰에 **ntfy** 앱 설치 (App Store / Play 스토어)
2. 앱에서 **＋ → Subscribe to topic** → 남이 못 맞힐 이름 입력 (예: `carebridge-7f3k9q2x`)
   - 토픽 이름은 비밀번호처럼 다루세요. 이름을 아는 사람은 알림을 볼 수 있어요.

## 3단계. 문의 접수기 만들기 (Google Apps Script)

1. 구글 드라이브에서 **새 스프레드시트** 만들기 (이름: `CareBridge 문의`)
2. 메뉴 **확장 프로그램 → Apps Script**
3. 기본 코드를 다 지우고 `apps-script/Code.gs` 내용을 통째로 붙여넣기 → 저장
4. 왼쪽 ⚙️ **프로젝트 설정 → 스크립트 속성 → 속성 추가**
   - `NOTIFY_EMAIL` = 알림 받을 메일 (여러 개면 쉼표로)
   - `SHEET_ID` = 문의 시트 주소에서 `/d/` 와 `/edit` 사이 글자
5. 편집기 위쪽 함수 목록에서 **`setupAndTest`** 선택 → ▶ 실행 → 권한 승인
   → 시트에 테스트 줄이 생기고 메일이 오면 성공
6. 오른쪽 위 **배포 → 새 배포** → 유형 ⚙️ *웹 앱*
   - 다음 사용자로 실행: **나**
   - 액세스 권한: **모든 사용자**
   → 배포 → **웹 앱 URL 복사** (`https://script.google.com/macros/s/…/exec`)
7. `docs/assets/config.js`에 URL과 ntfy 토픽 이름을 넣고 `npm run build` → GitHub에 다시 올리기

> 코드를 고친 뒤엔 **배포 → 배포 관리 → ✏️ → 버전: 새 버전**으로 다시 배포해야 반영돼요. (URL은 그대로)

## 문구·이미지 고치기

`src/data.mjs`(후기, 서비스 설명, 숫자, 문의 폼의 동행 유형 목록 `escortTypes` 등)를 고친 뒤 터미널에서:

```bash
npm install      # 처음 한 번만
npm run build    # docs/ 폴더가 다시 만들어짐
python3 -m http.server 8765 --directory docs &   # 회귀테스트용 로컬 서버
python3 tests/regress.py http://localhost:8765   # ALL PASS 확인 후 올리기
python3 tests/secret_scan.py --history           # 비밀값·개인정보 유출 검사
```

## 참고

- 사진은 Unsplash(무료·상업 이용 가능, 출처 표기 의무 없음) 공식 이미지 서버에서 불러와요. 실제 서비스 사진이 생기면 `docs/assets/`에 넣고 `src/data.mjs`의 주소를 바꾸면 됩니다. 사진을 못 불러오면 깨진 아이콘 대신 배경색만 보여요.
- 후기·숫자(48+ 병원, 12개 언어 등)는 시안의 예시 문구예요. 실제 운영 전에 사실에 맞게 바꿔 주세요.
- 문의 폼에는 스팸봇용 숨은 칸과 1분 중복 전송 방지가 들어 있어요.
- **유출 방지:** 알림 이메일·시트 ID는 Apps Script의 스크립트 속성에만 있고 저장소에는 없어요. 홈페이지 코드에 보이는 건 문의 접수 주소와 ntfy 토픽뿐인데, 둘 다 공개용이에요(푸시에는 개인정보를 넣지 않음). GitHub의 Secret Protection·Push protection도 켜져 있어요.
