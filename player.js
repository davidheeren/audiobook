document.addEventListener('DOMContentLoaded', () => {
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
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const STORAGE_INDEX_KEY = "eotw-audio-index";
  const STORAGE_TIME_KEY = "eotw-audio-time";

  let currentTrackIndex = 0;

  // --- Feature: Save and Resume Progress ---
  function saveState() {
    localStorage.setItem(STORAGE_INDEX_KEY, currentTrackIndex);
    localStorage.setItem(STORAGE_TIME_KEY, audio.currentTime);
  }

  function loadState() {
    const savedIndex = parseInt(localStorage.getItem(STORAGE_INDEX_KEY), 10);
    const savedTime = parseFloat(localStorage.getItem(STORAGE_TIME_KEY));

    currentTrackIndex = (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < urls.length) ? savedIndex : 0;
    return !isNaN(savedTime) ? savedTime : 0;
  }

  // --- Feature: Play Audio & Update Indicator ---
  function loadTrack(trackIndex, startTime = 0) {
    currentTrackIndex = trackIndex;
    audio.src = urls[currentTrackIndex];
    audio.currentTime = startTime;
    trackIndicator.textContent = `${currentTrackIndex + 1}/${urls.length}`;
    audio.play().catch(e => console.log("Playback was prevented.", e));
  }

  // --- Feature: Next/Previous Buttons ---
  prevBtn.addEventListener("click", () => {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : urls.length - 1;
    loadTrack(newIndex);
  });

  nextBtn.addEventListener("click", () => {
    const newIndex = (currentTrackIndex + 1) % urls.length;
    loadTrack(newIndex);
  });

  // --- Feature: Auto-Play Next Track ---
  audio.addEventListener("ended", () => {
    const newIndex = (currentTrackIndex + 1) % urls.length;
    loadTrack(newIndex);
  });

  // Save progress periodically
  audio.addEventListener("timeupdate", () => {
    // A simple throttle to avoid spamming localStorage
    if (audio.currentTime > 0 && Math.floor(audio.currentTime) % 5 === 0) {
        saveState();
    }
  });
  
  // Also save state when the user pauses
  audio.addEventListener("pause", saveState);

  // --- Feature: Save on Seek ---
  audio.addEventListener("seeked", saveState);

  // --- Initialization ---
  const initialTime = loadState();
  loadTrack(currentTrackIndex, initialTime);
});