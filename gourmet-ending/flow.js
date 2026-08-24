(() => {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector('.header');
  const stages = ['지목 결과', '조사 결과', '후일담', '사건의 전말'];

  function loadIcons() {
    const render = () => window.lucide?.createIcons();
    if (window.lucide) {
      render();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js';
    script.addEventListener('load', render);
    document.head.appendChild(script);
  }

  function setupTruthReader() {
    const truthFlow = document.querySelector('.truth-flow');
    if (!truthFlow) return;

    const chapters = Array.from(truthFlow.querySelectorAll(':scope > .chapter[id]'));
    if (chapters.length < 2) return;

    const controls = document.createElement('nav');
    controls.className = 'truth-reader-controls';
    controls.setAttribute('aria-label', '사건의 전말 항목 이동');
    controls.innerHTML = `
      <button type="button" class="truth-reader-btn truth-reader-prev" aria-label="이전 항목" title="이전 항목">
        <i data-lucide="arrow-left" aria-hidden="true"></i>
      </button>
      <div class="truth-reader-status" aria-live="polite">
        <span class="truth-reader-track" aria-hidden="true"><span></span></span>
        <span class="truth-reader-title" data-truth-title></span>
        <span class="truth-reader-count"><strong data-truth-current>1</strong> / ${chapters.length}</span>
      </div>
      <button type="button" class="truth-reader-btn truth-reader-next" aria-label="다음 항목" title="다음 항목">
        <i data-lucide="arrow-right" aria-hidden="true"></i>
      </button>
      <a href="index.html" class="truth-reader-hub" aria-label="엔딩 목록" title="엔딩 목록">
        <i data-lucide="layout-grid" aria-hidden="true"></i>
      </a>
    `;
    document.querySelector('main')?.appendChild(controls);

    const previousButton = controls.querySelector('.truth-reader-prev');
    const nextButton = controls.querySelector('.truth-reader-next');
    const title = controls.querySelector('[data-truth-title]');
    const current = controls.querySelector('[data-truth-current]');
    const track = controls.querySelector('.truth-reader-track span');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentChapter = 0;
    let ticking = false;

    function chapterTitle(chapter) {
      return chapter.querySelector('.script-kicker')?.textContent.trim() || '';
    }

    function update() {
      const marker = window.scrollY + window.innerHeight * .3;
      currentChapter = 0;
      chapters.forEach((chapter, index) => {
        if (chapter.offsetTop <= marker) currentChapter = index;
      });

      const start = truthFlow.offsetTop;
      const total = Math.max(truthFlow.offsetHeight - window.innerHeight * .55, 1);
      const read = Math.min(Math.max((window.scrollY - start + window.innerHeight * .2) / total, 0), 1);

      title.textContent = chapterTitle(chapters[currentChapter]);
      current.textContent = String(currentChapter + 1);
      track.style.width = `${read * 100}%`;
      previousButton.disabled = currentChapter === 0;
      nextButton.disabled = currentChapter === chapters.length - 1;
      ticking = false;
    }

    function scheduleUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    function moveTo(index) {
      const chapter = chapters[index];
      if (!chapter) return;
      const offset = window.innerWidth <= 600 ? 76 : 20;
      const top = chapter.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      const url = new URL(window.location.href);
      url.hash = chapter.id;
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    previousButton.addEventListener('click', () => moveTo(currentChapter - 1));
    nextButton.addEventListener('click', () => moveTo(currentChapter + 1));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    requestAnimationFrame(update);
  }

  document.querySelectorAll('.ending-arrow').forEach((arrow) => {
    arrow.innerHTML = '<i data-lucide="chevron-right" aria-hidden="true"></i>';
  });

  if (!header || filename === 'index.html') {
    loadIcons();
    return;
  }

  const isTruthPage = filename === 'story.html';
  document.body.classList.add(isTruthPage ? 'truth-flow-page' : 'gourmet-flow-page');

  const initialStage = isTruthPage ? 4 : 1;

  const progress = document.createElement('aside');
  progress.className = 'flow-progress';
  progress.innerHTML = `
    <ol>
      ${stages.map((stage, index) => `
        <li class="flow-step" data-flow-step="${index + 1}">
          <span class="flow-step-number">${index + 1}</span>
          <span class="flow-step-label">${stage}</span>
        </li>
      `).join('')}
    </ol>
    <p class="flow-progress-current"><span>현재 단계</span><strong data-flow-current></strong></p>
  `;
  header.insertAdjacentElement('afterend', progress);

  function setStage(stage) {
    progress.querySelectorAll('[data-flow-step]').forEach((step) => {
      const number = Number(step.dataset.flowStep);
      step.classList.toggle('is-complete', number < stage);
      step.classList.toggle('is-current', number === stage);
      if (number === stage) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    progress.setAttribute('aria-label', `전체 진행 ${stage}단계: ${stages[stage - 1]}`);
    progress.querySelector('[data-flow-current]').textContent = `${stage} / ${stages.length} · ${stages[stage - 1]}`;
  }

  setStage(initialStage);

  if (isTruthPage) {
    setupTruthReader();
    loadIcons();
    return;
  }

  const pager = document.querySelector('.ending-script');
  if (!pager) {
    loadIcons();
    return;
  }

  const truthIntro = pager.querySelector(':scope > .truth-intro');
  const pages = Array.from(pager.querySelectorAll(':scope > .chapter'));
  if (truthIntro && pages[0]) pages[0].prepend(truthIntro);

  if (pages.length < 2) {
    loadIcons();
    return;
  }

  const afterStory = Array.from(document.querySelectorAll('main > .next-step-btn, main > .nav-links, main > .footer'));
  const indexBack = document.querySelector('.ending-index-back');
  const controls = document.createElement('nav');
  controls.className = 'story-pager-controls';
  controls.setAttribute('aria-label', '엔딩 장면 이동');
  controls.innerHTML = `
    <button type="button" class="story-page-btn story-page-prev" aria-label="이전 장면" title="이전 장면">
      <i data-lucide="arrow-left" aria-hidden="true"></i><span>이전 장면</span>
    </button>
    <div class="story-page-status" aria-live="polite">
      <span class="story-page-steps" aria-hidden="true">${pages.map(() => '<span class="story-page-step"></span>').join('')}</span>
      <span class="story-page-meta">
        <span class="story-page-scene" data-story-scene></span>
        <span class="story-page-count"><strong data-story-current>1</strong> / ${pages.length}</span>
      </span>
    </div>
    <button type="button" class="story-page-btn story-page-next" aria-label="다음 장면" title="다음 장면">
      <span>다음 장면</span><i data-lucide="arrow-right" aria-hidden="true"></i>
    </button>
  `;
  pager.insertAdjacentElement('afterend', controls);

  const previousButton = controls.querySelector('.story-page-prev');
  const nextButton = controls.querySelector('.story-page-next');
  const currentLabel = controls.querySelector('[data-story-current]');
  const sceneLabel = controls.querySelector('[data-story-scene]');
  const stepIndicators = Array.from(controls.querySelectorAll('.story-page-step'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentPage = 0;

  pages.forEach((page, index) => {
    page.classList.add('story-page');
    page.dataset.storyIndex = String(index);
  });

  function stageForPage(page, index) {
    if (filename === 'story.html') return 4;
    if (page.classList.contains('gourmet-epilogue')) return 3;
    const kicker = page.querySelector('.script-kicker')?.textContent.trim() || '';
    if (/후일담|에필로그/i.test(kicker)) return 3;
    if (/조사 결과|왕실의 조치|후속 조사|사건 직후/i.test(kicker)) return 2;
    if (/지목 결과/i.test(kicker)) return 1;
    if (index > 0) return 2;
    return 1;
  }

  function render(move = false) {
    const isFinalPage = currentPage === pages.length - 1;
    pages.forEach((page, index) => {
      const active = index === currentPage;
      page.hidden = !active;
      page.setAttribute('aria-hidden', String(!active));
      page.tabIndex = -1;
    });
    previousButton.disabled = currentPage === 0;
    nextButton.hidden = isFinalPage;
    currentLabel.textContent = String(currentPage + 1);
    sceneLabel.textContent = pages[currentPage].querySelector('.script-kicker')?.textContent.trim() || `장면 ${currentPage + 1}`;
    stepIndicators.forEach((step, index) => {
      step.classList.toggle('is-read', index < currentPage);
      step.classList.toggle('is-current', index === currentPage);
    });
    afterStory.forEach((element) => {
      element.hidden = currentPage !== pages.length - 1;
    });
    if (indexBack) indexBack.hidden = currentPage !== 0;
    controls.classList.toggle('is-fixed', !isFinalPage);
    document.body.classList.toggle('story-pager-fixed', !isFinalPage);
    setStage(stageForPage(pages[currentPage], currentPage));
    if (move) {
      const top = pager.getBoundingClientRect().top + window.scrollY - 18;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      pages[currentPage].focus({ preventScroll: true });
    }
  }

  previousButton.addEventListener('click', () => {
    if (currentPage === 0) return;
    currentPage -= 1;
    render(true);
  });
  nextButton.addEventListener('click', () => {
    if (currentPage === pages.length - 1) return;
    currentPage += 1;
    render(true);
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  render();
  pager.classList.add('is-paged');
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
  loadIcons();
})();
