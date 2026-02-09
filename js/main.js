// ==================== MAIN SITE FUNCTIONALITY ====================

const aboutText = document.getElementById('aboutText');
const bodyImage = document.getElementById('bodyImage');
const speechBubble = document.getElementById('speechBubble');
const videoContainer = document.getElementById('videoContainer');
const video = document.getElementById('hearingVideo');
const closeVideoBtn = document.getElementById('closeVideoBtn');
const videoTrigger = document.getElementById('videoTrigger');
const audioControls = document.getElementById('audioControls');
const prevVideoBtn = document.getElementById('prevVideoBtn');
const nextVideoBtn = document.getElementById('nextVideoBtn');
const moneyRain = document.getElementById('moneyRain');
const aboutBlock = document.getElementById('aboutBlock');

const audioFiles = [
  'audio/hearingthings01.mp3',
  'audio/hearingthings02.mp3',
  'audio/hearingthings03.mp3',
  'audio/hearingthings04.mp3',
  'audio/hearingthings05.mp3'
];

const videoFiles = [
  'vids/hearing.mp4',
  'vids/hearing1.mp4',
  'vids/hearing2.mp4',
  'vids/hearing3.mp4',
  'vids/hearing5.mp4',
  'vids/hearing6.mp4',
  'vids/hearing7.mp4',
  'vids/hearing8.mp4',
  'vids/hearing9.mp4'
];

let currentTrackIndex = 0;
let currentVideoIndex = 0;
let isPlaying = false;

const audio = new Audio();
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const audioEarTrigger = document.getElementById('audioEarTrigger');

// ==================== AUDIO PLAYER ====================

function loadTrack(index) {
  if (index < 0 || index >= audioFiles.length) return;
  currentTrackIndex = index;
  audio.src = audioFiles[index];
  audio.load();
}

function playTrack() {
  audio.play().catch(() => {});
  playPauseBtn.textContent = '||';
  isPlaying = true;
}

function pauseTrack() {
  audio.pause();
  playPauseBtn.textContent = '>';
  isPlaying = false;
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % audioFiles.length;
  loadTrack(currentTrackIndex);
  playTrack();
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + audioFiles.length) % audioFiles.length;
  loadTrack(currentTrackIndex);
  playTrack();
}

// ==================== VIDEO PLAYER ====================

function loadVideo(index) {
  if (index < 0) index = videoFiles.length - 1;
  if (index >= videoFiles.length) index = 0;
  currentVideoIndex = index;
  video.innerHTML = `<source src="${videoFiles[index]}" type="video/mp4">`;
  video.load();
  video.play().catch(() => {});
}

// ==================== EVENT LISTENERS ====================

if (audioFiles.length > 0) loadTrack(0);

if (audioEarTrigger) {
  audioEarTrigger.addEventListener('click', () => {
    if (audioControls.classList.contains('visible')) {
      audioControls.classList.remove('visible');
      pauseTrack();
    } else {
      audioControls.classList.add('visible');
      if (!isPlaying) playTrack();
    }
  });
}

const closeAudioBtn = document.getElementById('closeAudioBtn');
if (closeAudioBtn) {
  closeAudioBtn.addEventListener('click', () => {
    audioControls.classList.remove('visible');
    pauseTrack();
  });
}

if (playPauseBtn) {
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) pauseTrack();
    else playTrack();
  });
}

if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);
audio.addEventListener('ended', nextTrack);

if (videoTrigger) {
  videoTrigger.addEventListener('click', () => {
    const aboutBlock = document.getElementById('aboutBlock');
    const caContainer = document.getElementById('caContainer');
    if (aboutBlock) aboutBlock.classList.add('hidden');
    if (caContainer) caContainer.classList.add('hidden');
    videoContainer.classList.add('active');
    const randomIndex = Math.floor(Math.random() * videoFiles.length);
    loadVideo(randomIndex);
  });
}

if (prevVideoBtn) {
  prevVideoBtn.addEventListener('click', () => loadVideo(currentVideoIndex - 1));
}

if (nextVideoBtn) {
  nextVideoBtn.addEventListener('click', () => loadVideo(currentVideoIndex + 1));
}

