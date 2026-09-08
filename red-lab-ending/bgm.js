const BGM_URL = './red-lab-bgm.mp3';
const STORAGE_KEY_TIME = 'red_lab_bgm_time';
const STORAGE_KEY_PLAYING = 'red_lab_bgm_playing';

function readPreference(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function writePreference(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}

function preserveVersionQuery() {
  const version = new URLSearchParams(window.location.search).get('v');

  if (!version) return;

  document.querySelectorAll('a[href*=".html"]').forEach((link) => {
    const rawHref = link.getAttribute('href');

    if (!rawHref || rawHref.startsWith('/') || rawHref.startsWith('http')) return;

    const url = new URL(rawHref, window.location.href);
    url.searchParams.set('v', version);
    link.setAttribute('href', `${url.pathname.split('/').pop()}${url.search}${url.hash}`);
  });
}

preserveVersionQuery();

function restorePreviousChoiceLink() {
  const params = new URLSearchParams(window.location.search);
  const previousPage = params.get('from');
  const version = params.get('v');

  if (!previousPage || !/^[a-z0-9-]+\.html$/i.test(previousPage)) return;

  document.querySelectorAll('[data-previous-choice]').forEach((link) => {
    const query = version ? `?v=${encodeURIComponent(version)}` : '';
    const decisionPages = /^(?:ending-[a-f]|future-e|future-e-stop)\.html$/i;
    const hash = decisionPages.test(previousPage) ? '#decision' : '';
    link.href = `${previousPage}${query}${hash}`;
    link.hidden = false;
  });

  const page = window.location.pathname.split('/').pop();
  const returnLinks = page === 'future-a.html'
    ? 'a[href^="future-a-stay.html"], a[href^="future-a-leave.html"]'
    : /^(future-a-stay|future-a-leave)\.html$/.test(page)
      ? 'a[href^="future-a.html"]'
      : null;
  if (returnLinks) document.querySelectorAll(returnLinks).forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set('from', previousPage);
    link.href = `${url.pathname.split('/').pop()}${url.search}${url.hash}`;
  });
}

restorePreviousChoiceLink();

function renderReaderToolbar() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const stages = ['지목 엔딩', '선택', '후일담', '사건의 전말'];
  const stageByPage = {
    'ending-a.html': 1,
    'ending-b.html': 1,
    'ending-c.html': 1,
    'ending-d.html': 1,
    'ending-e.html': 1,
    'ending-f.html': 1,
    'future-e.html': 1,
    'future-e-stop.html': 1,
    'future-a-confess.html': 2,
    'future-unresolved-confess.html': 2,
    'future-a.html': 2,
    'future-a-deny.html': 3,
    'future-a-leave.html': 3,
    'future-a-stay.html': 3,
    'future-b.html': 2,
    'future-b-stop.html': 3,
    'future-c.html': 2,
    'future-c-stop.html': 3,
    'future-d.html': 2,
    'future-d-stop.html': 3,
    'future-e-doctor-hide.html': 3,
    'future-e-outside-hide.html': 3,
    'future-f-hide.html': 3,
    'story.html': 4
  };
  const currentStage = stageByPage[filename];
  const header = document.querySelector('.header');

  document.body.classList.toggle('is-flow-page', Boolean(currentStage));

  const toolbar = document.createElement('nav');
  toolbar.className = 'reader-toolbar';
  toolbar.setAttribute('aria-label', '엔딩북 메뉴');
  toolbar.innerHTML = `
    <div class="reader-toolbar-inner">
      ${currentStage
        ? '<a class="reader-hub" href="index.html"><i data-lucide="layout-grid" aria-hidden="true"></i><span>엔딩 허브</span></a>'
        : '<span class="reader-hub reader-hub--current">엔딩북</span>'}
      <span class="reader-location">${currentStage ? stages[currentStage - 1] : '레드가 죽은 연구소'}</span>
    </div>
  `;
  document.body.prepend(toolbar);
  // The route badge identifies the ending; navigation uses the labelled hub link.
  const tag = header?.querySelector('a.tag');
  if (tag) {
    const badge = document.createElement('span');
    badge.className = tag.className;
    badge.textContent = tag.textContent;
    tag.replaceWith(badge);
  }
}

