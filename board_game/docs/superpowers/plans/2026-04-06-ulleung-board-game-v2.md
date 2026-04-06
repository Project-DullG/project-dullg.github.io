# 울릉 한 접시 보드게임 에디션 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 울릉한접시 경매 시스템을 기반으로, 24칸 보드게임 형태의 웹 컴패니언 앱을 구현한다.

**Architecture:** 기존 프로젝트 패턴(단일 HTML + 인라인 JS + Firebase Firestore + Tailwind CDN)을 따르되, 게임 데이터(보드/음식/미션/이벤트)는 공유 JS 모듈로 분리한다. `v2/` 서브폴더에 새 페이지를 생성하여 기존 v1과 공존한다. Firebase 실시간 스냅샷으로 멀티플레이어 동기화를 처리한다.

**Tech Stack:** Vanilla JS (ES Modules), Firebase Firestore 10.x, Tailwind CSS CDN, HTML5

**Spec:** `docs/superpowers/specs/2026-04-06-ulleung-board-game-design.md`

---

## File Structure

```
board_game/
├── game.html, room.html, join.html  (기존 v1 — 수정 없음)
├── v2/
│   ├── data.js          (게임 데이터: 보드, 음식, 미션, 이벤트, 태그)
│   ├── room.html        (방 생성 — v1 room.html 기반 수정)
│   ├── join.html        (참가 로비 — v1 join.html 기반 수정)
│   └── game.html        (메인 게임: 보드, 경매, 이벤트, 미션 전부)
```

### 파일별 책임

| 파일 | 책임 | 주요 export/구조 |
|------|------|-----------------|
| `v2/data.js` | 모든 정적 게임 데이터. 로직 없음 | `BOARD`, `FOODS`, `MISSIONS`, `EVENTS`, `SPECIAL_AUCTION`, `TAGS` |
| `v2/room.html` | 방 생성, 모드 설정, 링크 공유 | Firebase room document 생성 |
| `v2/join.html` | 참가 대기실, 플레이어 목록 | Firebase room document 참가 |
| `v2/game.html` | 보드 렌더링, 이동, 경매, 이벤트, 미션, 승리 판정 | 모든 게임 로직 인라인 |

### Firebase Document Structure (rooms collection)

```js
{
  id: "ROOM_NAME",
  version: "v2",           // v1과 구분
  hostName: "방장닉네임",
  started: false,
  gameOver: false,

  // 보드 상태
  meeplePosition: 0,       // 현재 미플 위치 (0=출발, 1~20=일반칸)
  lapCount: 0,              // 완주 횟수
  turnOrder: [],            // 플레이어 이름 배열 (시계방향)
  currentTurnIndex: 0,      // 현재 윷 던지는 사람

  // 게임 단계
  phase: "roll",            // roll, moving, auction, event, event_resolve, event_steal, event_add_tag,
                            // special_start, special_market, special_observatory, special_observatory_reveal,
                            // special_festival, mission_select
  round: 0,
  rollResults: [],          // 현재 턴의 윷 결과 누적 [{name, steps, extra}]

  // 경매
  currentFood: null,        // {name, tags, restaurant, tile}
  auctionActive: false,
  specialAuctionDeck: [],   // 특별 경매 카드 인덱스 배열 (초기: shuffle [0,1,2,3])

  // 이벤트
  eventDeck: [],            // 남은 이벤트 카드 인덱스
  eventDiscard: [],         // 버린 카드
  activeEvent: null,        // 현재 발동 이벤트

  // 효과 버퍼
  effects: {},              // {halfPrice: true, coupon: "playerName"}

  // 독도전망대: 관찰 결과 (해당 플레이어에게만 표시)
  revealedMission: null,    // {from: "관찰자이름", target: "대상이름", missionId: 3}

  // 플레이어
  players: [
    {
      name: "닉네임",
      balance: 500000,
      foods: [],             // [{name, tags, restaurant}]
      mission: null,         // 선택한 미션 ID
      missionOptions: [],    // 배분된 미션 2장
      missionSelected: false,
      bid: 0,
      hold: 0,              // 입찰 시 잔액에서 hold로 이동 (v1 패턴 유지)
      bidReady: false,
      willParticipate: null,
      skipNextTurn: false
    }
  ],

  // 로그
  roundLogs: [],

  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Task 1: Game Data Module

**Files:**
- Create: `v2/data.js`

- [ ] **Step 1: Create board layout data**

```js
// v2/data.js
export const BOARD = [
  { id: "start", name: "출발", type: "special", district: null },
  { id: "t1",  name: "도동 해녀식당", type: "restaurant", district: "도동", foodIndex: 0 },
  { id: "t2",  name: "도동 오징어라면집", type: "restaurant", district: "도동", foodIndex: 1 },
  { id: "t3",  name: "이벤트", type: "event", district: "도동" },
  { id: "t4",  name: "도동 초밥거리", type: "restaurant", district: "도동", foodIndex: 2 },
  { id: "t5",  name: "도동 카페로드", type: "restaurant", district: "도동", foodIndex: 3 },
  { id: "market", name: "울릉시장", type: "special", district: null },
  { id: "t6",  name: "남양 전복식당", type: "restaurant", district: "남���", foodIndex: 4 },
  { id: "t7",  name: "남양 산채마���", type: "restaurant", district: "남양", foodIndex: 5 },
  { id: "t8",  name: "이벤트", type: "event", district: "남양" },
  { id: "t9",  name: "남양 중화반점", type: "restaurant", district: "남양", foodIndex: 6 },
  { id: "t10", name: "남양 횟집", type: "restaurant", district: "남양", foodIndex: 7 },
  { id: "observatory", name: "독도전망대", type: "special", district: null },
  { id: "t11", name: "천부 약소식당", type: "restaurant", district: "천부", foodIndex: 8 },
  { id: "t12", name: "천부 따개비밥집", type: "restaurant", district: "천부", foodIndex: 9 },
  { id: "t13", name: "���벤트", type: "event", district: "천부" },
  { id: "t14", name: "천부 일식당", type: "restaurant", district: "천부", foodIndex: 10 },
  { id: "t15", name: "천부 해물탕집", type: "restaurant", district: "천부", foodIndex: 11 },
  { id: "festival", name: "해양축제", type: "special", district: null },
  { id: "t16", name: "저동 내수전식당", type: "restaurant", district: "저동", foodIndex: 12 },
  { id: "t17", name: "저동 중국집", type: "restaurant", district: "저동", foodIndex: 13 },
  { id: "t18", name: "이벤트", type: "event", district: "저동" },
  { id: "t19", name: "저동 디저트카페", type: "restaurant", district: "저동", foodIndex: 14 },
  { id: "t20", name: "저동 소라구이집", type: "restaurant", district: "저동", foodIndex: 15 },
];
```

- [ ] **Step 2: Create food data with tags**

```js
export const FOODS = [
  { name: "해녀비빔밥", restaurant: "도동 해녀식당", tags: ["한식","밥류","해산물","도동"] },
  { name: "오징어라면", restaurant: "도동 오징어라면집", tags: ["한식","면요리","해산물","도동"] },
  { name: "독도새우초밥", restaurant: "도동 초밥거리", tags: ["일식","해산물","울릉특산","도동"] },
  { name: "호박엿라떼", restaurant: "도동 카페로드", tags: ["카페","디저��","울릉특산","도���"] },
  { name: "전복해물탕", restaurant: "남양 전복식당", tags: ["한식","탕류","해산물","남양"] },
  { name: "명이나물정식", restaurant: "남양 산채마을", tags: ["한식","밥류","울��특산","남양"] },
  { name: "해물짬뽕", restaurant: "남양 중화반���", tags: ["중식","면요리","해산물","남양"] },
  { name: "울릉도회", restaurant: "남양 횟집", tags: ["일식","해산물","울릉특산","남양"] },
  { name: "울릉약소불고기", restaurant: "천부 약소식당", tags: ["한식","구이","울릉특산","천부"] },
  { name: "따개비칼국수", restaurant: "천�� 따개비밥집", tags: ["한식","면요��","해산물","천부"] },
  { name: "오징어스시", restaurant: "천부 일식당", tags: ["일식","해산물","울릉특산","천부"] },
  { name: "전복뚝배기", restaurant: "천부 해물탕집", tags: ["한식","탕류","해산���","천부"] },
  { name: "홍합밥", restaurant: "저동 내수전식당", tags: ["���식","밥류","���산물","저동"] },
  { name: "울릉짜장면", restaurant: "저동 중국집", tags: ["중식","면요리","저동"] },
  { name: "호박떡세트", restaurant: "저동 디저트카페", tags: ["카페","디저트","울릉특산","저동"] },
  { name: "소라구이정식", restaurant: "저동 소라구이집", tags: ["일식","구이","해산물","저동"] },
];

