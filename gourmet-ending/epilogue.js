(function () {
  const script = document.currentScript;
  const outcome = script && script.dataset ? script.dataset.outcome : "";

  const escapedDaniel = {
    label: "후일담",
    name: "다니엘",
    tone: "danger",
    paragraphs: [
      "다니엘은 우승하지 못했습니다. 살인범으로 발표되지도 않았습니다. 승강전은 무산됐고, 공보문 첫 장에는 금지 식재료와 왕궁 보안 문제가 올라갔습니다.",
      "몇 달 뒤 사설 만찬 안내문에는 \"국왕이 끝까지 시식한 스테이크\"라는 문구가 붙었습니다. 붉은 소스는 메뉴에서 빠졌습니다. 새 접시에는 산미 없는 검은 후추 소스가 올라갔고, 다니엘은 시식 기록지부터 확인했습니다."
    ]
  };

  const ashFuture = {
    label: "후일담",
    name: "애쉬",
    tone: "future",
    paragraphs: [
      "애쉬는 금지 식재료 사용으로 정직 처분을 받았습니다. 그녀는 왕궁 밖 하숙집 주방에서 매일 식재료 이름과 사용량을 장부에 적었습니다.",
      "복직 심사 날, 애쉬가 낸 해파리 냉채에는 조살과도 강한 향신료도 없었습니다. 접시가 반쯤 남았는데도 그녀는 새 소스를 더 붓지 않았습니다."
    ]
  };

  const ryuFuture = {
    label: "후일담",
    name: "류진환",
    tone: "future",
    paragraphs: [
      "류진환은 살인범으로 구속되지는 않았습니다. 대신 왕궁 감찰관에게 정기 출석 명령을 받았습니다. 그는 동쪽 시장 끝에 작은 국수대를 빌렸습니다.",
      "밤이 되면 그는 약초장 맨 아래칸을 비워 두었습니다. 조살과 이름이 적힌 병은 그 칸으로 돌아오지 않았고, 국물 냄비에는 고수와 닭뼈만 들어갔습니다."
    ]
  };

  const candyFuture = {
    label: "후일담",
    name: "캔디",
    tone: "future",
    paragraphs: [
      "캔디는 왕실 주방 출입 정지를 받았습니다. 아버지 이름으로 열리던 문은 닫혔습니다. 그녀는 성 밖 제과 공방에서 생일 케이크 주문부터 다시 받았습니다.",
      "다음 승강전 신청서에서 추천인 칸은 비워 두었습니다. 경력란 첫 줄에는 \"왕실 주방 견습 보조\"라고 썼고, 제출 요리에는 초록색 장식이 올라갔습니다. 심사관이 누구의 딸이냐고 묻지 않았을 때, 캔디는 처음으로 조용히 기다렸습니다."
    ]
  };

  const data = {
    daniel: {
      title: "다니엘이 구속된 뒤에도, 세 사람은 각자 다른 처분을 받았습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "다니엘",
          tone: "lost",
          paragraphs: [
            "경비대가 수갑을 채우는 동안, 다니엘은 조리복 앞섶을 스스로 맞췄습니다. 조사관이 조살과 씨앗을 적자 그는 붉은 소스 이야기를 더 하려 했지만, 왕이 손을 들어 말을 끊었습니다.",
            "우승자 명패가 놓일 자리에는 증거 번호가 붙었습니다. 다니엘이 마지막으로 본 것은 피해자의 빈 접시가 아니라, 왕의 접시에 말라붙은 붉은 소스였습니다."
          ]
        },
        ashFuture,
        ryuFuture,
        candyFuture
      ]
    },
    ash: {
      title: "애쉬가 별실로 옮겨진 뒤, 조사표는 세 갈래로 나뉘었습니다.",
      cards: [
        {
          label: "마지막 장면",
          name: "애쉬",
          tone: "lost",
          paragraphs: [
            "별실 문 앞에서 조사관이 \"씨앗\"이라고 적자, 애쉬는 곧바로 \"과육입니다\"라고 정정했습니다. 그 정정은 그녀를 풀어 주지 못했습니다.",
            "그녀가 마지막으로 고친 단어는 그것 하나였습니다. 살인 혐의 조서가 열렸고, 조리복 소매에서는 고추장 냄새가 희미하게 올라왔습니다."
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
            "류진환은 조사관이 소속을 묻자 대답하지 않았습니다. 이름을 묻는 질문에만 \"류진환\"이라고 답했습니다.",
            "경비대가 그를 데려갈 때, 그는 애쉬 쪽을 보지 않았습니다. 고개를 돌리면 애쉬에게도 같은 질문이 갈 것을 알았습니다. 조사실 문이 닫힐 때까지 그는 \"살인은 하지 않았다\"는 말을 꺼내지 못했습니다."
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
            "캔디는 조사관의 질문을 듣고도 대회장 안쪽으로 돌아가지 못했습니다. \"붉은 요리를 먹지 말라고 말했습니까\"라는 질문이 나오자, 그녀는 항의하던 말을 멈췄습니다.",
            "왕실 주방 출입 권한은 그 자리에서 정지됐습니다. 빈 심사석은 치워지지 않았고, 캔디는 아버지에게 줄 말을 조사실 문 앞에서 더 하지 못했습니다."
          ]
        },
        escapedDaniel,
        ashFuture,
        ryuFuture
      ]
    },
    unresolved: {
      title: "공식 범인이 비어 있는 동안, 조사 대상 명단은 닫히지 않았습니다.",
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
