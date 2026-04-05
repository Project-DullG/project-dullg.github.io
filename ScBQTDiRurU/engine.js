    /* ===== 화면 스케일링 ===== */
    function resizeGame() {
      var g = document.getElementById('game');
      var vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      var vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      var s = Math.min(vh / 740, vw / 440) * 0.98;
      g.style.transform = 'scale(' + s + ')';
    }
    window.addEventListener('resize', resizeGame);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeGame);
    resizeGame();

    /* ===== BGM ===== */
    var masterVol = parseFloat(localStorage.getItem('mr_vol') || '0.5');
    var bgmDaily = new Audio('일상.mp3'); bgmDaily.loop = true;
    var bgmBattle = new Audio('전투.mp3'); bgmBattle.loop = false;
    var bgmBattle2 = new Audio('두번째 전투.mp3'); bgmBattle2.loop = true;
    var bgmBaseVol = { daily: 0.4, battle: 0.5, battle2: 0.5 };
    function applyVol(a, base) { a.volume = Math.min(1, base * masterVol / 0.5) }
    var curBgm = null, bgmTimer = null;
    function playBgm(which) {
      if (curBgm === which) return;
      if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null }
      fadeBgm(bgmDaily); fadeBgm(bgmBattle); fadeBgm(bgmBattle2);
      curBgm = which;
      if (which === 'daily') { bgmDaily.currentTime = 0; applyVol(bgmDaily, bgmBaseVol.daily); bgmDaily.play().catch(function () { }); }
      else if (which === 'battle') {
        bgmBattle.currentTime = 0; applyVol(bgmBattle, bgmBaseVol.battle); bgmBattle.play().catch(function () { });
        bgmTimer = setTimeout(function () { fadeBgm(bgmBattle); curBgm = null }, 90000);
      }
      else if (which === 'battle2') {
        bgmBattle2.currentTime = 0; applyVol(bgmBattle2, bgmBaseVol.battle2); bgmBattle2.play().catch(function () { });
      }
    }
    // 일시정지 메뉴 & 볼륨
    var gamePaused = false;
    (function () {
      var slider = $('vol-slider'); var btn = $('vol-btn'); var label = $('vol-label');
      var tSlider = $('t-vol-slider'); var tBtn = $('t-vol-btn'); var tLabel = $('t-vol-label');
      var overlay = $('pause-overlay'); var pauseBtn = $('pause-btn');
      function updateVolUI() {
        var pct = Math.round(masterVol * 100);
        slider.value = pct; label.textContent = pct + '%';
        btn.textContent = masterVol <= 0 ? '🔇' : masterVol < 0.3 ? '🔈' : '🔊';
        if (tSlider) { tSlider.value = pct; tLabel.textContent = pct + '%'; tBtn.textContent = btn.textContent }
      }
      updateVolUI();
      function applyAllVol() {
        [bgmDaily, bgmBattle, bgmBattle2].forEach(function (a) { if (!a.paused) { var base = a === bgmDaily ? bgmBaseVol.daily : a === bgmBattle ? bgmBaseVol.battle : bgmBaseVol.battle2; applyVol(a, base) } });
      }
      function handleVolChange(val) {
        masterVol = val; localStorage.setItem('mr_vol', String(masterVol));
        updateVolUI(); applyAllVol();
      }
      slider.addEventListener('input', function () { handleVolChange(parseInt(this.value) / 100) });
      btn.addEventListener('click', function () { handleVolChange(masterVol > 0 ? 0 : 0.5) });
      if (tSlider) { tSlider.addEventListener('input', function () { handleVolChange(parseInt(this.value) / 100) }) }
      if (tBtn) { tBtn.addEventListener('click', function () { handleVolChange(masterVol > 0 ? 0 : 0.5) }) }
      function openPause() {
        gamePaused = true; overlay.classList.add('on');
        // 전투 중이면 훈련 종료 보이기
        var inBattle = $('battle-screen').classList.contains('active');
        $('pause-retreat').style.display = inBattle ? 'block' : 'none';
      }
      function closePause() {
        gamePaused = false; overlay.classList.remove('on');
      }
      pauseBtn.addEventListener('click', openPause);
      $('pause-resume').addEventListener('click', closePause);
      $('pause-title-btn').addEventListener('click', function () {
        closePause(); stopAllBgm(); showScr('title');
      });
      $('pause-retreat').addEventListener('click', function () {
        closePause(); retreatBattle();
      });
      $('pause-tut').addEventListener('click', function () {
        closePause(); showBattleTutorial(function () {});
      });
      // ESC 키로 일시정지 토글
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (gamePaused) closePause();
          else {
            var cur = document.querySelector('.screen.active');
            if (cur && (cur.id === 'battle-screen' || cur.id === 'scene-screen')) openPause();
          }
        }
      });
    })()
    var fadeTimers = [];
    function fadeBgm(a, target) {
      if (a.paused) return;
      var to = target || 0;
      var v = a.volume, iv = setInterval(function () { v -= 0.05; if (v <= to + 0.01) { if (to <= 0) { a.pause(); a.volume = 0 } else { a.volume = to } clearInterval(iv) } else { a.volume = Math.max(0, v) } }, 50);
      fadeTimers.push(iv);
    }
    function lowerBgm() {
      if (!bgmBattle2.paused) fadeBgm(bgmBattle2, 0.15 * masterVol / 0.5);
    }
    function restoreBgm() {
      if (!bgmBattle2.paused) {
        var to = Math.min(1, bgmBaseVol.battle2 * masterVol / 0.5);
        var v = bgmBattle2.volume, iv = setInterval(function () { v += 0.05; if (v >= to - 0.01) { bgmBattle2.volume = to; clearInterval(iv) } else { bgmBattle2.volume = Math.min(1, v) } }, 50);
        fadeTimers.push(iv); curBgm = 'battle2';
      } else playBgm('battle2');
    }
    function stopAllBgm() { fadeTimers.forEach(clearInterval); fadeTimers = []; fadeBgm(bgmDaily); fadeBgm(bgmBattle); fadeBgm(bgmBattle2); curBgm = null; if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null } }

    var NS = 'http://www.w3.org/2000/svg';
    var RC = { red: { m: '#e53935', d: '#c62828', l: '#ef5350' }, black: { m: '#555', d: '#333', l: '#777' }, blue: { m: '#1565c0', d: '#0d47a1', l: '#42a5f5' }, yellow: { m: '#f9a825', d: '#f57f17', l: '#fdd835' }, pink: { m: '#ec407a', d: '#c2185b', l: '#f48fb1' } };
    var VP = { red: 'M14,24 L23,17 L30,22 L37,17 L46,24 L43,34 L17,34Z', black: 'M13,23 L24,15 L30,20 L36,15 L47,23 L44,35 L16,35Z', blue: 'M15,25 L24,19 L30,23 L36,19 L45,25 L43,33 L17,33Z', yellow: 'M12,22 L23,16 L30,21 L37,16 L48,22 L45,34 L15,34Z', pink: 'M15,24 L24,18 L30,23 L36,18 L45,24 L43,33 L17,33Z' };
    function se(tag, a) { var e = document.createElementNS(NS, tag); if (a) Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]) }); return e }
    function mkR(t, sc) {
      sc = sc || 1; var c = RC[t], w = Math.round(60 * sc), h = Math.round(100 * sc);
      var s = se('svg', { viewBox: '0 0 60 100', width: '' + w, height: '' + h });
      if (t === 'red') s.appendChild(se('path', { d: 'M26,8 L30,-1 L34,8', fill: '#ffd700', stroke: '#f57c00', 'stroke-width': '0.5' }));
      if (t === 'yellow') { s.appendChild(se('ellipse', { cx: '8', cy: '28', rx: '5', ry: '8', fill: c.d })); s.appendChild(se('ellipse', { cx: '52', cy: '28', rx: '5', ry: '8', fill: c.d })) }
      s.appendChild(se('path', { d: 'M10,35 Q10,8 30,5 Q50,8 50,35 Q50,44 45,47 L40,50 30,52 20,50 15,47 Q10,44 10,35Z', fill: c.m, stroke: c.d, 'stroke-width': '1' }));
      s.appendChild(se('path', { d: 'M15,20 Q15,12 30,10 Q38,12 38,20', fill: 'none', stroke: c.l, 'stroke-width': '1', opacity: '0.4' }));
      s.appendChild(se('path', { d: VP[t], fill: '#111', stroke: '#222', 'stroke-width': '0.5' }));
      s.appendChild(se('path', { d: 'M19,26 L27,20 L30,23 L33,20 L41,26', fill: 'none', stroke: 'rgba(255,255,255,0.35)', 'stroke-width': '1.5' }));
      s.appendChild(se('path', { d: 'M21,37 L39,37 L37,44 Q30,47 23,44Z', fill: '#1a1a1a' }));
      [26, 30, 34].forEach(function (x) { s.appendChild(se('line', { x1: '' + x, y1: '38', x2: '' + x, y2: '43', stroke: '#333', 'stroke-width': '0.5' })) });
      s.appendChild(se('rect', { x: '22', y: '50', width: '16', height: '6', rx: '2', fill: c.d }));
      s.appendChild(se('path', { d: 'M12,56 L22,53 L38,53 L48,56 L48,90 Q48,95 44,95 L16,95 Q12,95 12,90Z', fill: c.m, stroke: c.d, 'stroke-width': '0.5' }));
      s.appendChild(se('path', { d: t === 'pink' ? 'M30,60 L25,65 L30,72 L35,65Z' : 'M30,58 L37,65 L30,74 L23,65Z', fill: 'none', stroke: 'rgba(255,255,255,0.3)', 'stroke-width': '1' }));
      s.appendChild(se('rect', { x: '12', y: '78', width: '36', height: '5', fill: '#ffd700' }));
      s.appendChild(se('circle', { cx: '30', cy: '80.5', r: '3', fill: '#fff', stroke: '#ddd', 'stroke-width': '0.5' }));
      if (t === 'black') { s.appendChild(se('path', { d: 'M8,56 L16,53 L16,62 Q12,62 8,60Z', fill: c.d })); s.appendChild(se('path', { d: 'M52,56 L44,53 L44,62 Q48,62 52,60Z', fill: c.d })) }
      return s;
    }
    function mkV(sc) {
      sc = sc || 1; var w = Math.round(60 * sc), h = Math.round(100 * sc);
      var s = se('svg', { viewBox: '0 0 60 100', width: '' + w, height: '' + h });
      s.appendChild(se('path', { d: 'M15,12 L8,-2 L20,10', fill: '#7b1fa2' }));
      s.appendChild(se('path', { d: 'M45,12 L52,-2 L40,10', fill: '#7b1fa2' }));
      s.appendChild(se('path', { d: 'M10,35 Q10,8 30,5 Q50,8 50,35 Q50,44 45,47 L40,50 30,52 20,50 15,47 Q10,44 10,35Z', fill: '#1a0a2a', stroke: '#6a1b9a', 'stroke-width': '1' }));
      s.appendChild(se('path', { d: 'M14,24 L22,17 L30,22 L38,17 L46,24 L42,32 L18,32Z', fill: '#b71c1c', stroke: '#e53935', 'stroke-width': '0.5' }));
      s.appendChild(se('circle', { cx: '23', cy: '24', r: '2.5', fill: '#ff0', opacity: '0.9' }));
      s.appendChild(se('circle', { cx: '37', cy: '24', r: '2.5', fill: '#ff0', opacity: '0.9' }));
      s.appendChild(se('path', { d: 'M22,39 L30,42 L38,39', fill: 'none', stroke: '#7b1fa2', 'stroke-width': '1.5' }));
      s.appendChild(se('path', { d: 'M12,56 L22,53 L38,53 L48,56 L48,90 Q48,95 44,95 L16,95 Q12,95 12,90Z', fill: '#12062a', stroke: '#4a148c', 'stroke-width': '0.5' }));
      s.appendChild(se('path', { d: 'M8,56 L4,92 L16,88 L12,56', fill: '#4a148c', opacity: '0.6' }));
      s.appendChild(se('path', { d: 'M52,56 L56,92 L44,88 L48,56', fill: '#4a148c', opacity: '0.6' }));
      s.appendChild(se('rect', { x: '12', y: '78', width: '36', height: '5', fill: '#7b1fa2' }));
      s.appendChild(se('circle', { cx: '30', cy: '80.5', r: '3', fill: '#b71c1c', stroke: '#e53935', 'stroke-width': '0.5' }));
      return s;
    }
    function mkD(sc) {
      sc = sc || 1; var w = Math.round(60 * sc), h = Math.round(100 * sc);
      var s = se('svg', { viewBox: '0 0 60 100', width: '' + w, height: '' + h });
      s.appendChild(se('path', { d: 'M20,22 Q20,8 30,6 Q40,8 40,22 L38,18 Q35,13 30,11 Q25,13 22,18Z', fill: '#b0b0b0' }));
      s.appendChild(se('path', { d: 'M20,16 Q20,10 22,8', fill: 'none', stroke: '#ccc', 'stroke-width': '0.8', opacity: '0.5' }));
      s.appendChild(se('path', { d: 'M38,16 Q38,10 36,8', fill: 'none', stroke: '#ccc', 'stroke-width': '0.8', opacity: '0.5' }));
      s.appendChild(se('ellipse', { cx: '30', cy: '30', rx: '13', ry: '15', fill: '#deb887' }));
      s.appendChild(se('path', { d: 'M20,24 L27,23', fill: 'none', stroke: '#bbb', 'stroke-width': '1.5' }));
      s.appendChild(se('path', { d: 'M33,23 L40,24', fill: 'none', stroke: '#bbb', 'stroke-width': '1.5' }));
      s.appendChild(se('path', { d: 'M22,21 Q26,19 29,21', fill: 'none', stroke: '#c8b090', 'stroke-width': '0.6' }));
      s.appendChild(se('path', { d: 'M31,21 Q34,19 38,21', fill: 'none', stroke: '#c8b090', 'stroke-width': '0.6' }));
      s.appendChild(se('rect', { x: '20', y: '26', width: '9', height: '6', rx: '2', fill: 'none', stroke: '#777', 'stroke-width': '1.5' }));
      s.appendChild(se('rect', { x: '31', y: '26', width: '9', height: '6', rx: '2', fill: 'none', stroke: '#777', 'stroke-width': '1.5' }));
      s.appendChild(se('line', { x1: '29', y1: '29', x2: '31', y2: '29', stroke: '#777', 'stroke-width': '1' }));
      s.appendChild(se('circle', { cx: '24.5', cy: '29', r: '1.5', fill: '#333' }));
      s.appendChild(se('circle', { cx: '35.5', cy: '29', r: '1.5', fill: '#333' }));
      s.appendChild(se('path', { d: 'M18,32 Q20,34 22,32', fill: 'none', stroke: '#c8a878', 'stroke-width': '0.5' }));
      s.appendChild(se('path', { d: 'M38,32 Q40,34 42,32', fill: 'none', stroke: '#c8a878', 'stroke-width': '0.5' }));
      s.appendChild(se('path', { d: 'M26,37 Q30,38 34,37', fill: 'none', stroke: '#a0522d', 'stroke-width': '1' }));
      s.appendChild(se('path', { d: 'M25,39 Q30,42 35,39', fill: 'none', stroke: '#bbb', 'stroke-width': '1' }));
      s.appendChild(se('rect', { x: '27', y: '43', width: '6', height: '5', fill: '#deb887' }));
      s.appendChild(se('path', { d: 'M10,52 L22,48 L38,48 L50,52 L52,95 L8,95Z', fill: '#f0f0f0', stroke: '#ddd', 'stroke-width': '0.5' }));
      s.appendChild(se('path', { d: 'M24,48 L30,56 L30,95', fill: 'none', stroke: '#e0e0e0', 'stroke-width': '1' }));
      s.appendChild(se('path', { d: 'M36,48 L30,56 L30,95', fill: 'none', stroke: '#e0e0e0', 'stroke-width': '1' }));
      s.appendChild(se('path', { d: 'M25,48 L30,53 L35,48', fill: '#5b86e5' }));
      s.appendChild(se('rect', { x: '34', y: '62', width: '8', height: '9', rx: '1', fill: 'none', stroke: '#ddd', 'stroke-width': '0.5' }));
      s.appendChild(se('line', { x1: '37', y1: '60', x2: '37', y2: '64', stroke: '#1565c0', 'stroke-width': '1.5' }));
      return s;
    }
    // 평상복 실루엣 (mkR과 동일 viewBox/비율)
    var SIL_COLORS = { red: ['#e53935', '#b71c1c'], black: ['#777', '#333'], blue: ['#42a5f5', '#0d47a1'], yellow: ['#fdd835', '#f57f17'], pink: ['#f48fb1', '#c2185b'], doc: ['#b0b0b0', '#757575'] };
    function mkSil(t, sc) {
      // mkR과 동일한 외곽선, 내부 디테일 없이 그라데이션 실루엣
      sc = sc || 1; var w = Math.round(60 * sc), h = Math.round(100 * sc);
      var cl = SIL_COLORS[t] || SIL_COLORS.doc;
      var s = se('svg', { viewBox: '0 0 60 100', width: '' + w, height: '' + h });
      var uid = 'sg_' + t + '_' + Math.random().toString(36).substr(2, 4);
      var df = se('defs');
      var gr = se('linearGradient', { id: uid, x1: '0', y1: '0', x2: '0', y2: '1' });
      gr.appendChild(se('stop', { offset: '0%', 'stop-color': cl[0], 'stop-opacity': '0.9' }));
      gr.appendChild(se('stop', { offset: '100%', 'stop-color': cl[1], 'stop-opacity': '0.7' }));
      df.appendChild(gr); s.appendChild(df);
      var f = 'url(#' + uid + ')';
      // 머리~목~몸통을 하나의 연속 path로 (내부 경계선 없음)
      s.appendChild(se('path', { d: 'M10,35 Q10,8 30,5 Q50,8 50,35 Q50,44 45,47 L38,53 L48,56 L48,90 Q48,95 44,95 L16,95 Q12,95 12,90 L12,56 L22,53 L15,47 Q10,44 10,35Z', fill: f }));
      return s;
    }
    function mkWrap(t, sc) { var w = document.createElement('div'); w.className = 'rw'; w.dataset.t = t; var base = t.replace('_sil', ''); if (t.indexOf('_sil') > -1) { w.appendChild(mkSil(base, sc)); w.style.filter = 'drop-shadow(0 2px 8px ' + ((SIL_COLORS[base] || SIL_COLORS.doc)[0]) + '40)' } else if (t === 'chaos') w.appendChild(mkV(sc)); else if (t === 'doc') w.appendChild(mkD(sc)); else if (t === 'titan') { w.appendChild(mkEnemy({ id: 'titan', color: '#7b1fa2', bodyColor: '#4a148c' }, 4.5)); w.style.filter = 'drop-shadow(0 0 32px rgba(123,31,162,0.8))' } else w.appendChild(mkR(t, sc)); return w }

    /* ===== ENGINE ===== */
    var idx = 0, flags = {}, busy = false;
    var bSt = { eH: 0, eM: 0, tH: 0, tM: 0 };
    function $(i) { return document.getElementById(i) }
    function clr(e) { while (e.firstChild) e.removeChild(e.firstChild) }
    function txEl(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; e.textContent = txt; return e }
    function showScr(id) {
      document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active') }); $(id + '-screen').classList.add('active');
      // 일시정지 버튼은 전투/스토리에서만 표시
      var pb = $('pause-btn'); if (pb) pb.style.display = (id === 'battle' || id === 'scene') ? 'flex' : 'none';
      // 일시정지 닫기
      gamePaused = false; var po = $('pause-overlay'); if (po) po.classList.remove('on');
    }

    function run() {
      if (idx >= S.length) return;
      var s = S[idx];
      if (s.if) { var k = Object.keys(s.if)[0]; if (flags[k] !== s.if[k]) { idx++; run(); return } }
      busy = true;
      var tp = s.t;
      if (tp === 'ch') doChapter(s);
      else if (tp === 'bg') { $('sbg').className = 'scene-bg bg-' + s.v; var dk = s.v === 'night' || s.v === 'battle' || s.v === 'lab-ev'; $('dlg').classList.toggle('dark', dk); if (s.v === 'battle') playBgm('battle'); else if (s.v === 'night') stopAllBgm(); else if (curBgm !== 'daily') playBgm('daily'); idx++; run() }
      else if (tp === 'border') { $('dlg').classList.toggle('red-border', s.v === 'red'); idx++; run() }
      else if (tp === 'img') doImg(s);
      else if (tp === 'sfx') doSfx(s);
      else if (tp === 'n') doNarr(s);
      else if (tp === 'd') doDialog(s);
      else if (tp === 'q') doChoice(s);
      else if (tp === 'pause') doPause(s);
      else if (tp === 'fx') doFx(s);
      else if (tp === 'drama') doDrama(s);
      else if (tp === 'bs') doBs(s);
      else if (tp === 'bh') doBh(s);
      else if (tp === 'be') doBe();
      else if (tp === 'aff') doAff(s);
      else if (tp === 'bgm') { playBgm(s.v); idx++; run() }
      else if (tp === 'boost') { $('btf').classList.add('boost'); $('bthud').classList.add('boost'); idx++; run() }
      else if (tp === 'end') doEnd();
    }
    function next() { if (busy) return; idx++; run() }

    function doChapter(s) {
      var c = $('chCard'); clr(c);
      if (s.n) c.appendChild(txEl('div', 'ch-num', s.n));
      if (s.tt) c.appendChild(txEl('div', 'ch-title', s.tt));
      c.classList.add('on');
      chapterTimer = setTimeout(function () { chapterTimer = null; c.classList.remove('on'); idx++; busy = false; run() }, 2200);
      c.onclick = function () { if (chapterTimer) { skipChapter(); c.onclick = null } };
    }
    function doImg(s) {
      showScr('scene'); clr($('sfx')); hideDrama();
      var wrap = document.createElement('div'); wrap.className = 'scene-cg';
      var img = document.createElement('img'); img.src = s.src; wrap.appendChild(img);
      var hint = document.createElement('div'); hint.className = 'cg-hint'; hint.textContent = '▼ 터치'; wrap.appendChild(hint);
      $('sbg').appendChild(wrap);
      $('spk').textContent = ''; $('dtxt').textContent = '';
      $('dnext').style.display = 'none'; $('chArea').style.display = 'none';
      busy = true;
      wrap.addEventListener('click', function () {
        wrap.style.opacity = '0'; wrap.style.transition = 'opacity 0.5s';
        setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap) }, 500);
        busy = false; idx++; run();
      });
    }
    function doSfx(s) {
      showScr('scene'); var area = $('sfx'); clr(area); hideDrama();
      var dark = $('sbg').className.indexOf('night') > -1 || $('sbg').className.indexOf('battle') > -1;
      area.appendChild(txEl('div', dark ? 'sfx-t dark' : 'sfx-t', s.v));
      $('spk').textContent = ''; $('dtxt').textContent = '';
      $('dnext').style.display = 'block'; $('chArea').style.display = 'none';
      busy = false;
    }
    function doNarr(s) {
      showScr('scene'); clr($('sfx')); hideDrama(); if ('ch' in s) setChars(s);
      $('spk').textContent = '';
      var d = $('dtxt'); d.textContent = s.tx;
      d.className = 'd-txt' + (s.st === 'center' ? ' center' : '');
      $('dnext').style.display = 'block'; $('chArea').style.display = 'none';
      busy = false;
    }
    function doDialog(s) {
      showScr('scene'); clr($('sfx')); hideDrama(); setChars(s);
      $('spk').textContent = '\u3010' + s.sp + '\u3011'; $('spk').style.color = s.cl || '#fff';
      $('dtxt').textContent = s.tx; $('dtxt').className = 'd-txt';
      $('dnext').style.display = 'block'; $('chArea').style.display = 'none';
      busy = false;
    }
    function doChoice(s) {
      showScr('scene'); clr($('sfx')); hideDrama(); if ('ch' in s) setChars(s);
      $('spk').textContent = ''; $('dtxt').textContent = s.tx; $('dtxt').className = 'd-txt';
      $('dnext').style.display = 'none';
      var area = $('chArea'); clr(area); area.style.display = 'flex';
      s.opts.forEach(function (o) {
        var btn = document.createElement('button'); btn.className = 'ch-btn'; btn.textContent = o.tx;
        btn.addEventListener('click', function () {
          flags[s.fl] = o.v; btn.classList.add('picked');
          area.style.display = 'none'; $('dnext').style.display = 'block';
          idx++; busy = false; setTimeout(run, 350);
        });
        area.appendChild(btn);
      });
    }
    function doPause(s) { pauseTimer = setTimeout(function () { pauseTimer = null; idx++; busy = false; run() }, s.ms || 1000) }
    function doFx(s) { inlineFx(s.v); idx++; setTimeout(function () { busy = false; run() }, 600) }
    function inlineFx(v) {
      if (v.indexOf('flash-') === 0) { var el = $('fl'); el.className = 'fl'; void el.offsetWidth; el.classList.add(v.replace('flash-', '')) }
      if (v === 'shake') { var sb = $('scene-screen') || $('game').querySelector('.screen.active'); if (sb) { sb.classList.add('shake-fx'); setTimeout(function () { sb.classList.remove('shake-fx') }, 500) } }
    }
    function doDrama(s) {
      showScr('scene'); clr($('sfx'));
      $('spk').textContent = ''; $('dtxt').textContent = '';
      $('dnext').style.display = 'none'; $('chArea').style.display = 'none';
      var area = $('drama'); clr(area); area.style.display = 'flex';
      s.lines.forEach(function (l) {
        var cls = 'drama-line';
        if (s.cls) s.cls.split(' ').forEach(function (c) { if (c) cls += ' ' + c });
        area.appendChild(txEl('div', cls, l));
      });
      idx++; busy = false; run();
    }
    function hideDrama() { $('drama').style.display = 'none' }
    function doAff(s) {
      var el = document.createElement('div');
      el.className = 'aff-pop ' + (s.dir === 'down' ? 'down' : 'up');
      el.textContent = (s.dir === 'down' ? '▼ ' : '♥ ') + s.tx;
      $('sbg').appendChild(el);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el) }, 1900);
      idx++; busy = true; setTimeout(function () { busy = false; run() }, 1200);
    }
    function doBs(s) {
      clr($('sfx')); hideDrama();
      bSt = { eH: s.eHp || 100, eM: s.eHp || 100, tH: s.tHp || 100, tM: s.tHp || 100 };
      $('bhud').classList.add('on'); $('bthud').classList.add('on'); $('btf').classList.remove('boost'); $('bthud').classList.remove('boost');
      $('ben').textContent = s.en || ''; updB(); idx++; run();
    }
    function doBh(s) {
      if (s.eHp !== undefined) bSt.eH = Math.max(0, s.eHp);
      if (s.tHp !== undefined) bSt.tH = Math.max(0, s.tHp);
      updB(); busy = true; setTimeout(function () { busy = false; idx++; run() }, 600);
    }
    function doBe() { $('bhud').classList.remove('on'); $('bthud').classList.remove('on'); idx++; run() }
    function updB() {
      $('bef').style.width = Math.max(0, Math.min(100, Math.round((bSt.eM > 0 ? bSt.eH / bSt.eM : 0) * 100))) + '%';
      $('btf').style.width = Math.max(0, Math.min(100, Math.round((bSt.tM > 0 ? bSt.tH / bSt.tM : 0) * 100))) + '%';
      $('behl').textContent = bSt.eH + ' / ' + bSt.eM;
      $('bthl').textContent = bSt.tH + ' / ' + bSt.tM;
    }
    function doEnd() {
      stopAllBgm();
      var es = $('ending-screen'); es.classList.remove('end-show'); void es.offsetWidth;
      // 기존 파티클 제거
      var oldP = es.querySelectorAll('.end-particle'); for (var i = 0; i < oldP.length; i++) oldP[i].remove();
      showScr('ending'); es.classList.add('end-show');
      // 파티클 생성
      for (var p = 0; p < 12; p++) {
        var dot = document.createElement('div'); dot.className = 'end-particle';
        dot.style.left = (10 + Math.random() * 80) + '%';
        dot.style.bottom = (-5 + Math.random() * 10) + '%';
        dot.style.animationDelay = (Math.random() * 4) + 's';
        dot.style.animationDuration = (4 + Math.random() * 4) + 's';
        dot.style.width = dot.style.height = (1 + Math.random() * 2) + 'px';
        es.appendChild(dot);
      }
      // 상단 텍스트
      var el = $('endQ'); clr(el);
      el.appendChild(txEl('div', 'end-line dim', '어둠 속에서 빛을 지킨 하루.'));
      el.appendChild(document.createElement('br'));
      el.appendChild(txEl('div', 'end-line', '오늘도 도시를 지켰다.'));
      el.appendChild(txEl('div', 'end-line bright', '내일도 지킬 것이다.'));
      var dv = document.createElement('div'); dv.className = 'end-divider'; el.appendChild(dv);
      el.appendChild(txEl('div', 'end-line', '그게 우리의 일상이니까.'));
      var ep = document.createElement('div'); ep.style.cssText = 'color:#9575cd;font-size:12px;text-align:center;margin-top:24px;letter-spacing:2px;opacity:0;animation:fadeIn 2s 4s forwards'; ep.textContent = '— 프리퀄 에피소드 —';
      var ep2 = document.createElement('div'); ep2.style.cssText = 'color:#555;font-size:11px;text-align:center;margin-top:8px;opacity:0;animation:fadeIn 2s 5s forwards'; ep2.textContent = '본편에서 이어집니다.';
      el.appendChild(ep); el.appendChild(ep2);
      // 이미지 영역
      var imgArea = $('end-img'); clr(imgArea);
      var img1 = document.createElement('img'); img1.src = 'explosion.png'; img1.className = 'end-cg';
      imgArea.appendChild(img1);
      // 서브타이틀 추가
      var tw = document.querySelector('.end-title-wrap');
      if (tw && !tw.querySelector('.end-subtitle')) {
        var st = document.createElement('div'); st.className = 'end-subtitle'; st.textContent = "DOCTOR'S DAY";
        tw.appendChild(st);
      }
    }

    function setChars(s) {
      var area = $('chars'); clr(area);
      if (!s || !s.ch || !s.ch.length) { area.className = 's-chars'; return }
      var cls = 's-chars';
      if (s.lo === 'left') cls += ' ch-left';
      else if (s.lo === 'right') cls += ' ch-right';
      else if (s.lo === 'spread') cls += ' ch-spread';
      else if (s.lo === 'sides') cls += ' ch-sides';
      area.className = cls;
      var sc = s.ch.length > 3 ? 0.75 : 0.95;
      s.ch.forEach(function (t) {
        var w = mkWrap(t, sc);
        if (s.tk && s.tk !== t) w.classList.add('dim');
        if (s.tk && s.tk === t) w.classList.add('talk');
        w.classList.add('enter');
        area.appendChild(w);
      });
    }

    $('btn-story').addEventListener('click', function () { idx = 0; flags = {}; $('bhud').classList.remove('on'); $('bthud').classList.remove('on'); $('btf').classList.remove('boost'); $('bthud').classList.remove('boost'); stopAllBgm(); playBgm('daily'); showScr('scene'); run() });
    var lastClick = 0;
    var pauseTimer = null; var chapterTimer = null;
    function skipPause() { if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; idx++; busy = false; run() } }
    function skipChapter() { if (chapterTimer) { clearTimeout(chapterTimer); chapterTimer = null; $('chCard').classList.remove('on'); idx++; busy = false; run() } }
    $('dlg').addEventListener('click', function (e) {
      if (gamePaused) return;
      if (e.target.classList.contains('ch-btn')) return;
      if ($('chArea').style.display === 'flex') return;
      var now = Date.now(); if (now - lastClick < 150) return; lastClick = now;
      if (pauseTimer) { skipPause(); return }
      if (chapterTimer) { skipChapter(); return }
      next();
    });
    $('sbg').addEventListener('click', function (e) {
      if (gamePaused) return;
      if (pauseTimer) { skipPause(); return }
      if (chapterTimer) { skipChapter(); return }
    });
    $('btn-title').addEventListener('click', function () { stopAllBgm(); showScr('title') });

    /* ═══════════════════════════════════════════
       전투 훈련 모드 — 로그라이크 전투 시스템
       ═══════════════════════════════════════════ */

    // ── 캐릭터 데이터 ──
    var RANGERS = {
      red: {
        name: '\uB808\uB4DC', color: '#e53935', weapon: '\uB300\uAC80',
        hp: 30, atk: 12, def: 10, crit: 15, dodge: 10, sp: 100,
        skill: { name: '\uBBF8\uB77C\uD074 \uC2AC\uB798\uC2DC', cost: 50, multi: 3.0, desc: '\uACF5\uACA9\uB825 300% \uB300\uAC80 \uC77C\uACA9', ignoreDef: 0 },
        support: { name: '\uB9AC\uB354\uC758 \uACA9\uB824', desc: '\uACF5\uACA9\uB825 +50% (2\uD134)', type: 'buff', stat: 'atk', val: 0.50, turns: 2 }
      },
      black: {
        name: '\uBE14\uB799', color: '#555', weapon: '\uCD1D',
        hp: 30, atk: 12, def: 10, crit: 15, dodge: 10, sp: 100,
        skill: { name: '\uD480\uBC84\uC2A4\uD2B8 \uC0F7', cost: 50, multi: 2.0, desc: '\uACF5\uACA9\uB825 200% + \uBC29\uC5B4\uBB34\uC2DC 50%', ignoreDef: 0.5 },
        support: { name: '\uD654\uB825 \uC9C0\uC6D0', desc: '3\uD134\uAC04 \uC790\uB3D9 \uD53C\uD574 75%', type: 'autoAttack', multi: 0.75, turns: 3 }
      },
      blue: {
        name: '\uBE14\uB8E8', color: '#1565c0', weapon: '\uAC80',
        hp: 30, atk: 12, def: 10, crit: 15, dodge: 10, sp: 100,
        skill: { name: '\uC18C\uB2C9 \uBE14\uB808\uC774\uB4DC', cost: 50, multi: 2.5, desc: '\uACF5\uACA9\uB825 250% + \uCE58\uBA85\uD0C0 \uD655\uB960 +20%', critBonus: 0.20, ignoreDef: 0 },
        support: { name: '\uC804\uC220 \uC9C0\uC6D0', desc: '3\uD134\uAC04 \uCD94\uAC00 \uD589\uB3D9 +40%', type: 'extraAtkBuff', val: 0.40, turns: 3 }
      },
      yellow: {
        name: '\uC610\uB85C', color: '#f9a825', weapon: '\uD074\uB85C',
        hp: 30, atk: 12, def: 10, crit: 15, dodge: 10, sp: 100,
        skill: { name: '\uC36C\uB354 \uD06C\uB7EC\uC26C', cost: 50, multi: 0.8, desc: '\uACF5\uACA9\uB825 80% + \uC2A4\uD134 1\uD134', stun: 1, ignoreDef: 0 },
        support: { name: '\uBC88\uAC1C \uCDA9\uC804', desc: 'SP 50% + 25%(3\uD134)', type: 'sp_regen', val: 0.50, regenVal: 0.25, turns: 3 }
      },
      pink: {
        name: '\uD551\uD06C', color: '#ec407a', weapon: '\uCC44\uCC0D',
        hp: 30, atk: 12, def: 10, crit: 15, dodge: 10, sp: 100,
        skill: { name: '\uBC14\uC778\uB4DC \uC704\uD504', cost: 50, multi: 1.5, desc: '\uACF5\uACA9\uB825 150% + \uC274\uB4DC 50% \uBD80\uC5EC', heal: 0.50, ignoreDef: 0 },
        support: { name: '\uD790\uB9C1 \uC704\uD504', desc: '3\uD134\uAC04 \uCCB4\uB825 5% \uD68C\uBCF5 + \uBC29\uC5B4\uC274\uB4DC 50%', type: 'regenShield', healPct: 0.05, shieldRatio: 0.50, turns: 3 }
      }
    };

    // ── 일반 괴인 풀 (10종) ──
    var MOBS = [
      {
        id: 'shadow', name: '섀도 졸병', color: '#9575cd', bodyColor: '#7e57c2',
        hpM: 1, atkM: 1, defM: 1, special: { type: 'stealth', every: 3 }, desc: '3턴마다 은신'
      },
      {
        id: 'blaze', name: '블레이즈 헌터', color: '#ff7043', bodyColor: '#e64a19',
        hpM: 0.8, atkM: 1.3, defM: 0.8, special: { type: 'burn', val: 1, turns: 2 }, desc: '공격 시 화상'
      },
      {
        id: 'iron', name: '아이언 가드', color: '#90a4ae', bodyColor: '#607d8b',
        hpM: 1.3, atkM: 0.8, defM: 1.5, special: { type: 'shield', hp: 5 }, desc: '쉴드 보유'
      },
      {
        id: 'phantom', name: '스피드 팬텀', color: '#ce93d8', bodyColor: '#ab47bc',
        hpM: 0.7, atkM: 1.0, defM: 0.7, special: { type: 'dodge', val: 0.25 }, desc: '빠른 유령'
      },
      {
        id: 'spider', name: '독 스파이더', color: '#66bb6a', bodyColor: '#388e3c',
        hpM: 0.9, atkM: 1.1, defM: 0.9, special: { type: 'poison', dmg: 2, turns: 3 }, desc: '독을 뿌리는 거미'
      },
      {
        id: 'wolf', name: '썬더 울프', color: '#ffee58', bodyColor: '#f9a825',
        hpM: 0.9, atkM: 1.2, defM: 0.9, special: { type: 'shock', val: 8 }, desc: '30% 확률 SP 감소'
      },
      {
        id: 'frost', name: '프로스트 고스트', color: '#81d4fa', bodyColor: '#4fc3f7',
        hpM: 1.0, atkM: 0.9, defM: 1.2, special: { type: 'freeze', val: 0.2, turns: 2 }, desc: '얼음 유령'
      },
      {
        id: 'knight', name: '다크 나이트', color: '#424242', bodyColor: '#212121',
        hpM: 1.1, atkM: 1.15, defM: 1.15, special: { type: 'counter', val: 0.4 }, desc: '일반공격 시 반격'
      },
      {
        id: 'seed', name: '카오스 씨드', color: '#ef5350', bodyColor: '#c62828',
        hpM: 0.5, atkM: 1.8, defM: 0.5, special: { type: 'bomb', turns: 3 }, desc: '3턴 후 자폭'
      },
      {
        id: 'witch', name: '마인드 위치', color: '#f48fb1', bodyColor: '#ec407a',
        hpM: 0.85, atkM: 1.0, defM: 0.9, special: { type: 'spdrain', val: 5 }, desc: 'SP를 흡수하는 마녀'
      }
    ];

    // ── 보스 괴인 풀 (5종) ──
    var BOSSES = [
      {
        id: 'titan', name: '다크 타이탄', color: '#7b1fa2', bodyColor: '#4a148c',
        hpM: 2.0, atkM: 1.3, defM: 1.2, special: { type: 'smash', every: 3, multi: 2.0 }, desc: '3턴마다 강타'
      },
      {
        id: 'serpent', name: '카오스 서펜트', color: '#2e7d32', bodyColor: '#1b5e20',
        hpM: 2.5, atkM: 1.0, defM: 1.0, special: { type: 'poison', dmg: 2, turns: 5 }, desc: '5턴 독 피해'
      },
      {
        id: 'reaper', name: '섀도 리퍼', color: '#37474f', bodyColor: '#263238',
        hpM: 1.5, atkM: 1.4, defM: 0.9, special: { type: 'double', chance: 0.5 }, desc: '50% 확률 2연타'
      },
      {
        id: 'golem', name: '아비스 골렘', color: '#8d6e63', bodyColor: '#5d4037',
        hpM: 3.0, atkM: 0.9, defM: 2.0, special: { type: 'armor', every: 3, shield: 7 }, desc: '높은 방어, 3턴마다 해제'
      },
      {
        id: 'general', name: '카오스 장군', color: '#c62828', bodyColor: '#b71c1c',
        hpM: 2.2, atkM: 1.2, defM: 1.3, special: { type: 'rally', every: 2 }, desc: '2턴마다 자가 버프'
      }
    ];

    // ── 보상 풀 ──
    var REWARDS = [
      // 1회성 회복
      { name: '체력 회복', desc: '체력 80% 회복', icon: '❤️', fn: function (p) { var h = Math.round(p.maxHp * 0.8); p.hp = Math.min(p.maxHp, p.hp + h); return '체력 +' + h } },
      { name: 'SP 회복', desc: 'SP 전체 회복', icon: '💎', fn: function (p) { p.sp = p.maxSp; return 'SP 최대!' } },
      // 기본 스탯 강화
      { name: '공격력 강화', desc: '공격력 +3', icon: '⚔️', fn: function (p) { p.atk += 3; return '공격력 +3' } },
      { name: '쉴드력 강화', desc: '쉴드력 +3', icon: '🛡️', fn: function (p) { p.def += 3; return '쉴드력 +3' } },
      { name: '치명타확률 강화', desc: '치명타확률 +4%', icon: '💥', fn: function (p) { p.crit += 4; return '치명타확률 +4%' } },
      { name: '회피확률 강화', desc: '회피확률 +4%', icon: '💨', fn: function (p) { p.dodge += 4; return '회피확률 +4%' } },
      { name: '최대 체력 증가', desc: '최대 체력 +8', icon: '💖', fn: function (p) { p.maxHp += 8; p.hp += 8; return '최대 체력 +8' } },
      { name: '최대 SP 증가', desc: '최대 SP +20', icon: '💠', fn: function (p) { p.maxSp += 20; p.sp = Math.min(p.maxSp, p.sp + 20); return '최대 SP +20' } },
      // 비례 스탯 강화
      { name: '공격력 연마', desc: '공격력 +15%', icon: '⚔️', fn: function (p) { var add = Math.max(2, Math.round(p.atk * 0.15)); p.atk += add; return '공격력 +' + add + ' (+15%)' } },
      { name: '체력 단련', desc: '최대 체력 +15%', icon: '💖', fn: function (p) { var add = Math.max(3, Math.round(p.maxHp * 0.15)); p.maxHp += add; p.hp += add; return '최대 체력 +' + add + ' (+15%)' } },
      { name: '쉴드 연마', desc: '쉴드력 +15%', icon: '🛡️', fn: function (p) { var add = Math.max(2, Math.round(p.def * 0.15)); p.def += add; return '쉴드력 +' + add + ' (+15%)' } },
      // 희귀 — 세부 스탯
      { name: '전체 강화', desc: '공격+2 쉴드력+2 치명타+3%', icon: '⚡', fn: function (p) { p.atk += 2; p.def += 2; p.crit += 3; return '전체 강화!' }, rare: 1 },
      { name: '강화 장갑', desc: '받는 피해 -8%', icon: '🔰', fn: function (p) { BT.perkDmgReduce = Math.min(0.50, BT.perkDmgReduce + 0.08); return '피해 감소 +8%! (총 ' + Math.round(BT.perkDmgReduce * 100) + '%)' }, rare: 1 },
      { name: '치명타 증폭', desc: '치명타 피해 +25%', icon: '💥', fn: function (p) { BT.perkCritDmg += 0.25; return '치명타 피해 +25%! (x' + (1.5 + BT.perkCritDmg).toFixed(2) + ')' }, rare: 1 },
      { name: '쉴드 강화', desc: '쉴드 생성량 +25%', icon: '🛡️', fn: function (p) { BT.perkShieldUp += 0.25; return '쉴드량 +25%! (총 +' + Math.round(BT.perkShieldUp * 100) + '%)' }, rare: 1 },
      { name: '파괴자', desc: '주는 피해 +8%', icon: '⚔️', fn: function (p) { BT.perkDmgUp += 0.08; return '피해 +8%! (총 +' + Math.round(BT.perkDmgUp * 100) + '%)' }, rare: 1 },
      { name: '관통탄', desc: '방어 관통 +15% (최대 70%)', icon: '🎯', fn: function (p) { BT.perkArmorPen = Math.min(0.70, BT.perkArmorPen + 0.15); return '관통 +15%! (총 ' + Math.round(BT.perkArmorPen * 100) + '%)' }, rare: 1 },
      // 희귀 — 전투 특수 효과
      { name: '재생의 기운', desc: '웨이브 종료 시 체력 5% 회복', icon: '💚', fn: function (p) { BT.perkEndHpRegen += 0.05; return '웨이브 종료 체력 회복 +5%! (총 ' + Math.round(BT.perkEndHpRegen * 100) + '%)' }, rare: 1 },
      { name: '에너지 충전', desc: '웨이브 종료 시 SP 10% 회복', icon: '🔋', fn: function (p) { BT.perkEndSpRegen += 0.10; return '웨이브 종료 SP 회복 +10%! (총 ' + Math.round(BT.perkEndSpRegen * 100) + '%)' }, rare: 1 },
      { name: '흡혈의 손길', desc: '공격 시 체력 10% 흡수', icon: '🧛', fn: function (p) { BT.perkVamp += 0.10; return '체력 흡수 +10%! (총 ' + Math.round(BT.perkVamp * 100) + '%)' }, rare: 1 },
      { name: '기선제압', desc: '매 웨이브 첫 공격 피해 +20%', icon: '⚡', fn: function (p) { BT.perkFirstStrike += 0.20; return '첫 공격 +20%! (총 +' + Math.round(BT.perkFirstStrike * 100) + '%)' }, rare: 1 }
    ];

    // ── 패시브 버프 (기본 수치 + 매턴 성장) ──
    var PASSIVE_BUFFS = {
      red: {
        name: '불꽃의 의지', desc: '치명타 피해 +10% (매턴 +10%)', icon: '🔥',
        apply: function (p) { BT.perkCritDmg += 0.10 },
        grow: function (p) { BT.perkCritDmg += 0.10; BT.passiveGrowth.critDmg += 0.10 },
        growDesc: '치명타 피해 +10%'
      },
      black: {
        name: '사수의 눈', desc: '방어 관통 +20% (매턴 공격력 +5%)', icon: '🎯',
        apply: function (p) { BT.perkArmorPen += 0.20 },
        grow: function (p) { var add = Math.max(1, Math.round(p.atk * 0.05)); p.atk += add; BT.passiveGrowth.atk += add },
        growDesc: '공격력 +5%'
      },
      blue: {
        name: '전술의 눈', desc: '치명타+5%, 추가행동 +5% (매턴 둘 다 +5%)', icon: '🎯',
        apply: function (p) { BT.perkCritChance += 0.05; BT.perkExtraAtk = (BT.perkExtraAtk || 0) + 0.05 },
        grow: function (p) { BT.perkCritChance += 0.05; BT.passiveGrowth.critChance += 0.05; BT.perkExtraAtk += 0.05; BT.passiveGrowth.extraAtk += 0.05 },
        growDesc: '치명타+5% 추가행동+5%'
      },
      yellow: {
        name: '번개의 에너지', desc: '매턴 SP 10% 회복 (매턴 회피확률 +5%)', icon: '⚡',
        apply: function (p) { p.spRegen += Math.round(p.maxSp * 0.10) },
        grow: function (p) { p.dodge += 5; BT.passiveGrowth.dodge += 5 },
        growDesc: '회피 +5%'
      },
      pink: {
        name: '수호의 유대', desc: '피해 감소 5%, 쉴드량 +10%, 웨이브 체력 5% 회복', icon: '💗',
        apply: function (p) { BT.perkDmgReduce += 0.05; BT.perkShieldUp += 0.10 }
      }
    };

    // ── 미니 보상 풀 ──
    var MINI_REWARDS = [
      // 1회성 회복
      { name: '체력 회복', icon: '❤️', desc: '체력 50% 회복', fn: function (p) { var h = Math.round(p.maxHp * 0.50); p.hp = Math.min(p.maxHp, p.hp + h); return '체력 +' + h } },
      { name: 'SP 회복', icon: '💎', desc: 'SP 50% 회복', fn: function (p) { var s = Math.round(p.maxSp * 0.5); p.sp = Math.min(p.maxSp, p.sp + s); return 'SP +' + s } },
      // 스탯 +2
      { name: '공격력 +2', icon: '⚔️', desc: '공격력 +2', fn: function (p) { p.atk += 2; return '공격력 +2' } },
      { name: '쉴드력 +2', icon: '🛡️', desc: '쉴드력 +2', fn: function (p) { p.def += 2; return '쉴드력 +2' } },
      { name: '치명타확률 +2%', icon: '💥', desc: '치명타확률 +2%', fn: function (p) { p.crit += 2; return '치명타확률 +2%' } },
      { name: '회피확률 +2%', icon: '💨', desc: '회피확률 +2%', fn: function (p) { p.dodge += 2; return '회피확률 +2%' } },
      { name: '최대 체력 +4', icon: '💖', desc: '최대 체력 +4', fn: function (p) { p.maxHp += 4; p.hp += 4; return '최대 체력 +4' } },
      // 비례 강화
      { name: '공격력 +8%', icon: '⚔️', desc: '공격력 +8%', fn: function (p) { var add = Math.max(1, Math.round(p.atk * 0.08)); p.atk += add; return '공격력 +' + add } },
      { name: '체력 +8%', icon: '💖', desc: '최대 체력 +8%', fn: function (p) { var add = Math.max(2, Math.round(p.maxHp * 0.08)); p.maxHp += add; p.hp += add; return '최대 체력 +' + add } },
      // 세부 스탯
      { name: '피해 감소', icon: '🔰', desc: '받는 피해 -5%', fn: function (p) { BT.perkDmgReduce = Math.min(0.50, BT.perkDmgReduce + 0.05); return '피해 감소 +5%!' } },
      { name: '치명타 확률', icon: '🎯', desc: '치명타 확률 +5%', fn: function (p) { BT.perkCritChance += 0.05; return '치명타 확률 +5%!' } },
      { name: '쉴드 보강', icon: '🛡️', desc: '쉴드 생성량 +12%', fn: function (p) { BT.perkShieldUp += 0.12; return '쉴드량 +12%!' } },
      { name: '관통력', icon: '🎯', desc: '방어 관통 +8% (최대 70%)', fn: function (p) { BT.perkArmorPen = Math.min(0.70, BT.perkArmorPen + 0.08); return '관통 +8%!' } },
      { name: '치명타 피해', icon: '💥', desc: '치명타 피해 +12%', fn: function (p) { BT.perkCritDmg += 0.12; return '치명타 피해 +12%!' } }
    ];

    // ── 난이도 시스템 ──
    var DIFF = {
      easy:   { label: '이지', hpM: 0.80, atkM: 0.70, rewardM: 1.0, color: '#4ecca3' },
      normal: { label: '노말', hpM: 1.00, atkM: 1.00, rewardM: 1.5, color: '#ffd700' },
      hard:   { label: '하드', hpM: 1.25, atkM: 1.50, rewardM: 2.0, color: '#e53935' }
    };
    var currentDiff = 'easy';
    function getDiffUnlock() {
      var d = localStorage.getItem('mr_diff_unlock');
      return d ? JSON.parse(d) : { easy: true, normal: false, hard: false };
    }
    function saveDiffUnlock(obj) { localStorage.setItem('mr_diff_unlock', JSON.stringify(obj)) }

    // ── 전투 상태 ──
    var BT = {
      wave: 0, kills: 0, player: null, enemy: null, turn: 0, supportCD: 0, acting: false,
      buffs: [], debuffs: [], poisonTurns: 0, poisonDmg: 0, stunTurns: 0, freezeATK: 0, freezeTurns: 0, supportUsedThisTurn: false, extraActionUsedThisTurn: false,
      selectedRanger: null, passiveRanger: null, passiveKey: null,
      supportIndex: 0, gold: 0, ce: 0,
      nextAtkBonus: 0, comboAttackCharged: false, boosterUsed: false,
      redMomentum: 0, blackAim: 0, blueCritChain: 0, yellowMarks: 0,
      shield: 0, focusCD: 0, defendCD: 0, skillCD: 0, doctorCD: 0,
      burnDmg: 0, burnTurns: 0, enemyTelegraph: false, enemyIntent: null,
      passiveGrowth: { critDmg: 0, atk: 0, critChance: 0, extraAtk: 0, dodge: 0 },
      supportCDs: {},
      perkVamp: 0, perkCounterUp: false, perkDodge: 0, perkSpOverflow: 0, perkThorns: 0, perkFirstStrike: 0, perkChainLightning: false, perkGuardHeal: false, perkRage: false, perkDoubleSupport: false, perkDoubleSupportUsed: false, perkDmgReduce: 0, perkCritChance: 0, perkCritDmg: 0, perkShieldUp: 0, perkDmgUp: 0, perkArmorPen: 0, perkEndHpRegen: 0, perkEndSpRegen: 0
    };

    // ── 스탯 강화 (MP 통화) ──
    var STAT_UPGRADES = [
      { id: 'hp', name: '체력', icon: '❤️', total: 1.0, max: 30, unit: '%', cap: '최대 +100%', cost: function (lv) { return 1 + Math.floor(lv / 3) }, pct: true },
      { id: 'atk', name: '공격력', icon: '⚔️', total: 1.0, max: 30, unit: '%', cap: '최대 +100%', cost: function (lv) { return 2 + Math.floor(lv / 2) }, pct: true },
      { id: 'def', name: '쉴드력', icon: '🛡️', total: 1.0, max: 30, unit: '%', cap: '최대 +100%', cost: function (lv) { return 2 + Math.floor(lv / 2) }, pct: true },
      { id: 'crit', name: '치명타확률', icon: '💥', total: 0.5, max: 30, unit: '%', cap: '최대 +50%', cost: function (lv) { return 2 + Math.floor(lv / 2) }, pct: true },
      { id: 'critDmg', name: '치명타 피해', icon: '🔥', total: 0.50, max: 30, unit: '', cap: '최대 +50% (x2.00)', cost: function (lv) { return 3 + Math.floor(lv / 2) }, fmt: function (v) { return 'x' + (1.5 + v).toFixed(2) } },
      { id: 'dodge', name: '회피확률', icon: '💨', total: 0.5, max: 30, unit: '%', cap: '최대 +50%', cost: function (lv) { return 2 + Math.floor(lv / 2) }, pct: true }
    ];

    // ── 연구소 업그레이드 (CE 통화) ──
    var LAB_UPGRADES = [
      { id: 'heal', name: '회복 강화', icon: '💖', desc: '웨이브 간 회복 +2% (최대 20%)', per: 0.02, max: 10, cost: function (lv) { return 5 + lv * 3 } },
      { id: 'spRegen', name: 'SP 회복', icon: '🔋', desc: '웨이브 간 SP +3% 회복 (최대 30%)', per: 0.03, max: 10, cost: function (lv) { return 6 + lv * 3 } },
      { id: 'reward', name: '보상 부스트', icon: '✨', desc: 'MP·CE 획득 +10% (최대 100%)', per: 0.10, max: 10, cost: function (lv) { return 5 + lv * 3 } },
      { id: 'dmgReduce', name: '피해 감소', icon: '🔰', desc: '받는 피해 -3% (최대 30%)', per: 0.03, max: 10, cost: function (lv) { return 6 + lv * 3 } },
      { id: 'shieldUp', name: '쉴드 강화', icon: '🛡️', desc: '쉴드 생성량 +10% (최대 100%)', per: 0.10, max: 10, cost: function (lv) { return 6 + lv * 3 } },
      { id: 'armorPen', name: '방어 관통', icon: '🎯', desc: '방어 관통 +5% (최대 50%)', per: 0.05, max: 10, cost: function (lv) { return 7 + lv * 3 } },
      { id: 'extraAtk', name: '추가 행동', icon: '⚔️', desc: '추가 행동 확률 +5% (최대 50%)', per: 0.05, max: 10, cost: function (lv) { return 7 + lv * 3 } },
      { id: 'sp', name: 'SP 증가', icon: '💎', desc: 'SP 최대치 +10% (최대 100%)', per: 0.10, max: 10, cost: function (lv) { return 5 + lv * 3 } }
    ];

    // ── 이중 통화 시스템 ──
    var progData = { mp: 0, ce: 0 };
    function loadProg() {
      progData.mp = parseInt(localStorage.getItem('mr_mp') || '0', 10);
      progData.ce = parseInt(localStorage.getItem('mr_ce') || '0', 10);
      var s; try { s = JSON.parse(localStorage.getItem('mr_stats') || '{}') } catch (e) { s = {} }
      STAT_UPGRADES.forEach(function (u) { u.level = s[u.id] || 0 });
      var l; try { l = JSON.parse(localStorage.getItem('mr_lab') || '{}') } catch (e) { l = {} }
      LAB_UPGRADES.forEach(function (u) { u.level = l[u.id] || 0 });
    }
    function saveProg() {
      localStorage.setItem('mr_mp', String(progData.mp));
      localStorage.setItem('mr_ce', String(progData.ce));
      var s = {}; STAT_UPGRADES.forEach(function (u) { s[u.id] = u.level });
      localStorage.setItem('mr_stats', JSON.stringify(s));
      var l = {}; LAB_UPGRADES.forEach(function (u) { l[u.id] = u.level });
      localStorage.setItem('mr_lab', JSON.stringify(l));
    }
    function getStatBonus(id) {
      var u = STAT_UPGRADES.filter(function (x) { return x.id === id })[0];
      if (!u || u.level === 0) return 0;
      return u.total * (u.level / u.max);
    }
    function getLabBonus(id) {
      var u = LAB_UPGRADES.filter(function (x) { return x.id === id })[0];
      return u ? (u.level * u.per) : 0;
    }
    loadProg();

    // ── 몹 SVG 렌더링 ──
    function mkEnemy(mob, sc) {
      sc = sc || 1;
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 60 80');
      svg.setAttribute('width', 60 * sc); svg.setAttribute('height', 80 * sc);
      var bc = mob.bodyColor, mc = mob.color;
      var g = document.createElementNS(ns, 'g');
      // 몸통 타입별 분기
      if (mob.id === 'spider') {
        // 거미: 둥근 몸 + 다리
        g.innerHTML = '<ellipse cx="30" cy="40" rx="18" ry="14" fill="' + bc + '"/>'
          + '<circle cx="30" cy="30" r="12" fill="' + mc + '"/>'
          + '<circle cx="25" cy="28" r="3" fill="#f00"/><circle cx="35" cy="28" r="3" fill="#f00"/>'
          + '<line x1="12" y1="35" x2="3" y2="25" stroke="' + bc + '" stroke-width="2"/>'
          + '<line x1="48" y1="35" x2="57" y2="25" stroke="' + bc + '" stroke-width="2"/>'
          + '<line x1="12" y1="42" x2="2" y2="50" stroke="' + bc + '" stroke-width="2"/>'
          + '<line x1="48" y1="42" x2="58" y2="50" stroke="' + bc + '" stroke-width="2"/>'
          + '<line x1="14" y1="48" x2="5" y2="60" stroke="' + bc + '" stroke-width="2"/>'
          + '<line x1="46" y1="48" x2="55" y2="60" stroke="' + bc + '" stroke-width="2"/>';
      } else if (mob.id === 'serpent') {
        // 뱀
        g.innerHTML = '<path d="M15,60 Q10,40 20,30 Q30,20 40,30 Q50,40 45,55 Q40,65 30,70 Q20,65 15,60Z" fill="' + bc + '"/>'
          + '<circle cx="25" cy="30" r="10" fill="' + mc + '"/>'
          + '<circle cx="22" cy="28" r="2.5" fill="#ff0"/><circle cx="28" cy="28" r="2.5" fill="#ff0"/>'
          + '<path d="M22,34 L25,37 L28,34" fill="none" stroke="#f00" stroke-width="1.5"/>';
      } else if (mob.id === 'golem') {
        // 바위 골렘: 각진 몸
        g.innerHTML = '<rect x="15" y="25" width="30" height="35" rx="3" fill="' + bc + '"/>'
          + '<rect x="18" y="15" width="24" height="20" rx="4" fill="' + mc + '"/>'
          + '<circle cx="25" cy="23" r="3" fill="#ff6"/><circle cx="35" cy="23" r="3" fill="#ff6"/>'
          + '<rect x="8" y="30" width="10" height="8" rx="2" fill="' + bc + '"/>'
          + '<rect x="42" y="30" width="10" height="8" rx="2" fill="' + bc + '"/>'
          + '<rect x="18" y="58" width="10" height="12" rx="2" fill="' + bc + '"/>'
          + '<rect x="32" y="58" width="10" height="12" rx="2" fill="' + bc + '"/>';
      } else if (mob.id === 'reaper') {
        // 그림자 리퍼: 로브 + 낫
        g.innerHTML = '<path d="M20,20 Q30,10 40,20 L42,65 Q30,70 18,65Z" fill="' + bc + '"/>'
          + '<circle cx="30" cy="22" r="9" fill="' + mc + '"/>'
          + '<circle cx="27" cy="21" r="2" fill="#f00"/><circle cx="33" cy="21" r="2" fill="#f00"/>'
          + '<path d="M8,15 Q5,8 15,5 L20,18" fill="none" stroke="#888" stroke-width="2.5"/>'
          + '<path d="M15,5 Q20,2 22,8" fill="none" stroke="#aaa" stroke-width="2"/>';
      } else if (mob.id === 'general') {
        // 장군: 갑옷 + 망토
        g.innerHTML = '<path d="M15,30 L10,65 L50,65 L45,30Z" fill="' + bc + '"/>'
          + '<path d="M12,30 Q8,50 10,65 L15,65 L18,35Z" fill="rgba(0,0,0,0.3)"/>'
          + '<path d="M48,30 Q52,50 50,65 L45,65 L42,35Z" fill="rgba(0,0,0,0.3)"/>'
          + '<circle cx="30" cy="22" r="10" fill="' + mc + '"/>'
          + '<circle cx="26" cy="20" r="2.5" fill="#ff0"/><circle cx="34" cy="20" r="2.5" fill="#ff0"/>'
          + '<path d="M24,26 L30,28 L36,26" fill="none" stroke="#888" stroke-width="1.5"/>'
          + '<path d="M22,12 L30,8 L38,12" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>';
      } else if (mob.id === 'wolf') {
        // 늑대
        g.innerHTML = '<ellipse cx="30" cy="45" rx="16" ry="12" fill="' + bc + '"/>'
          + '<circle cx="30" cy="30" r="11" fill="' + mc + '"/>'
          + '<polygon points="21,22 18,12 25,20" fill="' + mc + '"/>'
          + '<polygon points="39,22 42,12 35,20" fill="' + mc + '"/>'
          + '<circle cx="26" cy="28" r="2.5" fill="#ff0"/><circle cx="34" cy="28" r="2.5" fill="#ff0"/>'
          + '<path d="M27,34 L30,36 L33,34" fill="#333"/>'
          + '<line x1="15" y1="50" x2="12" y2="65" stroke="' + bc + '" stroke-width="3"/>'
          + '<line x1="45" y1="50" x2="48" y2="65" stroke="' + bc + '" stroke-width="3"/>';
      } else if (mob.id === 'frost') {
        // 유령
        g.innerHTML = '<path d="M15,30 Q15,12 30,12 Q45,12 45,30 L45,60 Q42,55 38,60 Q34,55 30,60 Q26,55 22,60 Q18,55 15,60Z" fill="' + mc + '" opacity="0.8"/>'
          + '<circle cx="24" cy="30" r="4" fill="#fff"/><circle cx="24" cy="30" r="2" fill="#333"/>'
          + '<circle cx="36" cy="30" r="4" fill="#fff"/><circle cx="36" cy="30" r="2" fill="#333"/>'
          + '<ellipse cx="30" cy="40" rx="5" ry="4" fill="rgba(0,0,0,0.3)"/>';
      } else if (mob.id === 'witch') {
        // 마녀
        g.innerHTML = '<path d="M20,25 L15,65 L45,65 L40,25Z" fill="' + bc + '"/>'
          + '<circle cx="30" cy="22" r="9" fill="' + mc + '"/>'
          + '<circle cx="27" cy="20" r="2" fill="#fff"/><circle cx="33" cy="20" r="2" fill="#fff"/>'
          + '<polygon points="22,14 30,0 38,14" fill="#333"/>'
          + '<line x1="48" y1="20" x2="52" y2="60" stroke="#8d6e63" stroke-width="2"/>'
          + '<circle cx="52" cy="16" r="4" fill="#e040fb" opacity="0.6"/>';
      } else if (mob.id === 'seed') {
        // 카오스 씨앗: 작은 구체
        g.innerHTML = '<circle cx="30" cy="40" r="16" fill="' + bc + '"/>'
          + '<circle cx="30" cy="40" r="12" fill="' + mc + '"/>'
          + '<circle cx="26" cy="37" r="3" fill="#fff"/><circle cx="34" cy="37" r="3" fill="#fff"/>'
          + '<circle cx="26" cy="37" r="1.5" fill="#000"/><circle cx="34" cy="37" r="1.5" fill="#000"/>'
          + '<path d="M25,45 Q30,48 35,45" fill="none" stroke="#000" stroke-width="1.5"/>';
      } else if (mob.id === 'titan') {
        // 타이탄: 거대
        g.innerHTML = '<rect x="12" y="25" width="36" height="38" rx="4" fill="' + bc + '"/>'
          + '<rect x="16" y="12" width="28" height="22" rx="6" fill="' + mc + '"/>'
          + '<circle cx="24" cy="22" r="3.5" fill="#ff0"/><circle cx="36" cy="22" r="3.5" fill="#ff0"/>'
          + '<path d="M24,30 L30,32 L36,30" fill="none" stroke="#f00" stroke-width="2"/>'
          + '<rect x="3" y="28" width="12" height="14" rx="3" fill="' + bc + '"/>'
          + '<rect x="45" y="28" width="12" height="14" rx="3" fill="' + bc + '"/>'
          + '<rect x="16" y="61" width="12" height="14" rx="3" fill="' + bc + '"/>'
          + '<rect x="32" y="61" width="12" height="14" rx="3" fill="' + bc + '"/>';
      } else {
        // 기본형 (섀도 졸병, 블레이즈, 아이언, 팬텀, 다크나이트)
        g.innerHTML = '<ellipse cx="30" cy="48" rx="16" ry="20" fill="' + bc + '"/>'
          + '<circle cx="30" cy="26" r="12" fill="' + mc + '"/>'
          + '<circle cx="25" cy="24" r="3" fill="#f44"/><circle cx="35" cy="24" r="3" fill="#f44"/>'
          + '<path d="M24,32 Q30,35 36,32" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>'
          + '<rect x="14" y="55" width="8" height="14" rx="3" fill="' + bc + '"/>'
          + '<rect x="38" y="55" width="8" height="14" rx="3" fill="' + bc + '"/>';
        // 타입별 장식
        if (mob.id === 'blaze') g.innerHTML += '<path d="M20,14 Q25,5 30,14 Q35,5 40,14" fill="#ff6d00" opacity="0.8"/>';
        if (mob.id === 'iron') g.innerHTML += '<rect x="18" y="18" width="24" height="16" rx="2" fill="rgba(255,255,255,0.15)" stroke="#999" stroke-width="1"/>';
        if (mob.id === 'phantom') svg.style.opacity = '0.7';
        if (mob.id === 'knight') g.innerHTML += '<rect x="20" y="30" width="20" height="22" rx="2" fill="rgba(100,100,100,0.3)" stroke="#666" stroke-width="1"/>';
      }
      svg.appendChild(g);
      return svg;
    }

    // ── 적 생성 ──
    function generateEnemy(wave) {
      var cycle = Math.ceil(wave / 3);
      var isBoss = (wave % 3 === 0);
      var template;
      if (isBoss) {
        template = BOSSES[(cycle - 1) % BOSSES.length];
      } else {
        template = MOBS[Math.floor(Math.random() * MOBS.length)];
      }
      var baseHp = isBoss ? (60 + cycle * 16) : (30 + cycle * 10);
      var baseAtk = isBoss ? (7 + cycle * 3) : (5 + cycle * 2);
      var baseDef = isBoss ? (3 + cycle * 2) : (2 + cycle * 1);
      // 지수 스케일링 (사이클 3 이후)
      // 완만한 스케일링: 사이클 4부터 3%씩, DEF는 2%씩 (최대 +30%)
      if (cycle > 3) { var m = 1 + Math.min((cycle - 3) * 0.03, 0.30); baseHp = Math.round(baseHp * m); baseAtk = Math.round(baseAtk * m); baseDef = Math.round(baseDef * (1 + Math.min((cycle - 3) * 0.02, 0.30))) }
      // 난이도 보정
      var diff = DIFF[currentDiff] || DIFF.easy;
      var en = {
        name: template.name, id: template.id, color: template.color, bodyColor: template.bodyColor,
        hp: Math.round(baseHp * template.hpM * diff.hpM), maxHp: Math.round(baseHp * template.hpM * diff.hpM),
        atk: Math.round(baseAtk * template.atkM * diff.atkM), def: Math.round(baseDef * template.defM),
        special: template.special, isBoss: isBoss, desc: template.desc, turnCount: 0,
        stealthActive: false, shield: 0, executeMode: false
      };
      if (en.special && en.special.type === 'shield') en.shield = (en.special.hp || 0) + cycle * 2;
      if (en.special && en.special.type === 'armor') en.shield = (en.special.shield || 0) + cycle * 1;
      return en;
    }

    // ── 캐릭터 선택 화면 ──
    function initSelect() {
      var cards = $('sel-cards'); clr(cards);
      var info = $('sel-info'); info.innerHTML = '<div style="color:#666;text-align:center;padding:20px">메인 레인저를 선택해주세요</div>';
      $('sel-go').style.display = 'none';
      $('sel-go').disabled = false;
      $('sel-title').textContent = '▼ 메인 레인저 선택 ▼';
      $('sel-step').style.display = 'none';
      BT.selectedRanger = null; BT.passiveRanger = null;
      // 난이도 선택 UI
      var diffArea = document.getElementById('sel-diff');
      if (!diffArea) {
        diffArea = document.createElement('div'); diffArea.id = 'sel-diff'; diffArea.className = 'sel-diff';
        var selBg = document.querySelector('#select-screen .sel-bg');
        selBg.insertBefore(diffArea, $('sel-cards'));
      }
      clr(diffArea);
      var unlock = getDiffUnlock();
      ['easy', 'normal', 'hard'].forEach(function (key) {
        var d = DIFF[key]; var btn = document.createElement('button'); btn.className = 'diff-btn';
        var rewardLabel = key === 'normal' ? ' (보상 +50%)' : key === 'hard' ? ' (보상 +100%)' : '';
        btn.textContent = d.label + rewardLabel;
        btn.style.borderColor = d.color; btn.style.color = d.color;
        if (key === currentDiff) btn.classList.add('active');
        if (!unlock[key]) { btn.classList.add('locked'); btn.textContent = d.label + ' 🔒' }
        btn.addEventListener('click', function () {
          if (!unlock[key]) return;
          currentDiff = key;
          diffArea.querySelectorAll('.diff-btn').forEach(function (b) { b.classList.remove('active') });
          btn.classList.add('active');
        });
        diffArea.appendChild(btn);
      });
      var step = 1;
      Object.keys(RANGERS).forEach(function (key) {
        var r = RANGERS[key];
        var card = document.createElement('div'); card.className = 'sel-card'; card.dataset.key = key;
        card.style.setProperty('--rc', r.color); card.style.setProperty('--rc-glow', r.color + '66');
        var sw = document.createElement('div'); sw.appendChild(mkR(key, 0.6)); card.appendChild(sw);
        var nm = document.createElement('div'); nm.className = 'sel-cname'; nm.style.color = r.color; nm.textContent = r.name; card.appendChild(nm);
        card.addEventListener('click', function () {
          if (step === 1) {
            cards.querySelectorAll('.sel-card').forEach(function (c) { c.classList.remove('picked') });
            card.classList.add('picked'); BT.selectedRanger = key;
            var pb = PASSIVE_BUFFS[key];
            info.innerHTML = '<div class="sel-info-name" style="color:' + r.color + '">' + r.name + ' (' + r.weapon + ')</div>'
              + '<div class="sel-skill">\u2728 ' + r.skill.name + ' \u2014 ' + r.skill.desc + ' (SP ' + r.skill.cost + ')</div>'
              + '<div class="sel-skill" style="color:#4ecca3;margin-top:4px">🌟 <b>[지원스킬]</b> ' + r.support.name + ' — ' + r.support.desc + '<br><span style="color:#ff9800;font-size:11px;font-weight:bold">⚠️ 메인/파트너로 선택하지 않은 레인저만 지원 가능</span></div>'
              + '<div class="sel-skill" style="color:#9575cd;margin-top:4px">' + pb.icon + ' \uCD9C\uB3D9 \uD328\uC2DC\uBE0C: <b>' + pb.name + '</b> \u2014 ' + pb.desc + '</div>';
            $('sel-go').style.display = 'block'; $('sel-go').textContent = '\u25B6 \uB2E4\uC74C: \uD30C\uD2B8\uB108 \uC120\uD0DD';
          } else if (step === 2) {
            if (key === BT.selectedRanger) return;
            cards.querySelectorAll('.sel-card').forEach(function (c) { c.classList.remove('passive-picked') });
            card.classList.add('passive-picked'); BT.passiveRanger = key;
            var pb = PASSIVE_BUFFS[key];
            var stepEl = $('sel-step'); stepEl.style.display = 'block';
            stepEl.innerHTML = pb.icon + ' <b>' + pb.name + '</b>: ' + pb.desc;
            $('sel-go').style.display = 'block'; $('sel-go').textContent = '▶ 출격!';
          }
        });
        cards.appendChild(card);
      });
      $('sel-go').onclick = function () {
        if (step === 1 && BT.selectedRanger) {
          step = 2;
          $('sel-title').textContent = '\u25BC \uD30C\uD2B8\uB108 \uC120\uD0DD \u25BC';
          info.innerHTML = '<div style="color:#9575cd;text-align:center;padding:20px">\uCD94\uAC00 \uCD9C\uB3D9 \uD328\uC2DC\uBE0C\uB97C \uBD80\uC5EC\uD560 \uD30C\uD2B8\uB108\uB97C \uC120\uD0DD\uD558\uC138\uC694<br><span style="color:#4ecca3;font-size:12px">\uD83D\uDCA1 \uBA54\uC778 + \uD30C\uD2B8\uB108 \uCD9C\uB3D9 \uD328\uC2DC\uBE0C \uBAA8\uB450 \uC801\uC6A9\uB429\uB2C8\uB2E4!</span></div>';
          cards.querySelectorAll('.sel-card').forEach(function (c) {
            c.classList.remove('picked');
            if (c.dataset.key === BT.selectedRanger) c.classList.add('disabled');
          });
          $('sel-go').style.display = 'none'; $('sel-step').style.display = 'none';
        } else if (step === 2 && BT.passiveRanger) {
          $('sel-go').disabled = true;
          startDefendMode(BT.selectedRanger, BT.passiveRanger);
        }
      };
    }

    var labTab = 'stat';
    function initLab() {
      loadProg();
      $('lab-currency').innerHTML = '<span class="lab-cur-mp">✨ MP: ' + progData.mp + '</span><span class="lab-cur-ce">🔮 CE: ' + progData.ce + '</span>';
      $('lab-tab-stat').className = 'lab-tab' + (labTab === 'stat' ? ' active' : '');
      $('lab-tab-research').className = 'lab-tab' + (labTab === 'research' ? ' active' : '');
      var grid = $('lab-grid'); clr(grid);
      if (labTab === 'stat') {
        STAT_UPGRADES.forEach(function (u) {
          var row = document.createElement('div'); row.className = 'lab-row';
          var cost = u.cost(u.level); var isMax = u.level >= u.max;
          var totalBonus = u.total * (u.level / u.max);
          var perVal = u.total / u.max;
          var bonusStr = u.fmt ? u.fmt(totalBonus) : (u.pct ? '+' + Math.round(totalBonus * 100) + '%' : '+' + Math.round(totalBonus * 100) / 100 + (u.unit || ''));
          var perStr = u.fmt ? '+' + (perVal * 100).toFixed(1) + '%' : (u.pct ? '+' + (perVal * 100).toFixed(1) + '%' : '+' + (Math.round(perVal * 100) / 100) + (u.unit || ''));
          var capDiv = document.createElement('div'); capDiv.style.cssText = 'font-size:10px;color:#666'; capDiv.textContent = '상한: ' + u.cap;
          var infoDiv = document.createElement('div'); infoDiv.className = 'lab-info';
          var nameDiv = document.createElement('div'); nameDiv.className = 'lab-stat-name'; nameDiv.textContent = u.name + ' Lv.' + u.level + '/' + u.max;
          var valDiv = document.createElement('div'); valDiv.className = 'lab-stat-val'; valDiv.textContent = bonusStr + ' (레벨당 ' + perStr + ')';
          var costDiv = document.createElement('div'); costDiv.className = 'lab-cost';
          if (isMax) { costDiv.style.color = '#4ecca3'; costDiv.textContent = 'MAX' } else { costDiv.textContent = '필요: ' + cost + ' MP' }
          infoDiv.appendChild(nameDiv); infoDiv.appendChild(valDiv); infoDiv.appendChild(capDiv); infoDiv.appendChild(costDiv);
          var iconDiv = document.createElement('div'); iconDiv.className = 'lab-icon'; iconDiv.textContent = u.icon;
          row.appendChild(iconDiv); row.appendChild(infoDiv);
          var btn = document.createElement('button');
          btn.className = 'lab-btn' + (isMax || progData.mp < cost ? ' maxed' : '');
          btn.textContent = isMax ? '최대' : '강화';
          btn.addEventListener('click', function () {
            if (isMax || progData.mp < cost) return;
            u.level++; progData.mp -= cost; saveProg(); initLab();
          });
          row.appendChild(btn); grid.appendChild(row);
        });
      } else {
        LAB_UPGRADES.forEach(function (u) {
          var row = document.createElement('div'); row.className = 'lab-row';
          var cost = u.cost(u.level); var isMax = u.level >= u.max;
          row.innerHTML = '<div class="lab-icon">' + u.icon + '</div>'
            + '<div class="lab-info"><div class="lab-stat-name">' + u.name + ' Lv.' + u.level + '/' + u.max + '</div>'
            + '<div class="lab-stat-val">' + u.desc + '</div>'
            + (isMax ? '<div class="lab-cost" style="color:#4ecca3">MAX</div>' : '<div class="lab-cost">필요: ' + cost + ' CE</div>') + '</div>';
          var btn = document.createElement('button');
          btn.className = 'lab-btn' + (isMax || progData.ce < cost ? ' maxed' : '');
          btn.textContent = isMax ? '최대' : '연구';
          btn.addEventListener('click', function () {
            if (isMax || progData.ce < cost) return;
            u.level++; progData.ce -= cost; saveProg(); initLab();
          });
          row.appendChild(btn); grid.appendChild(row);
        });
      }
    }
    $('btn-defend').addEventListener('click', function () { stopAllBgm(); playBgm('daily'); initSelect(); showScr('select') });
    $('lab-to-select').addEventListener('click', function () { initSelect(); showScr('select') });
    $('lab-to-title').addEventListener('click', function () { initSelect(); showScr('select') });
    $('sel-back').addEventListener('click', function () { stopAllBgm(); showScr('title') });
    $('sel-lab').addEventListener('click', function () { initLab(); showScr('lab') });
    $('sel-tut').addEventListener('click', function () {
      // 캐릭터 선택 화면 위에 튜토리얼 오버레이 표시
      var container = document.querySelector('#select-screen .sel-bg');
      showBattleTutorial(function () {}, container);
    });
    $('lab-tab-stat').addEventListener('click', function () { labTab = 'stat'; initLab() });
    $('lab-tab-research').addEventListener('click', function () { labTab = 'research'; initLab() });
    // 게임 내 확인 팝업
    function showGameConfirm(title, msg, onConfirm) {
      var existing = $('game-confirm-popup');
      if (existing) existing.remove();
      var popup = document.createElement('div');
      popup.id = 'game-confirm-popup';
      popup.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999';
      var box = document.createElement('div');
      box.style.cssText = 'background:#1a1a2e;border:2px solid #444;border-radius:12px;padding:24px;max-width:320px;text-align:center;color:#fff;font-family:"Gowun Dodum",sans-serif';
      box.innerHTML = '<div style="font-family:Do Hyeon;font-size:16px;color:#ffd700;margin-bottom:12px">' + title + '</div><div style="font-size:13px;line-height:1.6;margin-bottom:20px;white-space:pre-line">' + msg + '</div>';
      var btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'display:flex;gap:10px;justify-content:center';
      var yesBtn = document.createElement('button');
      yesBtn.style.cssText = 'padding:8px 24px;border:2px solid #4ecca3;background:rgba(78,204,163,0.15);color:#4ecca3;border-radius:8px;font-family:Do Hyeon;font-size:14px;cursor:pointer';
      yesBtn.textContent = '확인';
      yesBtn.addEventListener('click', function () { popup.remove(); onConfirm() });
      var noBtn = document.createElement('button');
      noBtn.style.cssText = 'padding:8px 24px;border:2px solid #666;background:rgba(255,255,255,0.05);color:#999;border-radius:8px;font-family:Do Hyeon;font-size:14px;cursor:pointer';
      noBtn.textContent = '취소';
      noBtn.addEventListener('click', function () { popup.remove() });
      btnWrap.appendChild(yesBtn); btnWrap.appendChild(noBtn);
      box.appendChild(btnWrap); popup.appendChild(box);
      document.getElementById('game').appendChild(popup);
    }
    function showGameAlert(title, msg) {
      var existing = $('game-confirm-popup');
      if (existing) existing.remove();
      var popup = document.createElement('div');
      popup.id = 'game-confirm-popup';
      popup.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999';
      var box = document.createElement('div');
      box.style.cssText = 'background:#1a1a2e;border:2px solid #444;border-radius:12px;padding:24px;max-width:320px;text-align:center;color:#fff;font-family:"Gowun Dodum",sans-serif';
      box.innerHTML = '<div style="font-family:Do Hyeon;font-size:16px;color:#ffd700;margin-bottom:12px">' + title + '</div><div style="font-size:13px;line-height:1.6;margin-bottom:20px">' + msg + '</div>';
      var okBtn = document.createElement('button');
      okBtn.style.cssText = 'padding:8px 24px;border:2px solid #4ecca3;background:rgba(78,204,163,0.15);color:#4ecca3;border-radius:8px;font-family:Do Hyeon;font-size:14px;cursor:pointer';
      okBtn.textContent = '확인';
      okBtn.addEventListener('click', function () { popup.remove() });
      box.appendChild(okBtn); popup.appendChild(box);
      document.getElementById('game').appendChild(popup);
    }
    $('lab-reset').addEventListener('click', function () {
      var mpRefund = 0, ceRefund = 0;
      STAT_UPGRADES.forEach(function (u) { for (var i = 0; i < u.level; i++) mpRefund += u.cost(i) });
      LAB_UPGRADES.forEach(function (u) { for (var i = 0; i < u.level; i++) ceRefund += u.cost(i) });
      if (mpRefund === 0 && ceRefund === 0) { showGameAlert('초기화', '초기화할 강화가 없습니다.'); return }
      var msg = '강화를 모두 초기화하시겠습니까?\n\n환불: ✨MP +' + mpRefund;
      if (ceRefund > 0) msg += ' / 🔮CE +' + ceRefund;
      showGameConfirm('강화 초기화', msg, function () {
        STAT_UPGRADES.forEach(function (u) { u.level = 0 });
        LAB_UPGRADES.forEach(function (u) { u.level = 0 });
        progData.mp += mpRefund; progData.ce += ceRefund; saveProg(); initLab();
      });
    });

    // ── 전투 시작 ──
    function startDefendMode(rangerKey, passiveKey) {
      var r = RANGERS[rangerKey];
      loadProg();
      BT.wave = 0; BT.kills = 0; BT.turn = 0; BT.supportCD = 0; BT.acting = false;
      BT.buffs = []; BT.debuffs = []; BT.poisonTurns = 0; BT.poisonDmg = 0; BT.stunTurns = 0; BT.freezeATK = 0; BT.freezeTurns = 0; BT.supportUsedThisTurn = false; BT.inExtraAction = false;
      BT.gold = 0; BT.ce = 0;
      BT.passiveKey = passiveKey; BT.supportIndex = 0; BT.nextAtkBonus = 0; BT.comboAttackCharged = false; BT.boosterUsed = false;
      BT.redMomentum = 0; BT.blackAim = 0; BT.blueCritChain = 0; BT.yellowMarks = 0;
      BT.shield = 0; BT.focusCD = 0; BT.defendCD = 0; BT.skillCD = 0; BT.doctorCD = 0; BT.burnDmg = 0; BT.burnTurns = 0; BT.enemyTelegraph = false; BT.enemyIntent = null; BT.enemyIntentValue = null;
      BT.passiveGrowth = { critDmg: 0, atk: 0, critChance: 0, extraAtk: 0, dodge: 0 }; BT.growthBase = null;
      BT.supportCDs = {};
      BT.perkVamp = 0; BT.perkCounterUp = false; BT.perkDodge = 0; BT.perkSpOverflow = 0; BT.perkThorns = 0; BT.perkFirstStrike = 0; BT.perkChainLightning = false; BT.perkGuardHeal = false; BT.perkRage = false; BT.perkDoubleSupport = false; BT.perkDoubleSupportUsed = false; BT.perkDmgReduce = getLabBonus('dmgReduce'); BT.perkCritChance = 0; BT.perkCritDmg = getStatBonus('critDmg'); BT.perkShieldUp = getLabBonus('shieldUp'); BT.perkDmgUp = 0; BT.perkArmorPen = getLabBonus('armorPen'); BT.perkExtraAtk = getLabBonus('extraAtk'); BT.perkEndHpRegen = 0; BT.perkEndSpRegen = 0;
      var mhp = Math.round(r.hp * (1 + getStatBonus('hp'))), msp = Math.round(r.sp * (1 + getLabBonus('sp')));
      BT.player = {
        key: rangerKey, name: r.name, color: r.color,
        hp: mhp, maxHp: mhp, atk: Math.round(r.atk * (1 + getStatBonus('atk'))), def: Math.round(r.def * (1 + getStatBonus('def'))),
        crit: Math.round(r.crit * (1 + getStatBonus('crit'))), dodge: Math.round(r.dodge * (1 + getStatBonus('dodge'))), sp: msp, maxSp: msp,
        skill: r.skill,
        guarding: false, critBonus: 0, spRegen: 0, skillCostReduction: 0, hpRegen: 0
      };
      // 출동 패시브: 메인 + 파트너 둘 다 적용
      if (PASSIVE_BUFFS[rangerKey]) {
        PASSIVE_BUFFS[rangerKey].apply(BT.player);
      }
      if (passiveKey && PASSIVE_BUFFS[passiveKey] && passiveKey !== rangerKey) {
        PASSIVE_BUFFS[passiveKey].apply(BT.player);
      }
      // 성장 기준값 저장 (패시브 apply 후, grow 전)
      saveGrowthBase();
      // Support pool: exclude active AND passive
      BT.supportPool = [];
      Object.keys(RANGERS).forEach(function (k) { if (k !== rangerKey && k !== passiveKey) BT.supportPool.push({ key: k, data: RANGERS[k] }) });
      playBgm('battle2');
      showScr('battle');
      if (!localStorage.getItem('mr_tut')) {
        showBattleTutorial(function () { nextWave() });
      } else {
        nextWave();
      }
    }

    function showBattleTutorial(cb, container) {
      var steps = [
        { title: '❤️ 체력 / 💎 SP', desc: '체력이 0이 되면 패배!\nSP는 필살기와 미라클 부스터에 사용합니다.\n공격·방어·지원은 SP를 소모하지 않습니다.' },
        { title: '⚔️ 행동 선택', desc: '⚔️ 공격: 기본 피해\n🛡️ 방어: 쉴드 생성 (쿨타임 2턴)\n🧘 집중: 체력 10% + SP 25% 회복 (쿨타임 3턴)\n✨ 필살기: SP 50 소모, 강력한 일격!\n🌟 미라클 부스터: SP 100 소모, 전 능력 2배 (2턴)' },
        { title: '💠 출동 패시브', desc: '메인 레인저와 파트너의\n출동 패시브가 동시에 적용됩니다!\n\n패시브는 매턴 성장하며\n웨이브 클리어 시 성장치가 초기화됩니다.' },
        { title: '🔬 지원 스킬', desc: '🔬 박사의 지원: 적 1턴 기절 (쿨타임 3턴)\n🌟 지원스킬: 전투에 미참여하는\n레인저가 고유 스킬로 지원! (쿨타임 4턴)\n\n⭐ 지원스킬은 턴을 소모하지 않습니다!\n한 턴에 1회 사용 후 행동을 선택하세요.' },
        { title: '🛡️ 쉴드 & 피해 감소', desc: '쉴드력이 높을수록 강한 쉴드 생성!\n쉴드는 적 공격을 먼저 흡수합니다.\n⚠️ 쉴드는 매 턴 50% 감소합니다.\n\n보상으로 \'피해 감소\'를 얻으면\n받는 피해가 영구적으로 줄어듭니다!' },
        { title: '⚠️ 적 의도 & 보상', desc: '적의 다음 행동이 상단에 예고됩니다.\n예고를 읽고 공격/방어를 판단하세요!\n\n웨이브 클리어 시 보상을 획득합니다.\n다양한 강화를 조합해 빌드를 만드세요!' },
        { title: 'ℹ️ 정보 & 팁', desc: '전투 중 ℹ️ 버튼을 누르면\n현재 스탯과 패시브를 확인할 수 있습니다.\n\n버튼에 마우스를 올리면(터치)\n예상 효과를 미리 볼 수 있습니다.' },
        { title: '★ 실전 돌입! ★', desc: '3웨이브마다 보스가 등장합니다.\n보스 클리어 시 ★희귀 보상★ 등장!\n괴인을 쓰러뜨리고 최고 웨이브에 도전하세요!' }
      ];
      var idx = 0;
      var ov = document.createElement('div'); ov.className = 'tut-overlay';
      function render() {
        var s = steps[idx];
        ov.innerHTML = '<div class="tut-box">'
          + '<div class="tut-step">전투 안내 ' + (idx + 1) + '/' + steps.length + '</div>'
          + '<div class="tut-title">' + s.title + '</div>'
          + '<div class="tut-desc">' + s.desc.replace(/\n/g, '<br>') + '</div>'
          + '<div class="tut-hint">▼ 탭하여 계속 ▼</div>'
          + '</div>';
      }
      render();
      ov.addEventListener('click', function () {
        idx++;
        if (idx >= steps.length) {
          localStorage.setItem('mr_tut', '1');
          ov.remove(); cb();
        } else { render() }
      });
      (container || $('bt-bg')).appendChild(ov);
    }

    // ── 패시브 성장 (매턴) ──
    function applyPassiveGrowth() {
      var p = BT.player;
      var keys = [p.key];
      if (BT.passiveKey && BT.passiveKey !== p.key) keys.push(BT.passiveKey);
      keys.forEach(function (k) { var pb = PASSIVE_BUFFS[k]; if (pb && pb.grow) pb.grow(p) });
    }
    // 성장 기준값 저장 (grow 전 상태)
    function saveGrowthBase() {
      var p = BT.player; if (!p) return;
      BT.growthBase = {
        perkCritDmg: BT.perkCritDmg,
        perkCritChance: BT.perkCritChance,
        perkExtraAtk: BT.perkExtraAtk,
        atk: p.atk,
        dodge: p.dodge
      };
    }
    function resetPassiveGrowth() {
      var p = BT.player; if (!p) return;
      if (BT.growthBase) {
        // 보상으로 증가한 양 = 현재값 - 기준값 - 성장량
        var g = BT.passiveGrowth;
        var rewardAtk = p.atk - BT.growthBase.atk - g.atk;
        var rewardDodge = p.dodge - BT.growthBase.dodge - g.dodge;
        var rewardCritDmg = BT.perkCritDmg - BT.growthBase.perkCritDmg - g.critDmg;
        var rewardCritChance = BT.perkCritChance - BT.growthBase.perkCritChance - g.critChance;
        var rewardExtraAtk = BT.perkExtraAtk - BT.growthBase.perkExtraAtk - g.extraAtk;
        // 기준값 + 보상분만 남기기 (성장분 완전 제거)
        p.atk = BT.growthBase.atk + rewardAtk;
        p.dodge = BT.growthBase.dodge + rewardDodge;
        BT.perkCritDmg = BT.growthBase.perkCritDmg + rewardCritDmg;
        BT.perkCritChance = BT.growthBase.perkCritChance + rewardCritChance;
        BT.perkExtraAtk = BT.growthBase.perkExtraAtk + rewardExtraAtk;
      }
      BT.passiveGrowth = { critDmg: 0, atk: 0, critChance: 0, extraAtk: 0, dodge: 0 };
    }

    // ── 다음 웨이브 ──
    function nextWave() {
      BT.wave++; BT.turn = 0; BT.acting = false;
      BT.player.guarding = false;
      // 웨이브 클리어 시 회복 (연구 개발 회복 강화 + 보상 퍽)
      if (BT.wave > 1) {
        var healPct = getLabBonus('heal') + BT.perkEndHpRegen;
        if (BT.passiveKey === 'pink' || BT.player.key === 'pink') healPct += 0.05;
        if (healPct > 0) BT.player.hp = Math.min(BT.player.maxHp, BT.player.hp + Math.round(BT.player.maxHp * healPct));
        var spHealPct = getLabBonus('spRegen') + BT.perkEndSpRegen;
        if (spHealPct > 0) BT.player.sp = Math.min(BT.player.maxSp, BT.player.sp + Math.round(BT.player.maxSp * spHealPct));
      }
      BT.enemy = generateEnemy(BT.wave);
      BT.shield = 0; BT.focusCD = 0; BT.defendCD = 0; BT.skillCD = 0; BT.doctorCD = 0; BT.stunTurns = 0; BT.poisonTurns = 0; BT.poisonDmg = 0; BT.burnDmg = 0; BT.burnTurns = 0; BT.enemyTelegraph = false;
      if (BT.freezeATK > 0) { BT.player.atk += BT.freezeATK; BT.freezeATK = 0; BT.freezeTurns = 0 }
      // 패시브 성장 리셋 (웨이브 끝 초기화)
      resetPassiveGrowth();
      saveGrowthBase(); // 새 웨이브 기준값 저장
      // 캐릭터 고유 메카닉 초기화
      BT.redMomentum = 0; BT.blackAim = 0; BT.blueCritChain = 0; BT.yellowMarks = 0;
      BT.buffs = []; BT.debuffs = []; BT.boosterUsed = false;
      // 웨이브 전환 오버레이
      var ov = $('bt-overlay'); ov.classList.add('on');
      setTimeout(function () {
        // UI 세팅
        var cycle = Math.ceil(BT.wave / 3); var waveInCycle = ((BT.wave - 1) % 3) + 1;
        var diffLabel = DIFF[currentDiff] ? ' [' + DIFF[currentDiff].label + ']' : '';
        $('bt-wave').innerHTML = '웨이브 ' + BT.wave + (BT.enemy.isBoss ? ' ★ 보스' : '') + diffLabel + ' <span class="bt-cycle">사이클 ' + cycle + ' (' + waveInCycle + '/3)</span>';
        $('bt-wave').style.color = BT.enemy.isBoss ? '#ff6b6b' : '#ffd700';
        $('bt-ename').textContent = BT.enemy.name; $('bt-ename').style.color = BT.enemy.color;
        // 적 설명
        var descEl = $('bt-edesc'); if (!descEl) { descEl = document.createElement('div'); descEl.className = 'bt-edesc'; descEl.id = 'bt-edesc'; $('bt-ehud').appendChild(descEl) }
        descEl.textContent = BT.enemy.desc + (BT.enemy.special ? ' — ' + getSpecialDesc(BT.enemy) : '');
        // 필드에 캐릭터 배치
        var field = $('bt-field'); clr(field);
        var eSvg = document.createElement('div'); eSvg.className = 'bt-enemy-svg' + (BT.enemy.isBoss ? ' boss' : ''); eSvg.id = 'bt-esvg';
        if (BT.enemy.isBoss) eSvg.style.setProperty('--boss-glow', BT.enemy.color);
        eSvg.appendChild(mkEnemy(BT.enemy, BT.enemy.isBoss ? 1.3 : 1.0));
        field.appendChild(eSvg);
        var pSvg = document.createElement('div'); pSvg.className = 'bt-player-svg'; pSvg.id = 'bt-psvg';
        pSvg.appendChild(mkR(BT.player.key, 0.9));
        field.appendChild(pSvg);
        updateBattleUI(); updateStatusIcons();
        // 오버레이 페이드아웃
        ov.classList.remove('on');
        clearBtLog();
        var enemyInfo = BT.enemy.name + ' — <span class="detail">체력 ' + BT.enemy.hp + ' 공격 ' + BT.enemy.atk + ' 방어 ' + BT.enemy.def + '</span>';
        if (BT.enemy.special) enemyInfo += ' <span class="buff">' + getSpecialDesc(BT.enemy) + '</span>';
        if (BT.enemy.shield > 0) enemyInfo += ' <span class="buff">🛡️' + BT.enemy.shield + '</span>';
        if (BT.enemy.isBoss) {
          // 보스 입장 연출
          setTimeout(function () {
            btChainFlash(BT.enemy.color, 3); btShake(true);
            btDrama('★ ' + BT.enemy.name + ' ★', BT.enemy.color, function () {
              btLog('<span class="buff">★ ' + BT.enemy.name + ' 등장! ★</span> ' + enemyInfo);
              decideEnemyIntent(); setTimeout(showActions, 400);
            }, 'boss');
          }, 400);
        } else {
          btLog(BT.enemy.name + '이(가) 나타났다! ' + enemyInfo);
          decideEnemyIntent(); setTimeout(showActions, 600);
        }
      }, BT.wave > 1 ? 500 : 100);
    }

    // ── 적 특수능력 설명 ──
    function getSpecialDesc(e) {
      if (!e.special) return '';
      var sp = e.special;
      if (sp.type === 'smash') return sp.every + '턴마다 강타';
      if (sp.type === 'poison') return '독 피해';
      if (sp.type === 'double') return '2연타 가능';
      if (sp.type === 'armor') return sp.every + '턴마다 방어 전환';
      if (sp.type === 'rally') return sp.every + '턴마다 자가 강화';
      if (sp.type === 'dodge') return '회피 가능';
      if (sp.type === 'freeze') return '빙결 (공격력 감소)';
      if (sp.type === 'spdrain') return 'SP 흡수';
      if (sp.type === 'stealth') return sp.every + '턴마다 은신';
      if (sp.type === 'burn') return '공격 시 화상';
      if (sp.type === 'shield') return '쉴드 보유';
      if (sp.type === 'counter') return '반격 가능';
      if (sp.type === 'bomb') return sp.turns + '턴 후 자폭';
      if (sp.type === 'shock') return '30% 확률 SP 감소';
      return '';
    }

    // ── UI 갱신 ──
    function updateBattleUI() {
      var p = BT.player, e = BT.enemy;
      $('bt-ebar').style.width = Math.max(0, Math.min(100, Math.round((e.maxHp > 0 ? e.hp / e.maxHp : 0) * 100))) + '%';
      $('bt-ehp').textContent = Math.max(0, e.hp) + (e.shield > 0 ? ' +🛡️' + e.shield : '') + ' / ' + e.maxHp + ' (공격 ' + e.atk + ' 방어 ' + e.def + ')';
      $('bt-php').style.width = Math.max(0, Math.min(100, Math.round((p.maxHp > 0 ? p.hp / p.maxHp : 0) * 100))) + '%';
      var shieldPct = BT.shield > 0 ? Math.min(100, Math.round(BT.shield / p.maxHp * 100)) : 0;
      $('bt-pshield').style.width = shieldPct + '%';
      $('bt-psp').style.width = Math.max(0, Math.min(100, Math.round((p.maxSp > 0 ? p.sp / p.maxSp : 0) * 100))) + '%';
      $('bt-phpv').textContent = Math.max(0, p.hp) + (BT.shield > 0 ? '+' + BT.shield : '') + ' / ' + p.maxHp;
      $('bt-pspv').textContent = p.sp + ' / ' + p.maxSp;
      var statsEl = $('bt-pstats');
      if (statsEl) statsEl.textContent = '⚔️' + p.atk + ' 🛡️' + p.def;
      // HP바 단계별 경고
      var hpRatio = p.hp / p.maxHp;
      var hpBar = $('bt-php');
      if (hpRatio <= 0.3) { hpBar.style.background = 'linear-gradient(90deg,#b71c1c,#e53935)'; hpBar.classList.add('hp-critical'); hpBar.classList.remove('hp-warning') }
      else if (hpRatio <= 0.5) { hpBar.style.background = 'linear-gradient(90deg,#e65100,#ff9800)'; hpBar.classList.add('hp-warning'); hpBar.classList.remove('hp-critical') }
      else { hpBar.style.background = ''; hpBar.classList.remove('hp-warning', 'hp-critical') }
    }

    // ── 상태이상 아이콘 갱신 (핵심만 표시) ──
    function updateStatusIcons() {
      var row = $('bt-status'); clr(row); var p = BT.player;
      function addIcon(cls, text, tip) { var s = document.createElement('span'); s.className = 'bt-sicon ' + cls; s.textContent = text; s.title = tip; row.appendChild(s) }
      // 강타 예고 (최우선)
      if (BT.enemyTelegraph) { var s = document.createElement('span'); s.className = 'bt-sicon buff'; s.style.cssText = 'animation:blink 0.4s infinite;color:#ff4444;font-weight:bold;border-color:#f44'; s.textContent = '\u26A0\uFE0F \uAC15\uD0C0\uC608\uACE0!'; row.appendChild(s) }
      // 상태이상 (위험)
      if (BT.poisonTurns > 0) addIcon('poison', '\u2620\uFE0F' + BT.poisonTurns, '\uB3C5 ' + BT.poisonDmg + '/\uD134, ' + BT.poisonTurns + '\uD134');
      if (BT.burnTurns > 0) addIcon('charge', '\uD83D\uDD25' + BT.burnTurns, '\uD654\uC0C1 ' + BT.burnDmg + '/\uD134, ' + BT.burnTurns + '\uD134');
      if (BT.freezeTurns > 0) addIcon('freeze', '\u2744\uFE0F' + BT.freezeTurns, '\uBE59\uACB0 ' + BT.freezeTurns + '\uD134');
      // 전투 버프/디버프 (턴 제한)
      BT.buffs.forEach(function (b) {
        if (b.stat === 'regenShield') { addIcon('heal', '💗' + b.turns + 't', '회복+쉴드 ' + b.turns + '턴'); return }
        if (b.stat === 'autoAttack') { addIcon('buff', '🔫' + b.turns + 't', '자동 피해 ' + Math.round(b.multi * 100) + '% (' + b.turns + '턴)'); return }
        addIcon('buff', '↑' + statKR(b.stat) + b.turns + 't', statKR(b.stat) + ' +' + Math.round((b.val || 0) * 100) + '%, ' + b.turns + '턴');
      });
      BT.debuffs.forEach(function (d) { addIcon('buff', '↓적' + statKR(d.stat) + d.turns + 't', '적 ' + statKR(d.stat) + ' -' + Math.round(d.val * 100) + '%, ' + d.turns + '턴') });
      // 적 기절
      if (BT.stunTurns > 0) addIcon('stun', '⚡기절!', '적 행동불가');
      // 쉴드
      if (BT.shield > 0) addIcon('guard', '\uD83D\uDEE1\uFE0F' + BT.shield, '\uC274\uB4DC ' + BT.shield + ' (\uB9E4\uD134 50%\u2193)');
      // 캐릭터 고유 게이지
      if (p.key === 'red' && BT.redMomentum > 0) addIcon('charge', '\uD83D\uDD25' + BT.redMomentum + '/5', '\uD22C\uC9C0 ' + BT.redMomentum + '/5' + (BT.redMomentum >= 5 ? ' MAX!' : ''));
      if (p.key === 'black') addIcon('buff', '\uD83D\uDD2B' + Math.round(BT.blackAim * 10) + '%', '\uAD00\uD1B5 ' + Math.round(BT.blackAim * 10) + '%');
      if (p.key === 'blue' && BT.blueCritChain > 0) addIcon('buff', '\uD83C\uDFAF+' + BT.blueCritChain * 8 + '%', '\uC9D1\uC911 \uD06C\uB9AC +' + BT.blueCritChain * 8 + '%');
      if (p.key === 'yellow' && BT.yellowMarks > 0) addIcon('stun', '\u26A1' + BT.yellowMarks + '/3', '\uAC10\uC804 ' + BT.yellowMarks + '/3' + (BT.yellowMarks >= 3 ? ' \uC2A4\uD134!' : ''));
      // 박사의 지원 쿨타임
      if (BT.doctorCD > 0) addIcon('buff', '🔬' + BT.doctorCD + 't', '박사의 지원 쿨타임 ' + BT.doctorCD + '턴');
      // 정보 버튼 (패시브/퍽 상세)
      var infoBtn = document.createElement('span'); infoBtn.className = 'bt-sicon bt-info-btn'; infoBtn.textContent = '\u2139\uFE0F';
      infoBtn.title = '\uD328\uC2DC\uBE0C/\uC2A4\uD0EF \uC0C1\uC138';
      infoBtn.addEventListener('click', function () { toggleBattleInfo() });
      row.appendChild(infoBtn);
      // 골드/CE 표시
      $('bt-pending').textContent = '\u2728MP ' + BT.gold + ' | \uD83D\uDD2ECE ' + BT.ce;
    }
    // ── 전투 정보 패널 (패시브/퍽/스탯) ──
    function toggleBattleInfo() {
      var existing = document.getElementById('bt-info-panel');
      if (existing) { existing.remove(); return }
      var p = BT.player; var panel = document.createElement('div');
      panel.id = 'bt-info-panel'; panel.className = 'bt-info-panel';
      var lines = [];
      lines.push('<b>\u2694\uFE0F ' + p.name + ' \uC2A4\uD0EF</b>');
      lines.push('\uCCB4\uB825 ' + p.hp + '/' + p.maxHp + ' | \uACF5\uACA9 ' + p.atk + ' | \uC274\uB4DC\uB825 ' + p.def + ' | \uCE58\uBA85\uD0C0 ' + p.crit + '% | \uD68C\uD53C ' + p.dodge + '%');
      // 출동 패시브
      var passives = [];
      if (PASSIVE_BUFFS[p.key]) passives.push(PASSIVE_BUFFS[p.key].icon + ' ' + PASSIVE_BUFFS[p.key].name + ': ' + PASSIVE_BUFFS[p.key].desc);
      if (BT.passiveKey && BT.passiveKey !== p.key && PASSIVE_BUFFS[BT.passiveKey]) passives.push(PASSIVE_BUFFS[BT.passiveKey].icon + ' ' + PASSIVE_BUFFS[BT.passiveKey].name + ': ' + PASSIVE_BUFFS[BT.passiveKey].desc);
      if (passives.length) { lines.push('<b>\uD83D\uDCA0 \uCD9C\uB3D9 \uD328\uC2DC\uBE0C</b>'); passives.forEach(function (pl) { lines.push(pl) }) }
      // 영구 퍽
      var perks = [];
      if (BT.perkDmgReduce > 0) perks.push('\uD83D\uDD30\uD53C\uD574\uAC10\uC18C ' + Math.round(BT.perkDmgReduce * 100) + '%');
      if (BT.perkCritChance > 0) perks.push('\uD83C\uDFAF\uCE58\uBA85\uD0C0\uD655\uB960 +' + Math.round(BT.perkCritChance * 100) + '%');
      if (BT.perkCritDmg > 0) perks.push('\uD83D\uDCA5\uCE58\uBA85\uD0C0\uD53C\uD574 x' + (1.5 + BT.perkCritDmg).toFixed(2));
      if (BT.perkShieldUp > 0) perks.push('\uD83D\uDEE1\uFE0F\uC274\uB4DC\uB7C9 +' + Math.round(BT.perkShieldUp * 100) + '%');
      if (BT.perkDmgUp > 0) perks.push('\u2694\uFE0F\uD53C\uD574 +' + Math.round(BT.perkDmgUp * 100) + '%');
      if (BT.perkArmorPen > 0) perks.push('\uD83C\uDFAF\uAD00\uD1B5 ' + Math.round(BT.perkArmorPen * 100) + '%');
      if (BT.perkExtraAtk > 0) perks.push('\u26A1\uCD94\uAC00\uD589\uB3D9 ' + Math.round(BT.perkExtraAtk * 100) + '%');
      if (BT.perkVamp > 0) perks.push('\uD83E\uDDDB\uD761\uD608 ' + Math.round(BT.perkVamp * 100) + '%');
      if (BT.perkFirstStrike > 0) perks.push('\u26A1\uCCAB\uACF5\uACA9 +' + Math.round(BT.perkFirstStrike * 100) + '%');
      if (BT.perkEndHpRegen > 0) perks.push('\uD83D\uDC9A\uC6E8\uC774\uBE0C\uCCB4\uB825 +' + Math.round(BT.perkEndHpRegen * 100) + '%');
      if (BT.perkEndSpRegen > 0) perks.push('\uD83D\uDD0B\uC6E8\uC774\uBE0CSP +' + Math.round(BT.perkEndSpRegen * 100) + '%');
      if (perks.length) { lines.push('<b>\uD83D\uDCCA \uC2A4\uD0EF \uBCF4\uB108\uC2A4</b>'); lines.push(perks.join(' \u00B7 ')) }
      panel.innerHTML = lines.join('<br>');
      panel.addEventListener('click', function () { panel.remove() });
      $('bt-bg').appendChild(panel);
    }

    // ── 행동 선택지 표시 ──
    function showActions() {
      if (BT.acting) return;
      var acts = $('bt-acts'); clr(acts);
      var p = BT.player, e = BT.enemy;
      // 예상 피해 계산 (평균)
      var estAtk = Math.round(calcDmg(p.atk + getBuffVal('atk'), e.def + getDebuffVal('def'), 1, 0) * 0.9);
      var atkLabel = '⚔️ 공격 (~' + estAtk + ')';
      // === 최적화된 버튼 레이아웃 ===
      var primaryRow = document.createElement('div'); primaryRow.className = 'bt-acts-primary';
      var secondaryRow = document.createElement('div'); secondaryRow.className = 'bt-acts-secondary';
      var supportRow = document.createElement('div'); supportRow.className = 'bt-acts-supports';
      // 공격
      var a1 = document.createElement('button'); a1.className = 'bt-act atk'; a1.textContent = atkLabel;
      a1.addEventListener('click', function () { doPlayerAction('attack') }); primaryRow.appendChild(a1);
      // 방어
      var shieldPreview = getBaseShield(p);
      var a2 = document.createElement('button'); a2.className = 'bt-act def';
      if (BT.defendCD > 0) { a2.textContent = '\uD83D\uDEE1\uFE0F \uBC29\uC5B4 [' + BT.defendCD + '\uD134]'; a2.classList.add('disabled') }
      else { a2.textContent = '\uD83D\uDEE1\uFE0F \uBC29\uC5B4 \uD83D\uDEE1+' + shieldPreview }
      a2.addEventListener('click', function () { doPlayerAction('defend') }); primaryRow.appendChild(a2);
      // 집중
      var focusHp = 1 + Math.round(p.maxHp * 0.10); var focusSp = Math.round(p.maxSp * 0.25);
      var focusBtn = document.createElement('button'); focusBtn.className = 'bt-act def';
      if (BT.focusCD > 0) { focusBtn.textContent = '\uD83E\uDDD8 \uC9D1\uC911 [' + BT.focusCD + '\uD134]'; focusBtn.classList.add('disabled') }
      else { focusBtn.textContent = '\uD83E\uDDD8 \uC9D1\uC911 \uCCB4\uB825+' + focusHp + ' SP+' + focusSp }
      focusBtn.addEventListener('click', function () { doPlayerAction('focus') }); secondaryRow.appendChild(focusBtn);
      // 필살기
      var effectiveCost = p.skill.cost - (p.skillCostReduction || 0);
      effectiveCost = Math.max(0, effectiveCost);
      var skillMulti = p.skill.multi;
      var estSkill = Math.round(calcDmg(p.atk + getBuffVal('atk'), e.def + getDebuffVal('def'), skillMulti, p.skill.ignoreDef || 0) * 0.9);
      var a3 = document.createElement('button'); a3.className = 'bt-act skill';
      if (BT.skillCD > 0) { a3.textContent = '✨ ' + p.skill.name + ' [' + BT.skillCD + '턴]'; a3.classList.add('disabled') }
      else { a3.textContent = '\u2728 ' + p.skill.name + ' SP' + effectiveCost + ' (~' + estSkill + ')'; if (p.sp < effectiveCost) a3.classList.add('disabled') }
      a3.addEventListener('click', function () { doPlayerAction('skill') }); secondaryRow.appendChild(a3);
      // 미라클 부스터
      var boostCost = 100;
      var a3b = document.createElement('button'); a3b.className = 'bt-act skill';
      a3b.style.cssText = 'border-color:rgba(255,180,0,0.5);color:#ffb300;background:rgba(255,180,0,0.08)';
      if (BT.boosterUsed) { a3b.textContent = '🌟 부스터 [사용됨]'; a3b.classList.add('disabled') }
      else { a3b.textContent = '🌟 부스터 SP' + boostCost; if (p.sp < boostCost) a3b.classList.add('disabled') }
      a3b.addEventListener('click', function () { doPlayerAction('booster') }); secondaryRow.appendChild(a3b);
      // 합체기
      if (BT.comboAttackCharged) {
        var a5 = document.createElement('button'); a5.className = 'bt-act combo';
        a5.textContent = '\uD83D\uDCAB \uD569\uCCB4\uAE30!';
        a5.addEventListener('click', function () { doPlayerAction('comboAttack') }); secondaryRow.appendChild(a5);
      }
      // 박사의 지원 (공용)
      var docBtn = document.createElement('button'); docBtn.className = 'bt-act support doc';
      if (BT.supportUsedThisTurn) { docBtn.textContent = '🔬 박사 [사용완료]'; docBtn.classList.add('disabled') }
      else if (BT.doctorCD > 0) { docBtn.textContent = '🔬 박사 [' + BT.doctorCD + '턴]'; docBtn.classList.add('disabled') }
      else { docBtn.textContent = '🔬 박사 (기절1턴)' }
      docBtn.addEventListener('click', function () { doPlayerAction('doctorSupport') });
      supportRow.appendChild(docBtn);
      // 지원스킬 (전투 미참여 캐릭터)
      BT.supportPool.forEach(function (sp, idx) {
        var sup = sp.data.support; var cd = BT.supportCDs[sp.key] || 0;
        var lb = sp.data.name + ' ';
        if (sup.type === 'buff') lb += statKR(sup.stat) + '+' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'autoAttack') lb += '자동피해' + Math.round(sup.multi * 100) + '%';
        else if (sup.type === 'dmgUp') lb += '피해+' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'extraAtkBuff') lb += '추가행동+' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'regenShield') lb += '체력+쉴드' + sup.turns + 't';
        else if (sup.type === 'armorPen') lb += '관통+' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'heal') lb += '체력+' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'sp_pct') lb += 'SP' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'sp_regen') lb += 'SP' + Math.round(sup.val * 100) + '%+' + Math.round(sup.regenVal * 100) + '%';
        else if (sup.type === 'sp') lb += 'SP+' + sup.val;
        else if (sup.type === 'debuff') lb += statKR(sup.stat) + '-' + Math.round(sup.val * 100) + '%';
        else if (sup.type === 'damage') lb += '공격x' + sup.multi;
        if (cd > 0) lb += ' [' + cd + 't]';
        var btn = document.createElement('button'); btn.className = 'bt-act support';
        btn.textContent = BT.supportUsedThisTurn ? sp.data.name + ' [사용완료]' : lb;
        if (cd > 0 || BT.supportUsedThisTurn) btn.classList.add('disabled');
        btn.addEventListener('click', function () { doPlayerAction('support_' + idx) });
        supportRow.appendChild(btn);
      });
      acts.appendChild(primaryRow); acts.appendChild(secondaryRow); acts.appendChild(supportRow);
      // ── 적 의도 표시 (배너 스타일) ──
      var oldIntent = document.getElementById('bt-intent'); if (oldIntent) oldIntent.remove();
      if (BT.enemyIntent) {
        var intentEl = document.createElement('div'); intentEl.id = 'bt-intent';
        var isUrgent = BT.enemyIntent.indexOf('\u26A0') > -1 || BT.enemyIntent.indexOf('\uAC15\uD0C0') > -1 || BT.enemyIntent.indexOf('\uD83D\uDCA3') > -1;
        var isCaution = BT.enemyIntent.indexOf('\uD83D\uDD36') > -1 || BT.enemyIntent.indexOf('\uBAA8\uC73C\uB294') > -1;
        intentEl.className = 'bt-intent-bar' + (isUrgent ? ' urgent' : isCaution ? ' caution' : '');
        var lbl = document.createElement('span'); lbl.className = 'bt-intent-label'; lbl.textContent = '\uC801 \uC758\uB3C4';
        var txt = document.createElement('span'); txt.className = 'bt-intent-text'; txt.textContent = BT.enemyIntent;
        intentEl.appendChild(lbl); intentEl.appendChild(txt);
        acts.parentNode.insertBefore(intentEl, acts);
      }
      // ── 적 캐릭터 옆 예상 수치 표시 ──
      var oldEiv = document.getElementById('bt-eiv'); if (oldEiv) oldEiv.remove();
      if (BT.enemyIntentValue) {
        var eiv = document.createElement('div'); eiv.id = 'bt-eiv';
        if (BT.enemyIntentValue.type === 'dmg') {
          eiv.className = 'bt-enemy-intent-val dmg';
          eiv.textContent = '⚔️ ~' + BT.enemyIntentValue.val;
        } else if (BT.enemyIntentValue.type === 'shield') {
          eiv.className = 'bt-enemy-intent-val shield';
          eiv.textContent = '🛡️ +' + BT.enemyIntentValue.val;
        }
        var eSvgEl = $('bt-esvg');
        if (eSvgEl) eSvgEl.appendChild(eiv);
      }
      // ── 예상행동 프리뷰 ──
      var pvEl = $('bt-preview'); pvEl.innerHTML = '';
      var critChance = Math.round((0.20 + p.crit * 0.01 + (p.critBonus || 0) + BT.perkCritChance) * 100);
      var spRegen = (p.spRegen || 0);
      function setPv(html) { pvEl.innerHTML = html }
      function clearPv() { pvEl.innerHTML = '' }
      var previews = {};
      // 공격 프리뷰
      var atkPvParts = [];
      atkPvParts.push('<span class="pv-dmg">예상 피해 ~' + estAtk + '</span>');
      var critMultiPv = (1.5 + BT.perkCritDmg).toFixed(2);
      atkPvParts.push('치명타' + critChance + '% (x' + critMultiPv + ')');
      previews.atk = atkPvParts.join(' · ');
      // 방어 프리뷰
      if (BT.defendCD > 0) { previews.def = '<span style="color:#f44">\uCFE8\uD0C0\uC784 ' + BT.defendCD + '\uD134 \uB0A8\uC74C</span>' }
      var defPvParts = ['<span class="pv-shield">\uC274\uB4DC ' + shieldPreview + ' \uC0DD\uC131 (\uB9E4\uD134 50%\u2193)</span>'];
      if (BT.perkGuardHeal) defPvParts.push('<span class="pv-heal">체력 +' + Math.round(p.maxHp * 0.02) + ' 치유</span>');
      previews.def = defPvParts.join(' · ');
      // 집중 프리뷰
      if (BT.focusCD > 0) previews.focus = '<span style="color:#f44">쿨타임 ' + BT.focusCD + '턴 남음</span>';
      else previews.focus = '<span class="pv-heal">체력 +' + focusHp + ' 회복</span> · <span class="pv-sp">SP +' + focusSp + ' (25%)</span> · <span class="pv-buff">쿨타임 3턴</span>';
      // 필살기 프리뷰
      var sklPvParts = ['<span class="pv-dmg">예상 ~' + estSkill + '</span>', '<span class="pv-sp">SP ' + effectiveCost + ' 소모</span>'];
      if (p.skill.stun) sklPvParts.push('<span class="pv-buff">적 ' + p.skill.stun + '턴 행동불가</span>');
      if (p.skill.heal) sklPvParts.push('<span class="pv-heal">쉴드 5% 부여</span>');
      if (p.skill.ignoreDef > 0) sklPvParts.push('<span class="pv-buff">적 방어 ' + Math.round(p.skill.ignoreDef * 100) + '% 무시</span>');
      if (p.key === 'yellow' && BT.yellowMarks >= 3) sklPvParts.push('<span class="pv-buff">감전 3스택 폭발! +30% 스턴</span>');
      else if (p.key === 'yellow' && BT.yellowMarks >= 2) sklPvParts.push('<span class="pv-buff">감전 2스택 소모 +20%</span>');
      if (p.key === 'red' && BT.redMomentum >= 5) sklPvParts.push('<span class="pv-buff">투지 MAX! 피해 x1.5</span>');
      if (p.key === 'black' && BT.blackAim > 0) sklPvParts.push('<span class="pv-buff">관통 ' + BT.blackAim + '스택 소모 +' + BT.blackAim * 5 + '%</span>');
      if (p.sp < effectiveCost) sklPvParts.push('<span style="color:#f44">SP 부족!</span>');
      previews.skill = sklPvParts.join(' · ');
      // 미라클 부스터 프리뷰
      var bstPvParts = ['<span class="pv-buff">전 능력치 2배 (2턴)</span>', '<span class="pv-sp">SP 100 소모</span>'];
      if (BT.boosterUsed) bstPvParts = ['<span style="color:#f44">이미 사용됨</span>'];
      else if (p.sp < 100) bstPvParts.push('<span style="color:#f44">SP 부족!</span>');
      previews.booster = bstPvParts.join(' · ');
      // 박사의 지원 프리뷰
      if (BT.doctorCD > 0) previews.doctor = '<span style="color:#f44">쿨타임 ' + BT.doctorCD + '턴 남음</span>';
      else previews.doctor = '<span class="pv-buff">적 1턴 기절</span> · <span class="pv-sp">SP +' + Math.round(p.maxSp * 0.25) + ' (25%)</span> · <span class="pv-buff">쿨타임 3턴</span>';
      // 지원 프리뷰 (각 서포터별)
      BT.supportPool.forEach(function (sp, idx) {
        var sup = sp.data.support; var cd = BT.supportCDs[sp.key] || 0;
        var pv = [];
        if (cd > 0) { pv.push('<span style="color:#f44">쿨타임 ' + cd + '턴 남음</span>') }
        else {
          pv.push('<span class="pv-buff">' + sp.data.name + '</span>');
          if (sup.type === 'buff') pv.push('<span class="pv-buff">' + statKR(sup.stat) + ' +' + Math.round(sup.val * 100) + '% (' + sup.turns + '턴)</span>');
          else if (sup.type === 'autoAttack') { var estAuto = Math.round(calcDmg(p.atk + getBuffVal('atk'), e.def + getDebuffVal('def'), sup.multi, BT.perkArmorPen) * 0.9); pv.push('<span class="pv-dmg">매턴 ~' + estAuto + ' 자동 피해 (' + sup.turns + '턴)</span>') }
          else if (sup.type === 'dmgUp') pv.push('<span class="pv-buff">피해 +' + Math.round(sup.val * 100) + '% (' + sup.turns + '턴)</span>');
          else if (sup.type === 'extraAtkBuff') pv.push('<span class="pv-buff">추가 행동 +' + Math.round(sup.val * 100) + '% (' + sup.turns + '턴)</span>');
          else if (sup.type === 'regenShield') { var rh = Math.round(p.maxHp * sup.healPct); var rs = Math.round(getBaseShield(p) * sup.shieldRatio); pv.push('<span class="pv-heal">' + sup.turns + '턴간 매턴 체력+' + rh + ' 쉴드+' + rs + '</span>') }
          else if (sup.type === 'armorPen') pv.push('<span class="pv-buff">방어 관통 +' + Math.round(sup.val * 100) + '% (' + sup.turns + '턴)</span>');
          else if (sup.type === 'heal') { var ha = Math.round(p.maxHp * sup.val); pv.push('<span class="pv-heal">체력 +' + ha + ' 회복</span>') }
          else if (sup.type === 'sp_pct') { var spAmt = Math.round(p.maxSp * sup.val); pv.push('<span class="pv-sp">SP +' + spAmt + ' (' + Math.round(sup.val * 100) + '%) 충전</span>') }
          else if (sup.type === 'sp_regen') { var spAmt = Math.round(p.maxSp * sup.val); var spRg = Math.round(p.maxSp * sup.regenVal); pv.push('<span class="pv-sp">SP +' + spAmt + ' 즉시</span> · <span class="pv-buff">매턴 SP +' + spRg + ' (' + sup.turns + '턴)</span>') }
          else if (sup.type === 'sp') pv.push('<span class="pv-sp">SP +' + sup.val + ' 충전</span>');
          else if (sup.type === 'debuff') pv.push('<span class="pv-buff">적 ' + statKR(sup.stat) + ' -' + Math.round(sup.val * 100) + '% (' + sup.turns + '턴)</span>');
          else if (sup.type === 'damage') { var es = Math.round(calcDmg(p.atk + getBuffVal('atk'), e.def + getDebuffVal('def'), sup.multi, 0) * 0.9); pv.push('<span class="pv-dmg">예상 ~' + es + '</span>') }
        }
        previews['sup_' + idx] = pv.join(' · ');
      });
      // 합체기 프리뷰
      if (BT.comboAttackCharged) {
        var estCombo = Math.round(calcDmg((p.atk + getBuffVal('atk')) * 2, e.def + getDebuffVal('def'), 1.5, 0.5) * 0.9);
        previews.combo = '<span class="pv-dmg">예상 ~' + estCombo + '</span> <span class="pv-buff">적 방어 50% 무시</span>';
      }
      // 이벤트 바인딩 (모바일: 탭→선택+프리뷰, 재탭→실행)
      var isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      var selectedBtAct = null;
      var pvTimer = null;
      function bindPv(btn, key) {
        if (!btn) return;
        btn.addEventListener('mouseenter', function () { clearTimeout(pvTimer); setPv(previews[key]) });
        btn.addEventListener('mouseleave', function () { pvTimer = setTimeout(clearPv, 60) });
        if (isTouchDevice) {
          btn.addEventListener('touchstart', function (e) {
            if (selectedBtAct !== btn) {
              e.preventDefault();
              if (selectedBtAct) selectedBtAct.classList.remove('selected');
              selectedBtAct = btn;
              btn.classList.add('selected');
              setPv(previews[key]);
            }
          });
        }
      }
      // 프리뷰 영역 터치 시 선택 해제
      if (isTouchDevice) {
        pvEl.addEventListener('touchstart', function () {
          if (selectedBtAct) { selectedBtAct.classList.remove('selected'); selectedBtAct = null; clearPv() }
        }, { passive: true });
      }
      bindPv(a1, 'atk'); bindPv(a2, 'def'); bindPv(focusBtn, 'focus'); bindPv(a3, 'skill'); bindPv(a3b, 'booster');
      bindPv(docBtn, 'doctor');
      supportRow.querySelectorAll('.bt-act.support').forEach(function (btn, idx) { if (idx > 0) bindPv(btn, 'sup_' + (idx - 1)) });
      if (BT.comboAttackCharged) { var cBtn = acts.querySelector('.bt-act:last-child'); bindPv(cBtn, 'combo') }
    }

    // ── 전투 로그 (히스토리) ──
    var btLogHistory = [];
    var BT_LOG_MAX = 6;
    function btLog(logContent) {
      if (btLogHistory.length > 0 && btLogHistory[btLogHistory.length - 1].turn === BT.turn) {
        btLogHistory[btLogHistory.length - 1].content = logContent;
      } else {
        btLogHistory.push({ turn: BT.turn, content: logContent });
      }
      if (btLogHistory.length > BT_LOG_MAX) btLogHistory.shift();
      renderBtLog();
    }
    function btLogNew(logContent) {
      btLogHistory.push({ turn: BT.turn, content: logContent });
      if (btLogHistory.length > BT_LOG_MAX) btLogHistory.shift();
      renderBtLog();
    }
    function renderBtLog() {
      var el = $('bt-log'); var frag = document.createDocumentFragment();
      btLogHistory.forEach(function (e) {
        var div = document.createElement('div'); div.className = 'bt-log-entry';
        var tn = document.createElement('span'); tn.className = 'bt-turn-num'; tn.textContent = 'T' + e.turn + ' ';
        div.appendChild(tn);
        var sp = document.createElement('span'); sp.innerHTML = e.content; div.appendChild(sp);
        frag.appendChild(div);
      });
      while (el.firstChild) el.removeChild(el.firstChild);
      el.appendChild(frag);
      el.scrollTop = el.scrollHeight;
    }
    function btLogAppend(extra) {
      if (btLogHistory.length > 0) { btLogHistory[btLogHistory.length - 1].content += extra; renderBtLog() }
    }
    function clearBtLog() { btLogHistory = []; var el = $('bt-log'); while (el.firstChild) el.removeChild(el.firstChild) }

    // ── 피해 숫자 표시 ──
    function showDmgNum(val, targetId, type) {
      var el = document.createElement('div');
      el.className = 'bt-dmg-num' + (type === 'heal' ? ' heal' : '') + (type === 'crit' ? ' crit' : '');
      el.textContent = (type === 'heal' ? '+' : '-') + val;
      var tgt = $(targetId);
      if (!tgt) return;
      var bg = $('bt-bg');
      var top = 0, left = 0, cur = tgt;
      while (cur && cur !== bg) { top += cur.offsetTop; left += cur.offsetLeft; cur = cur.offsetParent }
      el.style.left = (left + tgt.offsetWidth / 2 - 20) + 'px';
      var isEnemy = targetId === 'bt-esvg';
      el.style.top = (top - (isEnemy ? 20 : 10)) + 'px';
      bg.appendChild(el);
      setTimeout(function () { el.remove() }, 1000);
    }

    // ── 화면 이펙트 ──
    function btFlash(color) {
      var el = $('bt-fx'); el.style.background = color; el.style.opacity = '0';
      el.style.animation = 'none'; void el.offsetWidth;
      el.style.animation = 'btFlash 0.3s ease';
      el.style.opacity = '0.6';
      setTimeout(function () { el.style.opacity = '0' }, 300);
    }
    function btShake(strong) {
      var bg = $('bt-bg'); bg.style.animation = 'none'; void bg.offsetWidth;
      var dur = strong ? '0.6s' : '0.4s';
      bg.style.animation = 'btShake ' + dur + ' ease';
      setTimeout(function () { bg.style.animation = 'none' }, strong ? 600 : 400);
    }
    function btChainFlash(color, count) {
      var i = 0; (function go() { if (i >= count) return; btFlash(color); i++; setTimeout(go, 120) })();
    }
    function showCritBanner() {
      var el = document.createElement('div'); el.className = 'bt-crit-banner'; el.textContent = 'CRITICAL!';
      $('bt-bg').appendChild(el);
      setTimeout(function () { el.remove() }, 1000);
    }

    // ── 필살기 연출 ──
    var dramaTimer = null;
    function btDrama(text, color, cb, mode) {
      var d = $('bt-drama');
      if (dramaTimer) { clearTimeout(dramaTimer); d.classList.remove('on'); d.innerHTML = '' }
      d.classList.add('on');
      var cls = 'bt-drama-line';
      if (mode === 'boss') cls += ' boss';
      if (mode === 'victory') cls += ' victory';
      var dur = mode === 'boss' ? 1400 : mode === 'victory' ? 1600 : 900;
      d.innerHTML = '<div class="' + cls + '" style="color:' + color + '">' + text + '</div>';
      dramaTimer = setTimeout(function () { dramaTimer = null; d.classList.remove('on'); d.innerHTML = ''; if (cb) cb() }, dur);
    }

    // ── 쉴드 기본량 (방어 효과 기준) ──
    function getBaseShield(p) {
      return Math.round((p.maxHp * 0.10 + 1.5 * p.def) * (1 + BT.perkShieldUp));
    }

    // ── 피해 계산 ──
    function statKR(s) { return { atk: '공격력', def: '쉴드력', crit: '치명타확률', dodge: '회피확률', hp: '체력', sp: 'SP', dmg: '피해', dmgUp: '피해', extraAtk: '추가행동', armorPen: '관통', regenShield: '회복+쉴드' }[s] || s.toUpperCase() }
    function calcDmg(atk, def, multi, ignoreDef) {
      var base = atk * (multi || 1) * (1 + Math.random() * 0.3);
      var effectiveDef = Math.max(0, def) * (1 - (ignoreDef || 0));
      var reduction = Math.min(effectiveDef * 0.5, base * 0.5);
      return Math.max(1, Math.round(base - reduction));
    }

    // ── 지원스킬 처리 (턴 소모 없음) ──
    function _handleSupportAction(action, p, e) {
      function afterSupport() {
        updateBattleUI(); updateStatusIcons();
        BT.acting = false;
        setTimeout(showActions, 400);
      }
      if (action === 'doctorSupport') {
        if (BT.doctorCD > 0) { BT.supportUsedThisTurn = false; BT.acting = false; showActions(); return }
        BT.doctorCD = 3;
        BT.stunTurns += 1;
        var spRecover = Math.round(p.maxSp * 0.25); p.sp = Math.min(p.maxSp, p.sp + spRecover);
        btDrama('🔬 박사의 지원!', '#4ecca3', function () {
          btLog('🔬 <span class="buff">박사의 지원! 적 1턴 기절!</span> <span class="heal">SP+' + spRecover + '</span>');
          afterSupport();
        });
        return;
      }
      // 레인저 지원스킬
      var supIdx = parseInt(action.split('_')[1]);
      var supporter = BT.supportPool[supIdx];
      if (!supporter) { BT.supportUsedThisTurn = false; BT.acting = false; showActions(); return }
      var cd = BT.supportCDs[supporter.key] || 0;
      if (cd > 0) { BT.supportUsedThisTurn = false; BT.acting = false; showActions(); return }
      var sup = supporter.data.support;
      BT.supportCDs[supporter.key] = 4;
      var doubleSupport = (BT.perkDoubleSupport && !BT.perkDoubleSupportUsed);
      if (doubleSupport) BT.perkDoubleSupportUsed = true;
      var supMul = (doubleSupport ? 2 : 1);
      btDrama(supporter.data.name + '! ' + sup.name, supporter.data.color, function () {
        if (sup.type === 'buff') {
          var buffVal = sup.val * supMul;
          BT.buffs.push({ stat: sup.stat, val: buffVal, turns: sup.turns });
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="buff">' + statKR(sup.stat) + ' UP!</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'autoAttack') {
          var autoMulti = sup.multi * supMul;
          BT.buffs.push({ stat: 'autoAttack', multi: autoMulti, turns: sup.turns });
          var autoDmg = calcDmg(p.atk + getBuffVal('atk'), e.def + getDebuffVal('def'), autoMulti, BT.perkArmorPen);
          if (BT.perkDmgUp > 0) autoDmg = Math.round(autoDmg * (1 + BT.perkDmgUp));
          e.hp -= autoDmg;
          showDmgNum(autoDmg, 'bt-esvg', ''); btFlash(supporter.data.color);
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="dmg">' + autoDmg + ' 피해</span> <span class="buff">(' + sup.turns + '턴 자동 공격)</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'dmgUp') {
          var dmgVal = sup.val * supMul;
          BT.perkDmgUp += dmgVal;
          BT.buffs.push({ stat: 'dmgUp', val: dmgVal, turns: sup.turns });
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="buff">피해 +' + Math.round(dmgVal * 100) + '%!</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'extraAtkBuff') {
          var extraVal = sup.val * supMul;
          BT.perkExtraAtk += extraVal;
          BT.buffs.push({ stat: 'extraAtk', val: extraVal, turns: sup.turns });
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="buff">추가 행동 +' + Math.round(extraVal * 100) + '%!</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'regenShield') {
          BT.buffs.push({ stat: 'regenShield', healPct: sup.healPct, shieldRatio: sup.shieldRatio, turns: sup.turns });
          var immHeal = Math.round(p.maxHp * sup.healPct); p.hp = Math.min(p.maxHp, p.hp + immHeal);
          var immShield = Math.round(getBaseShield(p) * sup.shieldRatio); BT.shield += immShield;
          showDmgNum(immHeal, 'bt-psvg', 'heal');
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="heal">체력+' + immHeal + ' 🛡️+' + immShield + ' (' + sup.turns + '턴 지속)</span>');
        } else if (sup.type === 'damage') {
          var dmg = calcDmg(p.atk, e.def, sup.multi * supMul, BT.perkArmorPen);
          if (BT.perkDmgUp > 0) dmg = Math.round(dmg * (1 + BT.perkDmgUp));
          if (BT.perkRage && p.hp < p.maxHp * 0.3) { dmg = Math.round(dmg * 1.3) }
          e.hp -= dmg;
          showDmgNum(dmg, 'bt-esvg', ''); btFlash(supporter.data.color);
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="dmg">' + dmg + '</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'debuff') {
          var debuffVal = sup.val * supMul;
          BT.debuffs.push({ stat: sup.stat, val: debuffVal, turns: sup.turns });
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="buff">적 ' + statKR(sup.stat) + ' DOWN!</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'sp_pct') {
          var spVal = Math.round(p.maxSp * sup.val);
          p.sp = Math.min(p.maxSp, p.sp + spVal);
          btLog('🌟 ' + sup.name + '! <span class="sp-use">SP +' + spVal + ' (' + Math.round(sup.val * 100) + '%)</span>');
        } else if (sup.type === 'sp_regen') {
          var spVal = Math.round(p.maxSp * sup.val);
          p.sp = Math.min(p.maxSp, p.sp + spVal);
          BT.buffs.push({ stat: 'spRegen', val: sup.regenVal, turns: sup.turns });
          btLog('🌟 ' + sup.name + '! <span class="sp-use">SP +' + spVal + ' (' + Math.round(sup.val * 100) + '%)</span> + <span class="buff">매턴 SP ' + Math.round(sup.regenVal * 100) + '% (' + sup.turns + '턴)</span>');
        } else if (sup.type === 'sp') {
          var spVal = Math.round(sup.val * supMul);
          p.sp = Math.min(p.maxSp, p.sp + spVal);
          btLog('🌟 ' + sup.name + '! <span class="sp-use">SP +' + spVal + '</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'armorPen') {
          var penVal = sup.val * supMul;
          BT.buffs.push({ stat: 'armorPen', val: penVal, turns: sup.turns });
          BT.perkArmorPen += penVal;
          btLog('🌟 ' + supporter.data.name + '의 ' + sup.name + '! <span class="buff">방어 관통 +' + Math.round(penVal * 100) + '%!</span>' + (doubleSupport ? ' (2배!)' : ''));
        } else if (sup.type === 'heal') {
          var h = Math.round(p.maxHp * sup.val * supMul); p.hp = Math.min(p.maxHp, p.hp + h);
          showDmgNum(h, 'bt-psvg', 'heal');
          btLog('🌟 ' + sup.name + '! <span class="heal">체력 +' + h + '</span>' + (doubleSupport ? ' (2배!)' : ''));
        }
        // 지원스킬로 적이 쓰러지면 바로 처리
        if (e.hp <= 0) { e.hp = 0; updateBattleUI(); afterPlayerAction(); return }
        afterSupport();
      });
    }

    // ── 플레이어 행동 ──
    function doPlayerAction(action) {
      if (BT.acting || gamePaused) return;
      var p = BT.player, e = BT.enemy;

      // 지원스킬은 턴을 소모하지 않음 (한 턴에 1회만)
      var isSupport = (action === 'doctorSupport' || action.indexOf('support_') === 0);
      if (isSupport) {
        if (BT.supportUsedThisTurn) return;
        BT.acting = true;
        clr($('bt-acts'));
        BT.supportUsedThisTurn = true;
        _handleSupportAction(action, p, e);
        return;
      }

      BT.acting = true;
      clr($('bt-acts'));
      BT.turn++;
      BT.supportUsedThisTurn = false;
      BT.extraActionUsedThisTurn = false;
      p.guarding = false;
      // SP 회복 (옐로 패시브만)
      if (p.spRegen > 0) p.sp = Math.min(p.maxSp, p.sp + p.spRegen);
      // 패시브 성장 (매턴)
      applyPassiveGrowth();

      if (action === 'attack') {
        // 은신 체크 (stealth)
        if (e.special && e.special.type === 'stealth' && e.stealthActive) {
          e.stealthActive = false;
          btLog(e.name + '이(가) 은신에서 공격을 피했다! (스킬 사용 필요)');
          updateBattleUI(); setTimeout(function () { afterPlayerAction() }, 700); return;
        }
        // 팬텀 회피 체크
        if (e.special && e.special.type === 'dodge' && Math.random() < e.special.val) {
          btLog(e.name + '이(가) 재빠르게 회피했다!');
          updateBattleUI(); setTimeout(function () { afterPlayerAction() }, 700); return;
        }
        var nextBonus = BT.nextAtkBonus || 1; BT.nextAtkBonus = 0;
        var atkMultiplier = nextBonus;
        // 레드 고유: 투지 보너스
        var redBonus = 0;
        if (p.key === 'red') { BT.redMomentum = Math.min(5, BT.redMomentum + 1); redBonus = p.atk * BT.redMomentum * 0.02 }
        // 블랙 관통 누적: 매 공격마다 관통율 +10% (최대 50%), 스킬 사용 시 리셋
        var blackPierce = BT.perkArmorPen;
        if (p.key === 'black') { BT.blackAim = Math.min(5, BT.blackAim + 1); blackPierce += BT.blackAim * 0.10 }
        blackPierce = Math.min(1, blackPierce);
        var eDef = e.def + getDebuffVal('def');
        if (p.defIgnore) eDef = Math.round(eDef * (1 - p.defIgnore));
        var dmg = calcDmg(p.atk + getBuffVal('atk') + redBonus, eDef, atkMultiplier, blackPierce);
        if (BT.perkDmgUp > 0) dmg = Math.round(dmg * (1 + BT.perkDmgUp));
        // 치명타 체크
        var crit = Math.random() < (0.20 + p.crit * 0.01 + (p.critBonus || 0) + (BT.blueCritChain * 0.08) + BT.perkCritChance);
        if (crit) { dmg = Math.round(dmg * (1.5 + BT.perkCritDmg)) }
        // 기선제압
        if (BT.perkFirstStrike > 0 && BT.turn === 1) { dmg = Math.round(dmg * (1 + BT.perkFirstStrike)) }
        // SP 오버플로
        if (BT.perkSpOverflow > 0 && p.sp >= p.maxSp) { dmg = Math.round(dmg * (1 + BT.perkSpOverflow)) }
        // 분노의 일격
        if (BT.perkRage && p.hp < p.maxHp * 0.3) { dmg = Math.round(dmg * 1.3) }
        // 쉴드 체크
        if (e.shield > 0) {
          if (dmg >= e.shield) { dmg -= e.shield; e.shield = 0; btLog('방패 파괴!'); BT.debuffs.push({ stat: 'def', val: 0.5, turns: 3 }) }
          else { e.shield -= dmg; dmg = 0; btLog('방패 흡수! (남은 방패: ' + e.shield + ')') }
        }
        e.hp -= dmg;
        // 블루 고유: 쾌속 (치명타미발생 시 확률 누적, 치명타시 리셋)
        if (p.key === 'blue') { if (crit) { BT.blueCritChain = 0 } else { BT.blueCritChain = Math.min(3, BT.blueCritChain + 1) } }
        // 옐로 고유: 감전 마크
        if (p.key === 'yellow') { BT.yellowMarks = Math.min(3, BT.yellowMarks + 1) }
        if (crit) { btFlash('#ffd700'); btShake(true); showCritBanner() } else { btFlash(p.color); btShake() }
        showDmgNum(dmg, 'bt-esvg', crit ? 'crit' : '');
        var logMsg = p.name + '의 공격! <span class="dmg">' + dmg + ' 피해</span>';
        var details = [];
        if (p.key === 'black' && blackPierce > 0) { details.push('관통' + Math.round(blackPierce * 100) + '%') }
        if (crit) { var critMulti = (1.5 + BT.perkCritDmg).toFixed(2); logMsg += ' <span class="buff">치명타! x' + critMulti + '</span>'; details.push('치명타x' + critMulti) }
        if (p.key === 'red' && BT.redMomentum > 0) { logMsg += ' <span class="buff">투지 ' + BT.redMomentum + '/5</span>'; details.push('투지+' + Math.round(BT.redMomentum * 2) + '%') }
        if (p.key === 'black' && BT.blackAim > 0) logMsg += ' <span class="buff">🔫 관통 ' + Math.round(BT.blackAim * 10) + '%</span>';
        if (p.key === 'blue' && BT.blueCritChain > 0) logMsg += ' <span class="buff">집중 x' + BT.blueCritChain + '</span>';
        if (p.key === 'yellow') logMsg += ' <span class="buff">감전 ' + BT.yellowMarks + '/3</span>';
        if (e.shield > 0) details.push('적 쉴드:' + e.shield);
        if (details.length) logMsg += ' <span class="detail">(' + details.join(' ') + ')</span>';
        btLog(logMsg);
        // 흡혈 강타
        if (BT.perkVamp > 0 && dmg > 0) { var vampHeal = Math.round(dmg * BT.perkVamp); p.hp = Math.min(p.maxHp, p.hp + vampHeal); showDmgNum(vampHeal, 'bt-psvg', 'heal') }
        updateBattleUI();
        setTimeout(function () { afterPlayerAction() }, 700);

      } else if (action === 'defend') {
        if (BT.defendCD > 0) { BT.acting = false; showActions(); return }
        p.guarding = true;
        BT.defendCD = 2;
        // 쉴드 부여: (최대체력×10% + 1.5×def) × (1+쉴드보너스)
        var shieldAmt = getBaseShield(p);
        BT.shield = Math.max(BT.shield, shieldAmt);
        var defLog = p.name + '\uC774(\uAC00) \uBC29\uC5B4! <span class="buff">\uD83D\uDEE1\uFE0F \uC274\uB4DC ' + BT.shield + '</span>';
        // 수호의 오라
        if (BT.perkGuardHeal) {
          var gh = Math.round(p.maxHp * 0.02); p.hp = Math.min(p.maxHp, p.hp + gh);
          showDmgNum(gh, 'bt-psvg', 'heal'); defLog += ' <span class="heal">체력 +' + gh + '</span>';
        }
        btLog(defLog);
        updateBattleUI(); updateStatusIcons();
        setTimeout(function () { afterPlayerAction() }, 500);

      } else if (action === 'focus') {
        // 집중: 체력/SP 회복 (쿨타임 3턴)
        if (BT.focusCD > 0) { BT.acting = false; showActions(); return }
        var hpRecover = 1 + Math.round(p.maxHp * 0.10);
        var spRecover = Math.round(p.maxSp * 0.25);
        p.hp = Math.min(p.maxHp, p.hp + hpRecover);
        p.sp = Math.min(p.maxSp, p.sp + spRecover);
        BT.focusCD = 3;
        showDmgNum(hpRecover, 'bt-psvg', 'heal');
        var focusLog = p.name + '이(가) 집중! <span class="heal">체력 +' + hpRecover + '</span> <span class="sp-use">SP +' + spRecover + '</span>';
        btLog(focusLog);
        updateBattleUI(); updateStatusIcons();
        setTimeout(function () { afterPlayerAction() }, 500);

      } else if (action === 'skill') {
        if (BT.skillCD > 0) { BT.acting = false; showActions(); return }
        var skillCost = p.skill.cost - (p.skillCostReduction || 0);
        skillCost = Math.max(0, skillCost);
        if (p.sp < skillCost) { BT.acting = false; showActions(); return }
        BT.skillCD = 3;
        p.sp -= skillCost;
        var multi = p.skill.multi;
        var skillIgnore = p.skill.ignoreDef || 0;
        // 블랙 고유: 스킬 사용 시 관통 스택 소비 → 스킬 추가 배율
        if (p.key === 'black' && BT.blackAim > 0) { multi *= (1 + BT.blackAim * 0.05); BT.blackAim = 0 }
        // 옐로 고유: 감전 마크 소비
        var yellowBonus = 0; var yellowStunBonus = 0;
        if (p.key === 'yellow' && BT.yellowMarks > 0) {
          if (BT.yellowMarks >= 3) { yellowStunBonus = 1; yellowBonus = 0.30 }
          else if (BT.yellowMarks >= 2) { yellowBonus = 0.20 }
          BT.yellowMarks = 0;
        }
        multi *= (1 + yellowBonus);
        // 레드 고유: 투지 5 소비
        if (p.key === 'red' && BT.redMomentum >= 5) { multi *= 1.5; BT.redMomentum = 0 }
        var baseCrit = 0.20 + p.crit * 0.01 + (p.critBonus || 0) + BT.perkCritChance;
        var skillCritBonus = (p.skill.critBonus || 0);
        var skillCrit = Math.random() < (baseCrit + skillCritBonus);
        skillIgnore = Math.min(1, skillIgnore + BT.perkArmorPen);
        var dmg = calcDmg(p.atk + getBuffVal('atk'), e.def + getDebuffVal('def'), multi, skillIgnore);
        if (BT.perkDmgUp > 0) dmg = Math.round(dmg * (1 + BT.perkDmgUp));
        if (skillCrit) { dmg = Math.round(dmg * (1.5 + BT.perkCritDmg)) }
        // 분노의 일격
        if (BT.perkRage && p.hp < p.maxHp * 0.3) { dmg = Math.round(dmg * 1.3) }
        // 쉴드 체크
        if (e.shield > 0) {
          if (dmg >= e.shield) { dmg -= e.shield; e.shield = 0; btLog('방패 파괴!'); BT.debuffs.push({ stat: 'def', val: 0.5, turns: 3 }) }
          else { e.shield -= dmg; dmg = 0; btLog('방패 흡수! (남은 방패: ' + e.shield + ')') }
        }
        e.hp -= dmg;
        // 연출
        btDrama('★ ' + p.skill.name + ' ★', p.color, function () {
          btChainFlash(p.color, 2); btShake(true);
          showDmgNum(dmg, 'bt-esvg', 'crit');
          var logMsg = '✨ ' + p.skill.name + '! <span class="dmg">' + dmg + ' 피해</span>';
          if (skillCrit) { var critMulti = (1.5 + BT.perkCritDmg).toFixed(2); logMsg += ' <span class="buff">치명타! x' + critMulti + '</span>' }
          btLog(logMsg);
          // 추가 효과
          var stunVal = (p.skill.stun || 0) + yellowStunBonus;
          if (stunVal > 0) BT.stunTurns += stunVal;
          if (p.skill.heal) {
            var sh = Math.round(getBaseShield(p) * 0.50); BT.shield += sh;
            btLogAppend(' <span class="buff">🛡️ 쉴드 +' + sh + '</span>');
          }
          // Passive bonuses
          // 연쇄 번개
          if (BT.perkChainLightning && dmg > 0) { var clDmg = Math.round(p.atk * 0.3); e.hp -= clDmg; showDmgNum(clDmg, 'bt-esvg', ''); btLogAppend('<span class="dmg">연쇄 번개! ' + clDmg + '</span>') }
          updateBattleUI();
          setTimeout(function () { afterPlayerAction() }, 700);
        });
        return;

      } else if (action === 'booster') {
        // 미라클 부스터: SP 100 소모, 모든 능력치 2턴간 2배
        if (BT.boosterUsed) { BT.acting = false; showActions(); return }
        var boostCost = 100;
        if (p.sp < boostCost) { BT.acting = false; showActions(); return }
        p.sp -= boostCost;
        BT.boosterUsed = true;
        BT.buffs.push({ stat: 'atk', val: 1.0, turns: 2 });
        BT.buffs.push({ stat: 'def', val: 1.0, turns: 2 });
        BT.buffs.push({ stat: 'crit', val: 1.0, turns: 2 });
        BT.buffs.push({ stat: 'dodge', val: 1.0, turns: 2 });
        btChainFlash('#ffb300', 3); btShake(false);
        btLog('🌟 <span class="buff">미라클 부스터 발동! 전 능력치 2배! (2턴)</span>');
        updateBattleUI(); updateStatusIcons();
        setTimeout(function () { afterPlayerAction() }, 700);
        return;
      } else if (action === 'comboAttack') {
        if (!BT.comboAttackCharged) { BT.acting = false; showActions(); return }
        BT.comboAttackCharged = false;
        var passiveR = RANGERS[BT.passiveKey];
        var dmg = calcDmg((p.atk + getBuffVal('atk')) * 2, e.def + getDebuffVal('def'), 1.5, Math.min(1, 0.5 + BT.perkArmorPen));
        if (BT.perkDmgUp > 0) dmg = Math.round(dmg * (1 + BT.perkDmgUp));
        // 분노의 일격
        if (BT.perkRage && p.hp < p.maxHp * 0.3) { dmg = Math.round(dmg * 1.3) }
        e.hp -= dmg;
        btDrama('★ ' + p.name + ' & ' + passiveR.name + ' ★', '#9575cd', function () {
          btChainFlash('#9575cd', 3); btShake(true); showDmgNum(dmg, 'bt-esvg', 'crit');
          btLog('💫 합체기! ' + p.name + ' & ' + passiveR.name + '! <span class="dmg">' + dmg + '</span>');
          updateBattleUI(); setTimeout(function () { afterPlayerAction() }, 700);
        });
        return;
      }
    }

    // ── 버프/디버프 값 계산 ──
    function getBuffVal(stat) {
      var total = 0; if (!BT.player) return 0;
      BT.buffs.forEach(function (b) { if (b.stat === stat) total += Math.round((BT.player[stat] || 0) * b.val) });
      return total;
    }
    function getDebuffVal(stat) {
      var total = 0; if (!BT.enemy) return 0;
      BT.debuffs.forEach(function (d) { if (d.stat === stat) total -= Math.round((BT.enemy[stat] || 0) * d.val) });
      return total;
    }

    // ── 플레이어 행동 후 ──
    function afterPlayerAction() {
      var e = BT.enemy;
      // 적 쓰러졌는지 확인
      if (e.hp <= 0) {
        e.hp = 0; updateBattleUI();
        BT.kills++;
        // 골드 드롭 (골드 부스트 + 난이도 보정)
        var rewardBonus = 1 + getLabBonus('reward');
        var diffRewardM = (DIFF[currentDiff] || DIFF.normal).rewardM;
        var goldDrop = e.isBoss ? (5 + Math.floor(Math.random() * 4) + Math.ceil(BT.wave / 3)) : (2 + Math.floor(Math.random() * 2));
        goldDrop = Math.round(goldDrop * rewardBonus * diffRewardM);
        BT.gold += goldDrop;
        // CE 드롭
        var ceDrop = e.isBoss ? (5 + Math.floor(Math.random() * 4)) : (1 + Math.floor(Math.random() * 2));
        ceDrop = Math.round(ceDrop * rewardBonus * diffRewardM);
        BT.ce += ceDrop;
        progData.ce += ceDrop; saveProg();
        btLog(e.name + '을(를) 쓰러뜨렸다! <span class="gold-drop">✨MP+' + goldDrop + ' 🔮CE+' + ceDrop + '</span>' + (e.isBoss ? ' <span class="buff">★ 보스 격파!</span>' : ''));
        // 적 SVG 소멸
        var eSvg = $('bt-esvg'); if (eSvg) eSvg.classList.add('dead');
        btFlash(BT.player.color);
        updateStatusIcons();
        setTimeout(function () {
          if (BT.wave % 3 === 0) {
            showReward();
          } else {
            showMiniReward(function () { nextWave() });
          }
        }, 1000);
        return;
      }
      // 추가 행동 확률 체크 (턴당 1회, 추가행동 중 재발동 불가)
      if (!BT.extraActionUsedThisTurn && !BT.inExtraAction && BT.perkExtraAtk > 0 && Math.random() < BT.perkExtraAtk) {
        BT.extraActionUsedThisTurn = true;
        BT.inExtraAction = true;
        btLog('⚡ <span class="buff">추가 행동 발동!</span>');
        btFlash('#ffd700'); btShake();
        btDrama('⚡ 추가 행동!', '#ffd700', function () {
          BT.acting = false;
          showActions();
        });
        return;
      }
      BT.inExtraAction = false;
      // 적 턴
      setTimeout(enemyTurn, 400);
    }

    // ── 적 턴 ──
    function enemyTurn() {
      var p = BT.player, e = BT.enemy;
      e.turnCount++;

      // 스턴 중이면 스킵
      if (BT.stunTurns > 0) {
        BT.stunTurns--;
        btLog(e.name + '은(는) 기절 상태!');
        setTimeout(endTurn, 500);
        return;
      }

      // 보스 특수능력
      var atkMulti = 1;
      if (e.special) {
        var sp = e.special;
        // 타이탄 강타 예고 (힘 모으는 턴은 공격 안함)
        if (sp.type === 'smash' && (e.turnCount + 1) % sp.every === 0) {
          btLog('⚠️ <span class="buff">' + e.name + '이(가) 힘을 모으고 있다!</span>');
          BT.enemyTelegraph = true;
          updateBattleUI(); setTimeout(endTurn, 600);
          return;
        }
        if (sp.type === 'smash' && e.turnCount % sp.every === 0) { BT.enemyTelegraph = false; atkMulti = sp.multi; btChainFlash('#f44', 2); btShake(true); btLog('<span class="dmg">\u26A0\uFE0F\u26A0\uFE0F ' + e.name + '\uC758 \uAC15\uD0C0! \u26A0\uFE0F\u26A0\uFE0F</span> <span class="buff">x' + sp.multi.toFixed(1) + '</span>') }
        if (sp.type === 'double' && Math.random() < sp.chance) {
          // 2연타: 공격 2번 (쉴드 흡수 적용)
          var dmg1 = calcDmg(e.atk, 0, 1, 0);
          var dmg2 = calcDmg(e.atk, 0, 1, 0);
          if (BT.perkDmgReduce > 0) { dmg1 = Math.max(1, Math.round(dmg1 * (1 - BT.perkDmgReduce))); dmg2 = Math.max(1, Math.round(dmg2 * (1 - BT.perkDmgReduce))) }
          var totalDbl = dmg1 + dmg2; var dblShield = 0;
          if (BT.shield > 0) { dblShield = Math.min(BT.shield, totalDbl); BT.shield -= dblShield; totalDbl -= dblShield }
          p.hp = Math.max(0, p.hp - totalDbl);
          btShake(); showDmgNum(dblShield + totalDbl, 'bt-psvg', '');
          var dblLog = e.name + '의 2연타! <span class="dmg">' + (dblShield + totalDbl) + ' 피해</span>';
          if (dblShield > 0) dblLog += ' <span class="buff">🛡️ 쉴드 -' + dblShield + '</span>';
          btLog(dblLog);
          updateBattleUI();
          setTimeout(endTurn, 600);
          return;
        }
        // 리퍼 처형자 모드
        if (sp.type === 'double' && e.hp < e.maxHp * 0.3 && !e.executeMode) {
          e.executeMode = true; e.atk = Math.round(e.atk * 1.5);
          btLog('<span class="buff">' + e.name + '의 처형자 모드!</span> 공격력 증가!');
        }
        if (sp.type === 'armor') {
          if (e.turnCount % sp.every !== 0) {
            atkMulti = 0.5;
            var armorShield = Math.round((sp.shield || 7) * 0.5); e.shield += armorShield;
            btLog('<span class="sp-use">' + e.name + '의 방어 강화! 🛡️ 쉴드 +' + armorShield + '</span>');
          } else {
            atkMulti = 1.5; e.shield = 0;
            btLog('<span class="buff">' + e.name + '의 방어 해제! 쉴드 파괴, 반격!</span>');
          }
        }
        if (sp.type === 'rally' && sp.every > 0 && e.turnCount % sp.every === 0) {
          var rallyAtk = Math.min(2, Math.max(0, 30 - e.atk)); var rallyDef = Math.min(1, Math.max(0, 20 - e.def));
          if (rallyAtk > 0 || rallyDef > 0) {
            e.atk += rallyAtk; e.def += rallyDef;
            btLog('<span class="buff">' + e.name + '이(가) 강화!</span> 공격/방어 증가')
          }
          var rallyShield = 3; e.shield += rallyShield;
          btLogAppend('<span class="buff">🛡️ 쉴드 +' + rallyShield + '</span>');
          // 장군 전술 지휘: 디버프
          if (e.turnCount % 3 === 0) {
            BT.debuffs.push({ stat: 'atk', val: 0.15, turns: 2 });
            btLog('<span class="dmg">' + e.name + '의 전술 지휘! ATK -15%</span>');
          }
        }
        if (sp.type === 'poison' && e.turnCount === 1) {
          BT.poisonDmg = sp.dmg; BT.poisonTurns = sp.turns;
        }
        // 보스 독 에스컬레이션
        if (sp.type === 'poison' && e.isBoss && BT.poisonTurns > 0) {
          BT.poisonDmg++;
        }
        // 은신 (stealth) - 활성화
        if (sp.type === 'stealth' && e.turnCount % sp.every === 0) {
          e.stealthActive = true;
          btLog(e.name + '이(가) 은신 상태!');
        }
        // 자폭 (bomb) - 턴 카운트다운
        if (sp.type === 'bomb') {
          var remaining = sp.turns - e.turnCount;
          if (remaining <= 0) {
            var bombDmg = Math.round(p.maxHp * 0.35);
            p.hp = Math.max(0, p.hp - bombDmg);
            e.hp = 0;
            btLog('💥 ' + e.name + ' 자폭! <span class="dmg">' + bombDmg + ' 피해</span>');
            showDmgNum(bombDmg, 'bt-psvg', ''); btShake();
            updateBattleUI();
            setTimeout(endTurn, 600);
            return;
          } else {
            btLog('⚠️ 자폭까지 ' + remaining + '턴!');
          }
        }
      }

      // 적 쉴드 생성 행동 (decideEnemyIntent에서 미리 결정)
      if (BT.enemyNextShield) {
        BT.enemyNextShield = false;
        var eShieldAmt = Math.round(e.def * 1.5 + e.maxHp * 0.05);
        e.shield += eShieldAmt;
        btLog('🛡️ <span class="sp-use">' + e.name + '이(가) 쉴드를 생성했다! +' + eShieldAmt + '</span>');
        updateBattleUI();
        setTimeout(endTurn, 600);
        return;
      }

      var dmg = calcDmg(e.atk, 0, atkMulti, 0);
      if (BT.perkDmgReduce > 0) dmg = Math.max(1, Math.round(dmg * (1 - BT.perkDmgReduce)));
      // 회피 (SPD 기반 + perkDodge) — 성공 시 60% 경감
      var dodged = Math.random() < p.dodge * 0.01 + BT.perkDodge;
      if (dodged) {
        var reducedAmt = Math.round(dmg * 0.6);
        dmg = Math.max(1, dmg - reducedAmt);
        btLog(p.name + '이(가) 회피! <span class="buff">피해 60% 경감 (-' + reducedAmt + ')</span>');
      }
      // 쉴드 흡수
      var shieldAbsorb = 0;
      if (BT.shield > 0) {
        shieldAbsorb = Math.min(BT.shield, dmg);
        BT.shield -= shieldAbsorb; dmg -= shieldAbsorb;
      }
      p.hp = Math.max(0, p.hp - dmg);
      btShake(); showDmgNum(shieldAbsorb + dmg, 'bt-psvg', shieldAbsorb > 0 ? '' : '');
      var totalHit = shieldAbsorb + dmg;
      var hitLog = e.name + '의 공격! <span class="dmg">' + totalHit + ' 피해</span>';
      if (atkMulti > 1) hitLog += ' <span class="buff">강화 x' + atkMulti.toFixed(1) + '</span>';
      if (shieldAbsorb > 0) hitLog += ' <span class="buff">🛡️쉴드 -' + shieldAbsorb + '</span>';
      if (BT.shield > 0) hitLog += ' <span class="detail">(잔여 쉴드 ' + BT.shield + ')</span>';
      if (dmg > 0) hitLog += ' <span class="detail">(실 체력 -' + dmg + ')</span>';
      btLog(hitLog);

      // 카운터 공격 (방어 시)
      if (p.guarding) {
        var counterRate = 0.20;
        if (p.key === 'pink') counterRate = 0.35;
        if (BT.perkCounterUp) counterRate = 0.35;
        var counterDmg = Math.round(dmg * counterRate);
        if (counterDmg > 0) {
          e.hp -= counterDmg;
          showDmgNum(counterDmg, 'bt-esvg', '');
          btLogAppend('반격! <span class="dmg">' + counterDmg + ' 피해</span>');
        }
      }
      // 가시 방어 (perkThorns)
      if (BT.perkThorns > 0) {
        e.hp -= BT.perkThorns;
        btLogAppend('가시 방어! <span class="dmg">' + BT.perkThorns + '</span>');
      }

      // 화상 (burn) - 공격 시 화상 부여 (방어하면 안 걸림)
      if (e.special && e.special.type === 'burn' && !p.guarding) {
        BT.burnDmg = e.special.val; BT.burnTurns = e.special.turns;
        btLogAppend('<span class="dmg">화상! ' + e.special.val + '/턴 ' + e.special.turns + '턴</span>');
      }
      // 감전 (shock) - SP 감소
      if (e.special && e.special.type === 'shock' && Math.random() < 0.3) {
        p.sp = Math.max(0, p.sp - e.special.val);
        btLogAppend('<span class="sp-use">감전! SP -' + e.special.val + '</span>');
      }

      updateBattleUI();
      setTimeout(endTurn, 600);
    }

    // ── 적 의도 결정 (다음 턴 예고) ──
    function decideEnemyIntent() {
      var e = BT.enemy, p = BT.player; if (!e || e.hp <= 0) { BT.enemyIntent = null; BT.enemyIntentValue = null; return }
      var sp = e.special; var nextTurn = e.turnCount + 1;
      BT.enemyIntentValue = null;
      // 예상 피해 계산 헬퍼
      function estDmgTag(multi) {
        var est = calcDmg(e.atk, 0, multi || 1, 0);
        if (BT.perkDmgReduce > 0) est = Math.max(1, Math.round(est * (1 - BT.perkDmgReduce)));
        BT.enemyIntentValue = { type: 'dmg', val: est };
        return ' (~' + est + ')';
      }
      // 보스 특수 패턴 예고
      if (sp) {
        if (sp.type === 'smash' && nextTurn % sp.every === 0) { BT.enemyIntent = '\u26A0\uFE0F\u26A0\uFE0F \uAC15\uD0C0 \uBC1C\uB3D9! \uBC29\uC5B4 \uD544\uC218!!' + estDmgTag(2.0) + ' \u26A0\uFE0F\u26A0\uFE0F'; return }
        if (sp.type === 'smash' && (nextTurn + 1) % sp.every === 0) { BT.enemyIntent = '🔶 힘을 모으는 중...'; return }
        if (sp.type === 'armor' && nextTurn % sp.every === 0) { BT.enemyIntent = '💥 방어 해제 후 반격!' + estDmgTag(1.5) + ' (공격 찬스)'; return }
        if (sp.type === 'armor' && nextTurn % sp.every !== 0) { BT.enemyIntent = '🛡️ 방어 강화 중 (쉴드 축적)'; return }
        if (sp.type === 'rally' && sp.every > 0 && nextTurn % sp.every === 0) { BT.enemyIntent = '📢 자가 강화 준비 (빠른 처치 추천)'; return }
        if (sp.type === 'bomb') { var rem = sp.turns - nextTurn; if (rem <= 1) { BT.enemyIntent = '💣 자폭 임박!! (~' + Math.round(p.maxHp * 0.35) + ') 방어 필수'; return } else if (rem <= 2) { BT.enemyIntent = '💣 자폭까지 ' + rem + '턴!'; return } }
        if (sp.type === 'double' && e.executeMode) { BT.enemyIntent = '☠️ 처형자 모드!' + estDmgTag(1) + ' (높은 피해 주의)'; return }
        if (sp.type === 'stealth' && nextTurn % sp.every === 0) { BT.enemyIntent = '👁️ 은신 준비 (스킬로만 타격 가능)'; return }
      }
      // 쉴드 생성 여부 미리 결정 (웨이브 3+, 쉴드 없을 때 20%)
      BT.enemyNextShield = false;
      if (e.shield <= 0 && BT.wave >= 3 && Math.random() < 0.20) {
        BT.enemyNextShield = true;
        var estShield = Math.round(e.def * 1.5 + e.maxHp * 0.05);
        BT.enemyIntentValue = { type: 'shield', val: estShield };
        BT.enemyIntent = '🛡️ 방어 태세 (쉴드 +' + estShield + ')';
        return;
      }
      // 일반 몹: 상태 기반 힌트
      if (p.hp < p.maxHp * 0.3) { BT.enemyIntent = '⚔️ 약점 포착!' + estDmgTag(1) + ' (강한 공격 예상)'; return }
      if (BT.shield > 0) { BT.enemyIntent = '⚔️ 쉴드를 노리는 공격' + estDmgTag(1); return }
      // 기본
      BT.enemyIntent = '⚔️ 공격 준비' + estDmgTag(1);
    }

    // ── 턴 종료 처리 ──
    function endTurn() {
      var p = BT.player;
      // 독 피해 (이미 사망 시 무시)
      if (BT.poisonTurns > 0 && p.hp > 0) {
        BT.poisonTurns--;
        p.hp = Math.max(0, p.hp - BT.poisonDmg);
        showDmgNum(BT.poisonDmg, 'bt-psvg', '');
        btLogAppend('독 피해 <span class="dmg">' + BT.poisonDmg + '</span>');
        updateBattleUI();
      }
      // SP 드레인
      if (BT.enemy.special && BT.enemy.special.type === 'spdrain') {
        p.sp = Math.max(0, p.sp - BT.enemy.special.val);
        btLog('<span class="sp-use">SP -' + BT.enemy.special.val + '</span> 흡수당했다');
        updateBattleUI();
      }
      // 빙결 (공격력 감소) — 턴 카운터 기반
      if (BT.enemy.special && BT.enemy.special.type === 'freeze' && BT.enemy.turnCount === 1 && BT.freezeATK === 0) {
        BT.freezeATK = Math.round(p.atk * BT.enemy.special.val);
        BT.freezeTurns = BT.enemy.special.turns;
        p.atk -= BT.freezeATK;
        btLog('<span class="sp-use">빙결! 공격력 -' + BT.freezeATK + ' (' + BT.freezeTurns + '턴)</span>');
      }
      if (BT.freezeTurns > 0) {
        BT.freezeTurns--;
        if (BT.freezeTurns <= 0 && BT.freezeATK > 0) { p.atk += BT.freezeATK; BT.freezeATK = 0; btLogAppend('<span class="buff">빙결 해제!</span>') }
      }
      // regenShield / spRegen 효과 (틱 전 적용)
      BT.buffs.forEach(function (b) {
        if (b.stat === 'regenShield' && b.turns > 0 && p.hp > 0) {
          var rh = Math.round(p.maxHp * b.healPct); p.hp = Math.min(p.maxHp, p.hp + rh);
          var rs = Math.round(getBaseShield(p) * b.shieldRatio); BT.shield += rs;
          showDmgNum(rh, 'bt-psvg', 'heal');
          btLogAppend(' <span class="heal">💗+' + rh + '</span> <span class="buff">🛡️+' + rs + '</span>');
        }
        if (b.stat === 'spRegen' && b.turns > 0 && p.hp > 0) {
          var spRg = Math.round(p.maxSp * b.val); p.sp = Math.min(p.maxSp, p.sp + spRg);
          btLogAppend(' <span class="sp-use">⚡SP+' + spRg + '</span>');
        }
        if (b.stat === 'autoAttack' && b.turns > 0 && BT.enemy && BT.enemy.hp > 0) {
          var aaDmg = calcDmg(p.atk + getBuffVal('atk'), BT.enemy.def + getDebuffVal('def'), b.multi, BT.perkArmorPen);
          if (BT.perkDmgUp > 0) aaDmg = Math.round(aaDmg * (1 + BT.perkDmgUp));
          BT.enemy.hp -= aaDmg;
          showDmgNum(aaDmg, 'bt-esvg', ''); btFlash('#555');
          btLogAppend(' <span class="dmg">🔫자동 피해 ' + aaDmg + '</span>');
        }
      });
      // 버프/디버프 틱
      BT.buffs = BT.buffs.filter(function (b) {
        b.turns--;
        if (b.turns <= 0) {
          if (b.stat === 'armorPen') BT.perkArmorPen = Math.max(0, BT.perkArmorPen - b.val);
          if (b.stat === 'dmgUp') BT.perkDmgUp = Math.max(0, BT.perkDmgUp - b.val);
          if (b.stat === 'extraAtk') BT.perkExtraAtk = Math.max(0, BT.perkExtraAtk - b.val);
        }
        return b.turns > 0;
      });
      BT.debuffs = BT.debuffs.filter(function (d) { d.turns--; return d.turns > 0 });
      Object.keys(BT.supportCDs).forEach(function (k) { if (BT.supportCDs[k] > 0) BT.supportCDs[k]-- });
      if (BT.focusCD > 0) BT.focusCD--;
      if (BT.defendCD > 0) BT.defendCD--;
      if (BT.skillCD > 0) BT.skillCD--;
      if (BT.doctorCD > 0) BT.doctorCD--;

      // 화상 피해
      if (BT.burnTurns > 0 && p.hp > 0) {
        BT.burnTurns--;
        p.hp = Math.max(0, p.hp - BT.burnDmg);
        showDmgNum(BT.burnDmg, 'bt-psvg', '');
        btLogAppend('<span class="dmg">화상! -' + BT.burnDmg + '</span>');
        updateBattleUI();
      }
      // Passive regen
      if (p.hpRegen > 0 && p.hp > 0) { var rg = Math.max(1, Math.round(p.maxHp * p.hpRegen)); p.hp = Math.min(p.maxHp, p.hp + rg) }

      // 플레이어 사망 확인
      if (p.hp <= 0) {
        p.hp = 0; updateBattleUI(); updateStatusIcons();
        // 사망 연출: 플레이어 SVG 쓰러짐
        var psvg = $('bt-psvg'); if (psvg) psvg.classList.add('dead');
        btFlash('#e53935');
        setTimeout(function () {
          var ov = $('bt-overlay'); ov.classList.add('on');
          setTimeout(gameOver, 600);
        }, 800);
        return;
      }
      // 쉴드 감쇠: 매 턴 50% 감소
      if (BT.shield > 0) {
        var oldShield = BT.shield;
        BT.shield = Math.round(BT.shield * 0.5);
        if (BT.shield < oldShield) btLogAppend('<span class="detail">🛡️ 쉴드 감쇠 ' + oldShield + '→' + BT.shield + '</span>');
      }
      updateBattleUI(); updateStatusIcons();
      decideEnemyIntent();
      BT.acting = false;
      showActions();
    }

    // ── 보상 화면 ──
    function showReward() {
      // 보스 클리어 연출
      btChainFlash('#ffd700', 3); btShake(true);
      btDrama('★ 승리! ★', '#ffd700', function () { }, 'victory');
      setTimeout(function () {
        lowerBgm();
        var cycle = Math.ceil(BT.wave / 3);
        $('rw-title').textContent = '★ ' + cycle + ' 사이클 클리어 ★';
        var cards = $('rw-cards'); clr(cards);
        // 3개 랜덤 보상 선택
        var pool = REWARDS.slice();
        // 희귀 보상은 사이클 2부터
        if (cycle < 2) pool = pool.filter(function (r) { return !r.rare });
        var picked = [];
        while (picked.length < 3 && pool.length > 0) {
          var ri = Math.floor(Math.random() * pool.length);
          picked.push(pool[ri]); pool.splice(ri, 1);
        }
        picked.forEach(function (rw) {
          var isRare = !!rw.rare;
          var card = document.createElement('div'); card.className = 'rw-card' + (isRare ? ' rare' : '');
          var tierLabel = isRare ? '<div class="rw-tier rare">★ 희귀 ★</div>' : '<div class="rw-tier normal">일반</div>';
          card.innerHTML = tierLabel + '<div class="rw-icon">' + rw.icon + '</div><div class="rw-rname">' + rw.name + '</div><div class="rw-rdesc">' + rw.desc + '</div>';
          card.addEventListener('click', function () {
            if (this.dataset.used) return; cards.querySelectorAll('.rw-card').forEach(function (c) { c.dataset.used = '1' });
            var result = rw.fn(BT.player);
            updateBattleUI(); updateStatusIcons();
            restoreBgm();
            showScr('battle');
            btLog('<span class="buff">' + result + '</span> 획득!');
            setTimeout(nextWave, 600);
          });
          cards.appendChild(card);
        });
        // 훈련 종료 버튼 (웨이브 2 이상)
        var retreatBtn = $('rw-retreat');
        if (BT.wave >= 2) {
          retreatBtn.style.display = 'block';
          retreatBtn.onclick = function () { retreatBattle() };
        } else { retreatBtn.style.display = 'none' }
        showScr('reward');
      }, 1200);// 보스 클리어 연출 딜레이
    }

    // ── 미니 보상 ──
    function showMiniReward(callback) {
      lowerBgm();
      var pool = MINI_REWARDS.filter(function (r) { return !r.rare || Math.random() < 0.3 }); var picked = [];
      while (picked.length < 3 && pool.length > 0) { var ri = Math.floor(Math.random() * pool.length); picked.push(pool[ri]); pool.splice(ri, 1) }
      var overlay = document.createElement('div'); overlay.className = 'mini-rw';
      var box = document.createElement('div'); box.className = 'mini-rw-box';
      picked.forEach(function (rw) {
        var isRare = !!rw.rare;
        var card = document.createElement('div'); card.className = 'mini-rw-card' + (isRare ? ' rare' : '');
        card.innerHTML = '<div class="mini-rw-icon">' + rw.icon + '</div><div class="mini-rw-name">' + rw.name + '</div><div class="mini-rw-desc">' + rw.desc + '</div>';
        card.addEventListener('click', function () {
          if (overlay.dataset.used) return; overlay.dataset.used = '1';
          var result = rw.fn(BT.player); updateBattleUI(); updateStatusIcons();
          restoreBgm(); overlay.remove();
          btLog('<span class="buff">' + result + '</span>');
          if (callback) setTimeout(callback, 400);
        });
        box.appendChild(card);
      });
      // 훈련 종료 버튼 (웨이브 2 이상)
      if (BT.wave >= 2) {
        var retBtn = document.createElement('button'); retBtn.className = 'rw-retreat';
        retBtn.textContent = '🏳️ 훈련 종료 (보상 전액 획득)';
        retBtn.style.marginTop = '16px';
        retBtn.addEventListener('click', function () { overlay.remove(); retreatBattle() });
        box.appendChild(retBtn);
      }
      overlay.appendChild(box); $('bt-bg').appendChild(overlay);
    }

    // ── 게임오버 ──
    function endBattle(isRetreat) {
      stopAllBgm();
      var gs = $('gameover-screen'); gs.classList.remove('go-show'); void gs.offsetWidth;
      $('go-wave').textContent = '도달 웨이브: ' + BT.wave;
      $('go-kills').textContent = '처치한 괴인: ' + BT.kills;
      var waveBonus = Math.floor(BT.wave / 3);
      var baseMP = BT.gold + waveBonus;
      var baseCE = BT.ce;
      // 퇴각: 100%, 패배: 50%
      var rate = isRetreat ? 1 : 0.5;
      var earnedMP = Math.floor(baseMP * rate);
      var earnedCE = Math.floor(baseCE * rate);
      if (earnedMP > 0) { progData.mp += earnedMP }
      if (!isRetreat) {
        // 패배 시 이미 적립된 CE 중 절반만 인정 (전투 중 적립분 절반 회수)
        var ceLoss = Math.floor(baseCE * 0.5);
        progData.ce -= ceLoss;
      }
      saveProg();
      var rateLabel = isRetreat ? '(전액)' : '(패배 50%)';
      $('go-gold').textContent = rateLabel + ' ✨MP +' + earnedMP + '  |  🔮CE +' + earnedCE;
      $('go-rp').textContent = '보유: ✨MP ' + progData.mp + '  🔮CE ' + progData.ce;
      var best = parseInt(localStorage.getItem('mr_best_wave'), 10) || 0;
      if (BT.wave > best) { best = BT.wave; localStorage.setItem('mr_best_wave', String(best)); $('go-best').textContent = '🏆 신기록! 웨이브 ' + best }
      else { $('go-best').textContent = '최고 기록: 웨이브 ' + best }
      $('t-best').textContent = '최고 기록: 웨이브 ' + best;
      // 난이도 해금: 웨이브 3 이상 도달 시 다음 단계 개방
      if (BT.wave >= 3) {
        var unlock = getDiffUnlock();
        var unlocked = '';
        if (currentDiff === 'easy' && !unlock.normal) { unlock.normal = true; unlocked = '노말' }
        if (currentDiff === 'normal' && !unlock.hard) { unlock.hard = true; unlocked = '하드' }
        if (unlocked) { saveDiffUnlock(unlock); $('go-best').textContent += '\n🔓 ' + unlocked + ' 모드 해금!' }
      }
      if (isRetreat) {
        document.querySelector('.go-title').textContent = '훈련 종료';
        document.querySelector('.go-title').style.color = '#4ecca3';
      } else {
        document.querySelector('.go-title').textContent = 'GAME OVER';
        document.querySelector('.go-title').style.color = '#e53935';
      }
      showScr('gameover'); gs.classList.add('go-show');
      $('bt-overlay').classList.remove('on');
    }
    function gameOver() { endBattle(false) }
    function retreatBattle() {
      if (BT.wave < 2) { btLog('웨이브 2 이상부터 종료 가능!'); return }
      endBattle(true);
    }

    $('go-retry').addEventListener('click', function () { playBgm('daily'); initSelect(); showScr('select') });
    $('go-title').addEventListener('click', function () { stopAllBgm(); playBgm('daily'); initSelect(); showScr('select') });
    $('bt-retreat').addEventListener('click', function () {
      if (BT.acting) return;
      gamePaused = true; $('pause-overlay').classList.add('on');
      $('pause-retreat').style.display = 'block';
    });

    // ── 초기화 ──
    (function () {
      var row = $('t-rangers');
      ['red', 'black', 'blue', 'yellow', 'pink'].forEach(function (t) { row.appendChild(mkR(t, 0.5)) });
      // 최고 기록 표시
      var best = localStorage.getItem('mr_best_wave');
      if (best) $('t-best').textContent = '최고 기록: 웨이브 ' + best;
      showScr('title');
    })();
