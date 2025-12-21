const BGM_URL = '비밀의 장막.mp3';
const STORAGE_KEY_TIME = 'snake_carnival_bgm_time';
const STORAGE_KEY_PLAYING = 'snake_carnival_bgm_playing';

let audio = new Audio(BGM_URL);
audio.loop = true;

// Load state
const savedTime = localStorage.getItem(STORAGE_KEY_TIME);
const isPlaying = localStorage.getItem(STORAGE_KEY_PLAYING) === 'true';

if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
}

// Create UI
const bgmToggle = document.createElement('div');
bgmToggle.id = 'bgm-controller';
bgmToggle.innerHTML = `
    <button id="bgm-btn" title="BGM 켜기/끄기">
        <span id="bgm-icon">🔇</span>
    </button>
    <style>
        #bgm-controller {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
        }
        #bgm-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(20, 20, 22, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            backdrop-filter: blur(8px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        #bgm-btn:hover {
            transform: scale(1.1);
            border-color: #e63946;
            box-shadow: 0 0 15px rgba(230, 57, 70, 0.4);
        }
        /* 회전 애니메이션 제거됨 */
    </style>
`;
document.body.appendChild(bgmToggle);

const btn = document.getElementById('bgm-btn');
const icon = document.getElementById('bgm-icon');

function updateUI() {
    if (audio.paused) {
        icon.innerText = '🔇';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    } else {
        icon.innerText = '🎵';
        btn.style.borderColor = '#e63946';
    }
}

function toggleBGM() {
    if (audio.paused) {
        audio.play().then(updateUI).catch(e => console.log("Interaction required"));
        localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
    } else {
        audio.pause();
        localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
        updateUI();
    }
}

btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent global click listener from triggering
    toggleBGM();
});

// Auto-resume logic: Try playing immediately
if (isPlaying) {
    const startAudio = () => {
        audio.play().then(() => {
            updateUI();
            window.removeEventListener('click', startAudio);
            window.removeEventListener('touchstart', startAudio);
        }).catch(() => {
            // If failed, icon stays mute until interaction
            updateUI();
        });
    };

    // Try immediately
    startAudio();

    // Fallback: Start on any interaction
    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);
} else {
    updateUI();
}

// Sync time before page leave
window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
    }
});

window.addEventListener('beforeunload', () => {
    localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
});

// Sync time periodically
setInterval(() => {
    if (!audio.paused) {
        localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
    }
}, 1000);