export const SPECIAL_AUCTION = [
  { name: "독도새우회", tags: ["일식","해산물","울릉특산"] },
  { name: "울릉약소스테이크", tags: ["한식","구이","울릉특산"] },
  { name: "오징어먹물파스타", tags: ["한식","면요리","해산��","울릉특산"] },
  { name: "호박엿한상", tags: ["한식","디저트","울릉특산"] },
];
```

- [ ] **Step 3: Create mission and event data**

```js
export const MISSIONS = [
  { id: 1, name: "울릉도 미식가", desc: "한식 1종 + 일식 1종 + 중식 1종", difficulty: 2,
    check: (foods) => {
      const g = new Set(foods.flatMap(f=>f.tags.filter(t=>["한식","일식","중식"].includes(t))));
      return g.has("한식") && g.has("일식") && g.has("중식");
    }},
  { id: 2, name: "한식의 달인", desc: "한식 3종 (서로 다른 요리유형 3종)", difficulty: 3,
    check: (foods) => {
      const hf = foods.filter(f=>f.tags.includes("한식"));
      if(hf.length<3) return false;
      const types = new Set(hf.flatMap(f=>f.tags.filter(t=>["면요리","탕류","밥류","구이"].includes(t))));
      return types.size >= 3;
    }},
  { id: 3, name: "바다의 왕", desc: "해산물 3종 + 2가지 이상 장르", difficulty: 3,
    check: (foods) => {
      const sf = foods.filter(f=>f.tags.includes("해산물"));
      if(sf.length<3) return false;
      const genres = new Set(sf.flatMap(f=>f.tags.filter(t=>["한식","일식","중식","카페"].includes(t))));
      return genres.size >= 2;
    }},
  { id: 4, name: "대식가", desc: "아무 음식 5종", difficulty: 2,
    check: (foods) => foods.length >= 5 },
  { id: 5, name: "면 로드", desc: "면요리 2종 + 서로 다른 장르 2종", difficulty: 2,
    check: (foods) => {
      const nf = foods.filter(f=>f.tags.includes("면요리"));
      if(nf.length<2) return false;
      const genres = new Set(nf.flatMap(f=>f.tags.filter(t=>["��식","일식","중식"].includes(t))));
      return genres.size >= 2;
    }},
  { id: 6, name: "울릉 특산 수집가", desc: "울릉특산 3종 + 카페 1종 포함", difficulty: 3,
    check: (foods) => {
      const uf = foods.filter(f=>f.tags.includes("울���특산"));
      return uf.length>=3 && foods.some(f=>f.tags.includes("카페"));
    }},
  { id: 7, name: "디저트 & 밥상", desc: "카페 1종 + 밥류 1종 + 탕류 1종", difficulty: 2,
    check: (foods) => {
      return foods.some(f=>f.tags.includes("카페"))
          && foods.some(f=>f.tags.includes("밥류"))
          && foods.some(f=>f.tags.includes("탕��"));
    }},
  { id: 8, name: "절약 미식가", desc: "아무 음식 3종 + 잔액 30만원 이상", difficulty: 3,
    check: (foods, balance) => foods.length>=3 && balance>=300000 },
  { id: 9, name: "동서남북 미식", desc: "4개 구역에서 각 1종씩", difficulty: 3,
    check: (foods) => {
      const d = new Set(foods.flatMap(f=>f.tags.filter(t=>["도동","남양","천부","저동"].includes(t))));
      return d.size >= 4;
    }},
  { id: 10, name: "구이 & 국물", desc: "구이 1종 + 탕류 1종 + 해산물 1종", difficulty: 2,
    check: (foods) => {
      return foods.some(f=>f.tags.includes("구이"))
          && foods.some(f=>f.tags.includes("탕류"))
          && foods.some(f=>f.tags.includes("해산물"));
    }},
  { id: 11, name: "일본-중국 연합", desc: "일식 2종 + 중식 1종", difficulty: 2,
    check: (foods) => {
      return foods.filter(f=>f.tags.includes("일식")).length>=2
          && foods.some(f=>f.tags.includes("중식"));
    }},
  { id: 12, name: "태그 마스터", desc: "서로 다른 요리유형 4종", difficulty: 3,
    check: (foods) => {
      const types = new Set(foods.flatMap(f=>f.tags.filter(t=>
        ["면요리","밥류","탕류","구이","해산물","디저트"].includes(t))));
      return types.size >= 4;
    }},
  { id: 13, name: "해산물 대통령", desc: "해산물 4종 + 3가지 이상 장르", difficulty: 3,
    check: (foods) => {
      const sf = foods.filter(f=>f.tags.includes("해산물"));
      if(sf.length<4) return false;
      const genres = new Set(sf.flatMap(f=>f.tags.filter(t=>["한식","일식","중식","카페"].includes(t))));
      return genres.size >= 3;
    }},
  { id: 14, name: "구이 장인", desc: "구이 2종 + 울릉특산 1종", difficulty: 2,
    check: (foods) => {
      return foods.filter(f=>f.tags.includes("구이")).length>=2
          && foods.some(f=>f.tags.includes("울릉특산"));
    }},
  { id: 15, name: "울릉 관광 코스", desc: "울릉특산 2종 + 디저트 1종 + 면요리 1종", difficulty: 3,
    check: (foods) => {
      return foods.filter(f=>f.tags.includes("울릉특산")).length>=2
          && foods.some(f=>f.tags.includes("디저트"))
          && foods.some(f=>f.tags.includes("면요리"));
    }},
  { id: 16, name: "알뜰 여행가", desc: "아무 음식 2종 + 잔액 40만원 이상", difficulty: 3,
    check: (foods, balance) => foods.length>=2 && balance>=400000 },
];

// 3바퀴 교착 시 근접도 판정용 — 각 미션에 proximity 함수 추가
// proximity(foods, balance) → { score: 달성 조건 수, total: 전체 조건 수, ratio: score/total }
// 패턴 예시 (전체 16개에 동일 패턴 적용):
MISSIONS[0].proximity = (foods) => {
  const g = new Set(foods.flatMap(f=>f.tags.filter(t=>["한식","일식","중식"].includes(t))));
  return { score: g.size, total: 3, ratio: g.size / 3 };
};
MISSIONS[3].proximity = (foods) => {
  return { score: Math.min(foods.length, 5), total: 5, ratio: Math.min(foods.length, 5) / 5 };
};
MISSIONS[7].proximity = (foods, balance) => {
  const s1 = Math.min(foods.length, 3);
  const s2 = balance >= 300000 ? 1 : 0;
  return { score: s1 + s2, total: 4, ratio: (s1 + s2) / 4 };
};
// ... 나머지 미션도 동일 패턴으로 proximity 함수 추가 (구현 시 전체 작성)

