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
    label: "사건 이후 · 다니엘의 식당",
    title: "다니엘",
    people: ["다니엘"],
    tone: "future",
    blocks: [
      "조사가 끝난 뒤 다니엘은 자신의 식당으로 돌아갔다. 예약부에는 취소선이 가득했지만 메뉴를 줄이거나 식당 이름을 바꾸지는 않았다. 그가 살인 혐의로 기소되지 않았다는 발표가 나오자 손님도 차츰 돌아왔다.",
      "4년 뒤 열린 승강전에서 다니엘은 석류와 와인을 졸인 붉은 소스 스테이크를 다시 냈다. 새 심사위원들은 고기와 소스를 함께 맛본 뒤 최고점을 주었다. 이번에는 접시에 소스가 남지 않았다.",
      "왕실 요리사가 된 다니엘은 이후의 정기 평가도 모두 통과했다. 사건이 일어난 지 12년 뒤에는 평생 바라던 왕실 요리장으로 임명됐다. 처음 심사를 맡은 날, 그는 참가자의 접시를 자기 앞으로 당겼다.",
      { speaker: "다니엘", text: "“평가는 접시를 비운 뒤에 하게. 다음 요리를 들이게.”" }
    ]
  };

  const ryuKeepsHisCover = {
    label: "사건 이후 · 류진환의 식당",
    title: "류진환",
    people: ["류진환"],
    tone: "future",
    blocks: [
      "류진환은 살인 혐의로 기소되지 않았고 까마귀 소속도 드러나지 않았다. 식당으로 돌아간 그는 매일 같은 시간에 문을 열었고, 다시 열릴 승강전을 준비했다.",
      "몇 해 뒤 류진환은 고수 쌀국수로 승강전을 통과해 왕실 요리사가 됐다. 왕실 주방장은 그에게 동방 식재료 손질과 국수 수라를 맡겼다.",
      "류진환이 까마귀에 보고한 것은 왕실 주방 출입증을 받았다는 사실뿐이었다. 애쉬와 함께 지낸 과거, 애쉬가 가져간 식재료 연구 노트, 왕실 주방에서 다시 만난 사실은 어느 보고에도 적지 않았다."
    ]
  };

  const ashKeepsHerPlace = {
    label: "사건 이후 · 왕실 주방",
    title: "애쉬",
    people: ["애쉬"],
    tone: "future",
    blocks: [
      "애쉬는 왕실 주방으로 돌아간 뒤 조살과를 다시 사용하지 않았다. 다음 정기 평가에서는 승강전 당일 망가졌던 해파리 냉채를 처음부터 다시 만들었다.",
      "이번에는 해파리를 직접 소금에 절이고, 정해진 시간 안에 물기를 빼서 간을 맞췄다. 평가가 끝난 뒤 돌아온 접시는 비어 있었고 애쉬는 왕실 요리사 자격을 지켰다.",
      "그 뒤 왕실 주방은 동방 식재료의 독성과 조리법을 확인하는 일을 애쉬에게 맡겼다. 애쉬는 새로 들어온 요리사들에게 재료별 가열 시간과 사용량을 빠짐없이 적게 했다.",
      { speaker: "애쉬", text: "“확인되지 않은 재료는 수라상에 올리지 마세요. 가열 시간과 사용량부터 적어 주세요.”" }
    ]
  };

  const candyKeepsHerPlace = {
    label: "사건 이후 · 왕실 주방",
    title: "캔디",
    people: ["캔디"],
    tone: "future",
    blocks: [
      "아버지가 죽은 뒤에도 캔디는 왕실 요리사로 남았다. 연회용 케이크와 과자를 직접 만들면서 다음 정기 평가를 준비했다.",
      "4년 뒤 열린 평가에서 캔디는 제과 부문 최고점을 받았다. 심사표에 아버지의 이름이 없는 상태에서 받은 첫 공식 점수였다. 그날부터 캔디는 왕실 연회의 케이크와 과자를 책임졌다.",
      "캔디는 동료와 다투더라도 상대의 재료에 손대지 않았다. 손이 모자란 날에는 무엇을 도우면 되는지 먼저 물었고, 부탁받은 재료만 만졌다.",
      "그해 아버지의 생일, 캔디는 대회 날과 같은 녹색 케이크를 구웠다. 연회 준비가 끝난 뒤 촛불 하나를 켜고 아버지가 앉던 의자 앞에 케이크를 놓았다.",
      { speaker: "캔디", text: "“아빠, 나 오늘 제과 평가에서 최고점 받았어. 이번에는 진짜 자랑해도 돼.”" }
    ]
  };

  const endings = {
    "daniel-accused": {
      title: "다니엘이 유죄 판결을 받은 뒤",
      intro: "",
      scenes: [
        ashKeepsHerPlace,
        ryuKeepsHisCover,
        {
          label: "사건 이후 · 왕실 주방",
          title: "캔디",
          people: ["캔디"],
          tone: "coda",
          blocks: [
            "다니엘의 재판이 끝난 날, 캔디는 애쉬를 찾아가 대회 전날 해파리를 설탕물에 다시 절인 사람이 자신이라고 밝혔다. 도와주려 했다는 변명은 덧붙이지 않았다. 애쉬는 대답하지 않은 채 자리를 떠났고, 두 사람은 오랫동안 같은 조리대를 쓰지 않았다.",
            "4년 뒤 정기 평가에서 캔디는 제과 부문 최고점을 받았다. 평가가 끝나자 캔디는 남은 케이크 한 조각을 애쉬 앞에 놓았다. 애쉬는 잠시 접시를 보다가 포크를 들었고, 한 조각을 다 먹은 뒤 빈 접시를 캔디에게 돌려주었다.",
            "그 뒤 캔디는 왕실 연회와 왕실 가족의 생일상을 맡았다. 사건이 일어난 지 12년째 되는 해에는 왕실 요리장으로 임명됐다.",
            "임명식이 끝난 날은 아버지의 생일이었다. 캔디는 대회 날 만들었던 녹색 케이크에 촛불 하나를 켜고, 왕실 요리장 임명장을 그 옆에 놓았다.",
            { speaker: "캔디", text: "“아빠, 생일 축하해. 나 오늘 왕실 요리장이 됐어. 이번에는 내 요리로 받은 자리야.”" }
          ]
        }
      ]
    },
    "ash-accused": {
      title: "애쉬가 왕실 요리사 자격을 잃은 뒤",
      intro: "",
      scenes: [
        candyKeepsHerPlace,
        {
          label: "그 이후 · 왕실 주방",
          title: "류진환",
          people: ["류진환"],
          tone: "future",
          blocks: [
            "류진환은 자신의 식당으로 돌아가 다음 승강전을 준비했다. 몇 해 뒤 고수 쌀국수로 승강전을 통과한 그는 왕실 요리사가 됐다.",
            "그러나 왕실 요리장이 죽은 뒤 끊긴 흑진주 유통망은 다시 만들지 않았다. 류진환은 왕궁의 감시가 심해 접선할 수 없다고 까마귀에 거짓으로 보고했다.",
            "류진환은 왕실 주방에서 동방 식재료와 국수 요리를 맡았다. 왕실 요리사가 된 뒤에는 흑진주를 왕궁에 반입하지 않았다."
          ]
        },
        danielWins,
        {
          label: "석방 이후 · 수도 외곽",
          title: "애쉬",
          people: ["애쉬"],
          tone: "coda",
          blocks: [
            "애쉬는 석방된 뒤 수도의 식당들을 찾아다녔다. 살인 혐의에서는 벗어났지만, 국왕에게 조살과 과육을 먹인 전력은 남았다. 왕실과 거래하는 식당들은 애쉬를 고용하지 않았다.",
            "수도 외곽의 한 여관만이 애쉬에게 설거지와 재료 손질을 맡겼다. 애쉬는 그날 들어온 식재료의 이름과 독성, 손질법을 장부에 적은 뒤 칼을 잡았다. 석 달 뒤 여관 주인은 저녁 국물과 냉채를 애쉬에게 맡겼다.",
            "애쉬는 그 주방에서 8년을 일했다. 모아 둔 돈으로 시장 골목에 작은 식당을 연 뒤에는 동방 식재료를 직접 검수하고 모든 조리법에 사용량과 가열 시간을 적었다. 개업 3년째에는 저녁 자리가 한 달 전부터 찼다.",
            "어느 날, 추천장도 경력을 보증해 줄 스승도 없는 젊은 요리사가 일자리를 구하러 왔다. 애쉬는 어디서 배웠는지 묻지 않고, 가져온 재료의 이름과 손질법부터 설명해 보라고 했다.",
            { speaker: "애쉬", text: "“추천장은 필요 없어요. 이 재료를 안전하게 다룰 수 있는지 보여 주세요.”" },
            "지원자가 설명을 마치자 애쉬는 비어 있는 조리대를 내주었다. 완성된 요리를 맛본 뒤에는 근무 장부를 펼쳤다.",
            { speaker: "애쉬", text: "“내일 여섯 시까지 오세요. 첫날 준비는 같이 하죠.”" },
            "그날 저녁, 애쉬는 근무 장부에 새 조리사의 이름을 적었다. 식당 출입문 옆에는 ‘주방장 애쉬’라고 적힌 작은 명패가 걸려 있었다."
          ]
        }
      ]
    },
    "ryu-accused": {
      title: "류진환이 까마귀의 요원으로 밝혀진 뒤",
      intro: "",
      scenes: [
        {
          label: "사형 집행 전날 · 왕궁 접견실",
          title: "류진환과 애쉬",
          people: ["류진환", "애쉬"],
          tone: "lost",
          blocks: [
            "사형 집행 전날, 애쉬에게 한 차례 면회가 허락됐다. 두 사람 사이에는 탁자 하나가 놓였고 경비병은 문 앞을 지켰다.",
            { speaker: "애쉬", text: "“나를 살려 준 사람이 흑진주를 만들었다는 게 아직도 이해되지 않아요.”" },
            { speaker: "류진환", text: "“돈을 받고 시작했다. 조직에 들어간 뒤에도 멈추지 않았다. 변명하지 않겠다.”" },
            { speaker: "애쉬", text: "“6년 전에는 왜 아무 말도 하지 않았어요?”" },
            { speaker: "류진환", text: "“말했으면 넌 남으려 했을 테니까.”" },
            { speaker: "애쉬", text: "“그랬겠죠. 그래도 결정은 제가 했어야 했어요.”" },
            { speaker: "류진환", text: "“그래. 그건 내가 잘못했다.”" },
            { speaker: "애쉬", text: "“고맙다는 말도, 용서한다는 말도 못 하겠어요.”" },
            { speaker: "류진환", text: "“그럴 필요 없다.”" },
            "애쉬는 자리에서 일어났다. 류진환은 붙잡지 않았다. 사형은 다음 날 집행됐다."
          ]
        },
        {
          label: "사형 집행 며칠 뒤 · 왕실 주방",
          title: "캔디와 애쉬",
          people: ["캔디", "애쉬"],
          tone: "future",
          blocks: [
            "류진환을 수사하는 과정에서 왕실 요리장도 까마귀의 요원이었다는 사실이 밝혀졌다. 캔디는 아버지가 왕궁에 잠입한 까마귀의 요원이었다는 사실을 알게 됐고, 애쉬는 류진환이 흑진주를 만든 사람이라는 사실을 알게 됐다.",
            "사형 집행 며칠 뒤, 애쉬는 왕실 주방으로 돌아왔다. 캔디는 옆 조리대에서 애쉬가 해파리를 손질하는 모습을 지켜보다가 먼저 입을 열었다.",
            { speaker: "캔디", text: "“아빠가 잘못한 사람인 건 알아. 그래도 보고 싶어.”" },
            { speaker: "애쉬", text: "“나도 그래.”" },
            "캔디는 애쉬의 조리대에 놓인 그릇을 가리켰다.",
            { speaker: "캔디", text: "“해파리, 씻어 둘까?”" },
            { speaker: "애쉬", text: "“내 조리대에는 손대지 마.”" },
            { speaker: "캔디", text: "“알겠어.”" },
            "캔디는 손을 거두고 자기 조리대로 돌아갔다. 애쉬는 해파리를 씻다가 그릇을 캔디 쪽으로 밀었다.",
            { speaker: "애쉬", text: "“소금기만 빼 줘.”" },
            { speaker: "캔디", text: "“응.”" }
          ]
        },
        danielWins,
        {
          label: "그 후 · 왕실 주방",
          title: "캔디와 애쉬",
          people: ["캔디", "애쉬"],
          tone: "coda",
          blocks: [
            "왕실 수사대는 캔디가 아버지의 도움으로 왕실 요리사가 된 과정을 다시 조사했다. 캔디는 부녀 관계를 공개한 상태에서 별도의 실기 평가를 받았고, 제과 부문 최고점으로 자격을 지켰다.",
            "애쉬는 조살과를 다시 사용하지 않았다. 애쉬는 사건에서 회수된 이방 식자재 연구 노트를 다시 검토해 금지 재료 목록과 식재료별 사용량, 가열 시간을 정리했다. 왕실 주방은 그 기록을 검수 기준으로 채택했다.",
            "애쉬가 다시 만든 해파리 냉채는 왕실의 정식 수라에 올랐다. 캔디는 연회용 케이크와 과자를 맡았다. 두 사람은 상대의 재료가 필요할 때 먼저 허락을 구했다.",
            "사건이 일어난 지 12년 뒤, 캔디는 왕실 연회와 제과를 책임지는 수석 요리사가 됐다. 애쉬는 동방 요리와 식재료 검수를 책임지는 주방장이 됐다.",
            "그해 아버지의 생일에 캔디는 대회 날 만들었던 녹색 케이크를 다시 구웠다. 연회 준비가 끝난 뒤에도 애쉬는 주방에 남아 있었다.",
            { speaker: "캔디", text: "“한 조각 먹을래?”" },
            { speaker: "애쉬", text: "“작게 잘라.”" },
            "캔디는 케이크를 작게 잘라 애쉬에게 건넸다. 두 사람은 주방 불을 끄기 전에 케이크를 나누어 먹었다."
          ]
        }
      ]
    },
    "candy-accused": {
      title: "캔디가 왕실 요리사 자격을 잃은 뒤",
      intro: "",
      scenes: [
        ryuKeepsHisCover,
        ashKeepsHerPlace,
        danielWins,
        {
          label: "석방 이후 · 수도 외곽의 제과점",
          title: "캔디",
          people: ["캔디"],
          tone: "coda",
          blocks: [
            "캔디는 석방된 뒤 수도 외곽에 작은 제과점을 열었다. 왕실과 귀족가의 주문은 끊겼고, 처음 몇 달은 케이크를 사려는 사람보다 살인 용의자였던 캔디를 보러 오는 사람이 많았다.",
            "캔디는 손님이 적은 날에도 같은 시간에 문을 열었다. 케이크와 과자를 직접 진열하고, 한 번 산 손님이 다시 찾아올 때까지 매일 가게를 지켰다.",
            "8년 뒤에는 제과 보조를 두고 예약 주문을 받을 만큼 손님이 늘었다. 캔디는 새로 들어온 보조가 만든 음식에 손대기 전에 무엇을 도우면 되는지 먼저 물었다.",
            "아버지의 생일이 돌아오자 캔디는 대회에서 만들었던 녹색 케이크를 다시 구웠다. 마지막 손님이 나간 뒤 작은 케이크에 촛불을 켰다.",
            { speaker: "캔디", text: "“아빠, 오늘이 아빠 생일이네. 이제 내 케이크를 다시 사러 오는 손님도 있어.”" }
          ]
        }
      ]
    },
    "other-accused": {
      title: "무고한 사람이 지목된 뒤",
      intro: "",
      scenes: [
        {
          label: "4년 뒤 · 왕실 법정 앞",
          title: "지목된 인물",
          tone: "lost",
          blocks: [
            "왕실 법정은 지목된 사람이 사건에 관여했다는 증거를 찾지 못해 살인 혐의를 기각했다. 4년 만에 석방 명령이 내려졌지만, 살인 용의자로 체포됐다는 소문은 이미 수도 전역에 퍼진 뒤였다.",
            "구금된 동안 비어 있던 직위에는 다른 사람이 임명됐고 거래처도 새 계약을 맺었다. 지목된 사람은 무혐의 결정문을 들고 밖으로 나왔지만, 돌아갈 일터는 남아 있지 않았다."
          ]
        },
        ryuKeepsHisCover,
        ashKeepsHerPlace,
        candyKeepsHerPlace,
        {
          ...danielWins,
          tone: "coda"
        }
      ]
    },
    tie: {
      title: "사건이 미제로 남은 뒤",
      intro: "",
      scenes: [
        {
          label: "수사 4년째 · 왕실 법정",
          title: "류진환",
          people: ["류진환"],
          tone: "lost",
          blocks: [
            "류진환은 왕실 요리장 살인 혐의를 벗었다. 그러나 까마귀 소속과 흑진주 제조, 수도시설을 노린 임무가 드러났다.",
            "왕실 법정은 간첩 행위와 수도시설 중독 계획을 유죄로 판단해 류진환에게 사형을 선고했다. 사형은 그대로 집행됐다."
          ]
        },
        {
          label: "4년 뒤 · 수도의 식당가",
          title: "다니엘",
          people: ["다니엘"],
          tone: "lost",
          blocks: [
            "다니엘은 4년 동안 살인 혐의를 부인했다. 왕실 법정은 그를 유죄로 선고하지 못했지만, 수사가 끝날 때까지 석방하지도 않았다.",
            "다니엘이 구금된 동안 식당은 문을 닫았고 함께 일하던 요리사들은 다른 곳으로 떠났다. 석방 뒤에는 미제 살인 사건의 용의자였다는 이유로 승강전 참가 신청이 받아들여지지 않았다.",
            "다니엘은 수도 변두리에 작은 식당을 다시 열었다. 손님은 있었지만 왕족과 귀족의 예약은 돌아오지 않았고, 왕실 요리장이 되겠다는 목표도 이룰 수 없었다."
          ]
        },
        {
          label: "4년 뒤 · 왕실 법정",
          title: "애쉬",
          people: ["애쉬"],
          tone: "lost",
          blocks: [
            "애쉬는 살인 혐의를 벗었지만 국왕과 기미상궁에게 허가되지 않은 조살과 과육을 먹인 죄로 징역 4년을 선고받았다. 왕실 요리사 자격도 함께 박탈됐다.",
            "석방된 애쉬는 수도 외곽의 식당에서 재료 손질과 설거지를 맡았다. 다시 주방을 책임질 기회는 얻지 못했지만 요리를 그만두지는 않았다."
          ]
        },
        {
          label: "4년 뒤 · 수도 외곽",
          title: "캔디",
          people: ["캔디"],
          tone: "lost",
          blocks: [
            "캔디는 살인 혐의를 벗었지만 부녀 관계와 이전 심사의 특혜가 밝혀져 왕실 요리사 자격을 잃었다. 조사 기간에 캔디가 비운 자리는 다른 요리사가 맡았다.",
            "석방된 캔디는 작은 제과점에서 주문받은 과자를 만들었다. 왕실과 귀족가에서는 주문이 들어오지 않았고, 캔디는 다시 왕실 요리사로 지원할 수 없었다."
          ]
        },
        {
          label: "다음 왕실 요리사 승강전",
          title: "네 사람이 빠진 승강전",
          tone: "coda",
          blocks: [
            "다음 승강전에는 네 사람 중 누구도 참가하지 못했다. 애쉬와 캔디가 비운 자리는 새 요리사들이 채웠고, 다니엘의 이름은 도전자 명단에서 빠졌다.",
            "왕실 법정은 누구에게도 왕실 요리장 살인죄를 선고하지 못했다. 수사 기록은 종결되지 않은 채 보관됐고, 사건은 미제로 남았다."
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
