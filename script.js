// =====================
//   CONFETTI GENERATOR
// =====================
const COLORS = ['#FF6B9D', '#FF8E53', '#FFC107', '#4FC3F7', '#AB47BC', '#69F0AE', '#FF5252'];

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
//   GAME STATE
// =====================
const BALLOONS = ['🎭', '💅', '🍡', '🔍', '🍲', '🔫', '⚖️', '🌸', '🌈', '🎨', '✏️'];
const POP_FX   = ['💥', '✨', '🌟', '💫', '🎉'];

let score    = 0;
let timer    = 20;
let best     = 0;
let running  = false;
let gameInterval  = null;
let spawnInterval = null;

// DOM refs (set after DOMContentLoaded)
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

// =====================
//   GAME FUNCTIONS
// =====================
function startGame() {
  if (running) return;
  running = true;
  score   = 0;
  timer   = 20;

  scoreEl.textContent  = '0';
  timerEl.textContent  = '20';
  timerEl.style.color  = '#FF8E53';
  arena.innerHTML      = '';
  hintEl.textContent   = 'Pop semua emojinya! :D';

  resultBanner.classList.remove('show');
  startBtn.disabled    = true;

  spawnInterval = setInterval(spawnBalloon, 700);

  gameInterval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 5) timerEl.style.color = '#E53935';
    if (timer <= 0) endGame();
  }, 1000);
}

function spawnBalloon() {
  const b   = document.createElement('div');
  b.className = 'balloon';
  b.textContent = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];

  const maxX = arena.offsetWidth - 50;
  b.style.left = (10 + Math.random() * (maxX - 10)) + 'px';
  b.style.bottom = '-60px';

  const dur = 2.5 + Math.random() * 2.5;
  b.style.animation = `floatUp ${dur}s linear forwards`;

  b.addEventListener('click', (e) => popBalloon(b, e));
  arena.appendChild(b);

  // Auto-remove when it floats out
  setTimeout(() => { if (b.parentNode) b.remove(); }, dur * 1000);
}

function popBalloon(balloon, event) {
  if (!running) return;

  score++;
  scoreEl.textContent = score;

  // Pop effect
  const rect = arena.getBoundingClientRect();
  const fx   = document.createElement('div');
  fx.className   = 'pop-fx';
  fx.textContent = POP_FX[Math.floor(Math.random() * POP_FX.length)];
  fx.style.left  = (event.clientX - rect.left - 20) + 'px';
  fx.style.top   = (event.clientY - rect.top  - 20) + 'px';
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

  let msg, sub;
  if (score >= 25)      { msg = '🏆 すごい Seira!'; sub = `${score} emoji! wahh sepuh banget ini mah! 🎊`; }
  else if (score >= 15) { msg = '🎉 Keren Bat dah!';      sub = `${score} emoji! Mantap sekali! 🙌`; }
  else if (score >= 8)  { msg = '😄 Nice!';             sub = `${score} emoji! yuk Coba lagi biar lebih banyak!`; }
  else                  { msg = '🌸 Yuk bisa yuk!';      sub = `${score} emoji. Latihan lagi ya! Hehe (￣▽￣)`; }

  resultTitle.textContent = msg;
  resultSub.textContent   = sub;
  resultBanner.classList.add('show');
  hintEl.textContent = 'Gimana? nyoba lagi gak nih? 😄';
}

// =====================
//   INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  spawnConfetti();
  initRefs();
});
