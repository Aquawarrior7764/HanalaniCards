import { getMyCards, moveToDeck, moveToPool } from '../api.js';

// Helpers to handle unknown field casing from API
const val = (o, ks) => ks.find(k => o && o[k] != null) ? o[ks.find(k => o[k] != null)] : undefined;
const pcId = (pc) => val(pc, ['PlayerCardId','playerCardId','Id','id']);
const nameOf = (pc) => val(pc, ['Name','CardName','name']) || `Card`;
const N = (pc) => val(pc, ['N','n']); const E = (pc) => val(pc, ['E','e']);
const S = (pc) => val(pc, ['S','s']); const W = (pc) => val(pc, ['W','w']);

export function view() {
  const root = document.createElement('section');
  root.innerHTML = `<h2>My Cards</h2>
    <div id="deck"></div><div id="pool"></div><p id="msg"></p>`;
  const msg = root.querySelector('#msg');

  const render = async () => {
    try {
      const data = await getMyCards(); // { deck:[{...}], pool:[{...}] }
      const deckHtml = (data.deck || []).map(pc => `
        <div class="card">
          <div><b>${nameOf(pc)}</b> — N${N(pc)} E${E(pc)} S${S(pc)} W${W(pc)}</div>
          <button data-id="${pcId(pc)}" data-act="pool">Move to Pool</button>
        </div>`).join('') || '<p>(Deck empty)</p>';

      const poolHtml = (data.pool || []).map(pc => `
        <div class="card">
          <div><b>${nameOf(pc)}</b> — N${N(pc)} E${E(pc)} S${S(pc)} W${W(pc)}</div>
          <button data-id="${pcId(pc)}" data-act="deck">Move to Deck</button>
        </div>`).join('') || '<p>(Pool empty)</p>';

      root.querySelector('#deck').innerHTML = `<h3>Deck (max 5)</h3>${deckHtml}`;
      root.querySelector('#pool').innerHTML = `<h3>Pool</h3>${poolHtml}`;
      msg.textContent = '';
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