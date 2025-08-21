import { getBoard, playCard, getMyCards, getGame } from '../api.js';

const val = (o, ks) => ks.find(k => o && o[k] != null) ? o[ks.find(k => o[k] != null)] : undefined;
const pcId = (pc) => val(pc, ['PlayerCardId','playerCardId','Id','id']);
const nameOf = (pc) => val(pc, ['Name','CardName','name']) || `Card`;
const N = (pc) => val(pc, ['N','n']); const E = (pc) => val(pc, ['E','e']);
const S = (pc) => val(pc, ['S','s']); const W = (pc) => val(pc, ['W','w']);

export function view(params) {
  const gameId = params.get('game');
  const root = document.createElement('section');
  root.innerHTML = `<h2>Game ${gameId}</h2>
    <div id="turn"></div>
    <div id="grid" class="grid"></div>
    <h3>My Deck</h3>
    <div id="hand" class="hand"></div>
    <p id="msg"></p>`;

  const grid = root.querySelector('#grid'), hand = root.querySelector('#hand'),
        msg = root.querySelector('#msg'), turn = root.querySelector('#turn');

  let selectedCard = null, cells = [];

  function renderGrid() {
    grid.innerHTML = '';
    for (const c of cells) {
      const d = document.createElement('button');
      d.className = 'cell';
      d.textContent = c.CardId ? '•' : '+';
      d.onclick = async () => {
        if (!selectedCard || c.CardId) return;
        try {
          await playCard(gameId, c.CellId, selectedCard.playerCardId);
          selectedCard = null;
          await load();
        } catch (e) { msg.textContent = e.message; }
      };
      grid.appendChild(d);
    }
  }

  async function load() {
    const [board, gameState, mine] = await Promise.all([
      getBoard(gameId), getGame(gameId), getMyCards()
    ]);
    cells = board; renderGrid();
    turn.textContent = gameState.Completed ? `Completed — Winner: ${gameState.Winner || '—'}` :
                     (gameState.CurrentTurn ? `Turn: ${gameState.CurrentTurn}` : 'Waiting...');
    hand.innerHTML = (mine.deck || []).map(pc =>
      `<button class="card" data-id="${pcId(pc)}">${nameOf(pc)} (N${N(pc)} E${E(pc)} S${S(pc)} W${W(pc)})</button>`
    ).join('') || '<p>(Deck empty)</p>';
  }

  hand.addEventListener('click', (e) => {
    const b = e.target.closest('button.card'); if (!b) return;
    hand.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));
    b.classList.add('selected');
    selectedCard = { playerCardId: b.dataset.id };
  });

  load().catch(e=>msg.textContent=e.message);
  const t = setInterval(()=>load().catch(()=>{}), 2500);
  root.onremove = () => clearInterval(t);
  return root;
}