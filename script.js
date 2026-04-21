/* ============================================================
   BIRTHDAY SURPRISE — SCRIPT.JS
   Passcode: 1234 (change to your date!)
   ============================================================ */

'use strict';

/* ── Config ───────────────────────────────────────────────── */
const PASSCODE        = '2204'; // Change this!
const HEART_INTERVAL  = 1800;   // ms between floating hearts
const PARTICLE_COUNT  = 55;

/* ── State ────────────────────────────────────────────────── */
let typedCode     = '';
let giftsOpened   = 0;
let musicOn       = false;
let audioCtx      = null;
let musicSource   = null;
let musicNodes    = [];

/* ── Wait for DOM ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  startFloatingHearts();
  runLoadingScreen();
  bindKeypad();
  initAudio();
});

/* ── Loading Screen ───────────────────────────────────────── */
function runLoadingScreen() {
  setTimeout(() => {
    fadeOut('loading-screen');
    setTimeout(() => {
      showScreen('page-passcode');
    }, 600);
  }, 3000);
}

/* ── Screen Navigation ────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'exit');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
}

function fadeOut(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('exit');
}

function goTo(pageId) {
  playClick();
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.add('exit');
    setTimeout(() => {
      current.classList.remove('active', 'exit');
      showScreen(pageId);
      onPageEnter(pageId);
    }, 400);
  } else {
    showScreen(pageId);
    onPageEnter(pageId);
  }
}

function onPageEnter(pageId) {
  if (pageId === 'page-final') {
    launchConfetti();
    launchFinalHearts();
    tryStartMusic();
  }
  if (pageId === 'page-letter') {
    // reset letter state
    document.getElementById('envelope').classList.remove('opened');
    document.getElementById('letter-content').classList.add('hidden');
    document.getElementById('envelope-container').style.display = 'flex';
  }
  if (pageId === 'page-cake') {
    resetCake();
  }
}

/* ── Passcode Keypad ──────────────────────────────────────── */
function bindKeypad() {
  document.querySelectorAll('.key').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      if (val === 'clear') {
        clearCode();
      } else if (val === 'enter') {
        checkCode();
      } else {
        addDigit(val);
      }
    });
  });
}

function addDigit(d) {
  if (typedCode.length >= 4) return;
  playKey();
  typedCode += d;
  updateDots();
  if (typedCode.length === 4) {
    setTimeout(checkCode, 300);
  }
}

function clearCode() {
  typedCode = '';
  updateDots();
  hideError();
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < typedCode.length);
    dot.classList.remove('error-shake');
  });
}

function checkCode() {
  if (typedCode === PASSCODE) {
    playSuccess();
    document.querySelectorAll('.dot').forEach(d => {
      d.style.background = '#6fcf97';
      d.style.boxShadow  = '0 0 12px #6fcf97';
      d.style.border     = '2px solid #6fcf97';
    });
    setTimeout(() => goTo('page-intro'), 600);
  } else {
    playError();
    document.querySelectorAll('.dot').forEach(d => d.classList.add('error-shake'));
    showError();
    setTimeout(() => {
      typedCode = '';
      updateDots();
    }, 1000);
  }
}

function showError() {
  const el = document.getElementById('passcode-error');
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.4s ease';
}

function hideError() {
  document.getElementById('passcode-error').classList.add('hidden');
}

/* ── Gift Opening ─────────────────────────────────────────── */
function openGift(n) {
  const box = document.getElementById('gift' + n);
  if (box.classList.contains('opened')) return;

  playPop();
  box.classList.add('opened');

  const reveal = box.querySelector('.gift-reveal');
  reveal.classList.remove('hidden');

  giftsOpened++;
  if (giftsOpened === 3) {
    const nextBtn = document.getElementById('gifts-next-btn');
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
    nextBtn.style.transition = 'opacity 0.5s ease';
    playSparkle();
  }
}

