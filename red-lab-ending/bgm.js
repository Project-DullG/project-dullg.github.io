const BGM_URL = './red-lab-bgm.mp3';
const STORAGE_KEY_TIME = 'red_lab_bgm_time';
const STORAGE_KEY_PLAYING = 'red_lab_bgm_playing';

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
}

restorePreviousChoiceLink();

function renderFlowProgress() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const stages = ['지목 결과', '선택', '후일담', '사건의 전말'];
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
    'future-f-hide.html': 3
  };
  const currentStage = stageByPage[filename];
  const header = document.querySelector('.header');

  document.body.classList.toggle('is-flow-page', Boolean(currentStage));

  if (!currentStage || !header) return;

  const progress = document.createElement('aside');
  progress.className = 'flow-progress';
  progress.setAttribute('aria-label', `전체 진행 ${currentStage}단계: ${stages[currentStage - 1]}`);
  progress.innerHTML = `
    <ol>
      ${stages.map((stage, index) => {
        const number = index + 1;
        const state = number < currentStage ? ' is-complete' : number === currentStage ? ' is-current' : '';
        const current = number === currentStage ? ' aria-current="step"' : '';
        return `<li class="flow-step${state}"${current}><span class="flow-step-number">${number}</span><span class="flow-step-label">${stage}</span></li>`;
      }).join('')}
    </ol>
    <p class="flow-progress-current"><span>현재 단계</span><strong>${currentStage} / ${stages.length} · ${stages[currentStage - 1]}</strong></p>
  `;
  header.insertAdjacentElement('afterend', progress);
}

renderFlowProgress();

const audio = new Audio(BGM_URL);
audio.loop = true;
audio.volume = 0.45;

const savedTime = localStorage.getItem(STORAGE_KEY_TIME);
const shouldPlay = localStorage.getItem(STORAGE_KEY_PLAYING) === 'true';

if (savedTime) {
  audio.currentTime = parseFloat(savedTime);
}

const bgmToggle = document.createElement('div');
bgmToggle.id = 'bgm-controller';
bgmToggle.innerHTML = `
  <button id="bgm-btn" type="button" aria-label="BGM 켜기">
    <span id="bgm-icon"><i data-lucide="music-2" aria-hidden="true"></i></span>
  </button>
`;
document.body.appendChild(bgmToggle);

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
  script.src = 'https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js';
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
}

function saveBGMTime() {
  localStorage.setItem(STORAGE_KEY_TIME, String(audio.currentTime));
}

function toggleBGM() {
  if (audio.paused) {
    audio.play()
      .then(() => {
        localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
        updateUI();
      })
      .catch(() => {
        localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
        updateUI();
      });
  } else {
    audio.pause();
    localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
    saveBGMTime();
    updateUI();
  }
}

btn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleBGM();
});

if (shouldPlay) {
  const startAudio = () => {
    audio.play()
      .then(() => {
        updateUI();
        window.removeEventListener('click', startAudio);
        window.removeEventListener('touchstart', startAudio);
      })
      .catch(updateUI);
  };

  startAudio();
  window.addEventListener('click', startAudio);
  window.addEventListener('touchstart', startAudio);
} else {
  updateUI();
}

loadIconLibrary();

window.addEventListener('visibilitychange', () => {
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