renderReaderToolbar();
preserveVersionQuery();

const audio = new Audio(BGM_URL);
audio.loop = true;
audio.volume = 0.45;
audio.preload = 'none';

const savedTime = Number(readPreference(STORAGE_KEY_TIME));
const shouldPlay = readPreference(STORAGE_KEY_PLAYING) === 'true';
let wantsAudio = shouldPlay;

if (Number.isFinite(savedTime) && savedTime > 0) {
  audio.currentTime = savedTime;
}

const bgmToggle = document.createElement('div');
bgmToggle.id = 'bgm-controller';
bgmToggle.innerHTML = `
  <button id="bgm-btn" type="button" aria-label="BGM 켜기" aria-pressed="false" title="BGM 켜기">
    <span id="bgm-icon"><i data-lucide="music-2" aria-hidden="true"></i></span>
  </button>
`;
document.querySelector('.reader-toolbar-inner').appendChild(bgmToggle);

const btn = document.getElementById('bgm-btn');
const icon = document.getElementById('bgm-icon');

function setIcon(name) {
  icon.innerHTML = `<i data-lucide="${name}" aria-hidden="true"></i>`;
  window.lucide?.createIcons();
}

function renderInterfaceIcons() {
  document.querySelectorAll('.ending-arrow, .choice-arrow').forEach((arrow) => {
    arrow.innerHTML = '<i data-lucide="chevron-right" aria-hidden="true"></i>';
  });
  window.lucide?.createIcons();
}

function loadIconLibrary() {
  if (window.lucide) {
    renderInterfaceIcons();
    updateUI();
    return;
  }

  const script = document.createElement('script');
  script.src = 'assets/lucide.min.js';
  script.addEventListener('load', () => {
    renderInterfaceIcons();
    updateUI();
  });
  document.head.appendChild(script);
}

function updateUI() {
  if (audio.paused) {
    setIcon('music-2');
    btn.setAttribute('aria-label', 'BGM 켜기');
    btn.classList.remove('is-playing');
  } else {
    setIcon('square');
    btn.setAttribute('aria-label', 'BGM 끄기');
    btn.classList.add('is-playing');
  }
  btn.setAttribute('aria-pressed', String(!audio.paused));
  btn.title = btn.getAttribute('aria-label');
}

function saveBGMTime() {
  writePreference(STORAGE_KEY_TIME, String(audio.currentTime));
}

function toggleBGM() {
  clearResumeListeners();
  wantsAudio = audio.paused;
  writePreference(STORAGE_KEY_PLAYING, String(wantsAudio));
  if (wantsAudio) {
    audio.play()
      .then(() => {
        if (!wantsAudio) audio.pause();
        updateUI();
      })
      .catch(() => {
        wantsAudio = false;
        writePreference(STORAGE_KEY_PLAYING, 'false');
        updateUI();
      });
  } else {
    audio.pause();
    saveBGMTime();
    updateUI();
  }
}

btn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleBGM();
});

function clearResumeListeners() {
  window.removeEventListener('click', resumeAudio);
  window.removeEventListener('keydown', resumeAudio);
}

function resumeAudio(event) {
  if (!wantsAudio || event?.target?.closest('#bgm-btn')) return;
  audio.play().then(() => {
    if (!wantsAudio) audio.pause();
    clearResumeListeners();
    updateUI();
  }).catch(updateUI);
}

if (shouldPlay) {
  window.addEventListener('click', resumeAudio);
  window.addEventListener('keydown', resumeAudio);
  resumeAudio();
}
audio.addEventListener('play', updateUI);
audio.addEventListener('pause', updateUI);
updateUI();
loadIconLibrary();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveBGMTime();
  }
});

window.addEventListener('beforeunload', saveBGMTime);

setInterval(() => {
  if (!audio.paused) {
    saveBGMTime();
  }
}, 1000);