/* ── Cake ──────────────────────────────────────────────────── */
function blowCandles() {
  playBlow();
  const candles = document.querySelectorAll('.candle');
  candles.forEach((c, i) => {
    setTimeout(() => {
      c.classList.add('blown');
      playTiny();
    }, i * 200);
  });

  setTimeout(() => {
    document.getElementById('blow-btn').classList.add('hidden');
    document.getElementById('wish-msg').classList.remove('hidden');
    playSparkle();
    setTimeout(() => {
      document.getElementById('cake-next-btn').classList.remove('hidden');
    }, 1000);
  }, 1400);
}

function resetCake() {
  document.querySelectorAll('.candle').forEach(c => c.classList.remove('blown'));
  document.getElementById('blow-btn').classList.remove('hidden');
  document.getElementById('wish-msg').classList.add('hidden');
  document.getElementById('cake-next-btn').classList.add('hidden');
}

/* ── Envelope ─────────────────────────────────────────────── */
function openEnvelope() {
  const env = document.getElementById('envelope');
  if (env.classList.contains('opened')) return;

  playClick();
  env.classList.add('opened');

  setTimeout(() => {
    document.getElementById('envelope-container').style.display = 'none';
    const letter = document.getElementById('letter-content');
    letter.classList.remove('hidden');
  }, 700);
}

/* ── Confetti ─────────────────────────────────────────────── */
function launchConfetti() {
  const container = document.getElementById('confetti-burst');
  container.innerHTML = '';
  const colors = ['#c3aef0','#f4a7c3','#8ec8f5','#f9d56e','#fff'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.setProperty('--dx', (Math.random() * 400 - 200) + 'px');
    el.style.setProperty('--dy', (Math.random() * 300 + 50) + 'px');
    el.style.background   = colors[Math.floor(Math.random() * colors.length)];
    el.style.left         = '50%';
    el.style.top          = '30%';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.width        = Math.random() * 8 + 5 + 'px';
    el.style.height       = Math.random() * 8 + 5 + 'px';
    el.style.animationDelay    = Math.random() * 0.4 + 's';
    el.style.animationDuration = Math.random() * 1.5 + 2 + 's';
    container.appendChild(el);
  }
}

function launchFinalHearts() {
  const container = document.getElementById('final-hearts');
  const hearts = ['💙','💜','🤍','💗','✨'];
  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.fontSize  = Math.random() * 1.5 + 1.2 + 'rem';
    el.style.margin    = '0 0.3rem';
    el.style.display   = 'inline-block';
    el.style.animation = `heartBeat ${0.8 + Math.random()*0.6}s ease-in-out infinite`;
    el.style.animationDelay = Math.random() * 0.8 + 's';
    container.appendChild(el);
  }
}

/* ── Restart ──────────────────────────────────────────────── */
function restartSurprise() {
  giftsOpened = 0;
  typedCode   = '';
  updateDots();
  // reset gifts
  [1,2,3].forEach(n => {
    const box = document.getElementById('gift' + n);
    box.classList.remove('opened');
    box.querySelector('.gift-reveal').classList.add('hidden');
  });
  const nextBtn = document.getElementById('gifts-next-btn');
  nextBtn.style.opacity = '0';
  nextBtn.style.pointerEvents = 'none';

  goTo('page-passcode');
}

/* ── Floating Hearts ──────────────────────────────────────── */
function startFloatingHearts() {
  const emojis = ['💙','💜','🤍','💗','✨','⭐'];
  setInterval(() => {
    const el = document.createElement('div');
    el.className   = 'floating-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left  = Math.random() * 100 + 'vw';
    el.style.fontSize = Math.random() * 1.2 + 0.8 + 'rem';
    const dur = Math.random() * 6 + 8;
    el.style.animationDuration = dur + 's';
    el.style.opacity = Math.random() * 0.4 + 0.2;
    document.getElementById('hearts-container').appendChild(el);
    setTimeout(() => el.remove(), dur * 1000);
  }, HEART_INTERVAL);
}

