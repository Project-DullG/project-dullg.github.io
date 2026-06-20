const BGM_URL = '../ScBQTDiRurU/일상.mp3';
const STORAGE_KEY_TIME = 'red_lab_bgm_time';
const STORAGE_KEY_PLAYING = 'red_lab_bgm_playing';

const audio = new Audio(BGM_URL);
audio.loop = true;
audio.volume = 0.48;

const savedTime = localStorage.getItem(STORAGE_KEY_TIME);
const wasPlaying = localStorage.getItem(STORAGE_KEY_PLAYING) === 'true';

if (savedTime) {
  audio.currentTime = Number.parseFloat(savedTime) || 0;
}

const controller = document.createElement('div');
controller.id = 'bgm-controller';
controller.innerHTML = `
  <button id="bgm-btn" type="button" title="BGM 켜기/끄기" aria-label="BGM 켜기/끄기">
    <span id="bgm-state">BGM OFF</span>
  </button>
  <style>
    #bgm-controller {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 9999;
    }
    #bgm-btn {
      min-width: 92px;
      height: 40px;
      border-radius: 999px;
      background: rgba(16, 16, 20, .82);
      border: 1px solid rgba(255,255,255,.12);
      color: #eeeef3;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      font: 800 .72rem Pretendard, -apple-system, sans-serif;
      letter-spacing: 1px;
      backdrop-filter: blur(8px);
      transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
      box-shadow: 0 6px 18px rgba(0,0,0,.35);
    }
    #bgm-btn:hover {
      transform: translateY(-2px);
      border-color: #e53935;
      box-shadow: 0 0 18px rgba(229,57,53,.28);
    }
    #bgm-btn.is-playing {
      border-color: #e53935;
      color: #fff;
    }
    @media (max-width: 520px) {
      #bgm-controller { right: 14px; bottom: 14px; }
      #bgm-btn { min-width: 82px; height: 36px; font-size: .66rem; }
    }
  </style>
`;

document.body.appendChild(controller);

const btn = document.getElementById('bgm-btn');
const state = document.getElementById('bgm-state');

function updateUI() {
  if (audio.paused) {
    state.textContent = 'BGM OFF';
    btn.classList.remove('is-playing');
  } else {
    state.textContent = 'BGM ON';
    btn.classList.add('is-playing');
  }
}

function playAudio() {
  return audio.play()
    .then(() => {
      localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
      updateUI();
    })
    .catch(() => updateUI());
}

function toggleBGM() {
  if (audio.paused) {
    playAudio();
  } else {
    audio.pause();
    localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
    updateUI();
  }
}

btn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleBGM();
});

if (wasPlaying) {
  const startAudio = () => {
    playAudio().then(() => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    });
  };

  startAudio();
  window.addEventListener('click', startAudio);
  window.addEventListener('touchstart', startAudio);
} else {
  updateUI();
}

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
  }
});

window.addEventListener('beforeunload', () => {
  localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
});

setInterval(() => {
  if (!audio.paused) {
    localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
  }
}, 1000);