if (video) {
  video.addEventListener('ended', () => {
    loadVideo(currentVideoIndex + 1);
  });
}

if (closeVideoBtn) {
  closeVideoBtn.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    videoContainer.classList.remove('active');
    const aboutBlock = document.getElementById('aboutBlock');
    const caContainer = document.getElementById('caContainer');
    if (aboutBlock) aboutBlock.classList.remove('hidden');
    if (caContainer) caContainer.classList.remove('hidden');
  });
}
// ==================== TYPING EFFECT ====================

if (aboutText) {
  const fullText = aboutText.textContent.trim();
  aboutText.textContent = '';
  aboutText.classList.add('visible');
  let i = 0;
  const speed = 35;

  function typeWriter() {
    if (i < fullText.length) {
      aboutText.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    } else {
      document.querySelector('.about-cursor')?.remove();
      if (window.innerWidth > 1100 && bodyImage) {
        bodyImage.classList.add('visible');
      }
    }
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (aboutBlock) aboutBlock.classList.add('expanded');
      typeWriter();
    }, 800);
  });
}

// ==================== SPEECH BUBBLE ====================

const phrases = [
  "just heard a rumor",
  "they're toast",
  "i don't want to name names",
  "i've been hearing things",
  "big if true",
  "saw it on biz",
  "there's rumor",
  "ngmi fr fr",
  "wagmi tho"
];

let intervalId = null;

function setBubblePosition() {
  if (!bodyImage || !speechBubble) return;
  const rect = bodyImage.getBoundingClientRect();
  const bubbleWidth = speechBubble.offsetWidth || 280;
  const leftPos = rect.left + (rect.width / 2) - (bubbleWidth / 2) - 10;
  const topPos = rect.top - speechBubble.offsetHeight - 10;
  speechBubble.style.left = `${leftPos}px`;
  speechBubble.style.top = `${topPos}px`;
}

function showRandomPhrase() {
  if (!speechBubble) return;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  speechBubble.textContent = randomPhrase;
  speechBubble.style.display = 'block';
  setBubblePosition();
}

if (bodyImage) {
  bodyImage.addEventListener('click', () => {
    if (intervalId) clearInterval(intervalId);
    showRandomPhrase();
    intervalId = setInterval(showRandomPhrase, 10000);
  });
}

document.addEventListener('click', (e) => {
  if (bodyImage && speechBubble &&
      !bodyImage.contains(e.target) && !speechBubble.contains(e.target)) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      speechBubble.style.display = 'none';
    }
  }
});

window.addEventListener('resize', debounce(setBubblePosition, 100));
window.addEventListener('scroll', debounce(setBubblePosition, 100));

// ==================== CONTRACT ADDRESS COPY ====================

function copyCA() {
  const ca = '97sraAGszzEFY6AW8iuWfTceBQWa1RzuFRXryJqSbonk';
  
  copyToClipboard(ca, "Yeah, It's time to buy some $hearing !").then(success => {
    if (success) {
      rainMoney();
    }
  });
}

function rainMoney() {
  if (!moneyRain) return;
  
  moneyRain.innerHTML = '';
  const count = 80;
  
  for (let i = 0; i < count; i++) {
    const dollar = document.createElement('div');
    dollar.className = 'dollar';
    dollar.textContent = ['💲', '💰', '🤑', '💵'][Math.floor(Math.random() * 4)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const duration = 2 + Math.random() * 2;
    
    dollar.style.left = left + 'vw';
    dollar.style.animationDelay = delay + 's';
    dollar.style.animationDuration = duration + 's';
    
    moneyRain.appendChild(dollar);
  }
  
  setTimeout(() => { 
    moneyRain.innerHTML = ''; 
  }, 3500);
}

window.copyCA = copyCA;

// ==================== SOUND FX TOGGLE ====================
const soundFxBtn = document.getElementById('soundFxBtn');
if (soundFxBtn) {
  soundFxBtn.addEventListener('click', () => {
    if (typeof SoundSystem !== 'undefined') {
      const enabled = SoundSystem.toggle();
      soundFxBtn.classList.toggle('muted', !enabled);
      soundFxBtn.textContent = enabled ? '🔔' : '🔕';
    }
  });
}
