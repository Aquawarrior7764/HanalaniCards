export function view() {
  const root = document.createElement('section');
  const pid = localStorage.getItem('playerId') || '';
  const key = localStorage.getItem('playerKey') || '';
  root.innerHTML = `
    <h2>Settings</h2>
    <p>Player ID: <code>${pid || '(none)'}</code></p>
    <p>API Key: <input id="k" value="${key}" style="width:100%"></p>
    <button id="save">Save</button>
    <button id="logout">Log out</button>`;
  root.querySelector('#save').onclick = () => {
    localStorage.setItem('playerKey', root.querySelector('#k').value.trim());
    alert('Saved');
  };
  root.querySelector('#logout').onclick = () => { localStorage.clear(); location.hash = '#onboard'; };
  return root;
}
