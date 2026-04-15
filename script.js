// =====================
//   CONFETTI GENERATOR
// =====================
const COLORS = ['#FF6B9D','#FF8E53','#FFC107','#4FC3F7','#AB47BC','#69F0AE','#FF5252'];

function spawnConfetti() {
  const container = document.getElementById('confetti');
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left             = Math.random() * 100 + '%';
    piece.style.background       = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.animationDuration = (3 + Math.random() * 5) + 's';
    piece.style.animationDelay   = (Math.random() * 5) + 's';
    piece.style.width            = (6 + Math.random() * 10) + 'px';
    piece.style.height           = (6 + Math.random() * 10) + 'px';
    piece.style.borderRadius     = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
}

// =====================
//   AUDIO
// =====================
let music;

function playSound(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.volume = 0.6;
  el.play().catch(() => {});
}

function playMusic() {
  if (!music) return;
  music.muted = false;
  music.play().catch(err => console.log('Play error:', err));
}

function pauseMusic() {
  if (music) music.pause();
}

function setVolume(val) {
  if (music) music.volume = parseFloat(val);
}

// =====================
//   TAB NAVIGATION
// =====================
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// =============================
//   EMOJI POP GAME
// =============================
const BALLOONS = ['🎭','💅','🍡','🔍','🍲','🌸','⚖️','🌈','🎨','✏️','🦄','🎀','🍰','🌺'];
const POP_FX   = ['💥','✨','🌟','💫','🎉'];

let score = 0, timer = 20, best = 0, running = false;
let gameInterval, spawnInterval;
let arena, scoreEl, timerEl, bestEl, hintEl, resultBanner, resultTitle, resultSub, startBtn;

function initRefs() {
  arena        = document.getElementById('arena');
  scoreEl      = document.getElementById('score-val');
  timerEl      = document.getElementById('timer-val');
  bestEl       = document.getElementById('best-val');
  hintEl       = document.getElementById('game-hint');
  resultBanner = document.getElementById('result-banner');
  resultTitle  = document.getElementById('result-title');
  resultSub    = document.getElementById('result-sub');
  startBtn     = document.getElementById('start-btn');
}

function startGame() {
  if (running) return;
  running = true; score = 0; timer = 20;
  scoreEl.textContent = '0';
  timerEl.textContent = '20';
  timerEl.style.color = '#FF8E53';
  arena.innerHTML = '';
  hintEl.textContent = 'Pop semua emojinya! :D';
  resultBanner.classList.remove('show');
  startBtn.disabled = true;
  spawnInterval = setInterval(spawnBalloon, 700);
  gameInterval  = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 5) timerEl.style.color = '#E53935';
    if (timer <= 0) endGame();
  }, 1000);
}

function spawnBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  b.textContent = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];
  const maxX = arena.offsetWidth - 50;
  b.style.left = (10 + Math.random() * (maxX - 10)) + 'px';
  b.style.bottom = '-60px';
  const dur = 2.5 + Math.random() * 2.5;
  b.style.animation = `floatUp ${dur}s linear forwards`;
  b.addEventListener('click', (e) => popBalloon(b, e));
  arena.appendChild(b);
  setTimeout(() => { if (b.parentNode) b.remove(); }, dur * 1000);
}

function popBalloon(balloon, event) {
  if (!running) return;
  score++;
  scoreEl.textContent = score;
  playSound('sfx-pop');
  const rect = arena.getBoundingClientRect();
  const fx = document.createElement('div');
  fx.className = 'pop-fx';
  fx.textContent = POP_FX[Math.floor(Math.random() * POP_FX.length)];
  fx.style.left = (event.clientX - rect.left - 20) + 'px';
  fx.style.top  = (event.clientY - rect.top - 20) + 'px';
  arena.appendChild(fx);
  setTimeout(() => fx.remove(), 500);
  balloon.remove();
}

function endGame() {
  running = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  arena.innerHTML = '';
  if (score > best) best = score;
  bestEl.textContent   = best;
  startBtn.disabled    = false;
  startBtn.textContent = '👾 Main Lagi!';
  playSound('sfx-win');
  let msg, sub;
  if (score >= 25)      { msg = '🏆 すごい Seira!';      sub = `${score} emoji! wahh sepuh banget ini mah! 🎊`; }
  else if (score >= 15) { msg = '🎉 Keren Bat dah!';     sub = `${score} emoji! Mantap sekali! 🙌`; }
  else if (score >= 8)  { msg = '😄 Nice!';              sub = `${score} emoji! yuk Coba lagi biar lebih banyak!`; }
  else                  { msg = '🌸 Yuk bisa yuk!';      sub = `${score} emoji. Latihan lagi ya! Hehe (￣▽￣)`; }
  resultTitle.textContent = msg;
  resultSub.textContent   = sub;
  resultBanner.classList.add('show');
  hintEl.textContent = 'Gimana? nyoba lagi gak nih? 😄';
}

