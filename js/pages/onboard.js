import { createPlayer } from '../api.js';
import { RECOVERY_URL } from '../config.js';

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

    ${RECOVERY_URL ? `
      <h3>Recover by Email</h3>
      <input id="recEmail" type="email" placeholder="Email">
      <button id="recover">Send me my key</button>` : ''}

    <p id="msg" style="color:#b00"></p>`;

  const msg = root.querySelector('#msg');

  root.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData(e.target);
      const name = form.get('name');
      const email = form.get('email');
      const r = await createPlayer(name, email); // {id,name,key,...}
      localStorage.setItem('playerKey', r.key);
      localStorage.setItem('playerId', r.id);
      localStorage.setItem('playerName', r.name || name);
      localStorage.setItem('playerEmail', email);

      // Optionally register email→key with your recovery service
      if (RECOVERY_URL) {
        fetch(`${RECOVERY_URL}/register`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ email, key: r.key, name: r.name || name })
        }).catch(()=>{});
      }

      location.hash = '#cards';
    } catch (err) { msg.textContent = err.message; }
  };

  root.querySelector('#save').onclick = () => {
    const k = root.querySelector('#k').value.trim();
    if (!k) return;
    localStorage.setItem('playerKey', k);
    location.hash = '#cards';
  };

  const recoverBtn = root.querySelector('#recover');
  if (recoverBtn) {
    recoverBtn.onclick = async () => {
      const email = root.querySelector('#recEmail').value.trim();
      if (!email) return;
      try {
        const res = await fetch(`${RECOVERY_URL}/recover?email=${encodeURIComponent(email)}`);
        const { key } = await res.json();
        if (!key) throw new Error('No key found for that email.');
        localStorage.setItem('playerKey', key);
        localStorage.setItem('playerEmail', email);
        location.hash = '#cards';
      } catch (e) { msg.textContent = e.message; }
    };
  }

  return root;
}