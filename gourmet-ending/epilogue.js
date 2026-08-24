(function () {
  const script = document.currentScript;
  const outcome = script?.dataset?.outcome || "";

  const danielEscaped = {
    label: "다음 승강전",
    name: "다니엘",
    tone: "future",
    paragraphs: [
      "다른 사람이 구속되자 다니엘은 살인 혐의로 재판받지 않았다. 그는 왕궁을 나와 자신이 운영하던 식당으로 돌아갔다.",
      "왕실 요리장 살해 사건은 1차 음식이 폐기된 탓에 진범을 확정하지 못했다. 다니엘은 식당을 계속 운영했고, 귀족과 왕족의 예약도 끊이지 않았다.",
      "4년 뒤 다니엘은 새 승강전에 다시 참가했다. 그는 붉은 석류 와인 소스를 곁들인 스테이크를 냈고, 이번에는 국왕이 고기와 소스를 함께 맛보았다.",
      "다니엘은 선발 명단에 올라 왕실 요리사가 됐다. 그로부터 8년 뒤에는 평생 목표로 삼았던 왕실 요리장 자리에 올랐다."
    ]
  };

  const ashAfterCorrectAccusation = {
    label: "왕실 주방",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "애쉬는 사건 수사에 협조한 공로를 인정받았다. 중단된 승강전 때문에 기존 자격도 잃지 않았고, 사건 조사가 끝난 뒤 왕실 주방으로 돌아갔다.",
      "애쉬는 대회 날을 마지막으로 조살과를 요리에 쓰지 않았다. 왕실 주방으로 돌아간 뒤에는 조살과를 제외한 동방 식재료만 사용했다.",
      "4년 뒤에도 애쉬는 현직 왕실 요리사였다. 왕실 주방에서 동방 요리와 이방 식재료를 맡았고, 조살과를 쓰지 않은 요리로 자리를 지켰다."
    ]
  };

  const ashUnaccused = {
    label: "왕실 주방",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "애쉬는 살인 혐의로 조사받지 않은 채 왕실 주방으로 돌아갔다. 승강전이 무효가 됐으므로 현직 왕실 요리사 자격도 유지됐다.",
      "애쉬가 조살과 과육을 사용한 사실은 수사 대상이 되지 않았다. 애쉬는 2차 요리를 만들며 스스로 정했던 대로 그날 이후 조살과를 다시 쓰지 않았다.",
      "4년 뒤에도 애쉬는 현직 왕실 요리사였다. 왕실 주방에서 동방 요리와 이방 식재료를 맡으며 자격을 지켰다."
    ]
  };

  const ashAfterRyuAccused = {
    label: "왕실 주방",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "류진환을 조사하는 과정에서 그가 까마귀 요원이었다는 사실이 공개됐다. 애쉬는 6년 전 그가 말했던 까마귀가 자신을 밀어내기 위한 핑계만은 아니었다는 것을 알게 됐다.",
      "애쉬가 까마귀의 임무에 가담했다는 증거는 나오지 않았다. 그녀는 살인 혐의 없이 왕실 주방으로 돌아갔고, 현직 왕실 요리사 자격을 유지했다.",
      "애쉬는 그날 이후 조살과를 요리에 쓰지 않았다. 4년 뒤에는 왕실 주방에서 동방 요리와 이방 식재료를 맡고 있었다."
    ]
  };

  const ryuAfterCorrectAccusation = {
    label: "사라진 도전자",
    name: "류진환",
    tone: "future",
    paragraphs: [
      "류진환은 사건 수사에 협조한 대가로 다음 승강전 본선 참가 자격을 받았다. 그러나 접선 상대였던 왕실 요리장이 죽으면서 왕궁 잠입 계획을 그대로 이어가기 어려워졌다.",
      "왕궁에서 나온 류진환은 자신이 운영하던 식당을 정리했다. 그는 다음 승강전을 기다리지 않고 서방 왕국을 떠났다.",
      "까마귀는 류진환을 다른 지역의 제조소로 옮겼다. 4년 뒤에도 그는 새 신분으로 조살과를 이용한 약물을 만들고 있었다. 서방 왕국으로는 돌아오지 않았다."
    ]
  };

  const ryuUnaccused = {
    label: "사라진 도전자",
    name: "류진환",
    tone: "future",
    paragraphs: [
      "류진환은 살인 혐의로 조사받지 않은 채 왕궁을 나왔다. 접선 상대였던 왕실 요리장이 죽었고, 그가 전달한 흑진주가 왕궁 안에 남은 상황에서 같은 신분으로 머무는 것은 위험했다.",
      "류진환은 자신이 운영하던 식당을 정리하고 서방 왕국을 떠났다. 왕실 요리사 선발전에도 다시 참가하지 않았다.",
      "까마귀는 그를 다른 지역의 제조소로 옮겼다. 4년 뒤에도 류진환은 새 신분으로 조살과를 이용한 약물을 만들고 있었다. 서방 왕국으로는 돌아오지 않았다."
    ]
  };

  const candyAfterCorrectAccusation = {
    label: "아버지의 뒤를 이어",
    name: "캔디",
    tone: "future",
    paragraphs: [
      "다니엘의 재판에서 2차 스테이크의 붉은 소스가 1차 독을 중화할 수 있었다는 사실이 밝혀졌다. 캔디는 다니엘을 탈락시키려고 아버지에게 붉은 요리를 먹지 말라고 부탁했다. 그 부탁 때문에 아버지가 붉은 소스를 먹지 않았다는 사실도 알게 됐다.",
      "왕실 요리장을 죽인 사람은 복어국에 조살과 씨앗을 넣은 다니엘이었다. 캔디는 살인죄를 받지 않았지만, 자신이 심사에 개입하지 않았다면 아버지가 붉은 소스를 먹었을 가능성이 있었다는 사실을 알게 됐다.",
      "캔디는 사건 수사에 협조한 공로를 인정받아 왕실 요리사 자격을 유지했다. 왕실 주방으로 돌아간 뒤에는 다른 참가자의 재료를 건드리지 않았고, 심사위원에게 미리 부탁하는 일도 하지 않았다.",
      "12년 동안 왕실 주방에서 경력을 쌓은 캔디는 왕실 요리장으로 임명됐다. 그해 아버지의 생일에도 녹색 케이크를 만들었다. 촛불을 켠 캔디는 빈 조리실에서 말했다. “아빠, 나 이제 요리장이야. 내 실력으로 됐어.”"
    ]
  };

  const candyAfterUnresolvedCase = {
    label: "왕실 제과실",
    name: "캔디",
    tone: "future",
    paragraphs: [
      "캔디는 살인 혐의로 조사받지 않은 채 왕실 주방으로 돌아갔다. 승강전이 무효가 됐으므로 현직 왕실 요리사 자격도 유지됐다.",
      "다니엘의 붉은 소스에 해독제가 있었다는 사실은 수사에서 밝혀지지 않았다. 캔디는 자신이 아버지에게 한 부탁이 죽음에 영향을 주었다는 사실을 알지 못했다.",
      "캔디는 왕실 주방에서 케이크와 과자를 계속 만들었다. 4년 뒤에는 제과 작업을 책임지는 왕실 요리사가 됐다.",
      "아버지의 생일이 돌아올 때마다 캔디는 대회 날 만들었던 녹색 케이크를 다시 구웠다. 네 번째 케이크에 촛불을 꽂은 뒤에는 짧게 말했다. “아빠, 생일 축하해. 올해도 내가 만들었어.”"
    ]
  };

  const endings = {
    "daniel-accused": {
      title: "진범을 잡은 뒤",
      intro: "다니엘이 구속된 뒤 애쉬와 류진환, 캔디는 수사에 협조한 공로를 인정받았다.",
      cards: [ashAfterCorrectAccusation, ryuAfterCorrectAccusation, candyAfterCorrectAccusation]
    },
    "ash-accused": {
      title: "지목되지 않은 세 사람",
      intro: "애쉬가 구속된 뒤 다니엘과 류진환, 캔디는 살인 혐의 없이 왕궁을 나왔다.",
      cards: [ryuUnaccused, candyAfterUnresolvedCase, danielEscaped]
    },
    "ryu-accused": {
      title: "지목되지 않은 세 사람",
      intro: "류진환이 구속된 뒤 애쉬와 캔디, 다니엘은 살인 혐의 없이 왕궁을 나왔다.",
      cards: [ashAfterRyuAccused, candyAfterUnresolvedCase, danielEscaped]
    },
    "candy-accused": {
      title: "지목되지 않은 세 사람",
      intro: "캔디가 구속된 뒤 애쉬와 류진환, 다니엘은 살인 혐의 없이 왕궁을 나왔다.",
      cards: [ashUnaccused, ryuUnaccused, danielEscaped]
    },
    "other-accused": {
      title: "네 참가자의 이후",
      intro: "다른 인물이 구속된 뒤 네 참가자는 살인 혐의 없이 왕궁을 나왔다.",
      cards: [ashUnaccused, ryuUnaccused, candyAfterUnresolvedCase, danielEscaped]
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

  const section = document.createElement("section");
  const titleId = `epilogue-${outcome}`;
  const scenes = copy.cards.map((card, index) => {
    const sceneId = `${titleId}-${index + 1}`;
    const paragraphs = card.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
    return [
      `<div class="epilogue-scene epilogue-${card.tone}" aria-labelledby="${sceneId}">`,
      '<div class="epilogue-scene-heading">',
      portraitMarkup(card.name),
      '<div>',
      `<span>${card.label}</span>`,
      `<h3 id="${sceneId}">${card.name}</h3>`,
      '</div>',
      '</div>',
      paragraphs,
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
