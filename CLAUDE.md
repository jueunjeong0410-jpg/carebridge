# 작업 지침

- 새 작업은 `dev` 브랜치에서 하고, push나 `main` 반영 전에는 주은에게 먼저 확인받기
- 문구·데이터 수정은 `src/data.mjs`, 레이아웃은 `src/build.mjs`에서 하고 `npm run build`로 `docs/`를 다시 생성 (docs의 HTML을 직접 고치지 않기)
- `docs/assets/config.js`의 문의 접수 URL과 Apps Script 스크립트 속성(이메일, ntfy 토픽)은 지우거나 저장소에 비밀값을 적지 않기
- 결과 보고는 쉬운 말로
- GitHub에 올리기 전에 `python3 tests/secret_scan.py --history`로 비밀값·개인정보 검사를 하고, 통과해야만 올리기
- 실제 이메일·전화번호·구글 시트/스크립트 ID·API 키·토큰은 저장소에 쓰지 않기 (Apps Script 스크립트 속성에만 보관). 홈페이지에 공개돼도 되는 값은 문의 접수 주소와 ntfy 토픽뿐
