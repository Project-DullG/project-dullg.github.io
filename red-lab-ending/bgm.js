const BGM_URL = './red-lab-bgm.mp3';
const STORAGE_KEY_TIME = 'red_lab_bgm_time';
const STORAGE_KEY_PLAYING = 'red_lab_bgm_playing';

function preserveVersionQuery() {
  const version = new URLSearchParams(window.location.search).get('v');

  if (!version) return;

  document.querySelectorAll('a[href$=".html"], a[href*=".html?"]').forEach((link) => {
    const rawHref = link.getAttribute('href');

    if (!rawHref || rawHref.startsWith('/') || rawHref.startsWith('http')) return;

    const url = new URL(rawHref, window.location.href);
    url.searchParams.set('v', version);
    link.setAttribute('href', `${url.pathname.split('/').pop()}${url.search}${url.hash}`);
  });
}

preserveVersionQuery();

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
    <span id="bgm-icon">♪</span>
  </button>
`;
document.body.appendChild(bgmToggle);

const btn = document.getElementById('bgm-btn');
const icon = document.getElementById('bgm-icon');

function updateUI() {
  if (audio.paused) {
    icon.innerText = '♪';
    btn.setAttribute('aria-label', 'BGM 켜기');
    btn.classList.remove('is-playing');
  } else {
    icon.innerText = '■';
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
