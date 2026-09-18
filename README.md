# 째깍섬 상세페이지 A/B 테스트 · 포트폴리오

상세페이지 개선 가설 5개(UC1, UC2, UC3, UC4, UC5)를 AS-IS/TO-BE 화면으로 만들어
익명 투표(1인 1회)로 검증한 프로젝트입니다. 투표는 종료되었고, 이 저장소는
최종 결과를 보여주는 포트폴리오용 정적 사이트입니다.

## 보는 방법

`index.html`을 열면 `째깍섬_결과보고서.html`(결과 요약 페이지)로 이동합니다.
각 카드를 누르면 해당 UC의 AS-IS/TO-BE 비교 화면과 최종 투표 결과(`uc*-result.html`)를 볼 수 있습니다.

## 구조

```
index.html            # 째깍섬_결과보고서.html로 리다이렉트
째깍섬_결과보고서.html   # 케이스 스터디 (팀·진행과정·배경·목표·UC 5개 최종 결과·기대 효과)
uc1-result.html         # UC1 비교 화면 + 최종 결과 (정적)
uc2-result.html         # UC2 비교 화면 + 최종 결과 (정적)
uc3-result.html         # UC3 비교 화면 + 최종 결과 (정적)
uc4-result.html         # UC4 비교 화면 + 최종 결과 (정적)
uc5-result.html         # UC5 비교 화면 + 최종 결과 (정적)
이미지/                 # UC별 AS-IS/TO-BE 스크린샷, 로고
글꼴/                   # Pretendard 폰트 파일
```

## 최종 결과 요약

| UC | 내용 | 결과 |
|---|---|---|
| UC1 | 프로그램 진행 순서 타임라인 | TO-BE 87% (26/30표) |
| UC2 | UX 라이팅(안내 문구 톤) | AS-IS 58% (15/26표) |
| UC3 | 재방문 알림 바텀시트 | TO-BE 87% (21/24표) |
| UC4 | 선생님 프로필·자격 노출 | TO-BE 100% (24/24표) |
| UC5 | 부모 편의시설 아이콘 | TO-BE 96% (24/25표) |

총 5개 항목, 누적 129표 집계(한 명이 여러 UC에 중복 투표할 수 있어 총 참여 인원과는 다름). UC2를 제외한 4개 항목에서 TO-BE(개선안)가 채택되었습니다.

## 투표 당시 사이트(아카이브)

실제 투표가 진행되던 원본 페이지는 `ab-progress.html`과 `uc1-compare.html`,
`uc2-ux-writing.html`, `uc3-compare.html`, `uc4-compare.html`, `uc5-compare.html`에
그대로 남아있습니다(Firebase 실시간 투표 UI 포함, `vote.js` + `firebase-config.js` 사용).
이 페이지들은 기록 보존용이며, 포트폴리오 열람 목적이라면 위 `째깍섬_결과보고서.html` 쪽을 보면 됩니다.
