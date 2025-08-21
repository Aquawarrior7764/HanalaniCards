import { createGame, findOpenGames, joinGame } from '../api.js';

export function view() {
  const root = document.createElement('section');
  root.innerHTML = `
    <h2>Play</h2>
    <button id="create">Create Game</button>
    <div id="created"></div>
    <h3>Join by Code</h3>
    <input id="code" placeholder="GAME_ID">
    <button id="join">Join</button>
    <h3>Open Games</h3>
    <div id="list"></div>
    <p id="msg"></p>`;
  const msg = root.querySelector('#msg');

  root.querySelector('#create').onclick = async () => {
    try {
      const g = await createGame();      // -> { id }
      const div = root.querySelector('#created');
      div.innerHTML = `Game created: <b>${g.id}</b> <button id="goto">Open Board</button>`;
      div.querySelector('#goto').onclick = () => location.hash = `#board?game=${g.id}`;
    } catch (e) { msg.textContent = e.message; }
  };

  root.querySelector('#join').onclick = async () => {
    const id = root.querySelector('#code').value.trim();
    if (!id) return;
    try { await joinGame(id); location.hash = `#board?game=${id}`; }
    catch (e) { msg.textContent = e.message; }
  };

  (async () => {
    try {
      const games = await findOpenGames();
      root.querySelector('#list').innerHTML = games.map(g =>
        `<div>${g.id} | turn: ${g.CurrentTurn || '-'} | <button data-id="${g.id}">Join</button></div>`).join('');
    } catch {}
  })();

  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]'); if (!btn) return;
    try { await joinGame(btn.dataset.id); location.hash = `#board?game=${btn.dataset.id}`; }
    catch (e2) { msg.textContent = e2.message; }
  });
  return root;
}