const urls = [
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/01.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/02.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/03.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/04.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/05.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/06.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/07.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/08.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/09.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/10.mp3",
  "https://ipaudio3.club/wp-content/uploads/HHD/Eye%20of%20the%20World/11.mp3",
];

const audio = document.getElementById("audioPlayer");
const trackIndicator = document.getElementById("trackIndicator");

const STORAGE_INDEX_KEY = "currentAudioIndex";
const STORAGE_TIME_KEY = "currentTime";

function saveState(index, time) {
  localStorage.setItem(STORAGE_INDEX_KEY, index);
  localStorage.setItem(STORAGE_TIME_KEY, time);
}

function loadState() {
  let index = parseInt(localStorage.getItem(STORAGE_INDEX_KEY));
  if (isNaN(index) || index < 0 || index >= urls.length) index = 0;

  let time = parseFloat(localStorage.getItem(STORAGE_TIME_KEY));
  if (isNaN(time) || time < 0) time = 0;

  return { index, time };
}

function updateTrackIndicator(index) {
  trackIndicator.textContent = `${index + 1}/${urls.length}`;
}

function loadAudio(index, time) {
  audio.src = urls[index];
  updateTrackIndicator(index);

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `Chapter ${index + 1}`,
      artist: 'Robert Jordan',
      album: 'The Eye of the World',
    });
  }

  const setTime = () => {
    audio.currentTime = time;
  };

  // If metadata is already loaded, set time immediately.
  // Otherwise, wait for the event.
  if (audio.readyState >= 1) { // HAVE_METADATA
    setTime();
  } else {
    audio.addEventListener('loadedmetadata', setTime, { once: true });
  }

  audio.play().catch(() => {}); // Autoplay might be blocked initially
}

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let state = loadState();

function loadAudioByIndex(newIndex) {
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= urls.length) newIndex = urls.length - 1;
  state.index = newIndex;
  state.time = 0;
  loadAudio(state.index, 0);
  saveState(state.index, 0);
}

prevBtn.addEventListener("click", () => {
  loadAudioByIndex(state.index - 1);
});

nextBtn.addEventListener("click", () => {
  loadAudioByIndex(state.index + 1);
});

if ('mediaSession' in navigator) {
  const skipTime = 15; // 15 seconds

  navigator.mediaSession.setActionHandler('previoustrack', () => {
    audio.currentTime = Math.max(audio.currentTime - skipTime, 0);
    saveState(state.index, audio.currentTime);
  });

  navigator.mediaSession.setActionHandler('nexttrack', () => {
    audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration || 0);
    saveState(state.index, audio.currentTime);
  });

  navigator.mediaSession.setActionHandler('seekbackward', () => {
    audio.currentTime = Math.max(audio.currentTime - skipTime, 0);
    saveState(state.index, audio.currentTime);
  });

  navigator.mediaSession.setActionHandler('seekforward', () => {
    audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration || 0);
    saveState(state.index, audio.currentTime);
  });

  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (details.fastSeek) return;
    audio.currentTime = details.seekTime;
    saveState(state.index, audio.currentTime);
  });
}

loadAudio(state.index, state.time);

let saveTimer = null;
audio.addEventListener("timeupdate", () => {
  // throttle saves to once per second
  if (!saveTimer) {
    saveTimer = setTimeout(() => {
      saveState(state.index, audio.currentTime);
      saveTimer = null;
    }, 1000);
  }
});

audio.addEventListener("seeked", () => {
  saveState(state.index, audio.currentTime);
});

audio.addEventListener("ended", () => {
  state.index++;
  if (state.index >= urls.length) {
    // reached end, stop or reset
    state.index = 0;
  }
  state.time = 0;
  loadAudio(state.index, 0);
  saveState(state.index, 0);
});

