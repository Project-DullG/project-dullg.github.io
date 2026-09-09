(() => {
  const confession = document.querySelector('.dialogue--confession');
  if (confession) confession.classList.add('dialogue--reveal');
  if (document.querySelector('.ending-fin')) document.body.classList.add('has-ending-fin');

  const figures = Array.from(document.querySelectorAll('.story-visual'));
  if (!figures.length || typeof HTMLDialogElement === 'undefined') return;

  const viewer = document.createElement('dialog');
  viewer.className = 'visual-viewer';
  viewer.setAttribute('aria-label', '삽화 확대 보기');
  viewer.innerHTML = `
    <header class="visual-viewer__toolbar">
      <span>삽화</span>
      <button type="button" data-visual-zoom aria-label="삽화 확대" title="삽화 확대" aria-pressed="false">
        <i data-lucide="zoom-in" aria-hidden="true"></i>
        <i data-lucide="zoom-out" aria-hidden="true" hidden></i>
      </button>
      <button type="button" data-visual-close aria-label="삽화 닫기" title="삽화 닫기" autofocus>
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
    </header>
    <div class="visual-viewer__stage" tabindex="0" aria-label="확대한 삽화">
      <div class="visual-viewer__frame"><img alt="" decoding="async"></div>
    </div>
  `;
  document.body.appendChild(viewer);

  const stage = viewer.querySelector('.visual-viewer__stage');
  const frame = viewer.querySelector('.visual-viewer__frame');
  const fullImage = frame.querySelector('img');
  const zoomButton = viewer.querySelector('[data-visual-zoom]');
  const closeButton = viewer.querySelector('[data-visual-close]');
  let opener;
  let sourceImage;
  let zoomed = false;
  let savedScroll = 0;
  let savedBodyTop = '';
  let resizeFrame = 0;

  function resizeImage() {
    if (!viewer.open || !sourceImage) return;
    const width = sourceImage.naturalWidth || 16;
    const height = sourceImage.naturalHeight || 9;
    const availableWidth = Math.max(1, stage.clientWidth - 32);
    const availableHeight = Math.max(1, stage.clientHeight - 32);
    const scale = Math.min(availableWidth / width, availableHeight / height) * (zoomed ? 2 : 1);
    const displayWidth = width * scale;
    const displayHeight = height * scale;
    frame.style.width = `${displayWidth}px`;
    frame.style.height = `${displayHeight}px`;
    frame.style.marginTop = `${Math.max(0, (availableHeight - displayHeight) / 2)}px`;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      stage.scrollLeft = Math.max(0, (displayWidth - availableWidth) / 2);
      stage.scrollTop = Math.max(0, (displayHeight - availableHeight) / 2);
    });
  }

  function setZoom(value) {
    zoomed = value;
    zoomButton.setAttribute('aria-pressed', String(value));
    zoomButton.setAttribute('aria-label', value ? '화면에 맞추기' : '삽화 확대');
    zoomButton.title = zoomButton.getAttribute('aria-label');
    zoomButton.querySelector('[data-lucide="zoom-in"]').toggleAttribute('hidden', value);
    zoomButton.querySelector('[data-lucide="zoom-out"]').toggleAttribute('hidden', !value);
    resizeImage();
  }

  function openImage(button, image, framed) {
    if (viewer.open || !image.complete || !image.naturalWidth) return;
    opener = button;
    sourceImage = image;
    savedScroll = window.scrollY;
    savedBodyTop = document.body.style.top;
    fullImage.src = image.currentSrc || image.src;
    fullImage.alt = image.alt;
    frame.classList.toggle('visual-viewer__frame--trimmed', framed);
    document.body.style.top = `-${savedScroll}px`;
    document.body.classList.add('has-visual-viewer');
    viewer.showModal();
    setZoom(false);
    closeButton.focus({ preventScroll: true });
  }

  figures.forEach((figure) => {
    const image = figure.querySelector('img');
    if (!image) return;
    const framed = /\/(doctor-keeps-the-truth|rangers-return)\.(jpg|png)$/.test(new URL(image.src).pathname);
    figure.classList.toggle('story-visual--trimmed', framed);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'story-visual__open';
    button.setAttribute('aria-label', `${image.alt || '삽화'} 확대 보기`);
    button.title = '삽화 확대 보기';
    button.disabled = !image.complete || !image.naturalWidth;
    image.addEventListener('load', () => { button.disabled = false; });
    image.addEventListener('error', () => { button.disabled = true; });
    button.innerHTML = '<span class="story-visual__zoom"><i data-lucide="expand" aria-hidden="true"></i></span>';
    figure.appendChild(button);
    button.addEventListener('click', () => openImage(button, image, framed));
  });

  zoomButton.addEventListener('click', () => setZoom(!zoomed));
  closeButton.addEventListener('click', () => viewer.close());
  stage.addEventListener('click', (event) => {
    if (event.target === stage) viewer.close();
  });
  viewer.addEventListener('close', () => {
    cancelAnimationFrame(resizeFrame);
    document.body.classList.remove('has-visual-viewer');
    document.body.style.top = savedBodyTop;
    window.scrollTo({ top: savedScroll, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
    fullImage.removeAttribute('src');
    sourceImage = null;
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(resizeImage).observe(stage);
  } else {
    window.addEventListener('resize', resizeImage);
  }
  if (window.lucide) window.lucide.createIcons();
})();
