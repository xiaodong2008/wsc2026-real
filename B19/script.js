const HOLE_Y = 100;
const TOLERANCE = 5;
const IMAGES = [
  'assets/1.jpg',
  'assets/2.jpg',
  'assets/3.jpg',
  'assets/4.jpg',
  'assets/5.jpg',
];

const scene = document.getElementById('scene');
const hole = document.getElementById('hole');
const piece = document.getElementById('piece');
const handle = document.getElementById('handle');
const status = document.getElementById('status');

/* ===== DO NOT EDIT ABOVE THIS LINE ===== */

const SCENE_W = 600;
const SIZE = 60;
const PIECE_MAX = SCENE_W - SIZE;
let targetX = 0;
let pieceX = 0;
let solved = false;
let dragging = false;
let startPointer = 0;
let startHandle = 0;
let handleMax = 0;
let timer = null;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));


function newChallenge() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  solved = false;
  const src = IMAGES[Math.floor(Math.random() * IMAGES.length)];

  scene.style.backgroundImage = `url(${src})`;
  scene.classList.remove('solved');
  status.textContent = '';

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  console.log(getRandomArbitrary(100,PIECE_MAX))
  // targetX = getRandomArbitrary(100,PIECE_MAX) // 100 - PIECE_MAX
  targetX = Math.floor(100 + Math.random() * (PIECE_MAX - 100 + 1));

  hole.style.left = targetX + 'px';
  hole.style.top = HOLE_Y + 'px';

  piece.style.backgroundImage = `url(${src})`;
  piece.style.backgroundSize = `${SCENE_W}px 400px`;
  piece.style.backgroundPosition = `-${targetX}px -${HOLE_Y}px`;
  piece.style.top = HOLE_Y + 'px';

  handleMax = handle.parentElement.clientWidth - handle.offsetWidth;
  setHandle(0);
}

function setHandle(hx) {
  hx = clamp(hx, 0, handleMax);
  handle.style.left = hx + 'px';
  pieceX = Math.round(hx * PIECE_MAX / handleMax);
  piece.style.left = pieceX + 'px';
  return hx;
}

handle.style.touchAction = 'none';

handle.addEventListener('pointerdown', (e) => {
  if (solved) return;
  dragging = true;
  startPointer = e.clientX;
  startHandle = parseFloat(handle.style.left) || 0;
  handle.setPointerCapture(e.pointerId);
});

handle.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  setHandle(startHandle + (e.clientX - startPointer));
});

function end(e) {
  if (!dragging) return;
  dragging = false;
  try { handle.releasePointerCapture(e.pointerId); } catch {}

  if (Math.abs(pieceX - targetX) <= TOLERANCE) {
    piece.style.left = targetX + 'px';
    solved = true;
    scene.classList.add('solved');
    status.textContent = 'Success!';
    timer = setTimeout(newChallenge, 1500);
  }
}

handle.addEventListener('pointerup', end);
handle.addEventListener('pointercancel', end);

newChallenge();