// =============================
//   CATCH GAME
// =============================
const GOOD_ITEMS = ['🎂','🎁','🌸','⭐','💖','🍰','🎀','🌈','✨','🦄'];
const BAD_ITEMS  = ['💀','👹','😈','🤢','💩'];

let catchScore = 0, catchLives = 3, catchBest = 0, catchRunning = false;
let catchSpawnInterval, catchAnimFrame;
let fallingItems = [];
let basketX = 50;

function startCatchGame() {
  if (catchRunning) return;
  catchRunning = true;
  catchScore = 0; catchLives = 3;
  fallingItems = [];

  document.getElementById('catch-score').textContent = '0';
  document.getElementById('catch-lives').textContent = '❤️❤️❤️';
  document.getElementById('catch-result-banner').classList.remove('show');
  document.getElementById('catch-start-btn').disabled = true;
  document.getElementById('catch-hint').textContent = 'Tangkap yang bagus, hindari yang jelek!';

  const catchArena = document.getElementById('catch-arena');
  // Clear old items
  catchArena.querySelectorAll('.falling-item').forEach(el => el.remove());

  basketX = 50;
  updateBasket();

  // Mouse/touch control
  catchArena.onmousemove = (e) => {
    const rect = catchArena.getBoundingClientRect();
    basketX = ((e.clientX - rect.left) / rect.width) * 100;
    basketX = Math.max(5, Math.min(95, basketX));
    updateBasket();
  };
  catchArena.ontouchmove = (e) => {
    e.preventDefault();
    const rect = catchArena.getBoundingClientRect();
    basketX = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    basketX = Math.max(5, Math.min(95, basketX));
    updateBasket();
  };

  catchSpawnInterval = setInterval(spawnFallingItem, 900);
  catchAnimFrame = requestAnimationFrame(catchLoop);
}

function updateBasket() {
  const basket = document.getElementById('basket');
  if (basket) basket.style.left = basketX + '%';
}

let lastCatchTime = 0;
function catchLoop(ts) {
  if (!catchRunning) return;
  const dt = ts - lastCatchTime;
  lastCatchTime = ts;
  const catchArena = document.getElementById('catch-arena');
  const arenaH = catchArena.offsetHeight;
  const arenaW = catchArena.offsetWidth;

  fallingItems = fallingItems.filter(item => {
    if (!item.el.parentNode) return false;
    item.y += item.speed * (dt / 16);
    item.el.style.top = item.y + 'px';

    // Check catch (bottom zone)
    if (item.y >= arenaH - 90) {
      const itemXpx = (item.xPct / 100) * arenaW;
      const basketXpx = (basketX / 100) * arenaW;
      const hitRange = 55;

      if (Math.abs(itemXpx - basketXpx) < hitRange) {
        // Caught!
        if (item.good) {
          catchScore++;
          document.getElementById('catch-score').textContent = catchScore;
          playSound('sfx-catch');
          showCatchFx(catchArena, item.xPct, item.y, '✨ +1', '#69F0AE');
        } else {
          catchLives--;
          updateCatchLives();
          playSound('sfx-miss');
          showCatchFx(catchArena, item.xPct, item.y, '💔', '#FF5252');
          if (catchLives <= 0) { item.el.remove(); endCatchGame(); return false; }
        }
        item.el.remove();
        return false;
      }

      // Missed good item
      if (item.y >= arenaH - 20) {
        if (item.good) {
          catchLives--;
          updateCatchLives();
          playSound('sfx-miss');
          showCatchFx(catchArena, item.xPct, arenaH - 30, '💨', '#FF8E53');
          if (catchLives <= 0) { item.el.remove(); endCatchGame(); return false; }
        }
        item.el.remove();
        return false;
      }
    }
    return true;
  });

  if (catchRunning) catchAnimFrame = requestAnimationFrame(catchLoop);
}

function showCatchFx(arena, xPct, y, text, color) {
  const fx = document.createElement('div');
  fx.className = 'catch-miss-fx';
  fx.textContent = text;
  fx.style.left  = xPct + '%';
  fx.style.top   = y + 'px';
  fx.style.color = color;
  arena.appendChild(fx);
  setTimeout(() => fx.remove(), 800);
}

function updateCatchLives() {
  document.getElementById('catch-lives').textContent =
    '❤️'.repeat(Math.max(0, catchLives)) + '🖤'.repeat(Math.max(0, 3 - catchLives));
}

