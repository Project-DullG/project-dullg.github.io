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
 *                   allow 막지 않는다 / absent 포박 / bypassed 양의사가 먼저 뿌림
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
   * 그래서 사제의 답은 셋으로 갈린다: 내가 든다 / 들지 않되 막지도 않는다 / 거둔다.
   * 막지 않았거나 사제가 묶여 있으면 성수는 테이블로 열리고, 누가 드는지를 따로 정한다.
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
    account: '5-account.html'       // 오늘의 부활 — 경과 낭독
  };

  /**
   * 지금 화면 다음에 열릴 페이지.
   * from 은 화면이 스스로를 부르는 이름이고, 판단 재료는 구속자 명단뿐이다.
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
      case 'flaskspray': return PAGES.account;
      // 사제가 막지 않았거나 묶여 있으면 성수는 테이블로 넘어간다.
      case 'priest':
        return PRIEST_OPEN.indexOf(st.priest) !== -1 ? PAGES.hands : PAGES.account;
      case 'hands': return PAGES.account;
      default: return PAGES.account;   // 처분 이후와 모든 실패 낭독은 경과로 모인다
    }
  }

  /**
   * 이번 판의 기록을 patch만큼 갱신하고 다음 페이지로 넘어간다.
   * addKey 는 확보한 물건을 하나 더한다는 뜻이다.
   */
  function go(from, patch) {
    var st = read();
    var p = {}, k;
    for (k in (patch || {})) p[k] = patch[k];

    if (p.addKey) {
      st.keys = (st.keys || []).filter(function (x) { return x !== p.addKey; }).concat(p.addKey);
      delete p.addKey;
    }
    for (k in p) st[k] = p[k];

    global.location.href = nextPage(from, st) + query(st);
  }

  /**
   * [data-when-*] 가 붙은 요소 중 이 판에 해당하는 것만 남긴다.
   * 열람 모드에서는 갈래를 전부 펼쳐 둔다.
   */
  function reveal(attr, value, matchAll) {
    if (browsing()) return;
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
    3: '파멸의 이단 심문',
    4: '심판과 상실',
    5: '승리한 악',
    6: '고할 것이 없는 밤'
  };

  var ENDING_COLORS = { 1: 'gold', 2: 'plague', 3: 'talisman', 4: 'priest', 5: 'western', 6: 'ash' };

  /** [data-session-recap] 자리에 이 판의 결과 요약을 채운다. */
  function renderRecap() {
    var host = global.document.querySelector('[data-session-recap]');
    if (!host) return;

    var st = read();
    if (!st.arrested) { host.hidden = true; return; }

    var rows = [];
    rows.push(['구속', st.arrested.length
      ? '<strong>' + names(st.arrested).join(', ') + '</strong>'
      : '<strong>없음</strong> (하늘 지목)']);

    if (st.revive !== null) {
      rows.push(['부활 선언', st.revive ? '<strong>선언했다</strong>' : '<strong>선언하지 않았다</strong>']);
    }

    if (st.revive && st.vote !== null) {
      rows.push(['의식 개시', st.vote
        ? '<strong>시작</strong> · 위험을 감수하기로 함'
        : '<strong>포기</strong> · 물러서기로 함']);
    }

    if (st.med) {
      var mt = {
        join: '양의사가 <strong>함께 약을 가지러 갔다</strong>',
        deny: '양의사가 <strong>등을 돌렸다</strong>',
        shut: '<strong>중앙의원회의 문이 닫혔다</strong>'
      };
      rows.push(['약의 조달', mt[st.med]]);
    }

    if (st.revive && st.vote && st.keys) {
      // 의식은 첫 실패 지점에서 깨지므로, 요약에는 그 단계만 적는다.
      var fails = failedSteps(st.arrested, st.keys);
      var f = fails[0];
      var why = '';
      if (f) {
        // 1단계가 중앙의원회로 넘어간 판은 '물건 없음'이 아니라 약 자체가 원인이다.
        if (f.step === 1 && st.med === 'deny') why = '양의사가 등을 돌림';
        else if (f.step === 1 && st.med === 'shut') why = '약고가 열리지 않음';
        else if (f.actorGone) why = doctor(f.actor).name + ' 포박';
        else why = f.name + ' 없음';
      }
      rows.push(['의식 판정', f
        ? '<strong>' + f.step + '단계에서 실패</strong> (' + why + ')'
        : '<strong>1~3단계 성공</strong>']);
    }

    if (st.priest) {
      var pt = {
        agree: '사제가 <strong>성수로 불살랐다</strong>',
        barehand: '사제가 <strong>맨손으로 불을 피웠다</strong>',
        allow: '사제는 <strong>들지 않았고, 막지도 않았다</strong>',
        bypassed: '<strong>사제가 답하기 전에 끝났다</strong>',
        absent: '사제 <strong>부재</strong> (포박)',
        avert: '사제가 <strong>성수를 거두었다</strong>',
        unable: '사제가 <strong>맨손을 내주지 못했다</strong>'
      };
      rows.push(['정화', pt[st.priest]]);
    }

    if (st.hands) {
      var ht = {
        western: '<strong>양의사가 성수를 들었다</strong>',
        other: '<strong>다른 누군가가 성수를 들었다</strong>',
        none: '<strong>아무도 성수를 들지 않았다</strong>'
      };
      rows.push(['성수를 든 손', ht[st.hands]]);
    }

    if (st.choice) {
      var ct = { 1: '<strong>가만히 두었다</strong>', 2: '<strong>성수병을 떨어뜨렸다</strong>', 3: '<strong>성수병을 던졌다</strong>' };
      rows.push(['양의사', ct[st.choice]]);
    }


    host.hidden = false;
    host.className = 'session-recap';
    host.innerHTML = rows.map(function (r) {
      return '<div><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>';
    }).join('');
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

  function boot() { renderRecap(); keepQuery(); }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