/* ── Particle Canvas ──────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.size = Math.random() * 2 + 0.5;
      this.vx   = (Math.random() - 0.5) * 0.25;
      this.vy   = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.4 + 0.1;
      const hues = [260, 280, 300, 210, 200];
      this.hue  = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ── Audio / Web Audio API ────────────────────────────────── */
function initAudio() {
  // We'll create AudioContext lazily on first interaction
}

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playClick() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch(e) {}
}

function playKey() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880 + Math.random() * 200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
}

function playSuccess() {
  try {
    const ctx = getAudioCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch(e) {}
}

function playError() {
  try {
    const ctx = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

function playPop() {
  try {
    const ctx = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
}

function playSparkle() {
  try {
    const ctx = getAudioCtx();
    [1200, 1500, 1800, 2100].forEach((f, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = f;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch(e) {}
}

function playBlow() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.3;
    src.start();
  } catch(e) {}
}

function playTiny() {
  try {
    const ctx = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1600 + Math.random() * 400;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch(e) {}
}

/* ── Background Music (Web Audio generative) ─────────────── */
function tryStartMusic() {
  if (musicOn) return;
  startGenerativeMusic();
}

function startGenerativeMusic() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    musicOn = true;
    document.getElementById('music-btn').classList.remove('muted');

    // Soft ambient pad - layered sine waves
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    const reverbBuf = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = reverbBuf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/d.length, 2);
    }
    reverb.buffer = reverbBuf;
    reverb.connect(masterGain);

    // Chord: Cmaj - Fmaj - Am - G
    const chords = [
      [261.63, 329.63, 392.00],
      [349.23, 440.00, 523.25],
      [220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66]
    ];

    let chordIdx = 0;
    let activeOscs = [];

    function playChord() {
      activeOscs.forEach(o => {
        try { o.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); o.osc.stop(ctx.currentTime + 0.5); } catch(e) {}
      });
      activeOscs = [];

      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, h) => {
        const osc  = ctx.createOscillator();
        const g    = ctx.createGain();
        osc.type = h === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.connect(g);
        g.connect(reverb);
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.8);
        osc.start();
        activeOscs.push({ osc, gain: g });
      });

      // Add a soft melody note
      const melodyNotes = [523.25, 587.33, 659.25, 698.46, 783.99];
      const mel  = ctx.createOscillator();
      const melG = ctx.createGain();
      mel.type = 'sine';
      mel.frequency.value = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
      mel.connect(melG);
      melG.connect(reverb);
      melG.gain.setValueAtTime(0.001, ctx.currentTime + 0.2);
      melG.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.6);
      melG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      mel.start(ctx.currentTime + 0.2);
      mel.stop(ctx.currentTime + 2.2);
    }

    playChord();
    const interval = setInterval(() => {
      if (!musicOn) {
        clearInterval(interval);
        activeOscs.forEach(o => { try { o.osc.stop(); } catch(e) {} });
        return;
      }
      playChord();
    }, 4000);

    window._musicInterval = interval;
    window._masterGain    = masterGain;
  } catch(e) {
    console.warn('Audio init failed:', e);
  }
}

function toggleMusic() {
  if (musicOn) {
    musicOn = false;
    clearInterval(window._musicInterval);
    if (window._masterGain) {
      window._masterGain.gain.exponentialRampToValueAtTime(0.001, getAudioCtx().currentTime + 0.5);
    }
    document.getElementById('music-btn').classList.add('muted');
    document.getElementById('music-btn').textContent = '🔇';
  } else {
    document.getElementById('music-btn').textContent = '🎵';
    startGenerativeMusic();
  }
}

/* ── Easter Egg ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('easter-egg-trigger');
  const popup   = document.getElementById('easter-egg-popup');
  if (trigger && popup) {
    trigger.addEventListener('click', () => {
      popup.classList.toggle('hidden');
      playSparkle();
    });
  }
});