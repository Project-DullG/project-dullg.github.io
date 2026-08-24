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

  const danielWins = {
    label: "4년 뒤 · 왕실 요리사 승강전",
    title: "다니엘",
    people: ["다니엘"],
    tone: "future",
    blocks: [
      "봉쇄가 풀린 뒤 다니엘은 자신의 식당으로 돌아갔다. 수사대는 폐기된 복어국을 검사하지 못했고, 남은 스테이크에서는 독을 찾지 못했다. 다니엘은 기소되지 않았고 귀족과 왕족의 예약도 다시 들어왔다.",
      "4년 뒤, 다니엘은 외부 도전자로 승강전에 나왔다. 그는 다시 석류 와인 소스를 곁들인 스테이크를 냈다. 이번 소스에는 와인과 석류만 들어 있었다.",
      "새 심사위원들은 고기와 소스를 함께 먹었다. 다니엘은 최고점을 받아 왕실 요리사가 됐다. 그로부터 8년 뒤에는 평생 바라던 왕실 요리장 자리에 올랐다.",
      { speaker: "다니엘", text: "“접시에 있는 것은 전부 맛본 뒤 평가한다. 다음 요리를 가져오게.”" }
    ]
  };

  const ryuEscapes = {
    label: "봉쇄 해제 다음 날 · 서방 왕국",
    title: "류진환",
    people: ["류진환"],
    tone: "danger",
    blocks: [
      "류진환은 살인 혐의로 구속되지 않았다. 접선 상대였던 왕실 요리장이 죽고 수도시설로 들어갈 길도 끊기자, 그는 식당을 정리하고 서방 왕국을 떠났다.",
      "류진환은 까마귀에 왕궁 잠입 작전이 실패했다고 보고했다. 그의 정체와 흑진주 제조 경력은 드러나지 않았다. 애쉬에게도 연락하지 않았다.",
      "까마귀는 류진환에게 다른 지역의 제조소를 맡겼다. 그는 조직을 떠나지 못했지만 서방 왕국으로 돌아가지 않았고, 애쉬에게도 연락하지 않았다."
    ]
  };

  const ashKeepsHerPlace = {
    label: "4년 뒤 · 왕실 주방 평가",
    title: "애쉬",
    people: ["애쉬"],
    tone: "future",
    blocks: [
      "애쉬는 왕실 주방으로 돌아간 뒤 조살과를 다시 사용하지 않았다. 승강전 대상자를 정하는 다음 평가에서는 사건 당일 망쳤던 해파리 냉채를 다시 만들었다.",
      "이번에는 해파리를 소금에 절였고, 정해진 시간 안에 간을 맞췄다. 평가를 마친 접시는 비어 있었다. 애쉬는 교체 대상에서 빠져 왕실 요리사 자격을 지켰다.",
      "왕실 주방은 동방 식재료의 독성과 조리법을 확인하는 일을 애쉬에게 맡겼다. 애쉬는 재료마다 가열 시간과 사용량을 기록했고, 조살과를 반입 금지 목록에 올렸다."
    ]
  };

  const candyKeepsHerPlace = {
    label: "4년 뒤 · 왕실 주방 평가",
    title: "캔디",
    people: ["캔디"],
    tone: "future",
    blocks: [
      "아버지가 죽은 뒤에도 캔디는 왕실 요리사로 남았다. 캔디는 연회용 케이크와 과자를 직접 만들며 다음 평가를 준비했다.",
      "4년 뒤, 캔디는 제과 부문 최고점을 받았다. 아버지의 도움 없이 받은 첫 공식 평가였다. 캔디는 교체 대상에서 빠졌고 왕실 제과 작업을 맡게 됐다.",
      "캔디는 동료와 다툰 뒤에도 상대의 재료에는 손대지 않았다. 다음 평가에서도 자신이 만든 음식으로 점수를 받았다.",
      "그해 아버지의 생일, 연회 준비를 마친 캔디는 왕실 주방에 혼자 남아 대회 날과 같은 녹색 케이크를 구웠다. 촛불 하나를 켜고 말했다.",
      { speaker: "캔디", text: "“아빠, 이번 평가도 통과했어. 이번에는 내 점수야.”" }
    ]
  };

  const endings = {
    "daniel-accused": {
      title: "다니엘이 처형된 뒤",
      scenes: [
        {
          label: "캔디가 왕실 주방을 떠나기 전",
          title: "애쉬와 캔디",
          people: ["애쉬", "캔디"],
          tone: "future",
          blocks: [
            "재판에서 붉은 소스에 해독 성분이 있었다는 사실이 밝혀졌다. 캔디는 다니엘을 떨어뜨리려고 한 부탁이 아버지의 해독을 막았다는 사실도 알게 됐다.",
            "캔디는 살인죄로 처벌받지 않았지만 아버지의 심사에 개입한 일로 왕실 요리사 자격을 잃었다. 다만 재판에서 부녀 관계와 휴식 시간의 대화를 밝힌 점을 인정받아 4년 뒤 공개 선발전에 다시 지원할 수 있었다.",
            "왕실 주방을 떠나기 전, 캔디는 애쉬를 찾아갔다. 4년 동안 애쉬의 재료를 버리고 소금을 쏟은 일, 대회 전날 해파리를 설탕물에 담근 일을 모두 인정했다.",
            { speaker: "캔디", text: "“네 요리를 망친 건 나야. 다시는 네 재료에 손대지 않을게.”" },
            { speaker: "애쉬", text: "“용서했다는 말은 못 해. 그래도 그 약속은 지켜.”" },
            "캔디가 왕실 주방을 나간 뒤 두 사람은 따로 지냈다. 캔디가 공개 선발전을 준비하며 조리법을 물어 오면 애쉬는 완성된 음식부터 맛보았다. 어떤 재료를 얼마나 바꿀지는 캔디가 직접 정하게 했다."
          ]
        },
        {
          label: "봉쇄 해제 다음 날 · 서방 왕국",
          title: "류진환",
          people: ["류진환"],
          tone: "danger",
          blocks: [
            "국왕은 이날 승강전이 무효가 된 점을 고려해 류진환에게 다음 승강전 본선 참가 자격을 주었다. 류진환은 그 자격을 사용하지 않았다. 접선 상대였던 왕실 요리장이 죽었고, 왕궁 잠입을 이어갈 수도 없었다.",
            "류진환은 식당을 정리하고 동방으로 돌아갔다. 까마귀에는 수도시설 작전이 실패했다고 보고했다. 그의 정체는 끝내 드러나지 않았고 애쉬도 조사받지 않았다.",
            "류진환은 다른 지역에서 까마귀의 약물 제조를 계속했다. 서방 왕국으로 돌아오거나 애쉬에게 연락하는 일은 없었다."
          ]
        },
        ashKeepsHerPlace,
        {
          label: "12년 뒤 · 왕실 주방",
          title: "캔디",
          people: ["캔디"],
          tone: "coda",
          blocks: [
            "캔디는 4년 뒤 공개 선발전에 다시 지원했다. 아버지의 심사도, 미리 정해진 점수도 없는 시험이었다. 캔디는 제과 부문 최고점을 받아 왕실 주방으로 돌아갔다.",
            "그 뒤 8년 동안 캔디는 연회와 생일상을 맡았다. 모든 평가에서 자신이 만든 음식으로 점수를 받았고, 사건이 일어난 지 12년 뒤 왕실 요리장으로 임명됐다.",
            "임명식이 끝난 날은 아버지의 생일이었다. 캔디는 대회 날 만들었던 녹색 케이크를 다시 구웠다. 작은 케이크에 촛불 하나를 켜고 임명장을 옆에 놓았다.",
            { speaker: "캔디", text: "“아빠, 생일 축하해. 나 오늘 요리장이 됐어. 이번에는 내 요리로 됐어.”" }
          ]
        }
      ]
    },
    "ash-accused": {
      title: "애쉬가 왕실을 떠난 뒤",
      scenes: [
        ryuEscapes,
        candyKeepsHerPlace,
        danielWins,
        {
          label: "12년 뒤 · 수도 외곽의 식당",
          title: "애쉬",
          people: ["애쉬"],
          tone: "coda",
          blocks: [
            "애쉬는 4년형을 마치고 석방됐다. 조살과를 사용한 전력이 알려져 왕실과 거래하는 식당에서는 그녀를 고용하지 않았다.",
            "수도 외곽의 작은 식당 한 곳이 애쉬에게 한 접시를 만들어 보라고 했다. 애쉬는 해파리를 소금에 절여 냉채를 완성했다. 주인은 접시를 비운 뒤 다음 날부터 채소 손질과 국물 준비를 맡겼다.",
            "애쉬는 그곳에서 8년을 일했다. 해파리 냉채는 식당의 정식 메뉴가 됐고, 애쉬는 주방을 맡아 새 요리사들을 가르쳤다.",
            "한 보조 요리사가 간을 맞추지 못한 해파리를 버리려 하자 애쉬가 그릇을 받아 들었다.",
            { speaker: "애쉬", text: "“버리지 마세요. 물에 헹군 뒤 처음부터 간을 맞춰요.”" },
            "애쉬는 왕실 요리사라는 직함을 되찾지 못했다. 그날 저녁에도 손님들은 애쉬가 만든 해파리 냉채를 남기지 않았다."
          ]
        }
      ]
    },
    "ryu-accused": {
      title: "류진환의 정체가 드러난 뒤",
      scenes: [
        {
          label: "형 집행 전 · 왕궁 접견실",
          title: "류진환과 애쉬",
          people: ["류진환", "애쉬"],
          tone: "lost",
          blocks: [
            "류진환의 형이 확정된 뒤 애쉬에게 한 차례 면회가 허락됐다. 두 사람 사이에는 경비병이 서 있었다.",
            { speaker: "애쉬", text: "“그때 까마귀가 나까지 데려가려고 했어요?”" },
            { speaker: "류진환", text: "“아니. 하지만 네가 내 곁에 남았다면 곧 그렇게 됐을 거다.”" },
            { speaker: "애쉬", text: "“그래서 나를 쫓아냈고요?”" },
            { speaker: "류진환", text: "“그래.”" },
            { speaker: "애쉬", text: "“그 말은 여섯 해 전에 했어야 했어요.”" },
            { speaker: "류진환", text: "“맞다.”" },
            "면회 시간은 그 대답 뒤에 끝났다. 애쉬는 용서한다는 말을 하지 않았고, 류진환도 기다려 달라고 하지 않았다. 그의 형은 예정대로 집행됐다."
          ]
        },
        candyKeepsHerPlace,
        danielWins,
        {
          label: "12년 뒤 · 왕실 주방 식재료 검수실",
          title: "애쉬",
          people: ["애쉬"],
          tone: "coda",
          blocks: [
            "애쉬는 왕실 요리사 자격을 지켰고, 동방 식재료의 독성과 조리법을 확인하는 일을 맡았다. 류진환에게 배운 약초 지식도 그 일에 사용했다.",
            "한 상인이 조살과를 왕실 식재료로 납품하려 했다. 애쉬는 반입을 거부하고 거래 목록에서 그 상인을 제외했다. 조살과는 왕실 주방에 들어오지 못했다.",
            "검수를 마친 애쉬는 주방으로 돌아가 해파리 냉채를 완성했다. 저녁 수라가 끝난 뒤 돌아온 접시는 비어 있었다."
          ]
        }
      ]
    },
    "candy-accused": {
      title: "캔디가 왕실을 떠난 뒤",
      scenes: [
        ryuEscapes,
        ashKeepsHerPlace,
        danielWins,
        {
          label: "12년 뒤 · 아버지의 생일",
          title: "캔디",
          people: ["캔디"],
          tone: "coda",
          blocks: [
            "캔디는 석방된 뒤 집안의 재산으로 작은 제과점을 열었다. 왕실과 귀족가의 주문은 끊겼다. 처음 몇 달은 케이크를 사려는 사람보다 살인 용의자였던 캔디를 구경하러 오는 사람이 많았다.",
            "캔디는 케이크와 과자를 매일 직접 만들었다. 몇 달이 지나자 같은 과자를 사러 다시 오는 손님이 생겼다. 8년 뒤에는 제과 보조들을 고용하고 예약 주문을 받을 만큼 손님이 늘었다.",
            "아버지의 생일이 돌아오자 캔디는 대회에서 만들었던 녹색 케이크를 다시 구웠다. 마지막 손님이 나간 뒤, 남겨 둔 작은 케이크에 촛불을 켰다.",
            { speaker: "캔디", text: "“아빠, 오늘 케이크는 전부 팔렸어. 이번에는 내가 다 만들었어.”" }
          ]
        }
      ]
    },
    "other-accused": {
      title: "다른 사람이 구속된 뒤",
      scenes: [
        ryuEscapes,
        {
          label: "4년 뒤 · 왕실 법정 앞",
          title: "지목된 인물",
          tone: "lost",
          blocks: [
            "왕실 법정은 지목된 사람이 음식에 손댔다는 증거를 찾지 못해 살인 혐의를 기각했다. 그 사람은 4년 만에 구금실을 나왔다.",
            "그동안 직위에는 다른 사람이 임명됐고 거래처도 새 계약을 맺었다. 지목된 사람은 원래 하던 일로 돌아가지 못했다."
          ]
        },
        {
          label: "4년 뒤 · 왕실 주방 평가",
          title: "애쉬와 캔디",
          people: ["애쉬", "캔디"],
          tone: "future",
          blocks: [
            "애쉬와 캔디는 사건 뒤에도 왕실 요리사로 일했다. 아버지가 없는 캔디는 제과 평가를 자신의 점수로 통과했고, 애쉬는 조살과를 다시 사용하지 않은 채 동방 요리 평가를 통과했다.",
            "두 사람은 여전히 자주 다퉜다. 그러나 상대의 재료를 버리거나 조리대에 손대는 일은 없었다. 다음 승강전에서 두 사람은 모두 왕실 요리사 자격을 지켰다."
          ]
        },
        {
          ...danielWins,
          tone: "coda"
        }
      ]
    },
    tie: {
      title: "사건이 미제로 남은 뒤",
      scenes: [
        {
          label: "조사 종료 전 · 왕실 법정",
          title: "류진환",
          people: ["류진환"],
          tone: "lost",
          blocks: [
            "류진환은 왕실 요리장 살인 혐의를 벗었다. 그러나 까마귀 소속과 수도시설용 흑진주를 전달한 사실이 드러났다.",
            "왕실 법정은 간첩 행위와 수도시설 중독 준비에 사형을 선고했다. 압수된 단약은 폐기됐고 형은 그대로 집행됐다."
          ]
        },
        {
          label: "4년 뒤 · 수도의 식당가",
          title: "다니엘",
          people: ["다니엘"],
          tone: "lost",
          blocks: [
            "폐기된 복어국을 검사할 수 없었고 다니엘은 끝까지 범행을 부인했다. 캔디도 휴식 시간에 아버지에게 했던 부탁은 밝히지 않았다. 왕실 수사대는 왕실 요리장만 다니엘의 스테이크를 먹지 않은 이유를 확인하지 못했다.",
            "왕실 법정은 복어국과 스테이크가 한 사람을 죽이기 위해 함께 준비됐다고 확정하지 못했다. 다니엘은 살인죄로 기소되지 않은 채 4년 뒤 석방됐다.",
            "다니엘이 구금된 동안 식당은 문을 닫았고 요리사들은 다른 곳으로 떠났다. 왕실은 미제 살인 사건의 용의자였던 그에게 이후 승강전 참가를 허가하지 않았다.",
            { speaker: "다니엘", text: "“요리를 보지도 않고 제 이름부터 지우겠다는 겁니까?”" },
            "다니엘은 작은 식당을 다시 열었지만 왕족과 귀족의 예약은 돌아오지 않았다. 왕실 요리장이 되겠다는 목표도 끝났다."
          ]
        },
        {
          label: "4년 뒤 · 왕실 법정",
          title: "애쉬와 캔디",
          people: ["애쉬", "캔디"],
          tone: "lost",
          blocks: [
            "애쉬의 떡볶이에서는 조살과 과육이 확인됐다. 살인 혐의는 기각됐지만 국왕에게 중독성 식재료를 먹인 죄로 4년형을 살았고, 왕실 요리사 자격도 잃었다.",
            "캔디의 케이크에서는 사망 원인이 될 독이 나오지 않았다. 분홍색 편지와 과거 대회 기록을 통해 부녀 관계와 이전 심사의 특혜가 밝혀져 자격이 박탈됐다. 캔디도 살인 혐의가 기각된 뒤에야 구금실을 나왔다.",
            "두 사람이 비운 왕실 주방 자리에는 다른 요리사들이 들어갔다. 애쉬와 캔디는 다시 왕실 요리사로 지원할 수 없었다."
          ]
        },
        {
          label: "다음 왕실 요리사 승강전",
          title: "네 사람이 빠진 승강전",
          tone: "coda",
          blocks: [
            "다음 승강전에는 네 사람 중 누구도 참가하지 못했다. 애쉬와 캔디가 비운 자리는 새 요리사들이 채웠고, 다니엘의 이름은 도전자 명단에서 빠졌다.",
            "왕실 법정은 누구에게도 왕실 요리장 살인죄를 선고하지 못했다. 사건은 미제로 남았다."
          ]
        }
      ]
    }
  };

  const copy = endings[outcome];
  const article = document.querySelector(".ending-script");
  if (!copy || !article) return;

  const portraits = {
    다니엘: "images/portraits/daniel.webp",
    애쉬: "images/portraits/ash.webp",
    캔디: "images/portraits/candy.webp",
    류진환: "images/portraits/ryu.webp"
  };

  function portraitMarkup(people = []) {
    const images = people
      .filter((name) => portraits[name])
      .map((name) => `<img src="${portraits[name]}" alt="${name}">`)
      .join("");
    return images ? `<div class="epilogue-portraits">${images}</div>` : "";
  }

  function blockMarkup(block) {
    if (typeof block === "string") return `<p>${block}</p>`;
    return `<p class="dialogue epilogue-dialogue" data-speaker="${block.speaker}">${block.text}</p>`;
  }

  const section = document.createElement("section");
  const titleId = `epilogue-${outcome}`;
  const scenes = copy.scenes.map((scene, index) => {
    const sceneId = `${titleId}-${index + 1}`;
    const blocks = scene.blocks.map(blockMarkup).join("");
    return [
      `<div class="epilogue-scene epilogue-${scene.tone || "future"}" aria-labelledby="${sceneId}">`,
      '<div class="epilogue-scene-heading">',
      portraitMarkup(scene.people),
      '<div>',
      `<span>${scene.label}</span>`,
      `<h3 id="${sceneId}">${scene.title}</h3>`,
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
    copy.intro ? `<p class="epilogue-intro">${copy.intro}</p>` : "",
    `<div class="epilogue-scenes">${scenes}</div>`
  ].join("");
  article.appendChild(section);
}());
