(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toolbarOffset = () => (document.querySelector('.reader-toolbar')?.offsetHeight || 56) + 16;

  function scrollToElement(element, smooth = true) {
    const top = Math.max(0, element.getBoundingClientRect().top + window.scrollY - toolbarOffset());
    window.scrollTo({ top, behavior: smooth && !reduceMotion ? 'smooth' : 'instant' });
  }

  function setupTruthReader() {
    const truthFlow = document.querySelector('.truth-flow');
    if (!truthFlow) return;

    const chapters = Array.from(truthFlow.querySelectorAll('.script-block[id]'));
    if (chapters.length < 2) return;

    const controls = document.createElement('nav');
    controls.className = 'truth-reader-controls';
    controls.setAttribute('aria-label', '사건의 전말 장 이동');
    controls.innerHTML = `
      <button type="button" class="truth-reader-btn truth-reader-prev" aria-label="이전 장" title="이전 장">
        <i data-lucide="arrow-left" aria-hidden="true"></i>
      </button>
      <div class="truth-reader-status" aria-live="polite">
        <span class="truth-reader-track" aria-hidden="true"><span></span></span>
        <span class="truth-reader-title" data-truth-title></span>
        <span class="truth-reader-count"><span data-truth-current>1</span> / ${chapters.length}장</span>
      </div>
      <button type="button" class="truth-reader-btn truth-reader-next" aria-label="다음 장" title="다음 장">
        <i data-lucide="arrow-right" aria-hidden="true"></i>
      </button>
      <button type="button" class="truth-reader-toc" aria-haspopup="dialog" title="전말 목차">
        <i data-lucide="list" aria-hidden="true"></i><span>목차</span>
      </button>
    `;
    document.querySelector('main')?.appendChild(controls);
    document.body.classList.add('has-reader-controls');

    const previousButton = controls.querySelector('.truth-reader-prev');
    const nextButton = controls.querySelector('.truth-reader-next');
    const title = controls.querySelector('[data-truth-title]');
    const current = controls.querySelector('[data-truth-current]');
    const progress = controls.querySelector('.truth-reader-track span');
    let currentChapter = 0;
    let ticking = false;

    function chapterTitle(chapter, index) {
      return chapter.querySelector('.script-kicker')?.textContent?.trim() || `${index + 1}장`;
    }

    function update() {
      const marker = window.scrollY + toolbarOffset() + 32;
      currentChapter = 0;
      chapters.forEach((chapter, index) => {
        if (chapter.getBoundingClientRect().top + window.scrollY <= marker) currentChapter = index;
      });

      const bounds = truthFlow.getBoundingClientRect();
      const start = bounds.top + window.scrollY;
      const total = Math.max(bounds.height - window.innerHeight + toolbarOffset(), 1);
      const read = Math.min(Math.max((window.scrollY - start + toolbarOffset()) / total, 0), 1);

      const label = chapterTitle(chapters[currentChapter], currentChapter);
      if (title.textContent !== label) title.textContent = label;
      if (current.textContent !== String(currentChapter + 1)) current.textContent = String(currentChapter + 1);
      progress.style.width = `${read * 100}%`;
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
      scrollToElement(chapter);
      const url = new URL(window.location.href);
      url.hash = chapter.id;
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    previousButton.addEventListener('click', () => moveTo(currentChapter - 1));
    nextButton.addEventListener('click', () => moveTo(currentChapter + 1));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(truthFlow);

    const contents = document.querySelector('.truth-contents');
    const menu = document.createElement('dialog');
    menu.className = 'reader-contents-dialog';
    menu.setAttribute('aria-labelledby', 'reader-contents-title');
    menu.innerHTML = '<header><h2 id="reader-contents-title">전말 목차</h2><button type="button" aria-label="목차 닫기" title="목차 닫기"><i data-lucide="x" aria-hidden="true"></i></button></header>';
    menu.appendChild(contents.querySelector('nav').cloneNode(true));
    document.body.appendChild(menu);
    const contentsButton = controls.querySelector('.truth-reader-toc');
    const closeMenu = () => menu.close();
    contentsButton.addEventListener('click', () => {
      const activeId = chapters[currentChapter].id;
      menu.querySelectorAll('a').forEach((link) => {
        if (link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      menu.showModal();
    });
    menu.querySelector('button').addEventListener('click', closeMenu);
    menu.addEventListener('click', (event) => {
      if (event.target !== menu) return;
      const rect = menu.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
    });
    function jumpFromContents(event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (menu.open) closeMenu();
      contents.open = false;
      history.replaceState(null, '', `${location.pathname}${location.search}${link.hash}`);
      scrollToElement(target, false);
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      update();
    }
    contents.addEventListener('click', jumpFromContents);
    menu.addEventListener('click', jumpFromContents);
    document.fonts?.ready.then(scheduleUpdate);
    requestAnimationFrame(update);
  }

  setupTruthReader();

  const pager = document.querySelector('[data-story-pager]');

  if (!pager) return;

  const pages = Array.from(pager.querySelectorAll('[data-story-page]'));

  if (pages.length < 2) return;

  const afterStory = Array.from(document.querySelectorAll('[data-story-after]'));
  const decision = document.querySelector('.ending-decision[data-story-after]');
  const nextStep = document.querySelector('.next-step-btn[data-story-after]');
  document.body.classList.add('has-reader-controls');
  const controls = document.createElement('nav');
  controls.className = 'story-pager-controls';
  controls.setAttribute('aria-label', '이야기 장면 이동');
  controls.innerHTML = `
    <button type="button" class="story-page-btn story-page-prev" aria-label="이전 장면" title="이전 장면">
      <i data-lucide="arrow-left" aria-hidden="true"></i>
    </button>
    <div class="story-page-status" aria-live="polite">
      <span class="story-page-steps" aria-hidden="true">
        ${pages.map(() => '<span class="story-page-step"></span>').join('')}
      </span>
      <span class="story-page-scene" data-story-scene></span>
      <span class="story-page-count">장면 <span data-story-current>1</span><span aria-hidden="true"> / </span><span>${pages.length}</span></span>
    </div>
    <button type="button" class="story-page-btn story-page-next" aria-label="다음 장면" title="다음 장면">
      <span data-story-next-label>다음</span>
      <i data-lucide="arrow-right" aria-hidden="true"></i>
    </button>
  `;
  pager.appendChild(controls);

  const previousButton = controls.querySelector('.story-page-prev');
  const nextButton = controls.querySelector('.story-page-next');
  const nextLabel = controls.querySelector('[data-story-next-label]');
  const currentLabel = controls.querySelector('[data-story-current]');
  const sceneLabel = controls.querySelector('[data-story-scene]');
  const steps = Array.from(controls.querySelectorAll('.story-page-step'));
  const hadInitialHash = Boolean(window.location.hash);

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  pages.forEach((page, index) => {
    if (!page.id) page.id = `scene-${index + 1}`;
    page.setAttribute('aria-label', page.dataset.storyLabel || `${index + 1}번째 장면`);
  });

  function pageFromHash() {
    let hash;
    try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return null; }

    if (!hash) return null;
    if (hash === 'decision') return pages.length - 1;

    const directIndex = pages.findIndex((page) => page.id === hash);
    if (directIndex >= 0) return directIndex;

    const target = document.getElementById(hash);
    if (!target) return null;

    const page = target.closest('[data-story-page]');
    return page ? pages.indexOf(page) : null;
  }

  let currentPage = pageFromHash() ?? 0;

  function moveViewport() {
    scrollToElement(pages[currentPage], false);
  }

  function moveToDecision() {
    if (!decision) return;
    scrollToElement(decision, false);
    decision.tabIndex = -1;
    decision.focus({ preventScroll: true });
  }

  function saveLocation() {
    const url = new URL(window.location.href);
    url.hash = pages[currentPage].id;
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function render({ move = false, updateLocation = true } = {}) {
    pages.forEach((page, index) => {
      const isCurrent = index === currentPage;
      page.hidden = !isCurrent;
      page.setAttribute('aria-hidden', String(!isCurrent));
      page.tabIndex = -1;
    });

    currentLabel.textContent = String(currentPage + 1);
    sceneLabel.textContent = pages[currentPage].dataset.storyLabel || `${currentPage + 1}번째 장면`;

    const current = pages[currentPage];
    const tone = current.classList.contains('story-page--child')
      ? 'child'
      : current.classList.contains('story-page--secret')
        ? 'secret'
        : current.classList.contains('story-page--shutdown')
          ? 'shutdown'
          : current.classList.contains('story-page--return')
            ? 'return'
            : current.classList.contains('story-page--doctor')
              ? 'doctor'
              : current.classList.contains('story-page--danger')
                ? 'danger'
                : current.classList.contains('story-page--memory')
                  ? 'memory'
                  : 'default';
    document.body.dataset.storyTone = tone;
    steps.forEach((step, index) => {
      step.classList.toggle('is-current', index === currentPage);
      step.classList.toggle('is-read', index < currentPage);
      if (index === currentPage) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });
    previousButton.disabled = currentPage === 0;
    const isFinal = currentPage === pages.length - 1;
    nextButton.hidden = isFinal && !decision && !nextStep;
    nextLabel.textContent = isFinal ? (decision ? '선택지' : '끝으로') : '다음';
    nextButton.setAttribute('aria-label', isFinal ? (decision ? '선택지로 이동' : '엔딩 마무리로 이동') : '다음 장면');
    nextButton.title = nextButton.getAttribute('aria-label');
    controls.classList.toggle('is-final-page', currentPage === pages.length - 1);
    afterStory.forEach((element) => {
      element.hidden = currentPage !== pages.length - 1;
    });

    if (updateLocation) saveLocation();

    if (move) {
      moveViewport();
      pages[currentPage].focus({ preventScroll: true });
    }
    window.dispatchEvent(new Event('redlab:scenechange'));
  }

  previousButton.addEventListener('click', () => {
    if (currentPage === 0) return;
    currentPage -= 1;
    render({ move: true });
  });

  nextButton.addEventListener('click', () => {
    if (currentPage === pages.length - 1) {
      if (decision) moveToDecision();
      else if (nextStep) {
        scrollToElement(pages[currentPage].querySelector('.ending-fin') || nextStep, false);
        nextStep.focus({ preventScroll: true });
      }
      return;
    }
    currentPage += 1;
    render({ move: true });
  });

  pager.addEventListener('keydown', (event) => {
    if (event.target.closest('a, button, input, select, textarea')) return;

    if (event.key === 'ArrowLeft' && currentPage > 0) {
      currentPage -= 1;
      render({ move: true });
    }

    if (event.key === 'ArrowRight' && currentPage < pages.length - 1) {
      currentPage += 1;
      render({ move: true });
    }
  });

  window.addEventListener('hashchange', () => {
    const requestedPage = pageFromHash();
    if (requestedPage === null) return;
    const isDecision = window.location.hash === '#decision';
    if (requestedPage === currentPage) {
      if (isDecision) moveToDecision();
      return;
    }
    currentPage = requestedPage;
    render({ move: !isDecision, updateLocation: false });
    if (isDecision) moveToDecision();
  });

  const startsAtDecision = window.location.hash === '#decision';
  render({ updateLocation: hadInitialHash && !startsAtDecision });
  pager.classList.add('is-ready');
  if (hadInitialHash) requestAnimationFrame(() => {
    if (startsAtDecision) moveToDecision();
    else moveViewport();
  });
  if (!hadInitialHash) {
    const resetInitialPosition = () => window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => requestAnimationFrame(resetInitialPosition));
    window.addEventListener('pageshow', resetInitialPosition, { once: true });
  }
})();