export const EVENTS = [
  { id: 1, name: "태풍 경보", desc: "모든 플레이어 5만원 지불", effect: "typhoon", count: 2 },
  { id: 2, name: "풍어 축제", desc: "모든 플레이어 5만원 수령", effect: "bounty", count: 2 },
  { id: 3, name: "오징어 대풍년", desc: "다음 경매 낙찰가 반값", effect: "half_price", count: 2 },
  { id: 4, name: "여객선 지연", desc: "윷 던진 플레이어 다음 턴 건너뜀", effect: "skip_turn", count: 1 },
  { id: 5, name: "관광객 선물", desc: "윷 던진 플레이어 10만원 수령", effect: "gift", count: 2 },
  { id: 6, name: "세금 징수", desc: "최고 잔액 플레이어 10만원 지불", effect: "tax", count: 1 },
  { id: 7, name: "음식 도둑", desc: "다른 플레이어 음식 1개 가져오기", effect: "steal", count: 1 },
  { id: 8, name: "행운의 윷", desc: "즉시 한 번 더 이동", effect: "extra_roll", count: 1 },
  { id: 9, name: "할인 쿠폰", desc: "다음 낙찰 시 10만원 할인", effect: "coupon", count: 2 },
  { id: 10, name: "울릉도의 축복", desc: "보유 음식에 태그 1개 추가", effect: "add_tag", count: 1 },
];

// 이벤트 카드 15장 덱 생성 유틸
export function buildEventDeck() {
  const deck = [];
  EVENTS.forEach(e => { for(let i=0; i<e.count; i++) deck.push(e.id); });
  return shuffle([...deck]);
}

