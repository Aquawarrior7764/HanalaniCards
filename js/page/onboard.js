import { createPlayer } from '../api.js';
export function view() {
  const root = document.createElement('section');
  const key = localStorage.getItem('playerKey');
  if (key) {
    root.innerHTML = `<p>Ready. Your key is stored. Go to <a href="#cards">Cards</a> or <a href="#play">Play</a>.</p>`;
    return root;
  }
  root.innerHTML = `
    <h2>Create Player</h2>
    <form id="f">
      <input placeholder="Name" name="name" required>
      <input placeholder="Email (for key reset)" name="email" type="email" required>
      <button>Create</button>
    </form>
    <h3>Or paste existing key</h3>
    <input id="k" placeholder="player-api-key">
    <button id="save">Save Key</button>`;
  root.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const r = await createPlayer(form.get('name'), form.get('email'));
    localStorage.setItem('playerKey', r.key);
    localStorage.setItem('playerId', r.id);
    localStorage.setItem('playerName', r.name);
    location.hash = '#cards';
  };
  root.querySelector('#save').onclick = () => {
    const k = root.querySelector('#k').value.trim();
    if (k) { localStorage.setItem('playerKey', k); location.hash = '#cards'; }
  };
  return root;
}
