/**
 * 의사가 너무 많아! · 엔딩 진행 상태
 *
 * 판의 결과는 전부 URL 쿼리 스트링에 담는다. 서버도 저장소도 쓰지 않으므로
 * 링크 하나만 넘기면 다른 기기에서도 같은 결말이 그대로 열린다.
 *
 *   a  구속된 인물   talisman,acupunct,priest,plague,herbal,western (쉼표 구분, 없으면 생략)
 *   r  부활 선언     1 선언 / 0 선언하지 않음
 *   v  의식 개시     1 시작 / 0 중단 (결과만 기록한다)
 *   k  확보한 물건   note,talis,card1,water
 *   m  약의 조달     join 양의사가 함께 감 / deny 등을 돌림 / shut 약고가 닫힘
 *   p  사제의 답     agree 성수를 뿌린다 / barehand 맨손으로 피운다 (→엔딩1)
 *                   allow 막지 않는다 / absent 포박 / bypassed 양의사가 먼저 뿌림(사제가 자유로운 판)
 *                   (→ 성수를 든 손이 결말을 정한다)
 *                   avert 거둔다 / unable 맨손을 못 낸다 (→엔딩2)
 *   h  누가 들었나   western 양의사 / other 다른 사람 (→엔딩1) / none 아무도 (→엔딩2)
 *   c  양의사의 성수병 1 가만히 둔다 | 2 떨어뜨린다 | 3 던진다
 *   n  아홉 번째 침   full 세침통이 갖추어져 있었다 / lent 역병의사가 제 침을 내주었다
 */
