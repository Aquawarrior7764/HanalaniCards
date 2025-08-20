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
    <div id="list"></div>`;
  root.querySelector('#create').onclick = async () => {
    const g = await createGame();
    root.querySelector('#created').textContent = `Game created: ${g.id}`;
    root.querySelector('#created').onclick = () => location.hash = `#board?game=${g.id}`;
  };
  root.querySelector('#join').onclick = async () => {
    const id = root.querySelector('#code').value.trim();
    if (!id) return;
    await joinGame(id);
    location.hash = `#board?game=${id}`;
  };
  (async () => {
    const games = await findOpenGames();
    root.querySelector('#list').innerHTML = games.map(g =>
      `<div>${g.id} | turn: ${g.CurrentTurn || '-'} | <button data-id="${g.id}">Join</button></div>`).join('');
  })().catch(()=>{});
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]'); if (!btn) return;
    const id = btn.dataset.id; await joinGame(id); location.hash = `#board?game=${id}`;
  });
  return root;
}
