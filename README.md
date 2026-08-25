# 디자인 A/B 투표 사이트

UC1, UC2, UC4, UC5, UC6 (총 5개, UC3 제외) 화면의 A/B안 중 어느 쪽이 더 나은지
익명으로 1인 1회 투표받고, 인스타 투표처럼 바로바로 결과를 보여주는 정적 사이트입니다.
GitHub Pages로 배포하고, 투표 집계는 Firebase(Firestore)에 저장합니다.

## VSCode + Claude Code로 이어서 작업하기

이 폴더를 그대로 VSCode에서 열고 Claude Code에게 아래 순서로 시키면 됩니다.

1. **구조 파악**
   ```
   이 폴더는 A/B 테스트 투표 사이트야 (index.html, style.css, app.js, firebase-config.js).
   README.md 읽고 구조 파악해줘.
   ```
2. **Firebase 연동** — 콘솔에서 프로젝트 생성/웹앱 등록/보안 규칙 게시는 브라우저 로그인이 필요해서
   직접 해야 하고, 나온 값을 알려주면 Claude Code가 `firebase-config.js`에 반영해줍니다.
   ```
   Firebase 콘솔에서 프로젝트 만드는 것부터 Firestore 보안 규칙 설정까지
   단계별로 알려주면서 진행해줘. 값 복사해오면 파일에 반영해줘.
   ```
3. **이미지/문구 반영**
   ```
   images 폴더에 UC1_A.png ~ UC6_B.png (UC3 제외) 넣어놨어.
   app.js의 UC_LIST에서 제목이랑 설명 문구도 [실제 내용]으로 바꿔줘.
   ```
4. **테스트 + 배포**
   ```
   로컬 서버로 띄워서 투표 흐름(첫 투표 → 결과 보임 → 재접속 시 재투표 안 됨)
   테스트해줘. 문제없으면 깃허브 레포 만들어서 push하고 GitHub Pages 배포까지 설정해줘.
   ```
   `gh` CLI가 설치돼 있으면 Claude Code가 레포 생성/push/Pages 설정까지 대신 실행할 수 있어요.

## 1. 이미지 준비

Figma에서 각 UC 프레임을 PNG로 export 해서 `images/` 폴더에 아래 이름 규칙으로 넣어주세요.

```
images/UC1_A.png   images/UC1_B.png
images/UC2_A.png   images/UC2_B.png
images/UC4_A.png   images/UC4_B.png
images/UC5_A.png   images/UC5_B.png
images/UC6_A.png   images/UC6_B.png
```

이미지가 없어도 사이트는 동작하고(회색 placeholder로 표시), 나중에 채워 넣으면 됩니다.
문항 제목/설명은 `app.js` 맨 위 `UC_LIST` 배열에서 자유롭게 수정하세요.

## 2. Firebase 프로젝트 만들기 (5분)

1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. 프로젝트 이름 아무거나 입력 (예: `ab-test`), Google Analytics는 꺼도 무방
3. 왼쪽 메뉴 **빌드 > Firestore Database** → **데이터베이스 만들기**
   - 위치는 `asia-northeast3 (서울)` 추천
   - 보안 규칙은 일단 "테스트 모드"로 시작해도 되지만, 아래 3번 규칙으로 꼭 교체하세요.
4. 왼쪽 메뉴 **프로젝트 설정(톱니바퀴) > 일반** → 아래로 스크롤 → **웹 앱 추가 (</> 아이콘)**
   - 앱 닉네임 아무거나 입력 → 등록
   - 화면에 나오는 `firebaseConfig` 객체를 통째로 복사

5. 복사한 값을 이 프로젝트의 `firebase-config.js` 파일 안 `firebaseConfig`에 붙여넣기

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "ab-test-xxxx.firebaseapp.com",
  projectId: "ab-test-xxxx",
  storageBucket: "ab-test-xxxx.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

## 3. Firestore 보안 규칙 설정 (중요)

Firebase 콘솔 → Firestore Database → **규칙** 탭에서 아래로 교체하고 **게시**하세요.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/{pollId} {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(['a', 'b']);
    }
    match /voters/{voterId} {
      allow read: if true;
      allow create: if !exists(/databases/$(database)/documents/voters/$(voterId));
      allow update: if resource.data.status == 'in_progress';
      allow delete: if false;
    }
  }
}
```

이 규칙이 하는 일:
- `voters/{voterId}` 문서는 **한 번만 생성 가능** → 같은 브라우저(같은 voterId)로는 재투표 불가
- `polls` 문서는 a/b 카운트만 수정 가능

> **한계**: 완전한 부정 투표 방지는 아닙니다. 브라우저 저장공간(localStorage)을 지우거나
> 시크릿 모드/다른 기기를 쓰면 재투표가 가능해요. 사내 소규모 A/B 테스트 용도로는 충분한 수준이고,
> 완벽 차단이 필요하면 로그인(사번/이메일) 기반으로 바꾸는 게 좋아요 — 필요하면 알려주세요.

## 4. 로컬에서 테스트

폴더 전체를 그대로 브라우저에서 열어도 되지만, 일부 브라우저는 로컬 파일에서 `fetch`를 막아서
간단한 로컬 서버로 띄우는 걸 추천해요.

```bash
cd abtest-site
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## 5. GitHub Pages 배포

```bash
git init
git add .
git commit -m "A/B 투표 사이트"
git branch -M main
git remote add origin https://github.com/{your-id}/{repo-name}.git
git push -u origin main
```

그 다음:
1. GitHub 저장소 → **Settings > Pages**
2. **Source**를 `Deploy from a branch` → Branch: `main`, 폴더: `/ (root)` 선택 → Save
3. 몇 분 뒤 `https://{your-id}.github.io/{repo-name}/` 에서 접속 가능

## 폴더 구조

```
abtest-site/
├── index.html
├── style.css
├── app.js              # 투표 로직 (UC 목록도 여기서 수정)
├── firebase-config.js  # 본인 Firebase 프로젝트 값으로 교체 필요
├── images/              # UC1~UC6(UC3 제외) A/B 이미지
└── README.md
```

## 동작 방식 요약

- 처음 접속 시 브라우저에 랜덤 ID를 저장(localStorage) → 이 ID로 익명 식별
- UC1 → UC2 → UC4 → UC5 → UC6 순서로 한 문항씩 노출
- A안/B안 중 하나를 클릭하면 즉시 Firestore에 집계되고, 그 자리에서 현재까지의 A vs B 비율이 바로 표시됨 (인스타 투표 방식)
- 5문항을 모두 마치면 전체 요약 화면으로 이동, 이후에도 실시간으로 계속 갱신됨(다른 사람이 투표할 때마다 자동 반영)
- 이미 투표한 사람이 다시 접속하면 투표 화면 대신 바로 결과 화면만 보여줌