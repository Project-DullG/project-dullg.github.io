(function () {
  const script = document.currentScript;
  const requestedOutcome = script?.dataset?.outcome || "";

  const aliases = {
    daniel: "daniel-accused",
    "daniel-deny": "daniel-accused",
    "ash-cleared": "ash-accused",
    "ash-ryu-cleared": "ash-accused",
    "ash-candy-cleared": "ash-accused",
    "ryu-silent": "ryu-accused",
    "ryu-confess": "ryu-accused",
    "ryu-protect": "ryu-accused",
    "candy-hide": "candy-accused",
    "candy-confess": "candy-accused",
    "candy-resign": "candy-accused"
  };
  const outcome = aliases[requestedOutcome] || requestedOutcome;

  const danielEscaped = {
    label: "12년 뒤 · 왕실 주방",
    name: "다니엘",
    tone: "future",
    blocks: [
      "다니엘은 왕실 요리장 살해 혐의를 벗은 채 자신의 식당으로 돌아갔다. 1차 복어국이 폐기된 이상, 그를 재판에 세울 증거는 남지 않았다. 귀족과 왕족의 예약도 다시 이어졌다.",
      "4년 뒤 열린 승강전에서 다니엘은 다시 붉은 석류 와인 소스를 곁들인 스테이크를 냈다. 그날의 소스에는 와인과 석류만 들어갔다. 국왕과 새 심사위원들은 고기와 소스를 함께 맛보았고, 다니엘은 1위로 왕실 요리사가 됐다.",
      "왕실에 들어간 다니엘은 모든 심사 음식의 고기와 소스, 곁들임을 직접 맛본 뒤 평가를 적었다. 고기만 먹고 소스를 남기거나, 한 가지 곁들임만 맛보고 점수를 매기는 일도 허락하지 않았다.",
      "그로부터 8년 뒤, 다니엘은 평생 바라던 왕실 요리장으로 임명됐다. 첫 승강전에서 한 도전자가 떨리는 손으로 접시를 내밀자 그는 소스까지 한입 먹고 다음 접시를 요구했다.",
      { speaker: "다니엘", text: "“평가는 먹어 본 뒤에 내린다. 다음 접시를 가져오게.”" }
    ]
  };

  const ashAfterCorrectAccusation = {
    label: "4년 뒤 · 왕실 주방",
    name: "애쉬",
    tone: "future",
    blocks: [
      "애쉬는 다니엘의 수사에 협조한 공로를 인정받았고, 무효가 된 승강전 뒤에도 왕실 요리사 자격을 유지했다. 그녀는 대회 날을 마지막으로 조살과 과육을 요리에 넣지 않았다.",
      "왕실 주방으로 돌아온 애쉬는 동방 요리와 이방 식재료를 맡았다. 조살과를 제외한 향신료만 사용했고, 네 해 동안 자신의 조리법으로 자격을 지켰다.",
      "4년 뒤, 애쉬 밑에서 일하던 견습 요리사가 국물을 태웠다. 견습은 해고될 것이라 생각하고 그날 밤 짐을 쌌다. 애쉬는 가방을 닫고 있던 견습을 다시 조리대로 데려갔다.",
      { speaker: "애쉬", text: "“짐 풀어. 접시 하나 망쳤다고 널 내보내지는 않아. 국물부터 다시 끓여.”" },
      "견습은 왕실 주방에 남았다. 애쉬는 처음으로 자신의 이름을 걸고 제자를 가르쳤다."
    ]
  };

  const ashUnaccused = {
    label: "4년 뒤 · 왕실 주방",
    name: "애쉬",
    tone: "future",
    blocks: [
      "애쉬는 살인 혐의를 받지 않았고, 무효가 된 승강전 뒤에도 왕실 요리사 자격을 유지했다. 떡볶이에 조살과 과육을 넣은 일도 밝혀지지 않았다.",
      "애쉬는 그날 이후 조살과를 다시 사용하지 않았다. 동방 요리와 이방 식재료를 맡으며, 약물 없이도 평가를 받을 수 있는 조리법을 네 해 동안 다듬었다.",
      "4년 뒤, 애쉬 밑에서 일하던 견습 요리사가 국물을 태우고 짐을 쌌다. 애쉬는 견습을 다시 조리대로 데려가 새 냄비를 꺼냈다.",
      { speaker: "애쉬", text: "“실패한 접시는 버리면 돼. 사람까지 내보낼 필요는 없어. 다시 시작하자.”" },
      "견습은 왕실 주방에 남았다. 애쉬는 자신을 버렸던 두 스승과 달리, 제자의 첫 실패를 파문의 이유로 삼지 않았다."
    ]
  };

  const ashAfterRyuAccused = {
    label: "4년 뒤 · 왕실 주방",
    name: "애쉬",
    tone: "future",
    blocks: [
      "류진환이 까마귀 요원으로 체포되자 애쉬도 여러 차례 조사를 받았다. 류진환의 진술과 압수된 자료 어디에도 애쉬가 임무에 가담했다는 내용은 없었다.",
      "재판 전에 허락된 한 차례의 대면에서 애쉬는 6년 전 자신을 쫓아낸 이유를 물었다. 류진환은 경비병 앞에서도 같은 답을 했다.",
      { speaker: "류진환", text: "“너까지 까마귀에 묶일까 봐 보냈다. 내가 가르친 요리만 가지고 왕실로 돌아가라.”" },
      "애쉬는 류진환의 죄를 대신 용서하지도, 그의 형을 막으려 하지도 않았다. 다만 자신이 버림받은 이유는 처음으로 정확히 알게 됐다. 그녀는 왕실 주방으로 돌아가 조살과를 제외한 동방 식재료를 맡았다.",
      "4년 뒤 애쉬는 첫 견습 요리사를 받았다. 견습이 평가에서 떨어지고 짐을 싸자, 애쉬는 새 재료를 내주며 다음 평가까지 남으라고 했다."
    ]
  };

  const ryuAfterCorrectAccusation = {
    label: "4년 뒤 · 동방의 제조소",
    name: "류진환",
    tone: "future",
    blocks: [
      "류진환은 다니엘을 지목한 토론에 참여한 공로로 다음 승강전 본선 참가 자격을 받았다. 그러나 왕실 요리장이 죽으면서 까마귀의 왕궁 잠입 계획도 중단됐다.",
      "류진환은 본선 참가 자격을 사용하지 않았다. 애쉬가 왕실 주방으로 돌아갔다는 사실을 확인한 뒤 식당을 정리하고 서방 왕국을 떠났다.",
      "까마귀는 그를 동방의 다른 제조소로 옮겼다. 새 왕궁 잠입 요원을 고르는 회의에서 애쉬의 이름이 나오자, 류진환은 왕실이 이미 그녀를 감시하고 있다고 거짓 보고했다.",
      { speaker: "류진환", text: "“왕실이 이미 경계하고 있다. 애쉬는 후보에서 제외해.”" },
      "4년 뒤에도 류진환은 새 신분으로 흑진주를 만들고 있었다. 그는 까마귀를 떠나지 못했지만, 애쉬를 조직의 임무에 끌어들이라는 지시는 한 번도 통과시키지 않았다."
    ]
  };

  const ryuUnaccused = {
    label: "4년 뒤 · 동방의 제조소",
    name: "류진환",
    tone: "future",
    blocks: [
      "류진환은 살인 혐의로 조사받지 않은 채 왕궁을 나왔다. 접선 상대였던 왕실 요리장이 죽었고 수도시설 잠입 계획도 이어갈 수 없게 되자, 그는 식당을 정리하고 서방 왕국을 떠났다.",
      "까마귀는 류진환에게 새 신분을 주고 다른 제조소를 맡겼다. 그는 왕실 요리사 선발전에 다시 참가하지 않았고 애쉬에게도 연락하지 않았다.",
      "조직이 왕실 주방에 접근할 새 후보를 검토할 때마다 류진환은 애쉬가 감시 대상이라 포섭할 수 없다고 거짓 보고했다.",
      { speaker: "류진환", text: "“그 요리사는 건드리지 마라. 다른 사람을 찾아.”" },
      "4년 뒤에도 류진환은 까마귀의 흑진주 제조를 책임지고 있었다. 애쉬가 그의 선택을 알게 되는 일은 없었다."
    ]
  };

  const ashAccused = {
    label: "4년 뒤 · 민간 식당",
    name: "애쉬",
    tone: "lost",
    blocks: [
      "왕실 법정은 왕실 요리장이 애쉬의 떡볶이를 먹지 않았다는 식기 기록을 인정했다. 떡볶이와 죽음을 연결할 수 없었으므로 살인 혐의는 증거 불충분으로 기각됐다.",
      "그러나 심사 음식에 조살과 과육을 넣어 국왕과 기미상궁에게 먹인 사실은 남았다. 애쉬는 그 죄로 4년형을 선고받았고, 구금 기간을 형기에 포함해 판결 직후 석방됐다. 왕실 요리사 자격은 박탈됐다.",
      "조살과를 사용했다는 사실이 수도에 알려지면서 왕실과 거래하는 식당은 애쉬를 고용하지 않았다. 그녀는 수도 외곽의 민간 식당에서 채소를 다듬고 국물을 끓이는 일부터 다시 시작했다. 첫해에는 차림표에 자신의 이름을 올리지도 못했다.",
      "어느 날 밤, 함께 일하던 견습이 국물을 태우고 해고될 것이라 생각해 짐을 쌌다. 애쉬는 새 냄비를 꺼내 조리대 위에 올렸다.",
      { speaker: "애쉬", text: "“짐 풀어. 오늘 국물은 네가 다시 끓여. 나는 옆에서 볼게.”" },
      "견습은 식당에 남았다. 애쉬는 왕실의 직함을 되찾지 못했지만 그곳에서 계속 요리했고, 조살과는 다시 사용하지 않았다."
    ]
  };

  const ryuAccused = {
    label: "4년 뒤 · 왕실 법정",
    name: "류진환",
    tone: "lost",
    blocks: [
      "왕실 법정은 사용되지 않은 단약과 손대지 않은 쌀국수를 근거로 왕실 요리장 살인 혐의에 증거 불충분 판결을 내렸다.",
      "그러나 류진환이 까마귀 요원으로 왕궁에 잠입한 사실과 수도시설에 넣을 고농축 흑진주를 왕실 요리장에게 전달한 사실은 확인됐다. 간첩 행위와 수도시설 중독 준비가 유죄로 인정돼 사형이 선고됐다.",
      "류진환은 심문을 받을 때마다 애쉬가 까마귀와 흑진주를 모른다고 진술했다.",
      { speaker: "류진환", text: "“그 아이는 내 임무를 몰랐습니다. 살리려고 쫓아냈고, 오늘도 아무것도 알리지 않았습니다.”" },
      "애쉬가 까마귀의 임무에 가담했다는 증거는 나오지 않았다. 압수된 흑진주는 폐기됐고, 류진환에게 내려진 형은 그대로 집행됐다."
    ]
  };

  const candyAccused = {
    label: "4년 뒤 · 수도의 제과점",
    name: "캔디",
    tone: "lost",
    blocks: [
      "4년 동안 이어진 재조사에서도 케이크와 왕실 요리장의 죽음을 연결할 증거는 나오지 않았다. 왕실 법정은 캔디에게 살인죄를 적용할 수 없다고 판결했다.",
      "그러나 심사위원의 딸이라는 사실을 숨기고 심사에 개입한 일은 취소되지 않았다. 캔디의 왕실 요리사 자격은 박탈됐고, 왕실과 귀족가의 주문도 끊겼다.",
      "캔디는 집안의 재산으로 수도에 작은 제과점을 열었다. 처음에는 살인 용의자였다는 소문을 듣고 구경하러 온 사람이 대부분이었다. 캔디는 매일 케이크와 과자를 직접 만들었고, 몇 달 뒤부터 같은 빵을 사러 오는 손님이 생겼다.",
      "아버지의 생일이 돌아온 날, 캔디는 대회에서 만들었던 녹색 케이크를 다시 구웠다. 마지막 조각까지 팔고 남은 빈 진열대에 작은 케이크 하나를 놓고 촛불을 켰다.",
      { speaker: "캔디", text: "“아빠, 왕실에는 못 돌아갔어. 그래도 오늘 케이크는 전부 팔렸어.”" }
    ]
  };

  const candyAfterCorrectAccusation = {
    label: "12년 뒤 · 왕실 주방",
    name: "캔디",
    tone: "future",
    blocks: [
      "다니엘의 재판에서 2차 스테이크의 붉은 소스에 해독제가 들어 있었다는 사실이 밝혀졌다. 캔디는 다니엘을 탈락시키려고 아버지에게 붉은 요리를 먹지 말라고 부탁했다. 그 부탁을 따른 아버지가 해독제가 든 소스를 먹지 않았다는 사실도 함께 알게 됐다.",
      "왕실 법정은 살인의 책임이 복어국에 독을 넣은 다니엘에게 있다고 판결했다. 캔디는 자신이 심사를 조작하려 한 행동이 아버지의 해독제 섭취를 막았다는 사실도 알게 됐다.",
      "왕실 주방으로 돌아온 첫날, 캔디는 애쉬에게 지난 4년 동안 재료를 버리고 소금을 쏟았던 일과 대회 준비물을 바꿔 놓은 일을 모두 인정했다.",
      { speaker: "캔디", text: "“네 요리를 망친 건 나야. 미안해. 다시는 네 재료에 손대지 않을게.”" },
      { speaker: "애쉬", text: "“용서했다는 말은 못 해. 약속은 지켜.”" },
      "두 사람은 친구가 되지 않았다. 업무 지시가 필요할 때만 대화했고, 서로의 재료에는 손대지 않았다.",
      "4년 뒤 열린 평가에서 캔디는 아버지의 도움 없이 제과 부문 최고점을 받았다. 이후 왕실의 연회와 생일상을 맡으며 경력을 쌓았고, 사건으로부터 12년 뒤 왕실 요리장으로 임명됐다.",
      "임명장을 받은 날은 아버지의 생일이었다. 캔디는 대회 날 만들었던 녹색 케이크를 다시 굽고 촛불 하나를 켰다.",
      { speaker: "캔디", text: "“아빠, 생일 축하해. 나, 오늘부터 요리장이야. 이번에는 내 점수로 됐어.”" }
    ]
  };

  const candyAfterUnresolvedCase = {
    label: "4년 뒤 · 왕실 제과실",
    name: "캔디",
    tone: "future",
    blocks: [
      "캔디는 살인 혐의를 받지 않았고, 무효가 된 승강전 뒤에도 왕실 요리사 자격을 유지했다. 다니엘의 붉은 소스는 사망 원인과 연결되지 않았고, 캔디도 아버지에게 붉은 요리를 피하라고 부탁한 일이 죽음에 영향을 주었다고 생각하지 않았다.",
      "아버지가 없는 왕실 주방에서 캔디는 처음으로 누구의 도움도 기대할 수 없었다. 그녀는 다른 요리사의 재료에 손대지 않았고, 다음 평가에 낼 케이크와 과자를 매일 다시 만들었다.",
      "4년 뒤 열린 승강전에서 캔디는 심사위원에게 어떤 부탁도 하지 않았다. 제과 부문 최고점을 받아 왕실 요리사 자격을 지켰고, 그해부터 왕실 제과 작업을 책임졌다.",
      "애쉬와의 사이는 여전히 나빴다. 두 사람은 자주 다퉜지만 캔디가 애쉬의 재료를 버리는 일은 다시 없었다. 서로 다른 요리를 내고 결과로 승부했다.",
      "아버지의 생일이 돌아올 때마다 캔디는 녹색 케이크를 구웠다. 네 번째 케이크에 촛불을 켠 날, 처음으로 아버지 없이 통과한 평가 결과를 옆에 놓았다.",
      { speaker: "캔디", text: "“아빠, 이번에는 내 점수로 남았어. 보고 있지?”" }
    ]
  };

  const danielAfterTie = {
    label: "4년 뒤 · 수도의 식당",
    name: "다니엘",
    tone: "lost",
    blocks: [
      "다니엘은 4년 동안 살인 용의자로 구금됐다. 1차 복어국이 폐기된 탓에 살인죄로 기소되지는 않았고, 재조사가 끝난 뒤 석방됐다.",
      "그러나 왕실은 미제 살인 사건의 용의자였던 다니엘에게 이후 승강전 참가를 허가하지 않았다. 그가 자리를 비운 동안 식당의 요리사와 손님도 대부분 떠났다.",
      { speaker: "다니엘", text: "“내 요리를 심사하지도 않고, 이름부터 지우겠다는 겁니까?”" },
      "다니엘은 식당 문을 다시 열었지만 왕족과 귀족의 예약은 돌아오지 않았다. 그는 계속 요리할 수 있었으나, 평생 목표였던 왕실 요리장 선발 명단에는 다시 이름을 올리지 못했다."
    ]
  };

  const endings = {
    "daniel-accused": {
      title: "진범을 잡은 뒤",
      intro: "다니엘이 살인죄로 유죄 판결을 받은 뒤 애쉬와 캔디는 왕실 요리사 자격을 유지했고, 류진환은 다음 승강전 본선 참가 자격을 받았다.",
      cards: [ashAfterCorrectAccusation, ryuAfterCorrectAccusation, candyAfterCorrectAccusation]
    },
    "ash-accused": {
      title: "애쉬가 구속된 뒤의 네 사람",
      intro: "애쉬는 4년 동안 구금됐고 다니엘과 류진환, 캔디는 살인 혐의 없이 왕궁을 나왔다. 캔디는 왕실 주방으로 돌아갔고, 다니엘과 류진환은 각자의 식당으로 돌아갔다.",
      cards: [ashAccused, ryuUnaccused, candyAfterUnresolvedCase, danielEscaped]
    },
    "ryu-accused": {
      title: "류진환이 구속된 뒤의 네 사람",
      intro: "류진환이 구속되면서 애쉬와 캔디, 다니엘은 살인 혐의 없이 왕궁을 나왔다. 류진환의 정체가 밝혀진 일은 애쉬에게 6년 전 이별의 이유를 알려 주었지만, 살인 사건의 진범은 놓쳤다.",
      cards: [ryuAccused, ashAfterRyuAccused, candyAfterUnresolvedCase, danielEscaped]
    },
    "candy-accused": {
      title: "캔디가 구속된 뒤의 네 사람",
      intro: "캔디는 4년 동안 구금됐고 애쉬와 류진환, 다니엘은 살인 혐의 없이 왕궁을 나왔다. 애쉬는 왕실 주방으로 돌아갔고, 다니엘과 류진환은 각자의 식당으로 돌아갔다.",
      cards: [candyAccused, ashUnaccused, ryuUnaccused, danielEscaped]
    },
    "other-accused": {
      title: "네 참가자의 이후",
      intro: "다른 인물이 구속되자 다니엘과 애쉬, 류진환, 캔디는 살인 혐의 없이 왕궁을 나왔다. 애쉬와 캔디는 왕실 주방으로 돌아갔고, 다니엘과 류진환은 각자의 식당으로 돌아갔다.",
      cards: [ashUnaccused, ryuUnaccused, candyAfterUnresolvedCase, danielEscaped]
    },
    tie: {
      title: "네 사람이 치른 대가",
      intro: "재지목까지 동률로 끝나자 네 사람은 모두 구속됐다. 살인범은 특정되지 않았지만, 4년 동안 이어진 조사에서 각자가 숨겼던 행동은 차례로 드러났다.",
      cards: [danielAfterTie, ashAccused, ryuAccused, candyAccused]
    }
  };

  const copy = endings[outcome];
  const article = document.querySelector(".ending-script");
  if (!copy || !article) return;

  const portraits = [
    ["다니엘", "images/portraits/daniel.webp"],
    ["애쉬", "images/portraits/ash.webp"],
    ["캔디", "images/portraits/candy.webp"],
    ["류진환", "images/portraits/ryu.webp"]
  ];

  function portraitMarkup(name) {
    const portrait = portraits.find(([character]) => name.includes(character));
    if (!portrait) return "";
    const [character, src] = portrait;
    return `<div class="epilogue-portraits"><img src="${src}" alt="${character}"></div>`;
  }

  function blockMarkup(block) {
    if (typeof block === "string") return `<p>${block}</p>`;
    return `<p class="dialogue epilogue-dialogue" data-speaker="${block.speaker}">${block.text}</p>`;
  }

  const section = document.createElement("section");
  const titleId = `epilogue-${outcome}`;
  const scenes = copy.cards.map((card, index) => {
    const sceneId = `${titleId}-${index + 1}`;
    const blocks = card.blocks.map(blockMarkup).join("");
    return [
      `<div class="epilogue-scene epilogue-${card.tone}" aria-labelledby="${sceneId}">`,
      '<div class="epilogue-scene-heading">',
      portraitMarkup(card.name),
      '<div>',
      `<span>${card.label}</span>`,
      `<h3 id="${sceneId}">${card.name}</h3>`,
      '</div>',
      '</div>',
      blocks,
      '</div>'
    ].join("");
  }).join("");

  section.className = "chapter gourmet-epilogue";
  section.setAttribute("aria-labelledby", titleId);
  section.innerHTML = [
    '<p class="script-kicker">후일담</p>',
    `<h2 id="${titleId}">${copy.title}</h2>`,
    `<p class="epilogue-intro">${copy.intro}</p>`,
    `<div class="epilogue-scenes">${scenes}</div>`
  ].join("");
  article.appendChild(section);
}());
