# HANDOFF: Pitch (구 튜너) 세션 인수인계

작성 시점: 2026-10-21, 기준 커밋: main `bc2f256`. 이 문서는 세션을 다른 Claude 계정으로 옮기기 위한 정리입니다. 소스는 이 저장소와 지난 세션 대화이며, 확인하지 못한 내용은 "미확인"으로 표시했습니다.

## 1. 프로젝트 목적

- 기타와 베이스용 크로매틱 튜너 PWA입니다. 마이크로 줄 소리를 받아 음정(센트 단위 오차)을 바늘과 막대로 보여 줍니다.
- 앱 이름은 "튜너"에서 **Pitch**로 바뀌었습니다. 피타소프트 앱 패밀리(Pitch, bite, script, wayly, lexi, strum)의 디자인 통일 작업에 포함되어 있습니다.
- 소유자는 이 저장소의 GitHub 계정 `woowook-pixel`이고, 대화 상대는 김상욱 차장(피타소프트 한국 본사 CS팀장)입니다.

## 2. 구조

정적 사이트이며 프레임워크가 없습니다. 배포는 Vercel(정적)입니다.

| 경로 | 역할 |
|---|---|
| `index.html` | 앱 전체(HTML, CSS, JS가 한 파일, 약 420줄) |
| `sw.js` | 서비스 워커. network-first. `png/gif/svg/ico/webmanifest`와 같은 출처의 `/version.json`은 우회. 캐시 이름 `pitch-v6` |
| `manifest.webmanifest` | 이름 Pitch, standalone, 아이콘은 `/design/shared/icons/pitch-192.png`, `-512.png` |
| `vercel.json` | `buildCommand: node scripts/build.js`, `outputDirectory: "."`, `/version.json`은 no-store |
| `scripts/build.js` | 빌드 때 `version.json` 생성, `APP_VERSION` 주입, apple-touch-icon을 data URI로 주입(PNG 서명, 청크 CRC, 180x180 검증, 실패하면 빌드 실패) |
| `design/shared/` | 공통 디자인(tokens.css, symbols.js, icons, characters 등). **자동 동기화 PR("공통 디자인 동기화")이 갱신하므로 직접 고치지 않음** |
| `design/APPLIED.md` | 적용한 공통 CHANGELOG 번호와 앱 쪽 판단 기록 (현재 002-009, 011-013 적용) |
| `design/PITCH.md` | Pitch에만 해당하는 적용 기준 |

`index.html`의 소스에는 `href="__APPLE_TOUCH_ICON__"`과 `APP_VERSION = '__APP_VERSION__'` 자리표시자가 있습니다. 빌드가 이를 채웁니다.

## 3. 확정된 결정 사항

**디자인 (Pitch 패밀리 기준)**
- `border-radius: 0`, 원형 요소 없음. Ember 색은 현재 음 막대와 자동 감지 점에만 사용. 정확 상태는 검은 음 이름 글자.
- 터치 영역 44px 이상. 상단 바 높이 44px 고정.
- 공통 클래스를 쓰고(`.pf-header`, `.pf-topbar`, `.pf-brand`, `.pf-tabs`, `.pf-sym` 등) 앱 CSS는 앱 고유 부분만 둡니다. 공통 CSS가 정한 크기, 높이는 앱에서 덮어쓰지 않습니다.
- 글꼴은 공통 토큰(Archivo, Noto Sans KR). 화면 문구는 하십시오체이며 "해요체"를 쓰지 않습니다.
- 상단 워드마크 옆 캐릭터는 `pitch.gif`(움직임 줄이기에서는 `pitch-still.png`), `width="44" height="28"`. 서브 화면과 다른 곳에는 넣지 않습니다.
- 하단 탭바(`.pf-tabbar`)는 이 앱에 없습니다. `.pf-tabs`는 줄 선택용 상단 탭입니다.
- 음 이름 블록은 `.pf-titleblock`이 아니라 앱 클래스 `.noteblock`을 씁니다(009 규칙이 눈썹 글자를 오른쪽으로 옮기기 때문).
- 상단 흐림 점검(012)은 "해당 없음"입니다. 헤더 위 고정 오버레이, `backdrop-filter`, blur가 없고, 고정 요소는 `.scrim`(z-index 10)뿐이며 헤더(z-index 20) 아래입니다.

