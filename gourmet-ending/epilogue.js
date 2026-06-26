(function () {
  const script = document.currentScript;
  const outcome = script && script.dataset ? script.dataset.outcome : "";

  const escapedDaniel = {
    label: "조사 기록",
    name: "다니엘",
    tone: "danger",
    paragraphs: [
      "다니엘은 우승하지 못했습니다. 살인범으로 발표되지도 않았습니다. 승강전은 무산됐고, 공보문 앞쪽에는 금지 식재료와 왕궁 보안 문제가 올라갔습니다.",
      "다니엘의 붉은 소스는 새콤한 향이 나는 시료로 남았습니다. 하지만 조사관은 1차 복어국과 2차 스테이크를 같은 조서에 적지 않았습니다.",
      "참고인 명단 아래쪽에 적힌 다니엘의 이름 옆에는 '특제 소스 스테이크, 시식 흔적 거의 없음'이라는 문장만 남았습니다. 그 문장은 곧바로 체포 근거가 되지 못했습니다."
    ]
  };

  const ashFuture = {
    label: "조사 기록",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "애쉬는 살인범으로 확정되지는 않았습니다. 대신 조살과 과육 사용 정황과 떡볶이 조리 과정을 조사받았습니다.",
      "애쉬의 자백은 살인 조서의 첫 줄이 되지 못했습니다. 조서에는 조살과 씨앗이 아니라 조살과 과육이라고 적혔고, 그 기록 때문에 살인 조서와 금지 식재료 조서가 따로 열렸습니다.",
      "애쉬가 지키려던 것은 자기 요리였지만, 조사표 첫 줄에는 살인이 아니라 금지 식재료 사용 정황이 적혔습니다."
    ]
  };

  const ryuFuture = {
    label: "조사 기록",
    name: "류진환",
    tone: "future",
    paragraphs: [
      "류진환은 살인범으로 확정되지는 않았습니다. 대신 검은 코트 쪽지와 검은 함을 두고 별도 조사를 받았습니다.",
      "류진환 조서에는 왕실 요리장을 죽였다는 내용보다 검은 코트 쪽지가 먼저 적혔습니다. 다니엘의 스테이크 식기는 그 뒤에 대조되었습니다.",
      "검은 함 안에 단약이 남아 있었다는 사실은 류진환을 살인범에서 멀어지게 했지만, 왕궁 안으로 들어온 까마귀의 이름까지 지우지는 못했습니다."
    ]
  };

  const candyFuture = {
    label: "조사 기록",
    name: "캔디",
    tone: "future",
    paragraphs: [
      "캔디는 살인범으로 확정되지는 않았습니다. 대신 부녀 관계, 경쟁자 방해, 붉은 요리를 피하라는 부탁을 조사받았습니다.",
      "편지는 축하 인사로 전달되지 못했습니다. 편지의 \"아빠\"라는 호칭과 붉은 요리를 피하라는 말이 조서에 인용되었습니다.",
      "캔디가 아버지를 살리려고 한 말은 아니었습니다. 하지만 아버지가 딸의 부탁을 들었다는 사실만큼은 조서에서 빠지지 않았습니다."
    ]
  };

  const data = {
    daniel: {
      title: "다니엘이 구속되자, 승강전의 우승 후보 칸도 함께 비었습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "다니엘",
          tone: "lost",
          paragraphs: [
            "경비대는 다니엘에게 수갑을 채웠습니다. 조사관은 조살과 씨앗, 1차 복어국, 붉은 소스 시료를 같은 살인 조서에 적었습니다.",
            "우승 후보 칸은 비워졌고, 특제 소스 스테이크에는 증거 번호가 붙었습니다.",
            "다니엘의 붉은 소스는 시식평을 받지 못했습니다. 보관 목록에는 맛이 아니라 식기 상태와 시료 번호가 적혔습니다."
          ]
        },
        ashFuture,
        ryuFuture,
        candyFuture
      ]
    },
    ash: {
      title: "애쉬가 별실로 옮겨진 뒤, 조살과 과육 사용이 살인보다 먼저 기록됐습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "애쉬",
          tone: "lost",
          paragraphs: [
            "애쉬는 별실로 옮겨졌습니다. 조사관은 금지 식재료 사용, 조살과 과육, 떡볶이 조리 과정을 같은 조사표에 적었습니다.",
            "살인범으로 확정되지는 않았지만, 금지 식재료 사용 사실만으로도 격리 조치는 유지되었습니다.",
            "애쉬의 떡볶이는 사망 순서를 설명하지 못했습니다. 그래도 그녀가 금지된 맛을 선택했다는 사실은 지워지지 않았습니다."
          ]
        },
        escapedDaniel,
        ryuFuture,
        candyFuture
      ]
    },
    ryu: {
      title: "류진환이 별도 조사실로 옮겨진 뒤, 검은 함은 보안 조서 첫 장에 놓였습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "경비대는 류진환을 별도 조사실로 옮겼습니다. 조서 첫 장에는 검은 코트 쪽지와 검은 함이 적혔습니다.",
            "류진환이 침묵하거나 일부를 인정해도 결과는 같았습니다. 왕실은 살인 조서보다 보안 조서를 먼저 열었습니다.",
            "검은 단약이 남아 있었다는 사실은 살인 혐의를 약하게 했지만, 검은 코트 쪽지는 류진환을 대회장 밖으로 나가게 두지 않았습니다."
          ]
        },
        escapedDaniel,
        ashFuture,
        candyFuture
      ]
    },
    candy: {
      title: "캔디가 별도 조사실로 옮겨지자, 생일 편지는 증거 봉투에 남았습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "캔디",
          tone: "lost",
          paragraphs: [
            "조사관은 캔디에게 \"붉은 요리를 먹지 말라고 말했습니까\"라고 물었습니다. 캔디는 독을 넣지 않았다고 답했지만, 붉은 요리를 피하라는 부탁 자체는 부정하지 못했습니다.",
            "조사표에는 부녀 관계, 경쟁자 방해, 식사 선택에 개입한 말이 함께 적혔습니다.",
            "아버지에게 전하려던 축하 인사는 읽히지 않았습니다. 편지에서 먼저 읽힌 것은 \"아빠\"라는 호칭과 붉은 요리를 피하라는 부탁이었습니다."
          ]
        },
        escapedDaniel,
        ashFuture,
        ryuFuture
      ]
    },
    unresolved: {
      title: "공식 범인이 정해지지 않아, 네 사람의 이름은 서로 다른 봉투에 남았습니다.",
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
