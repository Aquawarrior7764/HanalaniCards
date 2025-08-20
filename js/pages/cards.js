import { getMyCards, moveToDeck, moveToPool } from '../api.js';
export function view() {
  const root = document.createElement('section');
  root.innerHTML = `<h2>My Cards</h2><div id="deck"></div><div id="pool"></div><p id="msg"></p>`;
  const msg = root.querySelector('#msg');
  const render = async () => {
    try {
      const data = await getMyCards(); // { deck:[{playerCardId, cardId, ...}], pool:[...] }
      root.querySelector('#deck').innerHTML = `<h3>Deck (max 5)</h3>` + data.deck.map(pc =>
        `<div class="card">
           <div>Card: ${pc.cardId}</div>
           <button data-id="${pc.playerCardId}" data-act="pool">Move to Pool</button>
         </div>`).join('');
      root.querySelector('#pool').innerHTML = `<h3>Pool</h3>` + data.pool.map(pc =>
        `<div class="card">
           <div>Card: ${pc.cardId}</div>
           <button data-id="${pc.playerCardId}" data-act="deck">Move to Deck</button>
         </div>`).join('');
    } catch (e) { msg.textContent = e.message; }
  };
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    try {
      btn.disabled = true;
      if (btn.dataset.act === 'deck') await moveToDeck(btn.dataset.id);
      else await moveToPool(btn.dataset.id);
      await render();
    } catch (e2) { msg.textContent = e2.message; btn.disabled = false; }
  });
  render();
  return root;
}
