const playlist = document.querySelector('#playlist');
const favCount = document.querySelector('#favCount');
const STORAGE_KEY = 'wavelength-favs';

/* ===== DO NOT EDIT ABOVE THIS LINE ===== */

const tracks = () => [...playlist.querySelectorAll('.track')];
const keyOf = (li) => li.dataset.id ?? String(tracks().indexOf(li));

function render() {
  favCount.textContent = playlist.querySelectorAll('.track--fav').length;
}

function save() {
  const favs = tracks().filter((t) => t.classList.contains('track--fav')).map(keyOf);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

playlist.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;
  btn.closest('.track').classList.toggle('track--fav');
  render();
  save();
});

try {
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
  tracks().forEach((li) => {
    if (saved.includes(keyOf(li))) li.classList.add('track--fav');
  });
} catch {}

render();
