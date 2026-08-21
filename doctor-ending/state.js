/**
 * 의사가 너무 많아! · 엔딩 진행 상태
 *
 * 판의 결과는 전부 URL 쿼리 스트링에 담는다. 서버도 저장소도 쓰지 않으므로
 * 링크 하나만 넘기면 다른 기기에서도 같은 결말이 그대로 열린다.
 *
 *   a  구속된 인물   talisman,acupunct,priest,plague,herbal,western (쉼표 구분, 없으면 생략)
 *   r  부활 선언     1 선언 / 0 선언하지 않음
 *   v  찬반 투표     1 가결 / 0 부결 (결과만 기록한다)
 *   k  확보한 물건   note,talis,card1,water
 *   p  사제의 정화   agree | silent | absent
 *   c  양의사의 선택 1 | 2 | 3
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
   * 부활 의식의 단계와 물건. actor가 그 단계를 수행하는 담당자다.
   * 담당자가 포박되었거나 물건이 나오지 않으면 그 단계는 실패한다.
   * 판정은 의식이 시작된 뒤 단계 질문에서만 이루어진다 — 지목 결과 화면에서
   * 미리 막아 버리면 "누가 필수인지"가 투표 전에 새므로, 조기 차단은
   * 부활을 선포할 유일한 인물인 역병의사가 포박된 경우뿐이다.
   */
  var KEYS = [
    { id: 'note',  step: 1, name: '형의 당부 수첩과 남은 약재', actor: 'herbal',   need: true },
    { id: 'talis', step: 2, name: '붉은 부적',                  actor: 'talisman', need: true },
    { id: 'card1', step: 3, name: '조건 달성 카드 1',           actor: 'acupunct', need: true },
    { id: 'water', step: 4, name: '성수',                       actor: 'priest',   need: false }
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
    var st = { arrested: null, revive: null, vote: null, keys: null, priest: null, choice: null };

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

    var p = q.get('p');
    if (['agree', 'silent', 'absent'].indexOf(p) !== -1) st.priest = p;

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

    if (st.priest) q.set('p', st.priest);
    if (st.choice) q.set('c', String(st.choice));

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
      var actorGone = out.indexOf(k.actor) !== -1;
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

    if (!st.keys) return null;
    if (failedSteps(st.arrested, st.keys).length) return 3;

    if (!st.priest) return null;
    return st.priest === 'agree' ? 1 : 2;
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
      rows.push(['찬반 투표', st.vote ? '<strong>가결</strong> · 과반 찬성' : '<strong>부결</strong>']);
    }

    if (st.revive && st.vote && st.keys) {
      // 의식은 첫 실패 지점에서 깨지므로, 요약에는 그 단계만 적는다.
      var fails = failedSteps(st.arrested, st.keys);
      var f = fails[0];
      rows.push(['의식 판정', f
        ? '<strong>' + f.step + '단계에서 실패</strong> (' +
          (f.actorGone ? doctor(f.actor).name + ' 포박' : f.name + ' 없음') + ')'
        : '<strong>1~3단계 성공</strong>']);
    }

    if (st.priest) {
      var pt = { agree: '사제가 정화에 <strong>동의</strong>', silent: '사제가 <strong>침묵 · 방관</strong>', absent: '사제 <strong>부재</strong> (포박)' };
      rows.push(['화(火) 정화', pt[st.priest]]);
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

  function boot() { renderRecap(); keepQuery(); }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
