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

const PIECE_MAX = 540;
let targetX = 0;
let pieceX = 0;
let solved = false;
let dragging = false;
let startPointer = 0;
let startHandle = 0;
let handleMax = 0;

function newChallenge() {
  solved = false;
  const src = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  scene.style.backgroundImage = `url(${src})`;
  scene.classList.remove('solved');
  status.textContent = '';
  targetX = Math.floor(100 + Math.random() * (PIECE_MAX - 100 + 1));
  hole.style.left = targetX + 'px';
  hole.style.top = HOLE_Y + 'px';
  piece.style.backgroundImage = `url(${src})`;
  piece.style.backgroundPosition = `-${targetX}px -${HOLE_Y}px`;
  piece.style.top = HOLE_Y + 'px';
  handleMax = handle.parentElement.clientWidth - handle.offsetWidth;
  setHandle(0);
}

function setHandle(hx) {
  hx = Math.max(0, Math.min(handleMax, hx));
  handle.style.left = hx + 'px';
  pieceX = Math.round(hx * PIECE_MAX / handleMax);
  piece.style.left = pieceX + 'px';
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
handle.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;
  if (Math.abs(pieceX - targetX) <= TOLERANCE) {
    piece.style.left = targetX + 'px';
    solved = true;
    scene.classList.add('solved');
    status.textContent = 'Success!';
    setTimeout(newChallenge, 1500);
  }
});

newChallenge();
