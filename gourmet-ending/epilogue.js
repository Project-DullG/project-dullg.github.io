(function () {
  const script = document.currentScript;
  const outcome = script && script.dataset ? script.dataset.outcome : "";

  const escapedDaniel = {
    label: "조사 기록",
    name: "다니엘",
    tone: "danger",
    paragraphs: [
      "다니엘은 우승하지 못했습니다. 살인범으로 발표되지도 않았습니다. 승강전은 무산됐고, 공보문 앞쪽에는 금지 식재료와 왕궁 보안 문제가 올라갔습니다.",
      "다니엘의 특제 소스 스테이크에서는 독성 반응이 나오지 않았습니다. 붉은 소스는 시료 봉투에 들어갔지만, 조사관은 1차 복어국과 2차 스테이크를 같은 조서에 적지 않았습니다."
    ]
  };

  const ashFuture = {
    label: "조사 기록",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "애쉬는 살인범으로 확정되지는 않았습니다. 대신 조살과 과육 사용, 조살과를 누가 들여왔는지, 떡볶이 조리 과정을 조사받았습니다.",
      "조서에는 조살과 씨앗이 아니라 조살과 과육이라고 적혔습니다. 조살과 과육이라는 기록 때문에 애쉬의 혐의는 살인 조서와 금지 식재료 조서로 나뉘었습니다."
    ]
  };

  const ryuFuture = {
    label: "조사 기록",
    name: "류진환",
    tone: "future",
    paragraphs: [
      "류진환은 살인범으로 확정되지는 않았습니다. 대신 까마귀 표식, 검은 함 전달, 수도시설 쪽지를 두고 별도 조사를 받았습니다.",
      "류진환 조서에는 왕실 요리장을 죽였다는 내용보다 왕궁 보안 사건이 먼저 적혔습니다. 다니엘의 스테이크 식기는 보안 조사가 열린 뒤에 대조되었습니다."
    ]
  };

  const candyFuture = {
    label: "조사 기록",
    name: "캔디",
    tone: "future",
    paragraphs: [
      "캔디는 살인범으로 확정되지는 않았습니다. 대신 부녀 관계, 경쟁자 방해, 붉은 요리를 피하라는 부탁을 조사받았습니다.",
      "편지는 축하 인사로 전달되지 못했습니다. 봉투의 애칭과 붉은 요리를 피하라는 말이 조서에 인용되었습니다."
    ]
  };

  const data = {
    daniel: {
      title: "다니엘이 구속된 뒤에도, 세 사람의 조사는 따로 이어졌습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "다니엘",
          tone: "lost",
          paragraphs: [
            "경비대는 다니엘에게 수갑을 채웠습니다. 조사관은 조살과 씨앗, 1차 복어국, 붉은 소스 시료를 같은 살인 조서에 적었습니다.",
            "우승 후보 칸은 비워졌고, 특제 소스 스테이크에는 증거 번호가 붙었습니다."
          ]
        },
        ashFuture,
        ryuFuture,
        candyFuture
      ]
    },
    ash: {
      title: "애쉬가 별실로 옮겨진 뒤, 살인 조서와 금지 식재료 조서가 따로 열렸습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "애쉬",
          tone: "lost",
          paragraphs: [
            "애쉬는 별실로 옮겨졌습니다. 조사관은 금지 식재료 사용, 조살과 과육, 떡볶이 조리 과정을 같은 조사표에 적었습니다.",
            "살인범으로 확정되지는 않았지만, 금지 식재료 사용 사실만으로도 격리 조치는 유지되었습니다."
          ]
        },
        escapedDaniel,
        ryuFuture,
        candyFuture
      ]
    },
    ryu: {
      title: "류진환이 별도 조사실로 옮겨진 뒤, 세 사람의 조사가 따로 이어졌습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "경비대는 류진환을 별도 조사실로 옮겼습니다. 조서 첫 장에는 까마귀 표식과 수도시설 쪽지가 적혔습니다.",
            "류진환이 침묵하거나 일부를 인정해도 결과는 같았습니다. 왕실은 살인 조서보다 보안 조서를 먼저 열었습니다."
          ]
        },
        escapedDaniel,
        ashFuture,
        candyFuture
      ]
    },
    candy: {
      title: "캔디의 주방 출입이 정지된 뒤, 세 사람은 다른 조사표에 적혔습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "캔디",
          tone: "lost",
          paragraphs: [
            "조사관은 캔디에게 \"붉은 요리를 먹지 말라고 말했습니까\"라고 물었습니다. 캔디는 독을 넣지 않았다고 답했지만, 붉은 요리를 피하라는 부탁 자체는 부정하지 못했습니다.",
            "왕실 주방 출입 권한은 조사실에서 정지됐습니다. 조사표에는 부녀 관계, 경쟁자 방해, 식사 선택에 개입한 말이 함께 적혔습니다."
          ]
        },
        escapedDaniel,
        ashFuture,
        ryuFuture
      ]
    },
    unresolved: {
      title: "공식 범인이 정해지지 않아, 네 사람 모두 조사 대상에 남았습니다.",
      cards: [
        escapedDaniel,
        ashFuture,
        ryuFuture,
        candyFuture
      ]
    }
  };

  const copy = data[outcome];
  const article = document.querySelector(".ending-script");
  if (!copy || !article) return;

  const section = document.createElement("section");
  section.className = "chapter gourmet-epilogue";
  section.innerHTML = [
    '<p class="script-kicker">EPILOGUE</p>',
    `<h2>${copy.title}</h2>`,
    '<div class="epilogue-scenes">',
    copy.cards.map((card) => {
      const paragraphs = card.paragraphs.map((text) => `<p>${text}</p>`).join("");
      return [
        `<article class="epilogue-scene epilogue-${card.tone}">`,
        `<span>${card.label}</span>`,
        `<h3>${card.name}</h3>`,
        paragraphs,
        "</article>"
      ].join("");
    }).join(""),
    "</div>"
  ].join("");

  article.appendChild(section);
}());
