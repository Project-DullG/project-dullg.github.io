(() => {
  const pager = document.querySelector('[data-story-pager]');

  if (!pager) return;

  const pages = Array.from(pager.querySelectorAll('[data-story-page]'));

  if (pages.length < 2) return;

  const afterStory = Array.from(document.querySelectorAll('[data-story-after]'));
  const controls = document.createElement('nav');
  controls.className = 'story-pager-controls';
  controls.setAttribute('aria-label', '이야기 장면 이동');
  controls.innerHTML = `
    <button type="button" class="story-page-btn story-page-prev" aria-label="이전 장면">
      <i data-lucide="arrow-left" aria-hidden="true"></i>
      <span>이전 장면</span>
    </button>
    <div class="story-page-status" aria-live="polite">
      <span class="story-page-steps" aria-hidden="true">
        ${pages.map(() => '<span class="story-page-step"></span>').join('')}
      </span>
      <span class="story-page-count"><span data-story-current>1</span><span aria-hidden="true"> / </span><span>${pages.length}</span></span>
    </div>
    <button type="button" class="story-page-btn story-page-next" aria-label="다음 장면">
      <span>다음 장면</span>
      <i data-lucide="arrow-right" aria-hidden="true"></i>
    </button>
    <a href="index.html" class="story-pager-hub" aria-label="엔딩 허브로 돌아가기">
      <i data-lucide="layout-grid" aria-hidden="true"></i>
      <span>엔딩 허브</span>
    </a>
  `;
  pager.appendChild(controls);

  const previousButton = controls.querySelector('.story-page-prev');
  const nextButton = controls.querySelector('.story-page-next');
  const currentLabel = controls.querySelector('[data-story-current]');
  const steps = Array.from(controls.querySelectorAll('.story-page-step'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pages.forEach((page, index) => {
    if (!page.id) page.id = `scene-${index + 1}`;
    page.setAttribute('aria-label', page.dataset.storyLabel || `${index + 1}번째 장면`);
  });

  function pageFromHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));

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
    const top = pager.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function moveToDecision() {
    const decision = document.getElementById('decision');
    if (!decision) return;
    decision.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
    nextButton.hidden = currentPage === pages.length - 1;
    controls.classList.toggle('is-final-page', currentPage === pages.length - 1);
    afterStory.forEach((element) => {
      element.hidden = currentPage !== pages.length - 1;
    });

    if (updateLocation) saveLocation();

    if (move) {
      moveViewport();
      pages[currentPage].focus({ preventScroll: true });
    }
  }

  previousButton.addEventListener('click', () => {
    if (currentPage === 0) return;
    currentPage -= 1;
    render({ move: true });
  });

  nextButton.addEventListener('click', () => {
    if (currentPage >= pages.length - 1) return;
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
  render({ updateLocation: !startsAtDecision });
  pager.classList.add('is-ready');
  if (startsAtDecision) requestAnimationFrame(moveToDecision);
})();
