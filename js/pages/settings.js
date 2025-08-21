import { getPlayer } from '../api.js';
import { APP_VERSION } from '../config.js';

export function view() {
  const root = document.createElement('section');
  const pid   = localStorage.getItem('playerId')    || '';
  const key   = localStorage.getItem('playerKey')   || '';
  const email = localStorage.getItem('playerEmail') || '';
  const name0 = localStorage.getItem('playerName')  || '';

  root.innerHTML = `
    <h2>Settings</h2>
    <p><b>Name:</b> <span id="nm">${name0 || '(unknown)'}</span></p>
    <p><b>Email (local only):</b> <span id="em">${email || '(unknown)'}</span></p>
    <p><b>API Key:</b> <input id="k" value="${key}" style="width:100%"></p>
    <div style="display:flex; gap:.5rem; margin:.3rem 0 1rem 0">
      <button id="copy">Copy Key to Clipboard</button>
      <button id="save">Save Key to Device</button>
      <button id="logout">Log out</button>
    </div>
    <h3>Account link (use to log in on another device)</h3>
    <input id="link" style="width:100%" readonly
      value="${location.origin + location.pathname}#onboard?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name0)}">
    <button id="copylink">Copy Link</button>
    <p style="opacity:.7;margin-top:1rem">Version: <code id="ver">${APP_VERSION}</code></p>
    <p id="msg" style="color:#b00"></p>`;

  // Refresh name from server if possible (email is never returned by API)
  if (pid && key) {
    getPlayer(pid).then(p => {
      if (p?.name) {
        localStorage.setItem('playerName', p.name);
        const nm = root.querySelector('#nm');
        if (nm) nm.textContent = p.name;
        const link = root.querySelector('#link');
        if (link) link.value = `${location.origin + location.pathname}#onboard?key=${encodeURIComponent(key)}&name=${encodeURIComponent(p.name)}`;
      }
    }).catch(()=>{});
  }

  root.querySelector('#copy').onclick = async () => {
    try { await navigator.clipboard.writeText(root.querySelector('#k').value); alert('Key copied'); } catch {}
  };
  root.querySelector('#copylink').onclick = async () => {
    try { await navigator.clipboard.writeText(root.querySelector('#link').value); alert('Link copied'); } catch {}
  };
  root.querySelector('#save').onclick = () => {
    localStorage.setItem('playerKey', root.querySelector('#k').value.trim());
    alert('Saved to this device');
  };
  root.querySelector('#logout').onclick = () => { localStorage.clear(); location.hash = '#onboard'; };
  return root;
}