export function shuffle(arr) {
  for(let i=arr.length-1; i>0; i--) {
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

// 태그 색상 (UI용)
export const TAG_COLORS = {
  "한식": "bg-red-100 text-red-700",
  "일식": "bg-blue-100 text-blue-700",
  "중식": "bg-yellow-100 text-yellow-700",
  "카페": "bg-pink-100 text-pink-700",
  "면요리": "bg-orange-100 text-orange-700",
  "밥류": "bg-amber-100 text-amber-700",
  "탕류": "bg-cyan-100 text-cyan-700",
  "구이": "bg-rose-100 text-rose-700",
  "해산물": "bg-sky-100 text-sky-700",
  "디저트": "bg-purple-100 text-purple-700",
  "울릉특산": "bg-emerald-100 text-emerald-700",
  "도동": "bg-slate-100 text-slate-600",
  "남양": "bg-slate-100 text-slate-600",
  "천부": "bg-slate-100 text-slate-600",
  "저동": "bg-slate-100 text-slate-600",
};
```

- [ ] **Step 4: Verify data module loads correctly**

브라우저 콘솔에서 확인:
```js
import('./v2/data.js').then(m => {
  console.assert(m.BOARD.length === 24, "보드 24칸");
  console.assert(m.FOODS.length === 16, "음식 16종");
  console.assert(m.MISSIONS.length === 16, "미션 16장");
  console.assert(m.buildEventDeck().length === 15, "이벤트 15장");
  console.log("All data checks passed!");
});
```

- [ ] **Step 5: Commit**

```bash
git add board_game/v2/data.js
git commit -m "feat(v2): add game data module with board, foods, missions, events"
```

---

## Task 2: Room Creation Page

**Files:**
- Create: `v2/room.html`
- Reference: `room.html` (기존 v1)

- [ ] **Step 1: Create room.html with Firebase setup**

기존 v1 `room.html`을 복사 후 수정:
- 타이틀: "울릉 한 접시 v2 · 보드게임 에디션"
- 모드 선택 제거 (항상 보드게임 모드)
- 플레이어 수 안내: 4~8명
- Room document에 `version: "v2"` 필드 추가
- 시작 잔액 500,000원
- `meeplePosition: 0`, `lapCount: 0`, `turnOrder: []`, `currentTurnIndex: 0`
- `phase: "mission_select"` (미션 선택부터 시작)
- `eventDeck: buildEventDeck()`, `eventDiscard: []`
- `effects: {}`
- 각 player에 `foods: []`, `mission: null`, `missionOptions: []`, `missionSelected: false`, `skipNextTurn: false`
- 게임 시작 시 미션 2장씩 랜덤 배분 (16장에서 각 2장)

- [ ] **Step 2: Implement mission distribution on game start**

```js
// 게임 시작 버튼 클릭 시
async function startGame() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const players = r.players || [];
    if (players.length < 4) { alert("4명 이상 필요합니다."); return; }

    // 미션 16장 셔플 후 2장씩 배분
    const missionIds = shuffle([...Array(16)].map((_,i)=>i+1));
    const updatedPlayers = players.map((p, idx) => ({
      ...p,
      balance: 500000,
      foods: [],
      mission: null,
      missionOptions: [missionIds[idx*2], missionIds[idx*2+1]],
      missionSelected: false,
      bid: 0, bidReady: false, willParticipate: null,
      skipNextTurn: false,
    }));

    const turnOrder = updatedPlayers.map(p => p.name);

    tx.update(ref, {
      started: true,
      version: "v2",
      players: updatedPlayers,
      meeplePosition: 0,
      lapCount: 0,
      turnOrder,
      currentTurnIndex: 0,
      phase: "mission_select",
      round: 0,
      rollResults: [],
      eventDeck: buildEventDeck(),
      eventDiscard: [],
      effects: {},
      revealedMission: null,
      specialAuctionDeck: shuffle([0,1,2,3]),
      currentFood: null,
      activeEvent: null,
      gameOver: false,
      roundLogs: [],
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 3: Update join link to point to v2/join.html**

- [ ] **Step 4: Verify room creation in browser**

1. `v2/room.html` 열기
2. 닉네임 입력, 방 생성
3. Firebase Console에서 room document 확인: `version: "v2"`, `phase: "mission_select"` 존재

- [ ] **Step 5: Commit**

```bash
git add board_game/v2/room.html
git commit -m "feat(v2): add room creation page with mission distribution"
```

---

## Task 3: Join Lobby Page

**Files:**
- Create: `v2/join.html`
- Reference: `join.html` (기존 v1)

- [ ] **Step 1: Create join.html**

기존 v1 `join.html`을 복사 후 수정:
- v2 타이틀
- 게임 시작 시 `v2/game.html`로 리다이렉트
- 최소 4명, 최대 8명 표시

- [ ] **Step 2: Verify join flow**

1. room.html에서 방 생성
2. 공유 링크로 join.html 접속
3. 닉네임 입력 후 참가
4. 게임 시작 → game.html 리다이렉트 확인

- [ ] **Step 3: Commit**

```bash
git add board_game/v2/join.html
git commit -m "feat(v2): add join lobby page"
```

---

## Task 4: Game Page — Board UI

**Files:**
- Create: `v2/game.html`

- [ ] **Step 1: Create game.html skeleton with Firebase + Tailwind**

기존 v1 `game.html`의 Firebase 초기화 패턴 사용. 레이아웃:
- 상단: 헤더 (방 정보, 라운드, 턴)
- 좌측: 보드 시각화 (CSS Grid 7×7)
- 우측: 내 정보 패널 (잔액, 보유 음식, 미션)
- 하단: 액션 패널 (윷 던지기, 경매, 이벤트 등 phase별 표시)

- [ ] **Step 2: Implement board rendering with CSS Grid**

```html
<div id="board" class="grid grid-cols-7 grid-rows-7 gap-0.5 w-full max-w-lg mx-auto aspect-square">
  <!-- JS로 24칸 + 빈 내부 영역 렌더링 -->
</div>
```

```js
function renderBoard(meeplePos) {
  // 7x7 그리드 매핑:
  // Row 0: [독도전망대] [⑪] [⑫] [⑬] [⑭] [⑮] [해양축제]
  // Row 1: [⑩] [빈] [빈] [빈] [빈] [빈] [⑯]
  // Row 2: [⑨] [빈] [빈] [빈] [빈] [빈] [⑰]
  // Row 3: [⑧] [빈] [중앙 정보] [빈] [빈] [⑱]
  // Row 4: [⑦] [빈] [빈] [빈] [빈] [빈] [⑲]
  // Row 5: [⑥] [빈] [빈] [빈] [빈] [빈] [⑳]
  // Row 6: [울릉시장] [⑤] [④] [③] [②] [①] [출발]

  const grid = Array(49).fill(null); // 7x7
  const posMap = [
    // [boardIndex, gridRow, gridCol]
    [0, 6, 6],   // 출발
    [1, 6, 5],   // ①
    [2, 6, 4],   // ②
    [3, 6, 3],   // ③ 이벤트
    [4, 6, 2],   // ④
    [5, 6, 1],   // ⑤
    [6, 6, 0],   // 울릉시장
    [7, 5, 0],   // ⑥
    [8, 4, 0],   // ⑦
    [9, 3, 0],   // ⑧ 이벤트
    [10, 2, 0],  // ⑨
    [11, 1, 0],  // ⑩
    [12, 0, 0],  // 독도전망대
    [13, 0, 1],  // ⑪
    [14, 0, 2],  // ⑫
    [15, 0, 3],  // ⑬ 이벤트
    [16, 0, 4],  // ⑭
    [17, 0, 5],  // ⑮
    [18, 0, 6],  // 해양축제
    [19, 1, 6],  // ⑯
    [20, 2, 6],  // ⑰
    [21, 3, 6],  // ⑱ 이벤트
    [22, 4, 6],  // ⑲
    [23, 5, 6],  // ⑳
  ];
  // 각 칸을 렌더링하고, meeplePos에 미플 아이콘 표시
}
```

- [ ] **Step 3: Style board tiles by type**

- 음식점 칸: 흰 배경, 구역별 테두리 색상 (도동=파랑, 남양=초록, 천부=주황, 저동=보라)
- 이벤트 칸: 노란 배경
- 특수 칸: 진한 색 배경 + 아이콘
- 미플 위치: 빨간 원형 마커

- [ ] **Step 4: Implement player info panel**

```html
<section id="playerPanel">
  <div>잔액: <span id="myBalance">500,000</span>원</div>
  <div>미션: <span id="myMission">비공개</span></div>
  <div>보유 음식:</div>
  <ul id="myFoods"></ul>
</section>
```

- [ ] **Step 5: Verify board renders correctly in browser**

1. game.html 열기 (파라미터로 room/name 전달)
2. 24칸 보드가 사각형으로 표시되는지 확인
3. 미플이 출발 칸에 표시되는지 확인

- [ ] **Step 6: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): add game page with board visualization"
```

---

## Task 5: Mission Selection Phase

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement mission selection UI**

게임 시작 직후 `phase: "mission_select"` 상태에서:
- 각 플레이어에게 배분된 2장의 미션 카드를 보여줌
- 1장을 선택하면 Firebase에 저장
- 모든 플레이어가 선택 완료하면 → `phase: "roll"`로 전환

```js
// 미션 선택 UI
if (phase === "mission_select" && !me.missionSelected) {
  const options = me.missionOptions.map(id => MISSIONS.find(m=>m.id===id));
  // 2장의 미션 카드 UI 표시, 선택 버튼
}

// 선택 확정
async function selectMission(missionId) {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const players = r.players.map(p => {
      if (p.name === myName) return { ...p, mission: missionId, missionSelected: true };
      return p;
    });
    const allSelected = players.every(p => p.missionSelected);
    tx.update(ref, {
      players,
      phase: allSelected ? "roll" : "mission_select",
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 2: Verify mission selection flow**

1. 4명 접속
2. 각 플레이어에게 2장의 미션 카드 표시 확인
3. 선택 후 비공개 저장 확인
4. 전원 선택 완료 → phase가 "roll"로 변경 확인

- [ ] **Step 3: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): implement mission selection phase"
```

---

## Task 6: Movement System (Roll Phase)

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement yut/dice roll functions**

```js
// 윷 결과 생성 (확률 기반)
function rollYut() {
  const sticks = Array(4).fill(0).map(() => Math.random() < 0.5 ? 1 : 0);
  const sum = sticks.reduce((a,b) => a+b, 0);
  // 빽도: 1개만 앞면인 경우의 약 25% (전체 ~6.25%)
  if (sum === 1 && Math.random() < 0.25) return { name: "빽도", steps: -1, extra: false };
  const results = { 0: {name:"모",steps:5,extra:true}, 1:{name:"도",steps:1,extra:false},
                    2:{name:"개",steps:2,extra:false}, 3:{name:"걸",steps:3,extra:false},
                    4:{name:"윷",steps:4,extra:true} };
  return results[sum];
}

// 주사위 대체
function rollDice() {
  const val = Math.floor(Math.random()*6)+1;
  if (val === 6) return { name: "6", steps: 6, extra: true };
  return { name: String(val), steps: val, extra: false };
}
```

- [ ] **Step 2: Implement roll accumulation coordinator**

> **핵심**: 윷/모(또는 주사위 6)가 나오면 추가 던지기. 모든 결과를 누적한 뒤 한 번에 이동.

```js
// 상태: rollResults 배열로 누적 표시
// Firebase에 저장하여 모든 플레이어가 실시간으로 볼 수 있게 함
async function handleRollPhase() {
  // 1) skipNextTurn인 경우 자동 건너뛰기 (위로금 없음)
  const throwerName = turnOrder[currentTurnIndex];
  const thrower = players.find(p => p.name === throwerName);
  if (thrower.skipNextTurn) {
    await runTransaction(db, async tx => {
      const s = await tx.get(ref);
      const r = s.data();
      const ps = r.players.map(p => {
        if (p.name === throwerName) return { ...p, skipNextTurn: false };
        return p;
      });
      // 다음 플레이어에게 턴 넘김, 경매 없이 바로 roll phase
      const nextIdx = (r.currentTurnIndex + 1) % r.turnOrder.length;
      tx.update(ref, {
        players: ps,
        currentTurnIndex: nextIdx,
        phase: "roll",
        updatedAt: serverTimestamp(),
      });
    });
    toast(`${throwerName}의 턴을 건너뜁니다 (여객선 지연)`);
    return;
  }

  // 2) 윷 던지기: UI에서 "윷 던지기" 버튼 클릭 → rollOnce()
}

// 한 번 던져서 Firebase에 기록, extra면 UI에서 다시 버튼 표시
async function rollOnce() {
  const result = rollYut(); // 또는 rollDice()
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const rolls = [...(r.rollResults || []), result];
    if (result.extra) {
      // 추가 던지기 필요 — phase 유지, UI에서 다시 버튼 표시
      tx.update(ref, {
        rollResults: rolls,
        updatedAt: serverTimestamp(),
      });
    } else {
      // 던지기 완료 — 합산하여 이동
      const totalSteps = rolls.reduce((sum, r) => sum + r.steps, 0);
      tx.update(ref, {
        rollResults: rolls,
        phase: "moving",  // 이동 처리 중 표시
        updatedAt: serverTimestamp(),
      });
    }
  });
}

// 모든 던지기 완료 후 이동 실행
async function executeMove() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const rolls = r.rollResults || [];
    const totalSteps = rolls.reduce((sum, r) => sum + r.steps, 0);

    // 이동 계산 (아래 Step 3)
    // ...
  });
}
```

> **Firebase 필드 추가**: `rollResults: []` (현재 턴의 윷 결과 배열, 턴 종료 시 초기화)

- [ ] **Step 3: Implement movement logic with start-tile distinction**

> **핵심**: 출발 칸을 "통과"하면 +10만원, "정확히 도착"하면 +10만원 + 이벤트 카드.
> 두 효과는 **배타적** — 도착은 통과에 포함되지 않음.

```js
async function executeMove() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const rolls = r.rollResults || [];
    const totalSteps = rolls.reduce((sum, r) => sum + r.steps, 0);
    const oldPos = r.meeplePosition;
    let newPos = oldPos + totalSteps;
    let laps = r.lapCount || 0;
    let passedStart = false;   // 통과 (도착 제외)
    let landedOnStart = false; // 정확히 도착

    // 빽도 처리
    if (totalSteps < 0) {
      newPos = oldPos + totalSteps;
      if (newPos < 0) newPos = 24 + newPos; // 출발에서 빽도 → ⑳
    }

    // 한 바퀴 완주 체크
    if (newPos >= 24) {
      laps++;
      newPos = newPos % 24;
      if (newPos === 0) {
        landedOnStart = true;  // 정확히 출발 칸 도착
      } else {
        passedStart = true;    // 출발 칸을 지나침
      }
    }

    // 출발 칸 보너스 적용 (통과 OR 도착 — 둘 다 +10만원, 중복 아님)
    let players = r.players.map(p => ({...p}));
    if (passedStart || landedOnStart) {
      players = players.map(p => ({...p, balance: p.balance + 100000}));
    }

    // 도착 칸에 따라 다음 phase 결정
    const tile = BOARD[newPos];
    let nextPhase;
    if (landedOnStart) {
      nextPhase = "special_start"; // 출발 도착: +10만원(위에서 처리) + 이벤트 카드
    } else if (tile.type === "restaurant") {
      nextPhase = "auction";
    } else if (tile.type === "event") {
      nextPhase = "event";
    } else if (tile.type === "special") {
      nextPhase = "special_" + tile.id;
    }

    tx.update(ref, {
      meeplePosition: newPos,
      lapCount: laps,
      players,
      phase: nextPhase,
      currentFood: tile.type === "restaurant"
        ? { name: FOODS[tile.foodIndex].name, tags: [...FOODS[tile.foodIndex].tags], restaurant: FOODS[tile.foodIndex].restaurant, tile: tile.id }
        : null,
      rollResults: [],  // 턴 종료 시 초기화
      lastRoll: { totalSteps, rolls, passedStart, landedOnStart },
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 4: Implement roll UI with accumulation display**

윷을 던지는 플레이어만 버튼 활성화. 결과를 누적 표시 (예: "모(5) + 윷(4) = 9칸"). 연속 던지기 시 "한 번 더!" 표시 후 다시 버튼 활성화.

```html
<div id="rollPanel" class="hidden">
  <div id="rollResults" class="text-lg font-bold mb-2"></div>
  <button id="btnRoll" class="btn bg-indigo-600 text-white rounded px-6 py-3 text-lg">
    윷 던지기
  </button>
  <div id="rollStatus" class="text-sm text-slate-500 mt-1"></div>
</div>
```

```js
// rollResults가 업데이트될 때마다 UI 갱신
function renderRollResults(rolls) {
  if (!rolls || rolls.length === 0) return "";
  const parts = rolls.map(r => `${r.name}(${r.steps > 0 ? "+" : ""}${r.steps})`);
  const total = rolls.reduce((s, r) => s + r.steps, 0);
  return parts.join(" + ") + ` = ${total}칸`;
}
```

- [ ] **Step 5: Verify movement in browser**

1. 윷 던지기 → 미플 이동 확인
2. 윷/모 → 추가 던지기 UI 표시 → 누적 합산 이동 확인
3. 출발 칸 통과 시 10만원 보너스 확인 (정확히 도착 시 중복 없음)
4. 출발 칸 정확 도착 시 10만원 + 이벤트 카드 확인
5. 빽도 → 뒤로 이동 확인 (출발에서 빽도 → ⑳)
6. skipNextTurn 플레이어 → 턴 자동 건너뛰기 확인

- [ ] **Step 6: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): implement yut/dice movement with roll accumulation"
```

---

## Task 7: Auction System

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement auction phase UI with hold mechanism**

음식점 칸 도착 시 (`phase: "auction"`):
1. 해당 음식 이름 + 태그 표시
2. 모든 플레이어에게 참여/불참 + 입찰 UI
3. v1의 hold 패턴 사용: 입찰 시 `balance -= bid`, `hold += bid`. 취소 시 복원.
4. skipNextTurn 플레이어는 자동 불참 (위로금 없음)

```js
// 음식 태그 렌더링
function renderTags(tags) {
  return tags.map(t =>
    `<span class="text-xs px-1.5 py-0.5 rounded ${TAG_COLORS[t]||''}">${t}</span>`
  ).join(' ');
}

// 입찰 확정 (v1 패턴: balance → hold 이동)
async function commitBid(amount) {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const ps = r.players.map(p => {
      if (p.name !== myName) return p;
      if (amount > p.balance) return p; // 잔액 초과 방지
      return { ...p, bid: amount, hold: amount, balance: p.balance - amount, bidReady: true, willParticipate: true };
    });
    tx.update(ref, { players: ps, updatedAt: serverTimestamp() });
  });
}

