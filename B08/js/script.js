const playlist = document.querySelector('#playlist');
const favCount = document.querySelector('#favCount');
const STORAGE_KEY = 'wavelength-favs';

/* ===== DO NOT EDIT ABOVE THIS LINE ===== */

const favs = () => [...playlist.querySelectorAll('.track--fav')];

playlist.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;
  btn.closest('.track').classList.toggle('track--fav');
  const ids = favs().map((li) => li.dataset.id);
  favCount.textContent = ids.length;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
});

const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
playlist.querySelectorAll('.track').forEach((li) => {
  if (saved.includes(li.dataset.id)) li.classList.add('track--fav');
});
favCount.textContent = favs().length;
