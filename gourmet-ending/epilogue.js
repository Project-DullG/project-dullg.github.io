(function () {
  const script = document.currentScript;
  const outcome = script && script.dataset ? script.dataset.outcome : "";

  const danielChampion = {
    label: "4년 뒤",
    name: "다니엘",
    tone: "future",
    paragraphs: [
      "왕실은 남아 있지 않은 1차 복어국의 성분을 확인하지 못했다. 다니엘은 기소되지 않았고 수도에서 식당을 계속 운영했다.",
      "4년 뒤 새 승강전이 열리자 다니엘은 다시 참가했다. 마지막 심사에 낸 요리는 와인과 석류를 졸인 붉은 소스 스테이크였다.",
      "국왕은 고기를 붉은 소스와 함께 먹었다. \"매운맛이 아니군. 와인과 석류의 산미가 고기와 잘 맞는다.\" 다니엘은 고개를 숙였다. \"감사합니다. 4년을 기다린 심사평입니다.\"",
      "다니엘은 최종 점수 1위로 왕실 요리장에 임명됐다. 그는 임명장을 받아 들고 왕실 주방에 들어갔다."
    ]
  };

  const ashCleared = {
    label: "후속 조사",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "왕실 요리장의 떡볶이 식기에 음식이 묻어 있지 않았다는 기록이 인정되면서 애쉬의 살인 혐의는 취소됐다. 다만 중독을 일으키는 조살과 과육을 심사 음식에 넣은 책임으로 왕실 요리사 자격이 정지됐다.",
      "징계가 끝난 뒤 애쉬는 복귀 시험을 치렀다. 재료의 이름과 사용량을 모두 신고하고 심사 음식에 중독성 재료를 쓰지 않아 합격했다. 왕실 주방으로 돌아온 뒤에는 견습 요리사들에게 조살과 과육과 씨앗의 작용을 구분해 가르쳤다."
    ]
  };

  const candyDisciplined = {
    label: "후속 징계",
    name: "캔디",
    tone: "future",
    paragraphs: [
      "캔디는 애쉬의 준비대에 허락 없이 손댄 사실을 인정했다. 왕실은 살인 사건과 별도로 캔디의 직무를 정지했고, 복귀 시험을 통과한 뒤에만 다시 왕실 주방에서 일하게 했다.",
      "캔디가 복귀한 뒤 승강전 규정에는 다른 참가자의 재료와 조리대에 손댈 수 없다는 조항이 추가됐다."
    ]
  };

  const data = {
    daniel: {
      title: "다니엘이 구금된 뒤, 왕실은 나머지 세 사람의 행동을 따로 조사했다.",
      cards: [
        {
          label: "징계 이후",
          name: "애쉬",
          tone: "future",
          paragraphs: [
            "왕실 요리장은 애쉬의 떡볶이를 먹지 않았다. 애쉬에게 살인 혐의는 적용되지 않았지만, 중독을 일으키는 조살과 과육을 심사 음식에 넣은 책임으로 왕실 요리사 자격이 정지됐다.",
            "징계가 끝난 뒤 애쉬는 복귀 시험을 치렀다. 모든 재료의 이름과 사용량을 신고하고 심사 음식에 중독성 재료를 쓰지 않아 합격했다. 왕실 주방으로 돌아온 뒤에는 견습 요리사들에게 조살과 과육과 씨앗의 작용을 구분해 가르쳤다."
          ]
        },
        {
          label: "4년 뒤",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "캔디는 부녀 관계를 숨기고 아버지에게 다니엘의 붉은 요리를 피하라고 부탁한 사실을 인정했다. 살인 혐의에서는 제외됐고, 심사 개입에 대한 징계를 마친 뒤 왕실 주방으로 돌아왔다.",
            "4년 뒤 열린 새 승강전에서 캔디는 예선부터 다시 치렀다. 최종 점수 1위를 차지한 캔디는 아버지의 뒤를 이어 왕실 요리장에 임명됐다.",
            "캔디가 처음 바꾼 규정은 두 가지였다. 참가자와 심사위원의 가족 관계를 대회 전에 신고하게 했고, 모든 시식 접시를 최종 발표가 끝날 때까지 보관하게 했다."
          ]
        },
        {
          label: "별도 재판",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "검은 단약은 함 안에 남아 있었고 왕실 요리장은 류진환의 쌀국수를 먹지 않았다. 류진환에게 왕실 요리장 살인 혐의는 적용되지 않았다.",
            "대신 왕궁의 호수와 우물에 흑진주를 풀기 위해 단약을 반입한 혐의로 별도 재판을 받았다. 류진환은 까마귀의 지시와 단약의 용도를 진술했고, 애쉬는 그 계획과 관계없다고 밝혔다."
          ]
        }
      ]
    },
    "ash-cleared": {
      title: "애쉬의 떡볶이는 사망 원인에서 제외됐지만, 다니엘은 살인 혐의를 받지 않았다.",
      cards: [ashCleared, danielChampion]
    },
    "ash-candy-cleared": {
      title: "후속 조사에서 애쉬와 캔디의 행동은 왕실 요리장 살인과 따로 처리됐다.",
      cards: [ashCleared, candyDisciplined, danielChampion]
    },
    "ryu-silent": {
      title: "검은 단약이 사용되지 않았다는 사실이 확인되자 류진환의 살인 혐의는 취소됐다.",
      cards: [
        {
          label: "별도 조사",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "왕실 요리장은 검은 단약을 삼키지 않았고 류진환의 쌀국수도 먹지 않았다. 왕실은 살인 혐의를 취소했지만, 단약을 왕궁에 들여온 경위에 대한 조사는 계속했다.",
            "류진환은 까마귀에 관해 진술하지 않았다. 압수된 단약과 명령서가 별도 재판에 넘겨졌고, 그는 재판이 끝날 때까지 수도를 떠날 수 없었다."
          ]
        },
        danielChampion
      ]
    },
    "ryu-confess": {
      title: "류진환은 살인 혐의에서는 벗어났지만, 흑진주 반입 혐의로 재판을 받았다.",
      cards: [
        {
          label: "까마귀의 계획",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "류진환의 진술에 따라 검은 단약은 압수됐고 왕궁의 호수와 우물에는 경비가 배치됐다. 왕실 요리장이 단약을 삼키지 않았다는 사실도 확인돼 살인 혐의는 취소됐다.",
            "류진환은 왕궁의 물에 흑진주를 풀기 위해 단약을 반입한 혐의로 유죄 판결을 받았다. 그의 진술 덕분에 까마귀가 준비한 단약은 어느 곳에도 사용되지 않았다."
          ]
        },
        danielChampion
      ]
    },
    "ryu-protect": {
      title: "류진환은 살인 혐의와 애쉬의 혐의를 분리한 뒤 까마귀에 관해 진술했다.",
      cards: [
        {
          label: "조사실에서",
          name: "류진환과 애쉬",
          tone: "future",
          paragraphs: [
            "왕실 요리장이 단약과 쌀국수를 먹지 않았다는 사실이 확인돼 류진환의 살인 혐의는 취소됐다. 류진환은 별도 조사에서 까마귀가 애쉬를 조직에 끌어들이지 못하게 하려고 6년 전 애쉬를 내보냈다고 설명했다.",
            "애쉬는 그때 이유를 말했어야 했다고 답했다. 류진환은 사과한 뒤 까마귀의 지시와 단약의 반입 경로를 진술했다. 애쉬는 조사를 마치고 먼저 방을 나갔다."
          ]
        },
        danielChampion
      ]
    },
    "candy-hide": {
      title: "편지는 부녀 관계를 밝혔지만 캔디가 아버지를 죽였다는 증거는 되지 못했다.",
      cards: [
        {
          label: "왕궁 밖에서",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "왕실은 캔디가 만든 케이크에서 사망 원인을 찾지 못했다. 살인 혐의는 취소됐지만, 부녀 관계와 단독 만남을 숨긴 책임을 묻는 징계가 시작됐다. 캔디는 징계 결정이 나오기 전에 왕실 요리사 자리에서 물러났다.",
            "캔디는 수도에 자신의 이름을 건 식당을 열었다. 메뉴를 정하고 재료를 주문하고 하루 매상을 계산하는 일까지 직접 맡았다. 아버지의 생일이 돌아온 날에는 대회에서 전하지 못한 케이크를 다시 만들어 손님들에게 한 조각씩 내놓았다."
          ]
        },
        danielChampion
      ]
    },
    "candy-confess": {
      title: "캔디의 부탁은 심사를 방해했지만, 아버지를 독살했다는 증거는 나오지 않았다.",
      cards: [
        {
          label: "징계 이후",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "왕실은 캔디의 살인 혐의를 취소하고 부녀 관계 은폐와 심사 개입만 징계했다. 자격 정지 기간이 끝난 뒤 캔디는 복귀 시험을 치러 왕실 주방으로 돌아왔다.",
            "복귀 후 캔디는 참가자와 심사위원의 가족 관계를 사전에 신고하게 했다. 가족이 승강전에 참가하면 해당 심사위원은 그 참가자의 점수를 매길 수 없게 됐다."
          ]
        },
        danielChampion
      ]
    },
    "candy-steak": {
      title: "캔디의 지적에도 붉은 소스는 살인 증거로 채택되지 않았다.",
      cards: [
        {
          label: "복귀 이후",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "왕실은 캔디가 만든 케이크와 왕실 요리장의 사망을 연결하지 못해 살인 혐의를 취소했다. 캔디는 심사 개입에 대한 징계를 받은 뒤 왕실 주방으로 돌아왔다.",
            "캔디는 다음 승강전부터 먹지 않은 음식도 조사 종료 전까지 버리지 못하게 했다. 시식 순서와 남은 음식의 양도 심사표에 함께 기록하게 했다."
          ]
        },
        danielChampion
      ]
    },
    "daniel-victory": {
      title: "왕실은 살인범을 특정하지 못한 채 이번 승강전을 끝냈다.",
      cards: [danielChampion]
    }
  };

  const copy = data[outcome];
  const article = document.querySelector(".ending-script");
  if (!copy || !article) return;

  const portraits = [
    ["다니엘", "images/portraits/daniel.webp"],
    ["애쉬", "images/portraits/ash.webp"],
    ["캔디", "images/portraits/candy.webp"],
    ["류진환", "images/portraits/ryu.webp"]
  ];

  function portraitMarkup(name) {
    const matches = portraits.filter(([character]) => name.includes(character));
    if (!matches.length) return "";
    return `<div class="epilogue-portraits">${matches.map(([character, src]) => `<img src="${src}" alt="${character}">`).join("")}</div>`;
  }

  const section = document.createElement("section");
  section.className = "chapter gourmet-epilogue";
  section.innerHTML = [
    '<p class="script-kicker">에필로그</p>',
    `<h2>${copy.title}</h2>`,
    '<div class="epilogue-scenes">',
    copy.cards.map((card) => {
      const paragraphs = card.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
      return [
        `<article class="epilogue-scene epilogue-${card.tone}">`,
        '<div class="epilogue-scene-heading">',
        portraitMarkup(card.name),
        '<div>',
        `<span>${card.label}</span>`,
        `<h3>${card.name}</h3>`,
        '</div>',
        '</div>',
        paragraphs,
        "</article>"
      ].join("");
    }).join(""),
    "</div>"
  ].join("");

  article.appendChild(section);
}());