**홈 화면 아이콘 (iOS)**
- iOS 27.2 Safari에서 파일 URL apple-touch-icon이 실패했고 data URI는 동작했습니다. 그래서 빌드 시 주입 방식을 유지합니다. `__APPLE_TOUCH_ICON__` 자리표시자를 지우지 마십시오.

**악기 범위**
- 지원 악기는 기타(6현)와 베이스(4현) 2종입니다. 어쿠스틱 베이스, 클래식 기타, 바이올린, 비올라, 첼로를 추가한 PR #36은 사용자 요청으로 **되돌렸습니다**(PR #37). 사용자가 "잘못했다, 앱이 헷갈린다"고 했으므로 같은 요청이 다시 오기 전에는 추가하지 마십시오.

**기준 파일 작업 방식**
- 소스에 없는 내용은 쓰지 않고, 보고는 결론 먼저, 수치 근거로 합니다.
- PR은 사용자가 요청할 때만 만듭니다(CHANGELOG 적용 작업은 작업 지시에 PR이 포함되어 있었음).

## 4. 절대 바꾸지 않는 것

- 음정 감지 코드: `yin()`, `tick()`, `freqOf()`, 마이크 설정(`start()`의 `getUserMedia`, `AudioContext` 생성). 사용자가 변경 금지로 정했습니다. 바꿔야 한다면 반드시 먼저 승인을 받으십시오.
- 악기별 `minF/maxF`, `GATE_RMS`(0.008) 같은 상수도 감지 동작을 바꾸므로 같은 취급입니다.
- `design/shared/` 파일. 자동 동기화가 덮어씁니다.

## 5. 현재 열린 PR 목록

2026-10-21 기준 **열린 PR은 없습니다**(GitHub에서 확인). 이 파일을 담은 PR만 새로 열립니다. 아래는 이 세션에서 다룬 PR의 상태입니다.

| PR | 목적 | 상태 |
|---|---|---|
| 이 HANDOFF 문서 PR | 인수인계 문서 추가(`HANDOFF.md`만) | 머지 예정 |
| #29 | CHANGELOG 012 상단 캐릭터 도입, 흐림 점검 | 머지됨 |
| #33 | CHANGELOG 013 캐릭터 44x28, 탭바 해당 없음 | 머지됨 |
| #36 | 악기 5종 추가 | 머지됨, 이후 #37로 되돌림 |
| #37 | #36 되돌리기 | 머지됨 |
| #30, #31, #32, #34, #35 | 공통 디자인 동기화(자동 PR) | 머지됨 |

## 6. 브랜치 정리 대상 (모두 원격에 남아 있음, 삭제는 사용자 승인 후)

`git cherry`로 main과 비교한 결과입니다(스쿼시 머지는 커밋이 달라 "미머지"로 보일 수 있음).

