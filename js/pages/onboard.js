import { createPlayer } from '../api.js';

export function view(params = new URLSearchParams()) {
  const root = document.createElement('section');

  // Deep-link auto login: #onboard?key=...&name=...
  const linkKey = params.get('key');
  const linkName = params.get('name');
  const storedKey = localStorage.getItem('playerKey');

  if (linkKey && !storedKey) {
    localStorage.setItem('playerKey', linkKey);
    if (linkName) localStorage.setItem('playerName', linkName);
    location.hash = '#cards';
    return root;
  }

  if (storedKey) {
    const name = localStorage.getItem('playerName') || 'Player';
    root.innerHTML = `<p>Signed in as <b>${name}</b>. Go to <a href="#cards">Cards</a> or <a href="#play">Play</a>.</p>`;
    return root;
  }

  root.innerHTML = `
    <h2>Create Player</h2>
    <p style="font-size:0.95em;opacity:.8">
      This creates your account and stores your key on this device. You can copy your key or a reusable login link in Settings later.
    </p>
    <form id="f">
      <input placeholder="Name" name="name" required>
      <input placeholder="Email (for key reset)" name="email" type="email" required>
      <button>Create</button>
    </form>
    <h3>Or paste existing key</h3>
    <input id="k" placeholder="player-api-key">
    <button id="save">Save Key</button>
    <p id="msg" style="color:#b00"></p>`;

  const msg = root.querySelector('#msg');

  root.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData(e.target);
      const name = form.get('name');
      const email = form.get('email');
      const r = await createPlayer(name, email); // { id, name, key, ... }
      // Persist so user stays logged in
      localStorage.setItem('playerKey', r.key);
      localStorage.setItem('playerId', r.id);
      localStorage.setItem('playerName', r.name || name);
      localStorage.setItem('playerEmail', email);
      location.hash = '#cards';
    } catch (err) { msg.textContent = err.message; }
  };

  root.querySelector('#save').onclick = () => {
    const k = root.querySelector('#k').value.trim();
    if (!k) return;
    localStorage.setItem('playerKey', k);
    location.hash = '#cards';
  };

  return root;
}