# 등촌 GIVE LOVE · 모바일 초대장 웹사이트 (v13)

2026년 11월 7일(토) 12:00–16:00, 등촌교회 교육관 1층에서 열리는 2청년회 플리마켓 & 새생명축제 홍보 사이트입니다.
모바일 청첩장처럼 한 장면씩 내려가며 읽고, 장면마다 스크롤에 맞춰 움직임이 하나씩 살아납니다.

- 공개 주소: https://prayer0420.github.io/deungchon-give-love/
- 저장소: https://github.com/prayer0420/deungchon-give-love

## 장면 구성

| 장면 | 내용 | 스크롤 동작 |
|---|---|---|
| 오프닝 | 등촌 GIVE LOVE, 날짜, 장소 | 빨간 실에 매달린 가격표가 떨어져 흔들림, 스크롤 속도에 따라 출렁임 |
| 초대합니다 | 청첩장식 인사말 | 문장이 한 줄씩 떠오름 |
| 날짜 | D-day(실시간), 11월 달력 | 7일에 하트가 그려짐, D-day 숫자가 올라감 |
| 새생명축제 | 축제 소개, 2청년회 주일예배 | 글자가 읽는 속도에 맞춰 진해짐, 시계 바늘이 2시 30분으로 감김 |
| 작은 장터 | 와플 미니어처 | 확대되며 회전 |
| 프로그램 | 먹거리, 마켓, 체험, 놀이 | 화면 고정 후 네 장면 전환, 물건에 이름표가 붙음 |
| 나눔 | 수익금 기부처 | 물건 탑이 아래부터 쌓임, 형광펜 강조 |
| 처음 오신 분께 | 무료 음료, 체험 쿠폰, 럭키드로우 응모권 | 쿠폰 세 장이 한 장씩 펼쳐짐 |
| 미리보기 | 종이 인형 영상 | 프레임이 커지며 자동 재생(무음) |
| 오시는 길 | 주소, 지도 버튼, 우천 안내 | 큰 글자가 올라옴 |
| 공유 | 공유하기, 링크 복사 | |
| 마지막 | 십자수 L♥VE, "당신이 오면 완성돼요" | 한 땀씩 수놓아지고 마지막 E는 끝에 완성 |

페이지 전체를 빨간 실 한 줄이 꿰매듯 따라 내려갑니다. 오른쪽 위 버튼으로 배경음악을 켜고 끌 수 있습니다(기본은 꺼짐).
'동작 줄이기' 설정을 켠 기기에서는 움직임 없이 모든 내용이 바로 보입니다.

## 사실 확인 출처 (2026-10-10 확인)

- 2청년회 예배: 주일 오후 2시 30분, 본당 예배실, 27세 이상 미혼 청년 공동체
  - 교회 홈페이지 2청년회 https://www.deungchon.org/main/sub.html?pageCode=33
  - 예배안내 https://www.deungchon.org/main/sub.html?pageCode=9
- 새생명축제: 등촌교회가 매년 11월에 여는 전도축제 https://www.deungchon.org/main/sub.html?pageCode=48
- 주소: 서울 양천구 목동중앙북로8길 49 https://www.deungchon.org/main/sub.html?pageCode=14
- 행사 일시·장소·프로그램·우천 계획·주최: 청년회 기획서와 확정 포스터 문구
- 수익금 기부처: 기아대책과 자립청소년 지원 (2026-10-10 청년회 결정)

## 고치는 법

- 문구: `index.html`에서 바로 고칩니다.
- 글자를 새로 넣었다면 글꼴을 다시 만들어야 합니다(페이지에 쓰인 글자만 담은 경량 글꼴):
  `python C:/Users/c/IdeaProjects/ai-workspace/.local/deungchon-site/tools/subset_fonts.py` (PYTHONPATH에 `.local/pylib` 필요)
- 움직임: `assets/js/site.js`, 디자인: `assets/css/site.css`
- 캘린더 파일: `assets/give-love.ics` (`tools/make_ics.cjs`로 생성)
- 검증 스크립트: `tools/shoot.mjs` (mobile, se, tablet, desktop, reduced), `tools/hero.mjs`

## 사용 기술

순수 HTML/CSS/JS, GSAP 3.15(ScrollTrigger, SplitText, DrawSVG), Lenis(데스크톱 휠 스크롤만), 모두 자체 호스팅.
글꼴: Paperlogy, SUIT, MaruBuri, Bricolage Grotesque (사용 글자만 서브셋).
아이콘: Phosphor Icons.

