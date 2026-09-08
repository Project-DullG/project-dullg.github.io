(() => {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector('.header');
  const stages = ['지목 결과', '조사 결과', '후일담', '사건의 전말'];
  const readingTools = document.createElement('nav');
  readingTools.className = 'reading-tools';
  readingTools.setAttribute('aria-label', '페이지 메뉴');
  readingTools.innerHTML = filename === 'index.html'
    ? '<span>미식의 대가</span>'
    : '<a href="index.html"><i data-lucide="arrow-left" aria-hidden="true"></i>엔딩 목록</a>';
  document.body.prepend(readingTools);
  document.querySelector('.ending-index-back')?.remove();

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

  const isTruthPage = filename === 'story.html';
  document.body.classList.add(isTruthPage ? 'truth-flow-page' : 'gourmet-flow-page');

  if (isTruthPage) {
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
  const controls = document.createElement('nav');
  controls.className = 'story-pager-controls';
  controls.setAttribute('aria-label', '엔딩 장면 이동');
  controls.innerHTML = `
    <button type="button" class="story-page-btn story-page-prev" aria-label="이전 장면" title="이전 장면">
      <i data-lucide="arrow-left" aria-hidden="true"></i><span>이전 장면</span>
    </button>
    <button type="button" class="story-page-btn story-page-next" aria-label="다음 장면" title="다음 장면">
      <span>다음 장면</span><i data-lucide="arrow-right" aria-hidden="true"></i>
    </button>
  `;
  pager.insertAdjacentElement('afterend', controls);

  const previousButton = controls.querySelector('.story-page-prev');
  const nextButton = controls.querySelector('.story-page-next');
  function pageFromHash() {
    const match = window.location.hash.match(/^#scene-(\d+)$/);
    const index = match ? Number(match[1]) - 1 : 0;
    return index >= 0 && index < pages.length ? index : 0;
  }
  let currentPage = pageFromHash();
  function pageLabel(page, index) {
    if (page.querySelector('.epilogue-monologue') || /독백/.test(page.querySelector('h2')?.textContent || '')) return '애쉬의 독백';
    return stages[stageForPage(page, index) - 1];
  }

  pages.forEach((page, index) => {
    page.classList.add('story-page');
    page.dataset.storyIndex = String(index);
  });

  function stageForPage(page, index) {
    if (filename === 'story.html') return 4;
    if (page.classList.contains('gourmet-epilogue')) return 3;
    const kicker = page.querySelector('.script-kicker')?.textContent.trim() || '';
    if (/후일담|에필로그/i.test(kicker)) return 3;
    if (/조사 결과|수사 결과|심층 조사|왕실의 조치|후속 조사|사건 직후/i.test(kicker)) return 2;
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
    if (currentPage > 0) {
      const label = pageLabel(pages[currentPage - 1], currentPage - 1);
      previousButton.querySelector('span').textContent = label;
      previousButton.setAttribute('aria-label', `${label} 다시 읽기`);
      previousButton.title = `${label} 다시 읽기`;
    }
    if (!isFinalPage) {
      const label = pageLabel(pages[currentPage + 1], currentPage + 1);
      nextButton.querySelector('span').textContent = label;
      nextButton.setAttribute('aria-label', `${label} 읽기`);
      nextButton.title = `${label} 읽기`;
    }
    afterStory.forEach((element) => {
      element.hidden = currentPage !== pages.length - 1;
    });
    controls.classList.toggle('is-final', isFinalPage);
    if (move) {
      const top = pager.getBoundingClientRect().top + window.scrollY - 18;
      window.scrollTo({ top: Math.max(0, top - readingTools.offsetHeight), behavior: 'instant' });
      pages[currentPage].focus({ preventScroll: true });
    }
  }

  previousButton.addEventListener('click', () => {
    if (currentPage === 0) return;
    currentPage -= 1;
    history.pushState(null, '', `#scene-${currentPage + 1}`);
    render(true);
  });
  nextButton.addEventListener('click', () => {
    if (currentPage === pages.length - 1) return;
    currentPage += 1;
    history.pushState(null, '', `#scene-${currentPage + 1}`);
    render(true);
  });

  window.addEventListener('popstate', () => {
    currentPage = pageFromHash();
    render(true);
  });
  document.querySelectorAll('main > .nav-links a[href="story.html"]').forEach(link => link.remove());
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  render();
  pager.classList.add('is-paged');
  requestAnimationFrame(() => {
    if (currentPage > 0) render(true);
    else window.scrollTo({ top: 0, behavior: 'instant' });
  });
  loadIcons();
})();