function spawnFallingItem() {
  if (!catchRunning) return;
  const catchArena = document.getElementById('catch-arena');
  const isGood = Math.random() > 0.3;
  const pool   = isGood ? GOOD_ITEMS : BAD_ITEMS;
  const emoji  = pool[Math.floor(Math.random() * pool.length)];
  const el = document.createElement('div');
  el.className = 'falling-item';
  el.textContent = emoji;
  const xPct = 5 + Math.random() * 90;
  el.style.left = xPct + '%';
  el.style.top  = '-40px';
  catchArena.appendChild(el);
  fallingItems.push({ el, xPct, y: -40, speed: 2 + Math.random() * 2.5, good: isGood });
}

function endCatchGame() {
  catchRunning = false;
  clearInterval(catchSpawnInterval);
  cancelAnimationFrame(catchAnimFrame);
  const catchArena = document.getElementById('catch-arena');
  catchArena.querySelectorAll('.falling-item').forEach(el => el.remove());
  catchArena.onmousemove = null;
  catchArena.ontouchmove = null;
  fallingItems = [];
  if (catchScore > catchBest) catchBest = catchScore;
  document.getElementById('catch-best').textContent = catchBest;
  document.getElementById('catch-start-btn').disabled = false;
  document.getElementById('catch-start-btn').textContent = '🧺 Main Lagi!';
  playSound('sfx-win');
  let msg, sub;
  if (catchScore >= 20)     { msg = '🏆 sepuh menangkap!'; sub = `${catchScore} item! Hebat heabat!`; }
  else if (catchScore >= 12){ msg = '🎉 cool af!';           sub = `${catchScore} item gotcha!`; }
  else if (catchScore >= 5) { msg = '😄 so so lah!';         sub = `${catchScore} item. Coba lagi yuk!`; }
  else                       { msg = '🌸 yuk bisa yuk!';        sub = `${catchScore} item. Latihan dulu yah!`; }
  document.getElementById('catch-result-title').textContent = msg;
  document.getElementById('catch-result-sub').textContent   = sub;
  document.getElementById('catch-result-banner').classList.add('show');
  document.getElementById('catch-hint').textContent = 'Gimana? nyoba lagi gak nih? 😄';
}

// =============================
//   MEMORY MATCH GAME
// =============================
const MEM_EMOJIS = ['🎂','🎁','🌸','⭐','💖','🦄','🎀','🌈'];
let memCards = [], memFlipped = [], memMatched = 0;
let memMoves = 0, memTimerVal = 0, memTimerInt = null;
let memRunning = false, memLock = false;

function startMemoryGame() {
  if (memRunning) return;

  const usePhotos = memPhotos.length === 8;

  memRunning = true; memFlipped = []; memMatched = 0; memMoves = 0; memTimerVal = 0;
  clearInterval(memTimerInt);

  document.getElementById('mem-pairs').textContent  = '0/8';
  document.getElementById('mem-moves').textContent  = '0';
  document.getElementById('mem-time').textContent   = '0s';
  document.getElementById('mem-result-banner').classList.remove('show');
  document.getElementById('mem-start-btn').disabled  = true;
  document.getElementById('memory-hint').textContent = 'Ingat-ingat ya posisi kartunya!';

  // Build pool: 8 pairs
  const pool = usePhotos
    ? [...memPhotos.map((src, i) => ({ type: 'photo', src, id: i })),
       ...memPhotos.map((src, i) => ({ type: 'photo', src, id: i }))]
    : [...MEM_EMOJIS, ...MEM_EMOJIS].map(e => ({ type: 'emoji', src: e, id: e }));

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  memCards = pool.map((item, idx) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.id  = item.id;
    card.dataset.idx = idx;

    if (usePhotos) {
      card.dataset.src = item.src;
      card.textContent = '?';
    } else {
      card.dataset.emoji = item.src;
      card.textContent   = '?';
    }

    card.addEventListener('click', () => flipMemCard(card, usePhotos));
    grid.appendChild(card);
    return card;
  });

  memTimerInt = setInterval(() => {
    memTimerVal++;
    document.getElementById('mem-time').textContent = memTimerVal + 's';
  }, 1000);
}

