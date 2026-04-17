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
//   SECRET CODE SYSTEM
// =====================
// Code: "gurita Bourbon 2023/04/29 ✨"
// Split: ["gurita", "Bourbon", "2023/04/29", "✨"]
const CODE_PARTS = ['gurita', 'Bourbon', '2023/04/29', '✨'];
let foundCodes = [false, false, false, false];
// earnedCodes tracks which codes have been *earned* via gameplay (but not yet shown)
let earnedCodes = [false, false, false, false];
// gamePlayed tracks whether each game has been finished at least once (for Secret tab unlock)
let gamePlayed = [false, false, false];
let giftPopupOpened = false;
let giftCodeClaimed = false;
let secretTabOpened = false;

// Called by games — only marks as earned, doesn't reveal yet
function earnCodeFragment(index) {
  if (earnedCodes[index]) return;
  earnedCodes[index] = true;
  // If secret tab is already open, reveal immediately
  if (secretTabOpened) {
    revealCodeFragment(index);
  }
}

// Show the Secret tab button only after all 3 games have been played at least once
function checkSecretTabVisibility() {
  const allGamesPlayed = gamePlayed[0] && gamePlayed[1] && gamePlayed[2];
  if (allGamesPlayed) {
    const secretTabBtn = document.getElementById('secret-tab-btn');
    if (secretTabBtn && secretTabBtn.style.display === 'none') {
      secretTabBtn.style.display = '';
      secretTabBtn.classList.add('secret-tab-unlock');
      setTimeout(() => secretTabBtn.classList.remove('secret-tab-unlock'), 1000);
    }
  }
}

// Actually shows the fragment in the UI
function revealCodeFragment(index) {
  if (foundCodes[index]) return;
  foundCodes[index] = true;

  const fragEl = document.getElementById(`code-frag-${index + 1}`);
  const valEl  = document.getElementById(`code-frag-${index + 1}-val`);
  const slotVal = document.getElementById(`slot-${index + 1}-val`);
  const slot   = document.getElementById(`slot-${index + 1}`);

  if (valEl)  valEl.textContent  = CODE_PARTS[index];
  if (slotVal) slotVal.textContent = CODE_PARTS[index];
  if (slot)   slot.classList.add('filled');

  if (fragEl) {
    fragEl.style.display = 'block';
    fragEl.classList.add('frag-animate');
  }

  playSound('sfx-match');
  checkAllCodesFound();
}

function revealGiftCodeFragment() {
  if (giftCodeClaimed) return;
  giftCodeClaimed = true;
  earnedCodes[3] = true;
  foundCodes[3] = true;

  const fragEl  = document.getElementById('code-frag-gift');
  const valEl   = document.getElementById('code-frag-gift-val');
  const slotVal = document.getElementById('slot-gift-val');
  const slot    = document.getElementById('slot-gift');

  if (valEl)   valEl.textContent   = CODE_PARTS[3];
  if (slotVal) slotVal.textContent = CODE_PARTS[3];
  if (slot)    slot.classList.add('filled');

  if (fragEl) {
    fragEl.style.display = 'block';
    fragEl.classList.add('frag-animate');
  }

  playSound('sfx-unlock');
  checkAllCodesFound();
}