- main에 내용이 모두 들어가 폐기 가능(차이 없음): `claude/tuner-ui-icon-redesign-ldajpz`(이 세션에 지정됐던 개발 브랜치, main과 동일), `design/central-tokens`, `design/changelog-002`, `design/changelog-003-004`, `design/changelog-005-006`, `design/family-ui`, `fix/home-icon`, `fix/home-icon-datauri`, `fix/home-icon-png`, `fix/home-icon-v2`.
- 스쿼시 머지로 내용이 main에 들어가 폐기 가능: `design/brand-icon-011`, `design/character-012`, `design/tabbar-013`, `revert/more-instruments`.
- 폐기 가능하나 확인 필요: `chore/remove-icon-test`(icon-test는 PR #23에서 제거되어 불필요하지만 커밋 1개가 main에 없음), `design/shared-009`(커밋 3개가 main에 없음으로 표시됨. 009 내용은 이후 PR로 main에 반영되어 있으나 브랜치별 대조는 하지 않았음).
- 보류: `feat/more-instruments`(악기 5종 추가 커밋. 사용자가 다시 원하면 재사용 가능).

## 7. 진행 중인 작업과 다음 할 일

사용자 결정을 기다리는 항목입니다. 코드는 아직 아무것도 바뀌지 않았습니다.

1. **마이크가 인식되지 않는다는 보고**: 코드에서 이상은 찾지 못했습니다(마이크 코드는 최초 업로드 이후 변경 없음). 가짜 마이크를 단 크롬에서는 정상 시작됐습니다. 원인 후보는 iOS 홈 화면 앱의 권한, iOS의 `AudioContext` 일시정지(`start()`가 `resume()`을 부르지 않음), 다른 앱의 마이크 점유입니다.
   - 필요한 정보: 기기와 환경(iPhone 홈 화면 앱인지, Safari 탭인지), 오류 문구가 뜨는지 아니면 바늘만 안 움직이는지.
   - 수정안: `start()`에 `ctx.resume()` 한 줄. 승인이 필요합니다.
2. **E4(기타 1번 줄, 329.6Hz)를 잘 못 잡는다는 보고**: 합성 신호 시험에서 YIN 자체는 정확했습니다(튕긴 뒤 0.6초 이내 오차 1.4센트 이하). 소리가 줄어드는 1초 이후에 게이트(`GATE_RMS` 0.008)에 걸려 `idle`이 되거나 배음 때문에 5-10센트 흔들립니다. 실제 기기 확인은 못 했습니다.
   - 후보: `GATE_RMS`를 0.004 정도로 낮추기(소음에 더 민감), 또는 사용자가 E4를 튕겼을 때 Hz 표시가 나왔다 사라지는지 먼저 확인. 승인이 필요합니다.
3. **공통 디자인 동기화 PR**: 앞으로도 자동으로 올라옵니다. 새 CHANGELOG 번호가 오면 사용자가 "CHANGELOG 0NN을 적용해 주세요" 형태로 지시합니다. 지시문 구조는 항상 "0. 먼저 확인(보고 후 진행) → 적용 → 로컬 확인 → `design/APPLIED.md` 기록과 PR → 변경 파일과 값 보고"입니다.

## 8. 주의할 점

- **빌드 부작용**: `node scripts/build.js`를 저장소 안에서 실행하면 `index.html`에 apple-touch-icon data URI와 버전이 주입됩니다. 커밋 전에 `__APPLE_TOUCH_ICON__`, `__APP_VERSION__` 자리표시자로 되돌리고 `version.json`(무시 파일)을 지우십시오. 안전한 방법은 파일을 임시 폴더에 복사해서 빌드하는 것입니다(이 세션에서는 `git ls-files -z | tar --null -T - -cf - | tar -xf - -C <임시폴더>` 후 임시 폴더에서 빌드).
- **서비스 워커 캐시**: `index.html`은 network-first지만 앱 셸 파일을 바꿀 때는 `sw.js`의 `CACHE` 이름 증가를 검토하십시오. 이미지 확장자 요청은 우회되므로 캐릭터 GIF는 캐시되지 않습니다.
- **로컬 시험 방법**: 헤드리스 크롬은 최소 너비가 500이라 CDP `Emulation.setDeviceMetricsOverride`로 390x844를 지정해야 합니다. 서버는 `python3 -m http.server <포트>`, 크롬은 `/opt/pw-browsers/chromium --headless=new --no-sandbox --remote-debugging-port=<포트>`. CDP 클립 좌표는 페이지 기준이라 스크롤 뒤에는 `scrollY`를 더해야 합니다. 마이크 시험은 `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`.
- **프로세스 종료는 포트로**: `lsof -ti:<포트> | xargs -r kill`. `pkill` 같은 이름 기반 종료는 자기 셸을 죽인 적이 있어 쓰지 않습니다.
- **글쓰기 규칙**: 한국어 합니다체. em dash와 en dash 금지, 기간은 `26/04/05 - 26/04/11`처럼 `-`. 사용자 선호로 보고서와 분석은 채팅 마크다운이 기본이고, 파일은 사용자가 명시할 때만 만듭니다.
- **커밋 규칙**: 커밋 메시지 끝에 세션이 지정한 `Co-Authored-By`와 `Claude-Session` 줄, PR 본문 끝에 `Generated with Claude Code` 줄을 붙입니다. 모델 이름은 커밋, PR, 코드 주석에 쓰지 않습니다.
- **개발 브랜치 지정**: 세션 시작 지시는 `claude/tuner-ui-icon-redesign-ldajpz`였으나, 실제 작업은 작업별 새 브랜치(`design/...`, `feat/...`)를 기본 브랜치 최신 커밋에서 따서 진행했습니다. 새 계정에서는 새 세션의 지정 브랜치를 따르십시오.
- **이 세션에서 한 범위 밖 변경**: `sw.js`의 gif 우회와 캐시 이름 `pitch-v6`은 지시에 없던 추가였고 012 PR에 포함되어 머지됐습니다.
