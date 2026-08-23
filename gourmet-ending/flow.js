(() => {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector('.header');
  const stages = ['지목 결과', '인물의 대응', '선택의 결과', '후일담', '사건의 전말'];
  const choicePages = new Set(['ending-a.html', 'ending-b.html', 'ending-c.html', 'ending-d.html']);
  const branchResultPattern = /^ending-[a-d]-[1-3]\.html$/;

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

  document.querySelectorAll('.ending-arrow').forEach((arrow) => {
    arrow.innerHTML = '<i data-lucide="chevron-right" aria-hidden="true"></i>';
  });

  if (!header || filename === 'index.html') {
    loadIcons();
    return;
  }

  document.body.classList.add('gourmet-flow-page');

  const initialStage = filename === 'story.html'
    ? 5
    : branchResultPattern.test(filename)
      ? 3
      : 1;

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
  const controls = document.createElement('nav');
  controls.className = 'story-pager-controls';
  controls.setAttribute('aria-label', '엔딩 장면 이동');
  controls.innerHTML = `
    <button type="button" class="story-page-btn story-page-prev">
      <i data-lucide="arrow-left" aria-hidden="true"></i><span>이전 장면</span>
    </button>
    <div class="story-page-status" aria-live="polite">
      <span class="story-page-steps" aria-hidden="true">${pages.map(() => '<span class="story-page-step"></span>').join('')}</span>
      <span><strong data-story-current>1</strong> / ${pages.length}</span>
    </div>
    <button type="button" class="story-page-btn story-page-next">
      <span>다음 장면</span><i data-lucide="arrow-right" aria-hidden="true"></i>
    </button>
  `;
  pager.appendChild(controls);

  const previousButton = controls.querySelector('.story-page-prev');
  const nextButton = controls.querySelector('.story-page-next');
  const currentLabel = controls.querySelector('[data-story-current]');
  const stepIndicators = Array.from(controls.querySelectorAll('.story-page-step'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentPage = 0;

  pages.forEach((page, index) => {
    page.classList.add('story-page');
    page.dataset.storyIndex = String(index);
  });

  function stageForPage(page, index) {
    if (filename === 'story.html') return 5;
    if (page.classList.contains('gourmet-epilogue')) return 4;
    const kicker = page.querySelector('.script-kicker')?.textContent.trim() || '';
    if (/후일담/i.test(kicker)) return 4;
    if (/인물의 선택|인물의 대응/i.test(kicker)) return 2;
    if (/선택의 결과|사건 직후/i.test(kicker)) return 3;
    if (/지목 결과/i.test(kicker)) return 1;
    if (choicePages.has(filename) && index > 0) return 2;
    if (branchResultPattern.test(filename)) return 3;
    return 1;
  }

  function render(move = false) {
    pages.forEach((page, index) => {
      const active = index === currentPage;
      page.hidden = !active;
      page.setAttribute('aria-hidden', String(!active));
      page.tabIndex = -1;
    });
    previousButton.disabled = currentPage === 0;
    nextButton.hidden = currentPage === pages.length - 1;
    currentLabel.textContent = String(currentPage + 1);
    stepIndicators.forEach((step, index) => {
      step.classList.toggle('is-read', index < currentPage);
      step.classList.toggle('is-current', index === currentPage);
    });
    afterStory.forEach((element) => {
      element.hidden = currentPage !== pages.length - 1;
    });
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
