import { getBoard, playCard, getMyCards } from '../api.js';
export function view(params) {
  const gameId = params.get('game');
  const root = document.createElement('section');
  root.innerHTML = `<h2>Game ${gameId}</h2>
    <div id="grid" class="grid"></div>
    <h3>My Deck</h3>
    <div id="hand" class="hand"></div>
    <p id="msg"></p>`;
  const grid = root.querySelector('#grid'), hand = root.querySelector('#hand'), msg = root.querySelector('#msg');

  let selectedCard = null, cells = [];
  function renderGrid() {
    grid.innerHTML = '';
    for (const c of cells) {
      const d = document.createElement('button');
      d.className = 'cell';
      d.textContent = c.CardId ? '•' : '+';
      d.onclick = async () => {
        if (!selectedCard || c.CardId) return;
        try { await playCard(gameId, c.CellId, selectedCard.playerCardId); selectedCard = null; await load(); }
        catch (e) { msg.textContent = e.message; }
      };
      grid.appendChild(d);
    }
  }
  async function load() {
    const [board, mine] = await Promise.all([getBoard(gameId), getMyCards()]);
    cells = board; renderGrid();
    hand.innerHTML = mine.deck.map(pc =>
      `<button class="card" data-id="${pc.playerCardId}">Card ${pc.cardId}</button>`).join('');
  }
  hand.addEventListener('click', (e) => {
    const b = e.target.closest('button.card'); if (!b) return;
    hand.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));
    b.classList.add('selected');
    selectedCard = { playerCardId: b.dataset.id, label: b.textContent };
  });
  // poll
  load().catch(e=>msg.textContent=e.message);
  const t = setInterval(()=>load().catch(()=>{}), 2500);
  root.onremove = () => clearInterval(t);
  return root;
}