(function (global) {
  'use strict';

  /** 여섯 의사. id는 캐릭터_상징색.md의 색 변수명과 맞춘다. */
  // 설명은 오프닝 자기소개에서 이미 공개된 진료 순서만 쓴다.
  // 신분·비밀은 아직 밝혀지지 않았을 수 있으므로 화면에 적지 않는다.
  var DOCTORS = [
    { id: 'talisman', name: '부적술사', role: '1시 진료' },
    { id: 'herbal', name: '한의사', role: '2시 진료' },
    { id: 'acupunct', name: '침술사', role: '3시 진료' },
    { id: 'priest', name: '사제', role: '4시 진료' },
    { id: 'plague', name: '역병의사', role: '5시 진료' },
    { id: 'western', name: '양의사', role: '6시 진료' }
  ];

  var VALID_IDS = DOCTORS.map(function (d) { return d.id; });

  /**
   * 4단계. 태워야 할 것은 왕에게 내려오는 기운이다.
   *
   * 성수는 누가 들어도 한 번은 반응한다 — 맨손의 불만이 사제의 것이다.
   * 그래서 성수가 온전한 판에서 사제의 답은 넷으로 갈린다:
   * 성수를 뿌린다 / 손에서 화염을 불러낸다 / 관망한다 / 거둔다.
   * 병이 깨진 판에는 맨손밖에 남지 않으므로 피운다 / 못 피운다 둘이다.
   * 관망했거나 사제가 묶여 있으면 성수는 테이블로 열리고, 누가 드는지를 따로 정한다.
   */
  var PRIEST_FIRE = ['agree', 'barehand'];   // 사제가 제 손으로 불을 들었다
  var PRIEST_OPEN = ['allow', 'absent', 'bypassed']; // 성수가 남의 손에 열린다 (허용 / 포박 / 선수를 빼앗김)
  var PRIEST_NO = ['avert', 'unable'];       // 그 자리에서 끝난다
  var PRIEST_ALL = PRIEST_FIRE.concat(PRIEST_OPEN, PRIEST_NO);

  var HANDS_FIRE = ['western', 'other'];     // 누군가 성수를 들었다
  var HANDS_ALL = HANDS_FIRE.concat(['none']);

  /**
   * 부활 의식의 단계와 물건. actor가 그 단계를 수행하는 담당자다.
   * actorNeeded는 담당자 본인이 없으면 그 단계가 성립하지 않는다는 뜻이다.
   * 1단계는 종이에 적힌 처방이라 담당자를 대신할 수 있고(한의사 호정 본인도
   * 형의 노트대로 달였을 뿐이다), 2·3단계는 손끝에 붙은 기술이라 대체할 수 없다.
   * 판정은 의식이 시작된 뒤 단계 질문에서만 이루어진다 — 지목 결과 화면에서
   * 미리 막아 버리면 "누가 필수인지"가 투표 전에 새므로, 조기 차단은
   * 부활을 선포할 유일한 인물인 역병의사가 포박된 경우뿐이다.
   */
  var KEYS = [
    { id: 'note',  step: 1, name: '형의 당부 수첩과 남은 약재', actor: 'herbal',   need: true,  actorNeeded: false },
    { id: 'talis', step: 2, name: '붉은 부적과 대못과 밀짚인형', actor: 'talisman', need: true,  actorNeeded: true },
    { id: 'card1', step: 3, name: '조건 달성 카드 1',           actor: 'acupunct', need: true,  actorNeeded: true },
    { id: 'water', step: 4, name: '성수',                       actor: 'priest',   need: false, actorNeeded: true }
  ];

  var VALID_KEYS = KEYS.map(function (k) { return k.id; });
  var REQUIRED_KEYS = KEYS.filter(function (k) { return k.need; }).map(function (k) { return k.id; });

  function doctor(id) {
    for (var i = 0; i < DOCTORS.length; i++) {
      if (DOCTORS[i].id === id) return DOCTORS[i];
    }
    return null;
  }

  function keyOf(id) {
    for (var i = 0; i < KEYS.length; i++) {
      if (KEYS[i].id === id) return KEYS[i];
    }
    return null;
  }

  function names(ids) {
    return (ids || []).map(function (id) {
      var d = doctor(id);
      return d ? d.name : id;
    });
  }

  /** 현재 URL에서 판의 상태를 읽는다. 값이 이상하면 조용히 버린다. */
  function read(search) {
    var q = new URLSearchParams(search !== undefined ? search : global.location.search);
    var st = { arrested: null, revive: null, vote: null, keys: null, med: null, priest: null, hands: null, choice: null, needle: null };

    if (q.has('a')) {
      st.arrested = (q.get('a') || '')
        .split(',')
        .map(function (v) { return v.trim(); })
        .filter(function (v) { return VALID_IDS.indexOf(v) !== -1; });
    } else if (q.has('r') || q.has('none')) {
      // 아무도 구속하지 않은 판. a가 비어 있어도 진행된 판임을 알 수 있다.
      st.arrested = [];
    }

    if (q.has('r')) st.revive = q.get('r') === '1';

    var v = q.get('v');
    if (v === '1' || v === '0') st.vote = v === '1';

    if (q.has('k')) {
      st.keys = (q.get('k') || '')
        .split(',')
        .map(function (x) { return x.trim(); })
        .filter(function (x) { return VALID_KEYS.indexOf(x) !== -1; });
    }

    var m = q.get('m');
    if (['join', 'deny', 'shut'].indexOf(m) !== -1) st.med = m;

    var p = q.get('p');
    if (PRIEST_ALL.indexOf(p) !== -1) st.priest = p;

    var h = q.get('h');
    if (HANDS_ALL.indexOf(h) !== -1) st.hands = h;

    var n = q.get('n');
    if (['full', 'lent'].indexOf(n) !== -1) st.needle = n;

    var c = Number(q.get('c'));
    if (c === 1 || c === 2 || c === 3) st.choice = c;

    return st;
  }

  /** 상태를 쿼리 스트링으로 만든다. 앞의 '?'까지 포함해 돌려준다. */
  function query(st) {
    var q = new URLSearchParams();

    if (st.arrested && st.arrested.length) q.set('a', st.arrested.join(','));
    else if (st.arrested) q.set('none', '1');

    if (st.revive !== null && st.revive !== undefined) q.set('r', st.revive ? '1' : '0');

    if (st.vote !== null && st.vote !== undefined) q.set('v', st.vote ? '1' : '0');
    if (st.keys) q.set('k', st.keys.join(','));

    if (st.med) q.set('m', st.med);
    if (st.priest) q.set('p', st.priest);
    if (st.hands) q.set('h', st.hands);
    if (st.choice) q.set('c', String(st.choice));
    if (st.needle) q.set('n', st.needle);

    var s = q.toString();
    return s ? '?' + s : '';
  }

  /** 구속자 목록으로 부활 선포 가능 여부와 포기 시 도달할 엔딩을 판정한다. */
  function judge(arrested) {
    var list = arrested || [];
    // 조기 차단은 역병의사뿐 — 나머지 담당자의 부재는 의식 단계에서 실패로 드러난다.
    var blockers = list.indexOf('plague') !== -1 ? ['plague'] : [];

    return {
      arrested: list,
      blockers: blockers,
      reviveBlocked: blockers.length > 0,
      priestGone: list.indexOf('priest') !== -1,
      culpritCaught: list.indexOf('western') !== -1,
      // 부활을 포기했을 때 도달하는 엔딩 (경로 ②)
      giveUpEnding: list.indexOf('western') !== -1 ? 4 : (list.length ? 5 : 6),
      // 의식이 끝까지 성공했을 때 도달하는 엔딩
      bestEnding: list.indexOf('priest') !== -1 ? 2 : 1
    };
  }

  /** 의식에 찬성할 자격이 있는 인원. 포박된 자는 의식에 관여할 수 없다. */
  function voters(arrested) {
    var out = arrested || [];
    return VALID_IDS.filter(function (id) { return out.indexOf(id) === -1; });
  }

  /**
   * 1~3단계 판정. 담당자가 포박되었거나 물건이 나오지 않은 단계를 돌려준다.
   * keys가 null이면 물건 판정은 건너뛰고 담당자 포박만 본다 (단계 화면 진입 전).
   *
   * ※ 판이 끝난 뒤에만 부른다. 물건은 단계를 통과할 때마다 하나씩 붙으므로,
   *   진행 중에 부르면 아직 이르지 않은 단계가 전부 '물건 없음'으로 잡힌다 —
   *   2단계 화면에서 "2단계 실패"가 되는 식이다. 진행 중인 화면은 이 값을
   *   쓰지 말고, 지금 서 있는 자리를 화면이 스스로 말하게 둔다.
   */
  function failedSteps(arrested, keys) {
    var out = arrested || [];
    return KEYS.filter(function (k) { return k.need; }).map(function (k) {
      var actorGone = k.actorNeeded && out.indexOf(k.actor) !== -1;
      var keyMissing = keys !== null && keys !== undefined && keys.indexOf(k.id) === -1;
      if (!actorGone && !keyMissing) return null;
      return { step: k.step, key: k.id, name: k.name, actor: k.actor, actorGone: actorGone, keyMissing: keyMissing };
    }).filter(Boolean);
  }

  /** 확보하지 못한 필수 물건. */
  function missingKeys(keys) {
    var have = keys || [];
    return REQUIRED_KEYS.filter(function (k) { return have.indexOf(k) === -1; });
  }

  /** 상태가 가리키는 엔딩 번호. 아직 정해지지 않았으면 null. */
  function ending(st) {
    if (!st.arrested) return null;
    var v = judge(st.arrested);

    // 역병의사가 포박되면 부활을 선포할 사람 자체가 없다.
    if (v.reviveBlocked) return v.giveUpEnding;

    if (st.revive === false) return v.giveUpEnding;
    if (st.revive !== true) return null;

    if (st.vote === null || st.vote === undefined) return null;
    if (!st.vote) return v.giveUpEnding;

    // 약이 오지 않아 1단계에서 멈춘 판은 확보한 물건이 하나도 없다.
    // 시신에 손대기 전에 끝났으므로 이단이 아니라 경로 ②다.
    if (haltedOnMedicine(st)) return v.giveUpEnding;

    if (!st.keys) return null;

    // 분기점은 왕의 시신에 손을 댔는가다. 1단계 실패는 약이 오지 않아
    // 시작조차 못 한 것이므로 이단 주술을 행한 적이 없다 — 경로 ②로 간다.
    // 2단계부터가 이단이며, 그 실패만 엔딩 3으로 간다.
    var fails = failedSteps(st.arrested, st.keys);
    if (fails.length) return fails[0].step === 1 ? v.giveUpEnding : 3;

    if (!st.priest) return null;
    if (PRIEST_FIRE.indexOf(st.priest) !== -1) return 1;

    // 사제가 막지 않았거나 묶여 있으면, 성수를 든 손이 있었는지가 결말을 정한다.
    if (PRIEST_OPEN.indexOf(st.priest) !== -1) {
      if (!st.hands) return null;
      return HANDS_FIRE.indexOf(st.hands) !== -1 ? 1 : 2;
    }
    return 2;
  }

  /** 의식이 시작됐다가 약을 짓지 못해 중단된 판인가 (경로 ②의 ㉡ 도입부). */
  function haltedOnMedicine(st) {
    return st.med === 'deny' || st.med === 'shut';
  }

  /**
   * 부활 판정의 페이지들. 갈래마다 파일이 하나씩 있고, 어느 파일로 갈지는
   * 아래 nextPage 한 곳에서만 정한다 — 각 화면의 HTML에는 조건 분기를 두지 않는다.
   */
  var PAGES = {
    arrest: 'index.html',           // 지목 결과 입력
    declare: '1-declare.html',      // 부활 선언
    consent: '2-consent.html',      // 찬반 투표
    queen: '2-1-queen.html',        // 왕비의 되물음 (무구속 판에서 물러섰을 때)
    ritual: '3-ritual.html',        // 의식 준비
    step1Free: '4-1-herbal.html',   // 한의사가 자리에 있다
    step1Held: '4-1-central.html',  // 한의사가 묶여 있다 → 중앙의원회
    step1Halt: '4-1-halt.html',     // 약이 끝내 오지 않았다
    step2: '4-2-spirit.html',
    step2Fail: '4-2-broken.html',   // 부적이 타지 않았다
    step3: '4-3-needle.html',
    step3Fail: '4-3-slipped.html',  // 혼이 다시 빠져나갔다
    descent: '4-4-descent.html',
    flask: '4-4-flask.html',        // 성수병 (양의사가 자유로울 때)
    priest: '4-4-priest.html',      // 사제의 결단
    hands: '4-4-hands.html',        // 성수가 테이블로 열린 판 · 누가 드는가
    nofire: '4-4-nobody.html',      // 성수도 깨졌고 사제도 없다
    after: '4-5-after.html',        // 불이 지나간 자리 — 그 밤이 정리되는 장면
    account: '5-account.html'       // 오늘의 부활 — 경과 낭독 (결말을 읽은 뒤 되짚는 페이지)
  };

  /**
   * 4단계까지 간 판이 결말 직전에 모이는 자리. 불이 지나갔든 오지 않았든
   * 여기로 합류한다. 그 자리의 장면을 갈아끼울 때 고칠 곳은 이 한 줄뿐이다.
   */
  var AFTER_FIRE = PAGES.after;

  /**
   * 이 판이 도착할 결말 페이지.
   * 판정이 끝나지 않은 상태로 불릴 일은 없지만, 불리면 포기 경로로 읽는다.
   */
  function endingNo(st) {
    return ending(st) || judge((st && st.arrested) || []).giveUpEnding;
  }

  /** 결말 번호로 그 결말의 파일을 짚는다. 결말 파일 이름을 아는 곳은 여기뿐이다. */
  function endingFile(n) {
    return '5-ending-' + n + '.html';
  }

  function endingPage(st) {
    return endingFile(endingNo(st));
  }

  /**
   * [다음 순서] 버튼 하나를 이 판의 결말로 향하게 한다.
   * 결말의 이름과 색까지 함께 맞추므로, 낭독 화면은 파일명을 알 필요가 없다.
   */
  function endingLink(st) {
    var go = global.document.getElementById('go');
    var label = global.document.getElementById('go-label');
    if (!go) return;
    var n = endingNo(st);
    go.href = endingPage(st) + query(st);
    go.style.setProperty('--card-color', 'var(--' + ENDING_COLORS[n] + ')');
    go.style.setProperty('--card-glow', 'var(--' + ENDING_COLORS[n] + '-soft)');
    if (label) label.textContent = '엔딩 ' + n + ' · ' + ENDING_TITLES[n];
  }

  /**
   * 지금 화면 다음에 열릴 페이지.
   * from 은 화면이 스스로를 부르는 이름이고, 판단 재료는 구속자 명단뿐이다.
   *
   * 낭독은 겹치지 않는다 — 방금 테이블에서 읽은 장면을 결말 직전에 다시
   * 요약하지 않는다. 그래서 모든 갈래가 결말로 직행하고, 4단계까지 간 판만
   * 아직 낭독되지 않은 '불이 지나간 자리'를 한 번 거친다.
   * 경과 낭독(5-account)은 결말을 읽은 뒤 되짚고 싶을 때 여는 페이지다.
   */
  function nextPage(from, st) {
    var A = (st && st.arrested) || [];
    var held = function (id) { return A.indexOf(id) !== -1; };

    switch (from) {
      // 구속 여부는 화면이 플레이어에게 직접 묻는다. 여기서 미리 갈라 두지 않는다.
      case 'ritual': return PAGES.step1Free;
      case 'step1': return PAGES.step2;
      case 'step1held': return PAGES.step1Held;
      case 'step1halt': return PAGES.step1Halt;
      case 'step2': return PAGES.step3;
      case 'step2fail': return PAGES.step2Fail;
      case 'step3': return PAGES.descent;
      case 'step3fail': return PAGES.step3Fail;
      // 성수병 앞에 설 수 있는 것은 자유로운 양의사뿐이다.
      case 'descent':
        if (!held('western')) return PAGES.flask;
        return held('priest') ? PAGES.hands : PAGES.priest;
      // 사제가 없으면, 성수가 남았는지가 그대로 갈림길이 된다.
      case 'flask':
        if (held('priest')) return st.choice === 1 ? PAGES.hands : PAGES.nofire;
        return PAGES.priest;
      // 양의사가 먼저 뿌린 판은 사제가 답할 차례 자체가 오지 않는다.
      case 'flaskspray': return AFTER_FIRE;
      // 사제가 막지 않았거나 묶여 있으면 성수는 테이블로 넘어간다.
      case 'priest':
        return PRIEST_OPEN.indexOf(st.priest) !== -1 ? PAGES.hands : AFTER_FIRE;
      case 'hands': return AFTER_FIRE;
      // 물도 손도 남지 않은 판. hands와 목적지는 같지만 전이는 따로 둔다 —
      // 한쪽을 고칠 때 다른 쪽이 말없이 딸려 가지 않도록.
      case 'nofire': return AFTER_FIRE;
      // 합류점(4-5-after)에서 결말로 가는 길은 endingLink 가 잡는다.
      default: return endingPage(st);   // 실패·포기 낭독은 그 자리에서 끝나고 결말로 간다
    }
  }

  /**
   * 직접 링크로 들어온 화면이 현재 판의 정상 순서인지 확인한다.
   * 열람 모드에서는 다른 갈래를 살펴볼 수 있어 이 검사를 하지 않는다.
   * 정상 흐름에 없는 화면을 전부 비활성화해 막다른 곳으로 만들지 않고,
   * 이 판에서 실제로 이어질 화면으로 보낸다.
   */
  function guardDirectPage(page, st) {
    if (browsing() || !st || !st.arrested) return false;

    var A = st.arrested;
    var held = function (id) { return A.indexOf(id) !== -1; };
    var target = null;
    var targetState = st;
    var resetPurify = function () {
      var out = {}, key;
      for (key in st) out[key] = st[key];
      out.choice = null;
      out.priest = null;
      out.hands = null;
      return out;
    };

    // 역병의사가 묶인 판도 2-consent에서 부활 가능 여부와 확정 실패를 확인한다.
    // 선언·의식 준비 화면으로 직접 들어온 경우에는 그 확인 화면으로 보낸다.
    if (['declare', 'ritual'].indexOf(page) !== -1 && held('plague')) {
      targetState = { arrested: A };
      target = PAGES.consent;
    // 1단계 중앙의원회는 한의사가 묶인 판에서만 열린다.
    } else if (page === 'central' && !held('herbal')) {
      target = PAGES.step1Free;
    // 성수병은 양의사가 자유로운 판에서만 양의사가 선택한다.
    } else if (page === 'flask' && (held('western') || st.choice !== null)) {
      if (held('western')) {
        targetState = resetPurify();
        target = nextPage('descent', targetState);
      } else {
        target = nextPage('flask', st);
      }
    // 사제의 결단은 사제가 자유로워야 한다. 양의사가 자유롭고
    // 아직 성수병 선택이 없다면 먼저 성수병 화면으로 돌아간다.
    } else if (page === 'priest' && (held('priest') || st.priest !== null
      || (!held('western') && st.choice === null)
      || (held('western') && st.choice !== null))) {
      if (held('priest')) {
        targetState = resetPurify();
        target = nextPage('descent', targetState);
      } else if (st.priest !== null) {
        target = nextPage('priest', st);
      } else {
        targetState = resetPurify();
        target = held('western') ? PAGES.priest : PAGES.flask;
      }
    // 성수 선택 화면은 사제가 관망했거나, 사제가 묶인 판에서만 열린다.
    } else if (page === 'hands') {
      var handsValid = st.priest === 'allow'
        || (st.priest === 'absent' && held('priest'))
        || (!st.priest && held('western') && held('priest') && st.choice === null)
        || (!st.priest && !held('western') && held('priest') && st.choice === 1);
      if (!handsValid) {
        if (held('western') && !held('priest')) target = PAGES.priest;
        else if (!held('western') && !held('priest') && st.choice === null) target = PAGES.flask;
        else if (!held('western') && held('priest') && st.choice !== 1) target = PAGES.nofire;
      }
      if (st.hands !== null) target = nextPage('hands', st);
    }

    if (!target) return false;
    global.location.replace(target + query(targetState));
    return true;
  }

  /**
   * ─── 갈래 지도 ───────────────────────────────────────────────
   *
   * 화면 하나가 마디 하나이고, 그 아래 달린 것이 그 자리에서 고를 수 있는 길이다.
   * 여기에 목적지는 적지 않는다 — 어디로 가는지는 위의 nextPage 한 곳에서만 정하고,
   * 이 표는 '무엇을 고를 수 있는가'와 '그 선택이 판에 무엇을 남기는가'만 안다.
   * 목적지를 두 곳에 적으면 언젠가 한쪽만 고쳐져 조용히 어긋난다.
   *
   * when 은 그 갈래가 아예 나타나지 않는 판을 걸러낸다. 화면이 스스로
   * [data-when-*] 로 숨기는 것과 같은 조건이므로, 한쪽을 고치면 다른 쪽도 고친다.
   */
  function free(id) { return function (A) { return A.indexOf(id) === -1; }; }
  function bound(id) { return function (A) { return A.indexOf(id) !== -1; }; }
  function noneBound(A) { return !A.length; }
  function someBound(A) { return !!A.length; }

  // 성수병은 양의사가 건드린 판에서만 깨진다. 양의사가 묶여 있었으면 온전하다.
  function intact(A, st) { return !st.choice || st.choice === 1; }
  function smashed(A, st) { return st.choice === 2 || st.choice === 3; }

  var FLOW = [
    { id: 'arrest', page: 'arrest', title: '지목', kicker: '누가 구속되었는가', picks: [
      { id: 'blocked', label: '역병의사가 구속되었다', desc: '부활 가능 여부를 확인한 뒤 확정 실패로 간다',
        to: 'consent', patch: {}, when: bound('plague') },
      { id: 'open', label: '역병의사는 자리에 있다',
        to: 'declare', patch: {}, when: free('plague') }
    ]},

    { id: 'declare', page: 'declare', title: '부활 선언', kicker: '노트를 꺼내는가', picks: [
      { id: 'no', label: '비술을 꺼내지 않는다', desc: '왕의 시신에 손대지 않는다',
        to: '@end', patch: { revive: false } },
      { id: 'yes', label: '노트를 펼친다', to: 'consent', patch: { revive: true } }
    ]},

    { id: 'consent', page: 'consent', title: '의식 개시', kicker: '찬반 투표', picks: [
      { id: 'blocked', label: '부활할 수 있는 사람이 없다', desc: '역병의사가 구속되어 부활을 시작할 수 없다',
        to: '@end', patch: { revive: false }, when: bound('plague') },
      { id: 'no', label: '물러선다', desc: '대역죄를 감당할 수 없다',
        to: '@end', patch: { revive: true, vote: false }, when: function (A) { return someBound(A) && A.indexOf('plague') === -1; } },
      // 아무도 지목하지 않은 판에서만 왕비가 한 번 더 묻는다 — 고할 것도 없고
      // 되살릴 뜻도 없다는 답을 그대로 받지 않기 때문이다.
      { id: 'asked', label: '물러선다', desc: '왕비가 한 번 더 묻는다',
        to: 'queen', patch: { revive: true, vote: false }, when: noneBound },
      { id: 'yes', label: '위험을 감수한다', to: 'ritual', patch: { revive: true, vote: true }, when: free('plague') }
    ]},

    { id: 'queen', page: 'queen', title: '왕비의 되물음', kicker: '한 번 더 묻는다', depth: 1, picks: [
      { id: 'silent', label: '그래도 답하지 않는다', desc: '두 번째 물음에도 조용하다',
        to: '@end', patch: { revive: true, vote: false } },
      { id: 'turn', label: '노트를 다시 펼친다', to: 'ritual', patch: { revive: true, vote: true } }
    ]},

    { id: 'ritual', page: 'ritual', title: '부활의 비술', kicker: '의식 준비', picks: [
      { id: 'begin', label: '가져온 것을 서로에게 돌려준다', go: 'ritual', patch: {} }
    ]},

    { id: 'step1', page: 'step1Free', title: '약을 짓다', kicker: '부활 판정 1 / 4', picks: [
      { id: 'free', label: '한의사가 자리에 있다', go: 'step1', patch: { addKey: 'note' },
        when: free('herbal') },
      { id: 'held', label: '한의사는 포박되어 있다', desc: '남은 약재를 가늠할 사람이 없다',
        go: 'step1held', patch: {}, when: bound('herbal') }
    ]},

    { id: 'central', page: 'step1Held', title: '중앙의원회', kicker: '약을 청하다', depth: 1, picks: [
      { id: 'join', label: '의원장이 함께 약을 타온다', go: 'step1',
        patch: { med: 'join', addKey: 'note' }, when: free('western') },
      { id: 'deny', label: '의원장이 등을 돌린다', go: 'step1halt',
        patch: { med: 'deny' }, when: free('western') },
      { id: 'shut', label: '약을 청할 곳이 없다', desc: '의원장도 묶여 있다',
        go: 'step1halt', patch: { med: 'shut' }, when: bound('western') }
    ]},

    { id: 'halt', page: 'step1Halt', title: '약이 오지 않다', kicker: '1단계에서 멈춤', depth: 2, picks: [
      { id: 'end', label: '시신에 손대기 전에 끝났다', go: 'halt', patch: {} }
    ]},

    { id: 'step2', page: 'step2', title: '혼을 훔치다', kicker: '부활 판정 2 / 4', picks: [
      { id: 'free', label: '부적술사가 자리에 있다', go: 'step2', patch: { addKey: 'talis' },
        when: free('talisman') },
      { id: 'held', label: '부적술사는 포박되어 있다', desc: '부적을 쓸 줄 아는 사람이 없다',
        go: 'step2fail', patch: {}, when: bound('talisman') }
    ]},

    { id: 'broken', page: 'step2Fail', title: '부적이 타지 않다', kicker: '2단계에서 실패', depth: 1, picks: [
      { id: 'end', label: '이미 왕의 시신에 손을 댄 뒤였다', go: 'fail', patch: {} }
    ]},

    { id: 'step3', page: 'step3', title: '혼을 봉하다', kicker: '부활 판정 3 / 4', picks: [
      { id: 'full', label: '세침통이 갖추어져 있다', go: 'step3',
        patch: { addKey: 'card1', needle: 'full' }, when: free('acupunct') },
      { id: 'lent', label: '역병의사가 제 침을 내준다', desc: '마지막 한 자리가 비어 있었다',
        go: 'step3', patch: { addKey: 'card1', needle: 'lent' }, when: free('acupunct') },
      { id: 'held', label: '침술사는 포박되어 있다', desc: '침을 놓을 수 있는 사람이 없다',
        go: 'step3fail', patch: {}, when: bound('acupunct') }
    ]},

    { id: 'slipped', page: 'step3Fail', title: '혼이 다시 빠져나가다', kicker: '3단계에서 실패', depth: 1, picks: [
      { id: 'end', label: '봉할 손이 없었다', go: 'fail', patch: {} }
    ]},

    { id: 'descent', page: 'descent', title: '강림', kicker: '부활 판정 4 / 4', picks: [
      { id: 'go', label: '하늘에서 검은 것이 내려온다', go: 'descent', patch: {} }
    ]},

    { id: 'flask', page: 'flask', title: '탁자 끝의 성수병', kicker: '양의사의 선택', picks: [
      { id: 'keep', label: '가만히 둔다', desc: '성수가 남는다', go: 'flask', patch: { choice: 1 } },
      { id: 'drop', label: '슬쩍 떨어뜨린다', desc: '병이 산산조각 난다',
        go: 'flask', patch: { choice: 2 } },
      // 사제가 자유로우면 그 차례를 빼앗은 것(bypassed), 묶여 있으면 차례가 없던 판(absent).
      { id: 'spray', label: '집어 들어 왕에게 뿌린다', desc: '다른 답을 기다리지 않는다',
        go: 'flaskspray', patch: function (st) {
          var held = (st.arrested || []).indexOf('priest') !== -1;
          return { priest: held ? 'absent' : 'bypassed', hands: 'western' };
        } },
      { id: 'throw', label: '집어 던진다', desc: '명백한 방해다', go: 'flask', patch: { choice: 3 } }
    ]},

    { id: 'nofire', page: 'nofire', title: '불은 피지 않다', kicker: '물도 손도 남지 않았다', depth: 1, picks: [
      { id: 'go', label: '검은 것이 그대로 내려온다', go: 'nofire',
        patch: { priest: 'absent', hands: 'none' } }
    ]},

    { id: 'priest', page: 'priest', title: '사제의 결단', kicker: '성수를 든 손', picks: [
      { id: 'agree', label: '성수를 뿌린다', go: 'priest', patch: { priest: 'agree' }, when: intact },
      // 맨손의 불은 사제 고유 능력이므로 성수가 온전한 판에서도 고를 수 있다.
      { id: 'barehand', label: '손에서 화염을 불러낸다', go: 'priest',
        patch: { priest: 'barehand' } },
      { id: 'allow', label: '관망한다', desc: '성수가 탁자로 열린다',
        go: 'priest', patch: { priest: 'allow' }, when: intact },
      { id: 'avert', label: '성수를 거둔다', go: 'priest', patch: { priest: 'avert' }, when: intact },
      { id: 'unable', label: '끝내 손을 내밀지 못한다', go: 'priest',
        patch: { priest: 'unable' }, when: smashed }
    ]},

    { id: 'hands', page: 'hands', title: '탁자에 남은 성수', kicker: '그 물을 드는 사람', picks: [
      { id: 'western', label: '양의사가 든다', go: 'hands', when: free('western'),
        patch: function (st) { return { hands: 'western', priest: st.priest || 'absent' }; } },
      { id: 'other', label: '다른 사람이 든다', go: 'hands',
        patch: function (st) { return { hands: 'other', priest: st.priest || 'absent' }; } },
      { id: 'none', label: '아무도 들지 않는다', go: 'hands',
        patch: function (st) { return { hands: 'none', priest: st.priest || 'absent' }; } }
    ]},

    // 이 화면은 nextPage 를 거치지 않는다 — endingLink 가 결말로 곧장 잇는다.
    { id: 'after', page: 'after', title: '불이 지나간 자리', kicker: '그 밤이 정리된다', picks: [
      { id: 'end', label: '결말로', to: '@end', patch: {} }
    ]}
  ];

  /** 지도에서 마디 하나를 꺼낸다. */
  function scene(id) {
    for (var i = 0; i < FLOW.length; i++) {
      if (FLOW[i].id === id) return FLOW[i];
    }
    return null;
  }

  /** nextPage 가 돌려준 파일이 지도의 어느 마디인지 되짚는다. */
  function sceneOfFile(file) {
    if (/^5-ending-/.test(file)) return '@end';
    for (var i = 0; i < FLOW.length; i++) {
      if (PAGES[FLOW[i].page] === file) return FLOW[i].id;
    }
    return '@end';
  }

  /** 이 갈래가 남기는 기록. 앞선 기록을 봐야 정해지는 것은 함수로 적혀 있다. */
  function pickPatch(pick, st) {
    return typeof pick.patch === 'function' ? pick.patch(st) : (pick.patch || {});
  }

  /**
   * 구속자 명단이 이러할 때 갈 수 있는 모든 길을 한 번씩 훑는다.
   * 흐름도의 지도도, '가정해 보기'의 도달 판정도 모두 이 순회 하나에서 나온다.
   *
   * visit(scene, pick, stAfter, toId) 로 갈래마다 불린다.
   * toId 가 '@end' 면 그 갈래는 그대로 결말로 빠진다.
   */
  function walk(arrested, visit) {
    var A = arrested || [];
    var seen = {};

    step('arrest', { arrested: A, revive: null, vote: null, keys: null,
                     med: null, priest: null, hands: null, choice: null, needle: null });

    function step(id, st) {
      var sig = id + query(st);
      if (seen[sig]) return;
      seen[sig] = true;

      var sc = scene(id);
      if (!sc) return;

      sc.picks.forEach(function (p) {
        if (p.when && !p.when(A, st)) return;
        var next = applyPatch(st, pickPatch(p, st));
        var to = p.to || sceneOfFile(nextPage(p.go, next));
        visit(sc, p, next, to);
        if (to !== '@end') step(to, next);
      });
    }
  }

  /**
   * 이 판이 실제로 밟은 마디들. 흐름도에서 금색으로 잇는 길이다.
   * 아직 답하지 않은 화면에 이르면 거기서 멈춘다 — 판이 끝나지 않았다는 뜻이다.
   */
  function path(st) {
    var A = (st && st.arrested) || [];
    var out = [];
    var id = 'arrest';
    var guard = 0;

    while (id && id !== '@end' && guard++ < 64) {
      var sc = scene(id);
      if (!sc) break;
      out.push(sc.id);

      var taken = null;
      for (var i = 0; i < sc.picks.length && !taken; i++) {
        var p = sc.picks[i];
        if (p.when && !p.when(A, st)) continue;
        if (recorded(p, st)) taken = p;
      }
      if (!taken) break;

      out.push(sc.id + '/' + taken.id);
      var next = applyPatch(st, pickPatch(taken, st));
      id = taken.to || sceneOfFile(nextPage(taken.go, next));
    }

    if (id === '@end') out.push('@end');
    return out;
  }

  /** 이 갈래가 남겼어야 할 것이 판의 기록에 그대로 있는가. */
  function recorded(pick, st) {
    var p = pickPatch(pick, st);
    for (var k in p) {
      if (k === 'addKey') {
        if (!st.keys || st.keys.indexOf(p[k]) === -1) return false;
      } else if (st[k] !== p[k]) {
        return false;
      }
    }
    return true;
  }

  /**
   * 이 구속자 명단으로 닿을 수 있는 것들.
   * nodes 는 흐름도에서 살아남는 마디, endings 는 도달 가능한 결말 번호다.
   * 부적술사·침술사·역병의사 중 하나라도 묶이면 revived 는 거짓이 된다.
   */
  function reachable(arrested) {
    var nodes = {}, ends = {};

    walk(arrested, function (sc, pick, next, to) {
      nodes[sc.id] = true;
      nodes[sc.id + '/' + pick.id] = true;
      if (to === '@end') ends['e' + endingNo(next)] = true;
    });

    var list = [];
    for (var k in ends) list.push(Number(k.slice(1)));
    list.sort();

    return { nodes: nodes, endings: list, revived: !!(ends.e1 || ends.e2) };
  }

  /**
   * 판의 기록에 patch 만큼 덧쓴 새 기록을 돌려준다. 원본은 건드리지 않는다.
   * addKey 는 확보한 물건을 하나 더한다는 뜻이다.
   */
  function applyPatch(st, patch) {
    var out = {}, p = {}, k;
    for (k in st) out[k] = st[k];
    for (k in (patch || {})) p[k] = patch[k];

    if (p.addKey) {
      out.keys = (out.keys || []).filter(function (x) { return x !== p.addKey; }).concat(p.addKey);
      delete p.addKey;
    }
    for (k in p) out[k] = p[k];
    return out;
  }

  /** 이번 판의 기록을 patch만큼 갱신하고 다음 페이지로 넘어간다. */
  function go(from, patch) {
    var st = applyPatch(read(), patch);
    var q = query(st);
    if (browsing()) q += (q ? '&' : '?') + 'view=1';
    global.location.href = nextPage(from, st) + q;
  }

  /**
   * [data-when-*] 가 붙은 요소 중 이 판에 해당하는 것만 남긴다.
   * 열람 모드에서는 갈래를 전부 펼쳐 둔다.
   */
  function reveal(attr, value, matchAll) {
    // 열람 모드 — 구속자 명단조차 없이 열렸으면 갈래를 전부 펼쳐 둔다.
    // 흐름도에서 조합을 지정해 열었다면 그 명단에서 갈리는 자리만 골라내고,
    // 아직 아무도 고르지 않은 선택으로 갈리는 자리는 그대로 펼쳐 둔다.
    if (browsing() && (!read().arrested || value === null || value === undefined)) return;
    var nodes = global.document.querySelectorAll('[' + attr + ']');
    Array.prototype.forEach.call(nodes, function (el) {
      var want = (el.getAttribute(attr) || '').split(/\s+/).filter(Boolean);
      if (value === null || value === undefined) { el.remove(); return; }
      var hit = matchAll
        ? want.some(function (w) { return value.indexOf(w) !== -1; })
        : want.indexOf(String(value)) !== -1;
      if (!hit) el.remove();
    });
  }

  /** 후일담 카드 전체를 접기·펼치기 영역으로 사용한다. */
  function bindEpilogueCards() {
    var cards = global.document.querySelectorAll('details.epilogue[data-secret-step]');
    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('summary, button, a, input, select, textarea, label')) return;
        card.open = !card.open;
      });
    });
  }

  /** 픽 목록 한 벌에 클릭 처리를 붙인다. attr 값이 그대로 콜백에 온다. */
  function onPick(hostId, attr, fn) {
    var host = global.document.getElementById(hostId);
    if (!host) return;
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[' + attr + ']');
      if (b) fn(b.getAttribute(attr), b);
    });
  }

  /** 이 판에서 불이 피어올랐는가. 사제의 손이든 남의 손이든. */
  function purified(st) {
    if (PRIEST_FIRE.indexOf(st.priest) !== -1) return true;
    if (PRIEST_OPEN.indexOf(st.priest) !== -1) return HANDS_FIRE.indexOf(st.hands) !== -1;
    return false;
  }

  /**
   * 열람 모드 (?view=1). 정산이 끝난 뒤 가지 않은 길을 훑어보는 상태다.
   * 이 판의 기록으로 문단을 골라내지 않고, 갈리는 갈래를 전부 펼쳐 둔다.
   */
  function browsing() {
    return new URLSearchParams(global.location.search).has('view');
  }

  var ENDING_TITLES = {
    1: '완벽한 부활',
    2: '대가성 부활',
    3: '기나긴 이단 심문',
    4: '심판과 상실',
    5: '승리한 악',
    6: '고친 것이 없는 밤'
  };

  var ENDING_COLORS = { 1: 'gold', 2: 'plague', 3: 'talisman', 4: 'priest', 5: 'western', 6: 'ash' };

  /**
   * [data-session-recap] 자리에 이 판이 누구를 묶었는지만 적는다.
   *
   * 갈래마다의 결과는 화면 본문이 [data-when-*] 로 이미 말하고, 판 전체를
   * 되짚는 일은 5-account 가 맡는다. 여기서 한 번 더 표로 옮기면 방금 읽은
   * 문장이 겹칠 뿐 아니라, 아직 묻지 않은 단계의 답까지 미리 새어 나간다.
   * 그래서 남기는 것은 구속자 명단 한 줄뿐이다 — 화면마다 "○○가 구속되어
   * 있습니까?"로 계속 되묻는 값이라, 이것만은 판 내내 눈에 보여야 한다.
   */
  function renderRecap() {
    var host = global.document.querySelector('[data-session-recap]');
    if (!host) return;

    var st = read();
    if (!st.arrested) { host.hidden = true; return; }

    var who = st.arrested.length
      ? st.arrested.map(function (id) {
          return '<strong style="color:var(--' + id + ')">' + doctor(id).name + '</strong>';
        }).join(', ')
      : '<strong>없음</strong> (하늘 지목)';

    host.hidden = false;
    host.className = 'session-recap';
    host.innerHTML = '<div><span class="k">구속</span><span class="v">' + who + '</span></div>';
  }

  /** [data-keep-query] 링크에 현재 쿼리를 그대로 물려준다. */
  function keepQuery() {
    var q = global.location.search;
    if (!q) return;
    Array.prototype.forEach.call(
      global.document.querySelectorAll('a[data-keep-query]'),
      function (a) {
        var href = a.getAttribute('href') || '';
        if (href.indexOf('?') !== -1 || href.charAt(0) === '#') return;
        a.setAttribute('href', href + q);
      }
    );
  }

  /**
   * [data-back] 은 실제로 지나온 길로 되돌린다.
   *
   * 결말·해설 화면은 들어오는 갈래가 여럿이라 '뒤로'를 미리 적을 수 없다.
   * 그래서 히스토리가 있으면 그것을 따르고, 없을 때만 화면이 적어 둔 자리로 간다.
   * 적어 둔 자리도 없는 화면(href="#")은 되돌아갈 곳이 없는 판이므로 링크를 지운다 —
   * 눌러도 아무 데도 가지 않는 버튼을 남겨 두지 않기 위해서다.
   */
  function backLinks() {
    var nodes = global.document.querySelectorAll('a[data-back]');
    if (!nodes.length) return;
    // referrer 로는 판단하지 않는다 — 새 탭으로 열린 화면은 referrer 가 있어도
    // 돌아갈 항목이 없어서 back() 이 아무 일도 하지 않는다.
    var canGoBack = global.history.length > 1;
    Array.prototype.forEach.call(nodes, function (a) {
      if (!canGoBack) {
        if ((a.getAttribute('href') || '#') === '#') a.remove();
        return;
      }
      a.addEventListener('click', function (e) {
        e.preventDefault();
        global.history.back();
      });
    });
  }

  global.DoctorEnding = {
    DOCTORS: DOCTORS,
    KEYS: KEYS,
    REQUIRED_KEYS: REQUIRED_KEYS,
    keyOf: keyOf,
    voters: voters,
    failedSteps: failedSteps,
    haltedOnMedicine: haltedOnMedicine,
    browsing: browsing,
    PAGES: PAGES,
    nextPage: nextPage,
    guardDirectPage: guardDirectPage,
    endingPage: endingPage,
    endingNo: endingNo,
    endingFile: endingFile,
    endingLink: endingLink,
    FLOW: FLOW,
    scene: scene,
    walk: walk,
    path: path,
    reachable: reachable,
    go: go,
    reveal: reveal,
    onPick: onPick,
    PRIEST_FIRE: PRIEST_FIRE,
    PRIEST_OPEN: PRIEST_OPEN,
    HANDS_FIRE: HANDS_FIRE,
    purified: purified,
    missingKeys: missingKeys,
    ENDING_TITLES: ENDING_TITLES,
    ENDING_COLORS: ENDING_COLORS,
    doctor: doctor,
    names: names,
    read: read,
    query: query,
    judge: judge,
    ending: ending
  };

  // 뒤로가기로 돌아와도 읽던 위치를 복원하지 않는다.
  // 멀티 엔딩을 훑는 독자는 항상 맨 위에서부터 다시 읽는다.
  if ('scrollRestoration' in global.history) global.history.scrollRestoration = 'manual';
  global.addEventListener('pageshow', function (e) {
    if (e.persisted) global.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });

  /**
   * 열람으로 열린 화면 맨 위에 그 사실을 적는다.
   * 오늘의 판을 진행하는 중인지, 가지 않은 길을 구경하는 중인지 헷갈리지 않도록.
   */
  function markBrowsing() {
    if (!browsing()) return;
    var main = global.document.querySelector('.container');
    if (!main || main.querySelector('.browse-tag')) return;

    var st = read();
    var tag = global.document.createElement('p');
    tag.className = 'browse-tag';
    tag.textContent = st.arrested && st.arrested.length
      ? '열람 중 · ' + names(st.arrested).join(', ') + '가 구속된 판으로 보고 있습니다'
      : '열람 중 · 오늘의 판 기록에는 영향을 주지 않습니다';
    main.insertBefore(tag, main.firstChild);
  }

  function boot() { markBrowsing(); renderRecap(); keepQuery(); backLinks(); bindEpilogueCards(); }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
