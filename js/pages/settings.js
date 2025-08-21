import { getPlayer } from '../api.js';

export function view() {
  const root = document.createElement('section');
  const pid = localStorage.getItem('playerId') || '';
  const key = localStorage.getItem('playerKey') || '';
  const email = localStorage.getItem('playerEmail') || '';

  root.innerHTML = `
    <h2>Settings</h2>
    <p><b>Name:</b> <span id="nm">(loading…)</span></p>
    <p><b>Email (local only):</b> ${email || '(unknown)'}</p>
    <p><b>Player ID:</b> <code>${pid || '(none)'}</code></p>
    <p><b>API Key:</b> <input id="k" value="${key}" style="width:100%"></p>
    <button id="save">Save</button>
    <button id="logout">Log out</button>
    <p id="msg"></p>`;

  const nm = root.querySelector('#nm');
  if (pid && key) {
    getPlayer(pid).then(p => {
      localStorage.setItem('playerName', p.name || '');
      nm.textContent = p.name || '(unknown)';
    }).catch(()=> { nm.textContent = localStorage.getItem('playerName') || '(unknown)'; });
  } else {
    nm.textContent = localStorage.getItem('playerName') || '(unknown)';
  }

  root.querySelector('#save').onclick = () => {
    localStorage.setItem('playerKey', root.querySelector('#k').value.trim());
    alert('Saved');
  };
  root.querySelector('#logout').onclick = () => { localStorage.clear(); location.hash = '#onboard'; };
  return root;
}