function checkAllCodesFound() {
  if (foundCodes.every(Boolean)) {
    const secretEntry = document.getElementById('secret-entry-card');
    if (secretEntry && secretEntry.style.display !== 'none') {
      const input = document.getElementById('secret-code-input');
      if (input) input.value = CODE_PARTS.join(' ');
      setTimeout(() => {
        secretEntry.classList.add('all-found');
        secretEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }
}

// Called when Secret tab is opened — reveals all earned game codes
function onSecretTabOpen() {
  if (secretTabOpened) return;
  secretTabOpened = true;

  // Show the secret entry card
  const secretEntry = document.getElementById('secret-entry-card');
  if (secretEntry) secretEntry.style.display = 'block';

  // Reveal any game codes already earned, with a small stagger
  let delay = 200;
  for (let i = 0; i < 3; i++) {
    if (earnedCodes[i]) {
      setTimeout(() => revealCodeFragment(i), delay);
      delay += 300;
    }
  }
}

// Gift popup logic
function openGiftPopup() {
  giftPopupOpened = true;
  const overlay = document.getElementById('gift-popup-overlay');
  if (overlay) {
    overlay.classList.add('open');
    playSound('sfx-gift');
    // Animate the gift icon
    const anim = document.getElementById('gift-popup-anim');
    if (anim) {
      anim.textContent = '🎁';
      setTimeout(() => { anim.textContent = '🎊'; }, 400);
      setTimeout(() => { anim.textContent = '🎉'; }, 800);
      setTimeout(() => { anim.textContent = '🎊'; }, 1200);
    }
  }
}

function closeGiftPopup(event) {
  if (event.target === document.getElementById('gift-popup-overlay')) {
    closeGiftPopupDirect();
  }
}

function closeGiftPopupDirect() {
  const overlay = document.getElementById('gift-popup-overlay');
  if (overlay) overlay.classList.remove('open');
}

function claimGiftCode() {
  closeGiftPopupDirect();
  // Ensure secret entry card is visible
  const secretEntry = document.getElementById('secret-entry-card');
  if (secretEntry) secretEntry.style.display = 'block';
  setTimeout(() => {
    revealGiftCodeFragment();
    if (foundCodes.slice(0, 3).every(Boolean)) {
      const input = document.getElementById('secret-code-input');
      if (input && !input.value) input.value = CODE_PARTS.join(' ');
      setTimeout(() => {
        if (secretEntry) {
          secretEntry.classList.add('all-found');
          secretEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, 300);
}

function checkSecretCode() {
  const input = document.getElementById('secret-code-input');
  const errorEl = document.getElementById('secret-error');
  const fullCode = CODE_PARTS.join(' ');

  if (input.value.trim() === fullCode) {
    errorEl.style.display = 'none';
    playSound('sfx-unlock');
    setTimeout(() => { window.location.href = 'secret.html'; }, 400);
  } else {
    errorEl.style.display = 'block';
    input.classList.add('shake-input');
    setTimeout(() => input.classList.remove('shake-input'), 400);
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

  // When Secret tab is opened for the first time, reveal earned codes
  if (tabId === 'secret-gift') {
    onSecretTabOpen();
  }
}

// =============================
//   EMOJI POP GAME
// =============================
const BALLOONS = ['🃏','💅','🍡','🔍','🍲','🌸','⚖️','🌈','🎨','✏️','🦄','🔫','📖','🖥️'];
const POP_FX   = ['💥','✨','🌟','💫','🎉'];

let score = 0, timer = 20, best = 0, running = false;
let gameInterval, spawnInterval;
let arena, scoreEl, timerEl, bestEl, hintEl, resultBanner, resultTitle, resultSub, startBtn;
let code1Revealed = false;

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
    if (timer <= 5) {
      timerEl.style.color = '#E53935';
    }
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

  // Check exact final score for code fragment
  if (score === 18 && !code1Revealed) {
    code1Revealed = true;
    earnCodeFragment(0);
  }

  // Mark game as played and check if Secret tab should appear
  gamePlayed[0] = true;
  checkSecretTabVisibility();

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
const GOOD_ITEMS = ['🐙','👱🏽‍♂️','👔','🧝‍♀️','⚔️','🦋','💻','🌈','🥊','📺'];
const BAD_ITEMS  = ['💀','👹','😈','🤮','💩'];

let catchScore = 0, catchLives = 3, catchBest = 0, catchRunning = false;
let catchSpawnInterval, catchAnimFrame;
let fallingItems = [];
let basketX = 50;
let code2Revealed = false;

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
  catchArena.querySelectorAll('.falling-item').forEach(el => el.remove());

  basketX = 50;
  updateBasket();

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

    if (item.y >= arenaH - 90) {
      const itemXpx   = (item.xPct / 100) * arenaW;
      const basketXpx = (basketX / 100) * arenaW;
      const hitRange  = 55;

      if (Math.abs(itemXpx - basketXpx) < hitRange) {
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

  // Check exact final score for code fragment
  if (catchScore === 4 && !code2Revealed) {
    code2Revealed = true;
    earnCodeFragment(1);
  }

  // Mark game as played and check if Secret tab should appear
  gamePlayed[1] = true;
  checkSecretTabVisibility();

  let msg, sub;
  if (catchScore >= 20)     { msg = '🏆 sepuh menangkap!'; sub = `${catchScore} item! Hebat hebat!`; }
  else if (catchScore >= 12){ msg = '🎉 cool af!';          sub = `${catchScore} item gotcha!`; }
  else if (catchScore >= 5) { msg = '😄 so so lah!';        sub = `${catchScore} item. Coba lagi yuk!`; }
  else                       { msg = '🌸 yuk bisa yuk!';     sub = `${catchScore} item. Latihan dulu yah!`; }
  document.getElementById('catch-result-title').textContent = msg;
  document.getElementById('catch-result-sub').textContent   = sub;
  document.getElementById('catch-result-banner').classList.add('show');
  document.getElementById('catch-hint').textContent = 'Gimana? nyoba lagi gak nih? 😄';
}

// =============================
//   STAR TAP GAME
// =============================
const STAR_EMOJIS = ['⭐','🌟','💫','✨','🌠'];
const BOMB_EMOJIS = ['💣','🖤','☠️'];

let starScore = 0, starLives = 3, starBest = 0, starRunning = false;
let starSpawnInterval, starSpeedInterval;
let activeStars = [];
let starSpawnDelay = 1200;
let code3Revealed = false;

function startStarGame() {
  if (starRunning) return;
  starRunning = true;
  starScore = 0; starLives = 3; starSpawnDelay = 1200;
  activeStars = [];

  document.getElementById('star-score').textContent = '0';
  document.getElementById('star-lives').textContent = '⭐⭐⭐';
  document.getElementById('star-result-banner').classList.remove('show');
  document.getElementById('star-start-btn').disabled = true;
  document.getElementById('star-hint').textContent = 'Tap bintangnya sebelum menghilang!';

  const arena = document.getElementById('star-arena');
  arena.innerHTML = '';

  // Spawn loop (dynamic delay)
  function scheduleSpawn() {
    if (!starRunning) return;
    spawnStar();
    starSpawnTimeout = setTimeout(scheduleSpawn, starSpawnDelay);
  }
  scheduleSpawn();

  // Speed up every 5 seconds
  starSpeedInterval = setInterval(() => {
    if (!starRunning) return;
    starSpawnDelay = Math.max(400, starSpawnDelay - 100);
  }, 5000);
}

let starSpawnTimeout;

function spawnStar() {
  if (!starRunning) return;
  const arena = document.getElementById('star-arena');
  const isBomb = Math.random() < 0.2;
  const pool = isBomb ? BOMB_EMOJIS : STAR_EMOJIS;
  const emoji = pool[Math.floor(Math.random() * pool.length)];

  const el = document.createElement('div');
  el.className = 'star-item' + (isBomb ? ' star-bomb' : '');
  el.textContent = emoji;

  const maxX = arena.offsetWidth - 60;
  const maxY = arena.offsetHeight - 60;
  const x = 10 + Math.random() * Math.max(10, maxX - 10);
  const y = 10 + Math.random() * Math.max(10, maxY - 10);
  el.style.left = x + 'px';
  el.style.top  = y + 'px';

  const lifespan = Math.max(800, 2000 - (starScore * 30));
  el.style.animationDuration = lifespan + 'ms';

  el.addEventListener('click', () => tapStar(el, isBomb));
  el.addEventListener('touchstart', (e) => { e.preventDefault(); tapStar(el, isBomb); });

  arena.appendChild(el);

  // Auto-remove when time runs out
  const timeout = setTimeout(() => {
    if (el.parentNode) {
      el.remove();
      if (!isBomb && starRunning) {
        // Missed a star = lose life
        starLives--;
        updateStarLives();
        playSound('sfx-star-miss');
        showStarFx(arena, x, y, '💨', '#FF8E53');
        if (starLives <= 0) endStarGame();
      }
    }
  }, lifespan);

  el._timeout = timeout;
}

function tapStar(el, isBomb) {
  if (!starRunning || !el.parentNode) return;
  clearTimeout(el._timeout);
  el.remove();

  const arena = document.getElementById('star-arena');

  if (isBomb) {
    starLives--;
    updateStarLives();
    playSound('sfx-miss');
    showStarFx(arena, parseInt(el.style.left), parseInt(el.style.top), '💥', '#FF5252');
    if (starLives <= 0) endStarGame();
  } else {
    starScore++;
    document.getElementById('star-score').textContent = starScore;
    playSound('sfx-pop');
    showStarFx(arena, parseInt(el.style.left), parseInt(el.style.top), '✨ +1', '#FFC107');
  }
}

function showStarFx(arena, x, y, text, color) {
  const fx = document.createElement('div');
  fx.className = 'catch-miss-fx';
  fx.textContent = text;
  fx.style.left  = x + 'px';
  fx.style.top   = y + 'px';
  fx.style.color = color;
  arena.appendChild(fx);
  setTimeout(() => fx.remove(), 800);
}

function updateStarLives() {
  document.getElementById('star-lives').textContent =
    '⭐'.repeat(Math.max(0, starLives)) + '🖤'.repeat(Math.max(0, 3 - starLives));
}

function endStarGame() {
  starRunning = false;
  clearTimeout(starSpawnTimeout);
  clearInterval(starSpeedInterval);
  const arena = document.getElementById('star-arena');
  arena.querySelectorAll('.star-item').forEach(el => {
    clearTimeout(el._timeout);
    el.remove();
  });
  activeStars = [];

  if (starScore > starBest) starBest = starScore;
  document.getElementById('star-best').textContent = starBest;
  document.getElementById('star-start-btn').disabled  = false;
  document.getElementById('star-start-btn').textContent = '⭐ Main Lagi!';
  playSound('sfx-win');

  // Check exact final score for code fragment
  if (starScore === 9 && !code3Revealed) {
    code3Revealed = true;
    earnCodeFragment(2);
  }

  // Mark game as played and check if Secret tab should appear
  gamePlayed[2] = true;
  checkSecretTabVisibility();

  let msg, sub;
  if (starScore >= 20)     { msg = '🏆 Refleks dewa!';    sub = `${starScore} bintang! Kamu luar biasa! 🌟`; }
  else if (starScore >= 12){ msg = '🎉 Keren banget!';    sub = `${starScore} bintang! Jari cepet nih! ⚡`; }
  else if (starScore >= 6) { msg = '😄 Lumayan nih!';     sub = `${starScore} bintang. Coba lagi yuk!`; }
  else                      { msg = '🌸 Pemanasan dulu!'; sub = `${starScore} bintang. Gaskeun lagi! 💪`; }

  document.getElementById('star-result-title').textContent = msg;
  document.getElementById('star-result-sub').textContent   = sub;
  document.getElementById('star-result-banner').classList.add('show');
  document.getElementById('star-hint').textContent = 'Mau nyoba lagi? 😄';
}

// =============================
//   MEMORY MATCH GAME
// =============================
const MEM_EMOJIS = ['🎂','🎁','🌸','⭐','💖','🦄','🎀','🌈'];

const memState = {
  cards: [], flipped: [], matched: 0,
  moves: 0, time: 0, running: false, lock: false,
  timerInt: null
};

function memEl(id) { return document.getElementById(id); }

function startMemoryGame() {
  if (memState.running) return;

  const usePhotos = memPhotos.length === 8;
  Object.assign(memState, { flipped: [], matched: 0, moves: 0, time: 0, running: true, lock: false });
  clearInterval(memState.timerInt);

  memEl('mem-pairs').textContent  = '0/8';
  memEl('mem-moves').textContent  = '0';
  memEl('mem-time').textContent   = '0s';
  memEl('mem-result-banner').classList.remove('show');
  memEl('mem-start-btn').disabled  = true;
  memEl('memory-hint').textContent = 'Ingat-ingat ya posisi kartunya!';

  // Build shuffled pool
  let pool;
  if (usePhotos) {
    pool = memPhotos.flatMap((src, i) => [
      { type: 'photo', src, id: i },
      { type: 'photo', src, id: i }
    ]);
  } else {
    pool = [...MEM_EMOJIS, ...MEM_EMOJIS].map(e => ({ type: 'emoji', src: e, id: e }));
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Render grid
  const grid = memEl('memory-grid');
  grid.innerHTML = '';
  memState.cards = pool.map((item, idx) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.id    = item.id;
    card.dataset.idx   = idx;
    card.dataset.type  = item.type;
    card.dataset.src   = item.src;
    card.textContent   = '?';
    card.addEventListener('click', () => flipMemCard(card, usePhotos));
    grid.appendChild(card);
    return card;
  });

  // Start timer
  memState.timerInt = setInterval(() => {
    memState.time++;
    memEl('mem-time').textContent = memState.time + 's';
  }, 1000);
}

function flipMemCard(card, usePhotos) {
  const s = memState;
  if (!s.running || s.lock) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (s.flipped.length >= 2) return;

  // Flip card face-up
  card.classList.add('flipped');
  playSound('sfx-flip');

  if (usePhotos) {
    card.innerHTML = '';
    const img = document.createElement('img');
    img.src = card.dataset.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:9px;';
    card.appendChild(img);
  } else {
    card.textContent = card.dataset.src;
  }

  s.flipped.push(card);

  if (s.flipped.length < 2) return;

  // Two cards flipped — check match
  s.moves++;
  memEl('mem-moves').textContent = s.moves;
  s.lock = true;

  const [a, b] = s.flipped;
  const isMatch = a.dataset.id === b.dataset.id;

  if (isMatch) {
    a.classList.add('matched');
    b.classList.add('matched');
    s.flipped = [];
    s.matched++;
    s.lock = false;
    playSound('sfx-match');
    memEl('mem-pairs').textContent = `${s.matched}/8`;
    if (s.matched === 8) endMemoryGame();
  } else {
    // Show wrong briefly then flip back
    setTimeout(() => {
      [a, b].forEach(c => {
        c.classList.remove('flipped');
        c.innerHTML = '';
        c.textContent = '?';
        c.classList.add('wrong');
        setTimeout(() => c.classList.remove('wrong'), 300);
      });
      s.flipped = [];
      s.lock = false;
    }, 900);
  }
}

function endMemoryGame() {
  const s = memState;
  s.running = false;
  clearInterval(s.timerInt);

  memEl('mem-start-btn').disabled  = false;
  memEl('mem-start-btn').textContent = '🃏 Main Lagi!';
  playSound('sfx-win');

  let msg, sub;
  if (s.time <= 30 && s.moves <= 12)      { msg = '🏆 timdak ingatan pmo!';  sub = `${s.moves} langkah, ${s.time}s! Ingatan bat nih!`; }
  else if (s.time <= 60 || s.moves <= 20) { msg = '🎉 wuih keren!';           sub = `${s.moves} langkah, ${s.time}s! nice one!`; }
  else                                     { msg = '😄 ok ok!';                sub = `${s.moves} langkah, ${s.time}s. Coba lagi yah!`; }

  memEl('mem-result-title').textContent = msg;
  memEl('mem-result-sub').textContent   = sub;
  memEl('mem-result-banner').classList.add('show');
  memEl('memory-hint').textContent = 'Mau nyoba lagi? 😄';
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
];

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
  if (!preview) return;
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
  if (status) {
    status.textContent = memPhotos.length === 8
      ? '✅ 8 foto siap! Langsung main yuk!'
      : `${memPhotos.length}/8 foto (butuh ${8 - memPhotos.length} lagi)`;
  }
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
  renderMemPhotoPreview();

  // Secret code input — allow Enter key
  const codeInput = document.getElementById('secret-code-input');
  if (codeInput) {
    codeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkSecretCode();
    });
  }

  const tryAutoPlay = () => {
    if (music && music.paused) music.play().catch(() => {});
    document.removeEventListener('click', tryAutoPlay);
    document.removeEventListener('touchstart', tryAutoPlay);
    document.removeEventListener('keydown', tryAutoPlay);
  };

  music.play().catch(() => {
    document.addEventListener('click', tryAutoPlay);
    document.addEventListener('touchstart', tryAutoPlay);
    document.addEventListener('keydown', tryAutoPlay);
  });
});
