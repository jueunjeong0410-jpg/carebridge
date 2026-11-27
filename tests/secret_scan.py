# 비밀값·개인정보 유출 검사 — GitHub에 올리기 전에 실행: python3 tests/secret_scan.py
# 저장소에 올라갈 모든 파일(그리고 --history 를 붙이면 지난 커밋 전부)에서
# 실제 이메일 주소, 전화번호, 구글 시트·스크립트 ID, API 키·토큰, 개인 키를 찾습니다.
import re, subprocess, sys

# 공개돼도 되는 값 (일부러 홈페이지에 넣은 것 / 예시)
ALLOWED = [
    'noreply@anthropic.com',          # 커밋 작성자 표기
    'me@gmail.com', 'you@example.com',  # 설명용 예시
    'AKfycbw2sM3Yo2qOOEJSVyAXoI34MWbL98fzXsrOhH_4WEtxBNMJgbFftGYQpN1QeKgETMuO',  # 문의 접수 주소(공개용)
]
ALLOWED_EMAIL_DOMAINS = ('example.com', 'x.com')  # 테스트용 가짜 주소

CHECKS = {
    '이메일 주소': re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'),
    '한국 휴대폰 번호': re.compile(r'01[016789][- .]?\d{3,4}[- .]?\d{4}'),
    '구글 시트/드라이브 ID': re.compile(r'docs\.google\.com/[a-z]+/d/[A-Za-z0-9_-]{25,}|\b1[A-Za-z0-9_-]{43}\b'),
    'Apps Script 프로젝트 ID': re.compile(r'script\.google\.com/home/projects/[A-Za-z0-9_-]{20,}'),
    'GitHub 토큰': re.compile(r'gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}'),
    'Google API 키': re.compile(r'AIza[0-9A-Za-z_-]{35}'),
    'OpenAI/Anthropic 키': re.compile(r'\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}'),
    'Slack 토큰': re.compile(r'xox[abprs]-[A-Za-z0-9-]{10,}'),
    '개인 키': re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
}
SKIP_FILES = ('package-lock.json',)  # 부품 목록(무결성 해시가 많아 오탐)
# 테스트 파일 안의 예시 번호는 허용
EXAMPLE_PHONES = ('010-1234-5678', '010 1234 5678')

def git(*a):
    return subprocess.run(['git', *a], capture_output=True, text=True).stdout

def check_text(text, where, path, found):
    for name, rx in CHECKS.items():
        for m in rx.finditer(text):
            v = m.group(0)
            if v in ALLOWED: continue
            if name == '이메일 주소' and v.split('@')[1].lower().endswith(ALLOWED_EMAIL_DOMAINS): continue
            if name == '한국 휴대폰 번호' and v in EXAMPLE_PHONES: continue
            found.append((where, path, name, v[:60]))

def main():
    found = []
    # 1) 지금 올라갈 파일: 추적 중이거나 새로 생긴 파일(.gitignore 제외)을 디스크에서 읽음
    for path in git('ls-files', '--cached', '--others', '--exclude-standard').splitlines():
        if path.endswith(SKIP_FILES): continue
        try: text = open(path, encoding='utf-8').read()
        except (UnicodeDecodeError, FileNotFoundError, IsADirectoryError): continue
        check_text(text, '현재 파일', path, found)
    # 2) --history: 이미 올라간 지난 커밋 전부
    if '--history' in sys.argv:
        for rev in git('rev-list', '--all').split():
            for path in git('ls-tree', '-r', '--name-only', rev).splitlines():
                if path.endswith(SKIP_FILES): continue
                r = subprocess.run(['git', 'show', f'{rev}:{path}'], capture_output=True)
                try: text = r.stdout.decode('utf-8')
                except UnicodeDecodeError: continue
                check_text(text, rev[:7], path, found)
    seen = set()
    for f in found:
        if f[1:] in seen: continue
        seen.add(f[1:])
        print(f'FAIL [{f[0]}] {f[1]}: {f[2]} → {f[3]}')
    print('RESULT:', 'ALL PASS (비밀값·개인정보 없음)' if not found else f'{len(seen)}건 발견 — 올리기 전에 지워야 해요')
    sys.exit(1 if found else 0)

if __name__ == '__main__':
    main()
