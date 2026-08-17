(function () {
  const script = document.currentScript;
  const outcome = script && script.dataset ? script.dataset.outcome : "";

  const data = {
    daniel: {
      title: "4년 뒤, 왕실 요리사 승강전이 다시 열렸다.",
      cards: [
        {
          label: "다시 열린 승강전",
          name: "애쉬",
          tone: "future",
          paragraphs: [
            "조살과 과육을 사용한 사실이 드러난 애쉬는 왕실 요리사 자격을 잃었다. 네 해 뒤 다시 조리대 앞에 선 그녀는 조살과도, 낯선 약초도 가져오지 않았다.",
            "애쉬가 내놓은 음식에는 자신이 익힌 기술과 조살과를 제외한 식재료만 들어 있었다. 이번에는 결과가 나오기 전부터 숨겨야 할 재료가 없었다."
          ]
        },
        {
          label: "다시 열린 승강전",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "캔디도 부녀 관계와 심사 개입이 밝혀져 자격을 잃었다. 네 해 뒤, 심사석에 아버지가 없는 승강전에 다시 참가했다.",
            "이번에는 누구에게도 특정 요리를 피하라고 부탁하지 않았다. 캔디는 자신이 만든 요리를 정해진 순서대로 내놓고 끝까지 결과를 기다렸다."
          ]
        },
        {
          label: "왕궁 조사",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "검은 함과 코트의 쪽지는 류진환이 까마귀의 요원이라는 사실을 드러냈다. 그는 왕실 요리사 선발장이 아니라 왕궁의 조사에서 흑진주의 목적을 설명해야 했다."
          ]
        }
      ]
    },
    "ash-admit": {
      title: "4년 뒤, 애쉬는 다시 조리대 앞에 섰다.",
      cards: [
        {
          label: "다음 승강전",
          name: "애쉬",
          tone: "future",
          paragraphs: [
            "조살과 사용을 인정한 애쉬는 왕실 요리사 자격을 잃었다. 네 해 뒤 다시 승강전에 참가했을 때, 그녀의 재료함에는 조살과가 없었다.",
            "애쉬는 한 번의 강한 맛으로 실패를 덮지 않았다. 정해진 시간 동안 자신이 준비한 재료만으로 요리를 완성했다."
          ]
        }
      ]
    },
    "ash-ryu": {
      title: "류진환의 검은 단약은 왕궁에서 회수됐다.",
      cards: [
        {
          label: "사건 이후",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "류진환이 건넨 검은 단약은 회수됐다. 호수나 우물에 넣으라는 지시도 공개돼, 그 단약이 왕궁의 물에 들어갈 가능성은 사라졌다.",
            "류진환은 까마귀의 임무를 숨기지 못했다. 애쉬가 자신을 살리려고 한 말은 아니었지만, 결과적으로 더 많은 사람이 흑진주에 노출되는 일은 막았다."
          ]
        }
      ]
    },
    "ash-candy": {
      title: "4년 뒤, 애쉬와 캔디는 다시 같은 승강전에 참가했다.",
      cards: [
        {
          label: "다음 승강전",
          name: "애쉬와 캔디",
          tone: "future",
          paragraphs: [
            "애쉬는 조살과 사용으로, 캔디는 경쟁자의 재료와 심사에 개입한 일로 왕실 요리사 자격을 잃었다.",
            "네 해 뒤 두 사람은 서로 떨어진 조리대에 섰다. 캔디는 애쉬의 준비대에 손대지 않았고, 애쉬는 조살과를 가져오지 않았다. 두 사람은 처음으로 상대가 아니라 자기 요리만 책임졌다."
          ]
        }
      ]
    },
    "ryu-silent": {
      title: "류진환은 붙잡힌 뒤에도 같은 대답을 반복했다.",
      cards: [
        {
          label: "왕궁 조사",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "누가 검은 단약을 만들었는지, 왕실 요리장이 왜 그것을 받았는지 묻는 말에 류진환은 대답하지 않았다.",
            "까마귀의 이름도 애쉬의 이름도 그의 입에서 나오지 않았다. 애쉬는 류진환이 자신을 내쫓은 이유를 끝내 듣지 못했다."
          ]
        }
      ]
    },
    "ryu-confess": {
      title: "검은 단약은 끝내 왕궁의 물에 들어가지 못했다.",
      cards: [
        {
          label: "사건 이후",
          name: "류진환",
          tone: "lost",
          paragraphs: [
            "류진환의 진술에 따라 검은 단약과 지시문은 함께 압수됐다. 왕실 요리장과 까마귀의 접선도 더 이어질 수 없었다.",
            "류진환은 자유를 잃었지만, 자신이 만든 흑진주가 호수나 우물에 사용되는 일도 막았다."
          ]
        }
      ]
    },
    "ryu-protect": {
      title: "애쉬는 6년 만에 류진환에게서 떠나야 했던 이유를 들었다.",
      cards: [
        {
          label: "마지막 대면",
          name: "류진환과 애쉬",
          tone: "future",
          paragraphs: [
            "류진환은 까마귀의 감시에서 애쉬를 떼어 놓기 위해 일부러 관계를 끊었다고 말했다. 애쉬는 그가 경비병을 따라가기 직전에야 6년 전의 이유를 들었다.",
            "그 말이 애쉬의 조살과 사용을 없던 일로 만들지는 않았다. 다만 류진환이 자신을 버린 것이 아니라 보호하려 했다는 사실은 알게 됐다."
          ]
        }
      ]
    },
    "candy-hide": {
      title: "캔디는 왕실 요리사 자격을 잃었다.",
      cards: [
        {
          label: "사건 이후",
          name: "캔디",
          tone: "lost",
          paragraphs: [
            "부녀 관계와 심사 개입이 확인되면서 캔디는 왕실 요리사 자격을 잃었다. 끝까지 부정했던 탓에 아버지를 지키려 했다는 설명도 쉽게 받아들여지지 않았다.",
            "캔디는 범인을 찾지 못했고, 아버지에게 준비한 생일 편지도 직접 전할 수 없었다."
          ]
        }
      ]
    },
    "candy-confess": {
      title: "4년 뒤, 캔디는 다른 심사위원 앞에서 승강전에 다시 도전했다.",
      cards: [
        {
          label: "다음 승강전",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "심사 개입을 인정한 캔디는 왕실 요리사 자격을 잃었다. 네 해 뒤 다시 참가했을 때, 심사 과정에 개입할 가족은 없었다.",
            "캔디는 모든 요리를 자기 손으로 준비했다. 다른 참가자의 재료에도, 심사위원의 선택에도 손대지 않고 결과를 기다렸다."
          ]
        }
      ]
    },
    "candy-steak": {
      title: "4년 뒤, 캔디는 자신의 요리만으로 왕실 주방에 돌아왔다.",
      cards: [
        {
          label: "다음 승강전",
          name: "캔디",
          tone: "future",
          paragraphs: [
            "캔디는 부녀 관계와 심사 개입 때문에 한 차례 왕실 주방을 떠났다. 네 해 뒤 다시 열린 승강전에서 그녀는 가장 많은 점수를 받아 왕실 요리사 자리를 되찾았다.",
            "이번 심사에는 아버지의 윙크도, 먹지 말아 달라는 부탁도 없었다. 심사위원들은 캔디가 만든 요리만 평가했다."
          ]
        }
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
      const paragraphs = card.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
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
