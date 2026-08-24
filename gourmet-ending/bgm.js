(() => {
  const audio = new Audio('./gourmet-bgm.mp3');
  const timeKey = 'gourmet_bgm_time';
  const playingKey = 'gourmet_bgm_playing';

  audio.loop = true;
  audio.volume = 0.4;

  const savedTime = Number.parseFloat(localStorage.getItem(timeKey) || '0');
  const shouldPlay = localStorage.getItem(playingKey) === 'true';
  if (Number.isFinite(savedTime) && savedTime > 0) audio.currentTime = savedTime;

  const controller = document.createElement('div');
  controller.id = 'bgm-controller';
  controller.innerHTML = `
    <button id="bgm-btn" type="button" aria-label="BGM 켜기" title="BGM 켜기">
      <span id="bgm-icon"><i data-lucide="music-2" aria-hidden="true"></i></span>
    </button>
  `;
  document.body.appendChild(controller);

  const button = controller.querySelector('#bgm-btn');
  const icon = controller.querySelector('#bgm-icon');

  function renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
      return;
    }

    const iconScript = document.querySelector('script[src*="lucide"]');
    if (iconScript) {
      iconScript.addEventListener('load', () => window.lucide?.createIcons(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js';
    script.addEventListener('load', () => window.lucide?.createIcons(), { once: true });
    document.head.appendChild(script);
  }

  function setIcon(name) {
    icon.innerHTML = `<i data-lucide="${name}" aria-hidden="true"></i>`;
    renderIcons();
  }

  function updateInterface() {
    const playing = !audio.paused;
    const label = playing ? 'BGM 끄기' : 'BGM 켜기';
    setIcon(playing ? 'square' : 'music-2');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.classList.toggle('is-playing', playing);
  }

  function saveTime() {
    if (Number.isFinite(audio.currentTime)) {
      localStorage.setItem(timeKey, String(audio.currentTime));
    }
  }

  function play() {
    return audio.play()
      .then(() => {
        localStorage.setItem(playingKey, 'true');
        updateInterface();
      })
      .catch(() => {
        updateInterface();
      });
  }

  function pause() {
    audio.pause();
    localStorage.setItem(playingKey, 'false');
    saveTime();
    updateInterface();
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (audio.paused) play();
    else pause();
  });

  if (shouldPlay) {
    const resume = () => {
      play().then(() => {
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      });
    };

    play();
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
  } else {
    updateInterface();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveTime();
  });
  window.addEventListener('beforeunload', saveTime);
  window.setInterval(() => {
    if (!audio.paused) saveTime();
  }, 1000);
})();
