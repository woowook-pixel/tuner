공통 파일: design/shared (자동 동기화, 직접 고치지 않음). 같은 도메인의 /design/shared/...(tokens.css, symbols.js, 아이콘)를 직접 링크하며 import는 쓰지 않는다. apple-touch-icon은 빌드 때 scripts/build.js가 design/shared/icons/apple-touch-icon.datauri.txt를 읽어 HTML에 넣는다(정적 사이트, 빌드는 vercel.json의 buildCommand).

- 적용한 CHANGELOG 번호: 002, 003, 004, 005, 006, 007, 008, 009, 011, 012, 013
  - 004의 중앙 주소는 007에서 design/shared로 바뀌었다. 008(아이콘 스타일)은 동기화가 design/shared/icons/에 넣는 파일로 자동 반영된다.
  - 013: 상단 캐릭터 크기를 width="44" height="28"로 바꿨다(공통 CSS가 크기를 정함, 앱 CSS 크기 지정 없음). 이 앱에는 하단 탭바(.pf-tabbar)가 없어 탭바 항목은 해당 없음이다(.pf-tabs는 줄 선택용 상단 탭).
  - 009: 이 앱에는 제목 줄(.pf-title) 화면이 없다. 음 이름 블록은 제목 블록이 아니라서 .pf-titleblock 대신 앱 클래스(.noteblock)를 쓴다.