// 불참 선택
async function abstainBid() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const ps = r.players.map(p => {
      if (p.name !== myName) return p;
      return { ...p, bid: 0, hold: 0, bidReady: true, willParticipate: false };
    });
    tx.update(ref, { players: ps, updatedAt: serverTimestamp() });
  });
}
```

- [ ] **Step 2: Implement bid settlement with v2 rules**

> **핵심 수정사항**:
> - 반값: `Math.ceil(maxBid / 2 / 10000) * 10000` (올림, 1만원 단위)
> - 쿠폰: 낙찰자가 coupon 보유 시 `-10만원` 추가 할인
> - hold → balance 환불/차감 처리
> - skipNextTurn 플레이어: 자동 불참, 위로금 없음
> - 잔액 0원 이하 방지: `Math.max(0, balance - amount)`

```js
async function settleAuction() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const food = r.currentFood; // {name, tags, restaurant}
    let players = r.players.map(p => ({...p}));
    const effects = { ...(r.effects || {}) };
    const throwerName = r.turnOrder[r.currentTurnIndex];

    // skipNextTurn 플레이어 구분 (이번 턴에 건너뛴 게 아니라, 경매 자체에서 제외)
    const skippedNames = players.filter(p => p.skipNextTurn).map(p => p.name);

    const participants = players.filter(p =>
      p.willParticipate === true && !skippedNames.includes(p.name));
    const abstainers = players.filter(p =>
      p.willParticipate === false && !skippedNames.includes(p.name));

    // 불참자: 위로금 5만원 (skipNextTurn 제외 — 위로금 없음)
    abstainers.forEach(p => {
      const idx = players.findIndex(x => x.name === p.name);
      players[idx].balance += 50000;
    });

    if (participants.length > 0) {
      const maxBid = Math.max(...participants.map(p => p.bid));
      const winners = participants.filter(p => p.bid === maxBid);
      const losers = participants.filter(p => p.bid < maxBid);

      // 반값 이벤트 적용
      let actualPrice = maxBid;
      if (effects.halfPrice) {
        actualPrice = Math.ceil(maxBid / 2 / 10000) * 10000;
      }

      winners.forEach(w => {
        const idx = players.findIndex(x => x.name === w.name);
        // hold에서 이미 차감됨. 반값이면 차액 환불.
        let refund = w.hold - actualPrice;

        // 쿠폰 적용 (해당 플레이어가 coupon 대상일 때)
        if (effects.coupon === w.name) {
          const couponDiscount = Math.min(100000, actualPrice); // 최대 10만원
          refund += couponDiscount;
          delete effects.coupon; // 쿠폰 소진
        }

        players[idx].balance += Math.max(0, refund);
        players[idx].foods.push({
          name: food.name, tags: [...food.tags], restaurant: food.restaurant
        });
      });

      // 탈락자: hold 전액 환불
      losers.forEach(p => {
        const idx = players.findIndex(x => x.name === p.name);
        players[idx].balance += p.hold;
      });
    }

    // 라운드 초기화 → 다음 턴
    const nextTurnIndex = (r.currentTurnIndex + 1) % r.turnOrder.length;
    players = players.map(p => ({
      ...p, bid: 0, hold: 0, bidReady: false, willParticipate: null
    }));

    tx.update(ref, {
      players,
      currentFood: null,
      auctionActive: false,
      phase: "roll",
      currentTurnIndex: nextTurnIndex,
      round: (r.round || 0) + 1,
      effects: { ...effects, halfPrice: false },
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 3: Verify auction flow**

1. 음식점 칸 도착 → 경매 UI 표시 (음식 이름 + 태그 뱃지)
2. 불참(0원) → 위로금 5만원 확인
3. 입찰 → balance에서 hold로 이동 확인 → 최고가 낙찰 확인
4. 동점 → 모두 획득 확인, 각각 지불 확인
5. 탈락 → hold에서 balance로 전액 환불 확인
6. 반값 이벤트 활성 시: 낙찰가 15만원 → 실제 지불 8만원(올림) 확인
7. 쿠폰 보유자 낙찰 시: 추가 10만원 할인 확인
8. skipNextTurn 플레이어 → 경매 불참 + 위로금 없음 확인

- [ ] **Step 4: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): implement auction system with hold, half-price, coupon"
```

---

## Task 8: Event System

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement event card draw**

```js
async function resolveEvent() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    let deck = [...(r.eventDeck || [])];
    let discard = [...(r.eventDiscard || [])];

    // 덱 소진 시 셔플하여 재구성
    if (deck.length === 0) {
      deck = shuffle([...discard]);
      discard = [];
    }

    const cardId = deck.shift();
    discard.push(cardId);
    const event = EVENTS.find(e => e.id === cardId);

    tx.update(ref, {
      eventDeck: deck,
      eventDiscard: discard,
      activeEvent: { id: cardId, name: event.name, desc: event.desc, effect: event.effect },
      phase: "event_resolve",
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 2: Implement immediate event effects (typhoon, bounty, half_price, skip_turn, gift, tax, coupon)**

```js
async function applyEventEffect(event) {
  const throwerName = turnOrder[currentTurnIndex];

  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    let players = r.players.map(p => ({...p}));
    const effects = { ...(r.effects || {}) };
    let nextPhase = "roll";  // 기본: 이벤트 후 다음 턴
    let advanceTurn = true;

    switch(event.effect) {
      case "typhoon":
        // 모든 플레이어 -5만원 (잔액 부족 시 있는 만큼만)
        players = players.map(p => ({
          ...p, balance: Math.max(0, p.balance - 50000)
        }));
        break;

      case "bounty":
        // 모든 플레이어 +5만원
        players = players.map(p => ({...p, balance: p.balance + 50000}));
        break;

      case "half_price":
        effects.halfPrice = true;
        break;

      case "skip_turn":
        // 윷 던진 플레이어의 다음 윷 차례 건너뜀
        players = players.map(p => {
          if (p.name === throwerName) return {...p, skipNextTurn: true};
          return p;
        });
        break;

      case "gift":
        // 윷 던진 플레이어만 +10만원
        players = players.map(p => {
          if (p.name === throwerName) return {...p, balance: p.balance + 100000};
          return p;
        });
        break;

      case "tax": {
        // 최고 잔액 플레이어 -10만원 (동점 시 모두)
        const maxBal = Math.max(...players.map(p => p.balance));
        players = players.map(p => {
          if (p.balance === maxBal) return {...p, balance: Math.max(0, p.balance - 100000)};
          return p;
        });
        break;
      }

      case "extra_roll":
        // 즉시 추가 이동 — 현재 턴 플레이어가 다시 roll (턴 유지)
        nextPhase = "roll";
        advanceTurn = false; // 턴을 넘기지 않음!
        break;

      case "coupon":
        effects.coupon = throwerName;
        break;

      case "steal":
        // 인터랙티브 — 별도 phase에서 처리 (Step 3)
        nextPhase = "event_steal";
        advanceTurn = false;
        break;

      case "add_tag":
        // 인터랙티브 — 별도 phase에서 처리 (Step 3)
        nextPhase = "event_add_tag";
        advanceTurn = false;
        break;
    }

    const nextTurnIndex = advanceTurn
      ? (r.currentTurnIndex + 1) % r.turnOrder.length
      : r.currentTurnIndex;

    tx.update(ref, {
      players,
      effects,
      activeEvent: null,
      phase: nextPhase,
      currentTurnIndex: nextTurnIndex,
      round: advanceTurn ? (r.round || 0) + 1 : r.round,
      updatedAt: serverTimestamp(),
    });
  });
}
```

> **extra_roll 핵심**: `advanceTurn = false`로 현재 플레이어가 다시 윷을 던짐. 새 roll → 새 이동 → 도착 칸 효과 발동 (완전한 새 이동 사이클). 연쇄 extra_roll도 자연스럽게 처리됨.

- [ ] **Step 3: Implement interactive events (steal, add_tag)**

#### 음식 도둑 (event_steal)

```html
<div id="stealPanel" class="hidden bg-white rounded-xl shadow p-4">
  <h3 class="font-semibold">🍽 음식 도둑!</h3>
  <p class="text-sm mb-2">다른 플레이어의 음식 1개를 가져오세요.</p>
  <div id="stealTargets" class="space-y-2"></div>
  <button id="btnStealConfirm" class="btn bg-rose-600 text-white rounded px-4 py-2 mt-2" disabled>가져오기</button>
</div>
```

```js
// phase === "event_steal" && isMyTurn(thrower)일 때 표시
// 다른 플레이어 목록 + 각자의 음식 목록 → 대상 + 음식 선택
let stealTarget = null;
let stealFoodIndex = null;

function renderStealTargets(players, myName) {
  const others = players.filter(p => p.name !== myName && p.foods.length > 0);
  if (others.length === 0) {
    // 가져올 음식 없음 → 자동 스킵
    advanceTurnAfterSpecial();
    toast("가져올 음식이 없습니다.");
    return;
  }
  // 플레이어 선택 → 해당 플레이어의 음식 목록 표시 → 음식 1개 선택
}

// add_tag도 동일: 음식이 없으면 스킵
function renderAddTagFoods(foods) {
  if (!foods || foods.length === 0) {
    advanceTurnAfterSpecial();
    toast("태그를 추가할 음식이 없습니다.");
    return;
  }
  // 음식 선택 → 가능한 태그 목록 표시
}

async function applySteal(targetName, foodIndex) {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    let players = r.players.map(p => ({...p, foods: [...p.foods]}));
    const throwerName = r.turnOrder[r.currentTurnIndex];

    const targetIdx = players.findIndex(p => p.name === targetName);
    const throwerIdx = players.findIndex(p => p.name === throwerName);
    const stolenFood = players[targetIdx].foods.splice(foodIndex, 1)[0];
    players[throwerIdx].foods.push(stolenFood);

    const nextTurnIndex = (r.currentTurnIndex + 1) % r.turnOrder.length;
    tx.update(ref, {
      players,
      phase: "roll",
      currentTurnIndex: nextTurnIndex,
      round: (r.round || 0) + 1,
      updatedAt: serverTimestamp(),
    });
  });
}
```

#### 울릉도의 축복 (event_add_tag)

```html
<div id="addTagPanel" class="hidden bg-white rounded-xl shadow p-4">
  <h3 class="font-semibold">✨ 울릉도의 축복!</h3>
  <p class="text-sm mb-2">보유 음식 1개에 태그를 추가하세요.</p>
  <div id="addTagFoods" class="space-y-2"></div>
  <select id="tagSelect" class="border rounded px-2 py-1 mt-2"></select>
  <button id="btnAddTagConfirm" class="btn bg-emerald-600 text-white rounded px-4 py-2 mt-2" disabled>추가</button>
</div>
```

```js
// 음식 선택 → 현재 없는 태그 중 1개 선택
const ALL_TAGS = ["한식","일식","중식","카페","면요리","밥류","탕류","구이","해산물","디저트","울릉특산","도동","남양","천부","저동"];

function getAvailableTags(food) {
  return ALL_TAGS.filter(t => !food.tags.includes(t));
}

async function applyAddTag(foodIndex, newTag) {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    let players = r.players.map(p => ({...p, foods: p.foods.map(f => ({...f, tags: [...f.tags]}))}));
    const throwerName = r.turnOrder[r.currentTurnIndex];
    const throwerIdx = players.findIndex(p => p.name === throwerName);

    if (players[throwerIdx].foods[foodIndex]) {
      players[throwerIdx].foods[foodIndex].tags.push(newTag);
    }

    const nextTurnIndex = (r.currentTurnIndex + 1) % r.turnOrder.length;
    tx.update(ref, {
      players,
      phase: "roll",
      currentTurnIndex: nextTurnIndex,
      round: (r.round || 0) + 1,
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 4: Verify all 10 event types**

1. 태풍 경보: 모든 플레이어 -5만원, 잔액 부족 시 0원까지만 차감 확인
2. 풍어 축제: 모든 플레이어 +5만원 확인
3. 오징어 대풍년: 다음 경매에서 반값 적용 확인 (15만원 → 8만원)
4. 여객선 지연: 윷 던진 플레이어 skipNextTurn 설정 확인
5. 관광객 선물: 윷 던진 플레이어만 +10만원 확인
6. 세금 징수: 최고 잔액자 -10만원 (동점 시 모두) 확인
7. 음식 도둑: 대상 선택 → 음식 선택 → 가져오기 확인
8. 행운의 윷: 즉시 추가 roll → 새 이동 사이클 확인
9. 할인 쿠폰: 다음 경매 낙찰 시 10만원 할인 확인
10. 울릉도의 축복: 음식 선택 → 태그 추가 확인

- [ ] **Step 5: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): implement event card system with all 10 effects"
```

---

## Task 9: Special Tiles

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement 출발 칸 (landing only — pass-through는 Task 6에서 처리)**

> **핵심**: 출발 칸 통과 시 +10만원은 Task 6의 `executeMove()`에서 이미 처리됨.
> 여기서는 **정확히 도착한 경우**만 처리: +10만원(이미 적용됨) + 이벤트 카드 드로우.
> 이벤트 카드 드로우만 추가하면 됨.

```js
// phase === "special_start" 일 때
async function handleStartLanding() {
  // 10만원은 executeMove()에서 이미 지급됨.
  // 이벤트 카드만 드로우.
  await resolveEvent(); // Task 8의 이벤트 드로우 재사용 → phase: "event_resolve"
  toast("출발 칸 도착! 10만원 수령 + 이벤트 카드!");
}
```

- [ ] **Step 2: Implement 울릉시장 (1분 자유 거래)**

```js
// phase: "special_market"
// 1분 카운트다운 타이머 UI 표시
let marketTimer = null;

function startMarketTimer() {
  const endTime = Date.now() + 60000;
  const timerEl = $("#marketTimer");
  marketTimer = setInterval(() => {
    const remaining = Math.max(0, endTime - Date.now());
    const sec = Math.ceil(remaining / 1000);
    timerEl.textContent = `${sec}초`;
    if (remaining <= 0) {
      clearInterval(marketTimer);
      timerEl.textContent = "종료!";
      // 다음 턴으로 (방장만 실행)
      if (isHost) advanceTurnAfterSpecial();
    }
  }, 200);
}

async function advanceTurnAfterSpecial() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const nextTurnIndex = (r.currentTurnIndex + 1) % r.turnOrder.length;
    tx.update(ref, {
      phase: "roll",
      currentTurnIndex: nextTurnIndex,
      round: (r.round || 0) + 1,
      updatedAt: serverTimestamp(),
    });
  });
}
```

```html
<div id="marketPanel" class="hidden bg-white rounded-xl shadow p-4 text-center">
  <h3 class="font-semibold text-lg">🏪 울릉시장 — 자유 거래!</h3>
  <p class="text-sm mb-2">1분 동안 플레이어 간 음식을 사고 팔 수 있습니다.</p>
  <div id="marketTimer" class="text-4xl font-bold text-indigo-600 my-4">60초</div>
  <p class="text-xs text-slate-500">거래는 오프라인으로 진행합니다. 합의된 거래만 성사.</p>
</div>
```

- [ ] **Step 3: Implement 독도전망대 (미션 정찰 — 프라이버시 보장)**

> **핵심**: 웹앱에서는 다른 플레이어의 미션을 "몰래 보여주기"가 불가능.
> Firebase의 `revealedMission` 필드에 결과를 저장하고, 해당 관찰자에게만 UI로 표시.

```js
// phase: "special_observatory" — 윷 던진 플레이어만 인터랙션
// 1) 대상 플레이어 선택 UI

async function observeMission(targetName) {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const throwerName = r.turnOrder[r.currentTurnIndex];
    const target = r.players.find(p => p.name === targetName);
    if (!target || !target.mission) return;

    tx.update(ref, {
      revealedMission: {
        from: throwerName,
        target: targetName,
        missionId: target.mission,
      },
      phase: "special_observatory_reveal",
      updatedAt: serverTimestamp(),
    });
  });
}

// 2) 결과 표시: revealedMission.from === myName 일 때만 미션 내용 표시
//    다른 플레이어에게는 "○○님이 △△님의 미션을 확인 중..." 표시

// 3) 확인 완료 → 다음 턴
async function confirmObservation() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    const nextTurnIndex = (r.currentTurnIndex + 1) % r.turnOrder.length;
    tx.update(ref, {
      revealedMission: null,
      phase: "roll",
      currentTurnIndex: nextTurnIndex,
      round: (r.round || 0) + 1,
      updatedAt: serverTimestamp(),
    });
  });
}
```

```html
<div id="observatoryPanel" class="hidden bg-white rounded-xl shadow p-4">
  <h3 class="font-semibold">🔭 독도전망대 — 미션 정찰</h3>
  <!-- 윷 던진 플레이어: 대상 선택 UI -->
  <div id="observeTargets" class="space-y-2"></div>
  <!-- 결과: 관찰자에게만 표시 -->
  <div id="observeResult" class="hidden mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
    <p id="observeResultText"></p>
    <button id="btnObserveConfirm" class="btn bg-indigo-600 text-white rounded px-4 py-2 mt-2">확인 완료</button>
  </div>
</div>
```

- [ ] **Step 4: Implement 해양축제 (특별 경매)**

```js
// phase: "special_festival"
async function handleFestivalAuction() {
  await runTransaction(db, async tx => {
    const s = await tx.get(ref);
    const r = s.data();
    let deck = [...(r.specialAuctionDeck || [])];

    // 덱 소진 시 셔플 재구성
    if (deck.length === 0) {
      deck = shuffle([0, 1, 2, 3]);
    }

    const cardIndex = deck.shift();
    const food = SPECIAL_AUCTION[cardIndex];

    tx.update(ref, {
      specialAuctionDeck: deck,
      currentFood: {
        name: food.name,
        tags: [...food.tags],
        restaurant: "해양축제 특별",
        tile: "festival",
      },
      phase: "auction", // 일반 경매와 동일한 프로세스로 진행
      updatedAt: serverTimestamp(),
    });
  });
}
```

- [ ] **Step 5: Verify all 4 special tiles**

1. 출발 정확 도착: +10만원(중복 없음) + 이벤트 카드 드로우 확인
2. 출발 통과: +10만원만 확인 (이벤트 카드 없음)
3. 울릉시장: 1분 타이머 표시 + 종료 후 다음 턴 확인
4. 독도전망대: 관찰자에게만 미션 표시 + 다른 플레이어에게 미표시 확인
5. 해양축제: 특별 경매 카드 드로우 + 경매 진행 확인

- [ ] **Step 6: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): implement all special tile effects"
```

---

## Task 10: Win Condition & Game Over

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement mission achievement check**

```js
function checkMissionComplete(player) {
  const mission = MISSIONS.find(m => m.id === player.mission);
  if (!mission) return false;
  return mission.check(player.foods, player.balance);
}

// 매 경매/이벤트 정산 후 호출
function checkAllMissions(players) {
  return players.filter(p => checkMissionComplete(p));
}
```

- [ ] **Step 2: Implement mission declaration UI**

```js
// 경매/이벤트 정산 후 미션 달성 가능한 플레이어에게 "미션 달성!" 버튼 표시
// 클릭 → 미션 카드 공개 + 검증
// 유효 → 게임 종료
// 허위 → 벌금 10만원
```

- [ ] **Step 3: Implement tie-breaking and 3-lap timeout with proximity scoring**

```js
// 동시 달성: 잔액 > 음식 수 > 선 순서
function breakTie(winners, turnOrder) {
  return winners.sort((a, b) => {
    if (b.balance !== a.balance) return b.balance - a.balance;
    if (b.foods.length !== a.foods.length) return b.foods.length - a.foods.length;
    return turnOrder.indexOf(a.name) - turnOrder.indexOf(b.name);
  })[0];
}

// 3바퀴 교착: lapCount >= 3이면 강제 종료
// 미션 근접도 계산: 미션 check 함수를 변형하여 "달성된 조건 수 / 전체 조건 수" 반환
function getMissionProximity(player) {
  const mission = MISSIONS.find(m => m.id === player.mission);
  if (!mission) return { score: 0, total: 1, ratio: 0 };

  // 각 미션별 세부 조건 달성도 계산
  // 범용: check 함수를 partial 모드로 호출하는 대신,
  // 각 미션 조건을 독립적으로 체크하여 점수화
  return mission.proximity
    ? mission.proximity(player.foods, player.balance)
    : { score: mission.check(player.foods, player.balance) ? 1 : 0, total: 1, ratio: mission.check(player.foods, player.balance) ? 1 : 0 };
}

// data.js의 각 MISSION에 proximity 함수 추가 필요 (Task 1 수정)
// 예: 미션 1 "울릉도 미식가" (한식 1 + 일식 1 + 중식 1)
//   proximity: (foods) => {
//     const g = new Set(foods.flatMap(f=>f.tags.filter(t=>["한식","일식","중식"].includes(t))));
//     return { score: g.size, total: 3, ratio: g.size / 3 };
//   }

if (lapCount >= 3) {
  // 모든 플레이어의 미션 근접도 계산
  const scores = players.map(p => ({
    name: p.name,
    proximity: getMissionProximity(p),
    balance: p.balance,
  }));
  // 근접도(ratio) > 잔액 순으로 정렬
  scores.sort((a, b) => {
    if (b.proximity.ratio !== a.proximity.ratio) return b.proximity.ratio - a.proximity.ratio;
    return b.balance - a.balance;
  });
  const winner = scores[0].name;
  // gameOver 처리
}
```

> **구현 참고**: 각 MISSION 객체에 `proximity(foods, balance)` 함수를 추가하여 달성 근접도를 계산한다. `check()`가 boolean을 반환하는 반면, `proximity()`는 `{score, total, ratio}`를 반환한다. Task 1의 data.js에 이 함수를 추가해야 함.

- [ ] **Step 4: Implement game over UI**

게임 종료 시:
- 승자 이름 + 미션 카드 공개
- 전체 플레이어 최종 상태 (음식, 잔액) 표시
- 게임 로그
- "다시하기" 버튼

- [ ] **Step 5: Verify win conditions**

1. 미션 달성 → 즉시 승리 확인
2. 동시 달성 → 잔액 비교 확인
3. 3바퀴 타임아웃 → 강제 종료 확인
4. 허위 선언 → 벌금 확인

- [ ] **Step 6: Commit**

```bash
git add board_game/v2/game.html
git commit -m "feat(v2): implement win conditions and game over"
```

---

## Task 11: Game Log & Polish

**Files:**
- Modify: `v2/game.html`

- [ ] **Step 1: Implement round log**

각 턴/경매/이벤트의 결과를 `roundLogs`에 기록:
```js
const logEntry = {
  round, turn: turnOrder[currentTurnIndex],
  roll: { name, steps },
  tile: BOARD[meeplePosition].name,
  action: "auction" | "event" | "special",
  result: { winners, item, amount } | { event: eventName },
};
```

- [ ] **Step 2: Add toast notifications**

기존 v1의 toast 시스템 재사용. 경매 결과, 이벤트, 출발 통과 보너스 등 주요 이벤트에 토스트 표시.

- [ ] **Step 3: Add mission progress indicator**

내 미션 카드의 달성 현황을 시각적으로 표시:
- 달성된 조건: 초록 체크
- 미달성 조건: 회색
- 전체 진행률 바

- [ ] **Step 4: Responsive design for mobile**

- 보드는 화면 너비에 맞춰 축소
- 경매/이벤트 UI는 하단 고정 바
- 미션 정보는 접기/펼치기

- [ ] **Step 5: Final integration test**

4명 이상으로 풀 게임 플레이:
1. 방 생성 → 참가 → 미션 선택
2. 윷 던지기 → 이동 → 경매/이벤트
3. 특수 칸 효과
4. 미션 달성 → 승리

- [ ] **Step 6: Commit**

```bash
git add board_game/v2/
git commit -m "feat(v2): add game log, toast, mission progress, and polish"
```

---

## Summary

| Task | 설명 | 예상 파일 |
|------|------|----------|
| 1 | Game Data Module | `v2/data.js` |
| 2 | Room Creation | `v2/room.html` |
| 3 | Join Lobby | `v2/join.html` |
| 4 | Board UI | `v2/game.html` (생성) |
| 5 | Mission Selection | `v2/game.html` (수정) |
| 6 | Movement System | `v2/game.html` (수정) |
| 7 | Auction System | `v2/game.html` (���정) |
| 8 | Event System | `v2/game.html` (수정) |
| 9 | Special Tiles | `v2/game.html` (수정) |
| 10 | Win Condition | `v2/game.html` (수정) |
| 11 | Polish & Integration | `v2/game.html` (수정) |