function flipMemCard(card, usePhotos) {
  if (!memRunning || memLock) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (memFlipped.length >= 2) return;

  card.classList.add('flipped');
  if (usePhotos) {
    card.innerHTML = '';
    const img = document.createElement('img');
    img.src = card.dataset.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:9px;';
    card.appendChild(img);
  } else {
    card.textContent = card.dataset.emoji;
  }
  memFlipped.push(card);

  if (memFlipped.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves;
    memLock = true;
    const [a, b] = memFlipped;
    const matchKey = usePhotos ? 'id' : 'emoji';
    if (a.dataset[matchKey] === b.dataset[matchKey]) {
      a.classList.add('matched');
      b.classList.add('matched');
      memFlipped = [];
      memMatched++;
      memLock = false;
      playSound('sfx-match');
      document.getElementById('mem-pairs').textContent = `${memMatched}/8`;
      if (memMatched === 8) endMemoryGame();
    } else {
      setTimeout(() => {
        a.classList.remove('flipped'); a.innerHTML = ''; a.textContent = '?';
        b.classList.remove('flipped'); b.innerHTML = ''; b.textContent = '?';
        a.classList.add('wrong');
        b.classList.add('wrong');
        setTimeout(() => { a.classList.remove('wrong'); b.classList.remove('wrong'); }, 300);
        memFlipped = [];
        memLock = false;
      }, 900);
    }
  }
}

function endMemoryGame() {
  memRunning = false;
  clearInterval(memTimerInt);
  document.getElementById('mem-start-btn').disabled  = false;
  document.getElementById('mem-start-btn').textContent = '🃏 Main Lagi!';
  playSound('sfx-win');
  let msg, sub;
  if (memTimerVal <= 30 && memMoves <= 12)    { msg = '🏆 iq 1000!';  sub = `${memMoves} langkah, ${memTimerVal}s! Ingatan bat nih!`; }
  else if (memTimerVal <= 60 || memMoves <= 20){ msg = '🎉 wuih keren!';         sub = `${memMoves} langkah, ${memTimerVal}s! nice one!`; }
  else                                          { msg = '😄 ok ok!';   sub = `${memMoves} langkah, ${memTimerVal}s. Coba lagi yah!`; }
  document.getElementById('mem-result-title').textContent = msg;
  document.getElementById('mem-result-sub').textContent   = sub;
  document.getElementById('mem-result-banner').classList.add('show');
  document.getElementById('memory-hint').textContent = 'Mau nyoba lagi? 😄';
}

// =============================
//   MEMORY PHOTO UPLOAD
// =============================
let memPhotos = [
  'pics/ardhito.jpg',
  'pics/randy.png',
  'pics/saras.jpg',
  'pics/yuda.jpg',
  'pics/lintang.jpg',
  'pics/nayra.jpg',
  'pics/fikri.jpg',
  'pics/sumala.jpg'
]; // array of {src, name}

function handleMemPhotoUpload(event) {
  const files = Array.from(event.target.files).slice(0, 8 - memPhotos.length);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (memPhotos.length < 8) {
        memPhotos.push(e.target.result);
        renderMemPhotoPreview();
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderMemPhotoPreview() {
  const preview = document.getElementById('mem-photo-preview');
  const status  = document.getElementById('mem-upload-status');
  preview.innerHTML = '';
  memPhotos.forEach((src, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'mem-preview-thumb';
    const img = document.createElement('img');
    img.src = src;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => { memPhotos.splice(i, 1); renderMemPhotoPreview(); };
    wrap.appendChild(img);
    wrap.appendChild(del);
    preview.appendChild(wrap);
  });
  status.textContent = memPhotos.length === 8
    ? '✅ 8 foto siap! Langsung main yuk!'
    : `${memPhotos.length}/8 foto (butuh ${8 - memPhotos.length} lagi)`;
}

function setupMemPhotoZone() {
  const zone  = document.getElementById('mem-upload-zone');
  const input = document.getElementById('mem-photo-input');
  if (!zone || !input) return;
  zone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') input.click();
  });
  zone.addEventListener('dragover',  (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.slice(0, 8 - memPhotos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => { if (memPhotos.length < 8) { memPhotos.push(ev.target.result); renderMemPhotoPreview(); } };
      reader.readAsDataURL(file);
    });
  });
}

// =====================
//   INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  spawnConfetti();
  initRefs();
  music = document.getElementById('bg-music');
  if (music) music.volume = 0.5;

  setupMemPhotoZone();

  // 🔥 INI YANG PENTING
  renderMemPhotoPreview();

  music.play().catch(() => {
    document.addEventListener('click', tryAutoPlay);
  });

  // Auto-play BGM on first interaction (browser policy workaround)
  const tryAutoPlay = () => {
    if (music && music.paused) {
      music.play().catch(() => {});
    }
    document.removeEventListener('click', tryAutoPlay);
    document.removeEventListener('touchstart', tryAutoPlay);
    document.removeEventListener('keydown', tryAutoPlay);
  };
  setupMemPhotoZone();
  music.play().catch(() => {
    // Blocked — wait for first interaction
    document.addEventListener('click', tryAutoPlay);
    document.addEventListener('touchstart', tryAutoPlay);
    document.addEventListener('keydown', tryAutoPlay);
  });
});
