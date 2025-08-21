import { getMyCards, moveToDeck, moveToPool } from '../api.js';

const N = (pc)=>pc?.N ?? pc?.n; const E=(pc)=>pc?.E ?? pc?.e; const S=(pc)=>pc?.S ?? pc?.s; const W=(pc)=>pc?.W ?? pc?.w;
const pcId = (pc)=> pc?.Id ?? pc?.PlayerCardId ?? pc?.playerCardId ?? pc?.id ?? null;

export function view(){
  const root = document.createElement('section');
  root.innerHTML = `<h2>My Cards</h2><div id="deck"></div><div id="pool"></div><p id="msg"></p>`;
  const msg = root.querySelector('#msg');

  const render = async ()=>{
    try{
      const data = await getMyCards();
      const deckHtml = (data.deck||[]).map(pc=>{
        const id = pcId(pc);
        return `<div class="card">
          <div><b>${pc?.Name || 'Card'}</b> — N${N(pc)} E${E(pc)} S${S(pc)} W${W(pc)}</div>
          <div style="font-size:.8em;opacity:.6">id: ${id || '(missing)'}</div>
          <button ${id?'':'disabled'} data-id="${id??''}" data-act="pool">Move to Pool</button>
        </div>`;
      }).join('') || '<p>(Deck empty)</p>';

      const poolHtml = (data.pool||[]).map(pc=>{
        const id = pcId(pc);
        return `<div class="card">
          <div><b>${pc?.Name || 'Card'}</b> — N${N(pc)} E${E(pc)} S${S(pc)} W${W(pc)}</div>
          <div style="font-size:.8em;opacity:.6">id: ${id || '(missing)'}</div>
          <button ${id?'':'disabled'} data-id="${id??''}" data-act="deck">Move to Deck</button>
        </div>`;
      }).join('') || '<p>(Pool empty)</p>';

      root.querySelector('#deck').innerHTML = `<h3>Deck (max 5)</h3>${deckHtml}`;
      root.querySelector('#pool').innerHTML = `<h3>Pool</h3>${poolHtml}`;
      msg.textContent = '';
    }catch(e){ msg.textContent = e.message; }
  };

  root.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button'); if (!btn) return;
    try{
      btn.disabled = true;
      if (btn.dataset.act==='deck') await moveToDeck(btn.dataset.id);
      else await moveToPool(btn.dataset.id);
      await render();
    }catch(e2){ msg.textContent = e2.message; btn.disabled = false; }
  });

  render();
  return root;
}