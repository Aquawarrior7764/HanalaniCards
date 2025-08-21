export const API_BASE = 'https://app-nineturns-dev-aqd8f2dmhtg5e0hw.centralus-01.azurewebsites.net';

function key(){ return localStorage.getItem('playerKey') || ''; }
function headers(auth=false){ const h={'Content-Type':'application/json'}; if(auth) h['player-api-key']=key(); return h; }

async function parseMaybeJson(res){
  // Accept 204/empty bodies as success
  if (res.status === 204) return {};
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return {};
  try { return await res.json(); } catch { return {}; }
}
async function errorText(res){
  let t = await res.text();
  try { t = JSON.parse(t).message || t; } catch {}
  return t || `${res.status} ${res.statusText}`;
}
async function handle(res){
  if (!res.ok) throw new Error(await errorText(res));
  return parseMaybeJson(res);
}

// ---- Players ----
export async function createPlayer(name,email){
  const r = await fetch(`${API_BASE}/players/create`, {
    method:'POST', headers:headers(), body:JSON.stringify({name,email})
  });
  return handle(r); // { id, name, key, ... }
}
export async function getPlayer(playerId){
  const r = await fetch(`${API_BASE}/players/${encodeURIComponent(playerId)}`, { headers:headers(true) });
  return handle(r);
}

// ---- Cards (owned by player) ----
export async function getMyCards(){
  // Canonical route first; fallback to legacy if needed
  let r = await fetch(`${API_BASE}/cards`, { headers:headers(true) });
  if (r.status === 404) r = await fetch(`${API_BASE}/players/cards`, { headers:headers(true) });
  return handle(r); // { deck:[{Id,Name,n,e,s,w,...}], pool:[...] }
}

// Helpers to detect if the move actually applied (handles funky backend statuses)
const idOf = (pc)=> pc?.Id ?? pc?.PlayerCardId ?? pc?.playerCardId ?? pc?.id ?? null;
async function movedToDeck(id){
  const data = await getMyCards();
  return (data.deck || []).some(pc => String(idOf(pc)) === String(id));
}
async function movedToPool(id){
  const data = await getMyCards();
  return (data.pool || []).some(pc => String(idOf(pc)) === String(id));
}
async function move(path){ return handle(await fetch(`${API_BASE}${path}`, { method:'PATCH', headers:headers(true) })); }

export async function moveToDeck(playerCardId){
  const id = String(playerCardId || '').trim();
  if (!id) throw new Error('Card id missing.');
  const res = await fetch(`${API_BASE}/cards/move/${encodeURIComponent(id)}/to/deck`, { method:'PATCH', headers:headers(true) });
  if (res.ok) return parseMaybeJson(res);
  if (res.status === 404) { // server might return 404 even if it applied
    // tiny delay then verify
    await new Promise(r=>setTimeout(r,200));
    if (await movedToDeck(id)) return {};
  }
  throw new Error(await errorText(res));
}

export async function moveToPool(playerCardId){
  const id = String(playerCardId || '').trim();
  if (!id) throw new Error('Card id missing.');
  const res = await fetch(`${API_BASE}/cards/move/${encodeURIComponent(id)}/to/pool`, { method:'PATCH', headers:headers(true) });
  if (res.ok) return parseMaybeJson(res);
  if (res.status === 404) {
    await new Promise(r=>setTimeout(r,200));
    if (await movedToPool(id)) return {};
  }
  throw new Error(await errorText(res));
}

// ---- Games ----
export async function createGame(){ return handle(await fetch(`${API_BASE}/games/create`,{method:'POST',headers:headers(true)})); }
export async function findOpenGames(){ return handle(await fetch(`${API_BASE}/games/find`,{headers:headers(true)})); }
export async function joinGame(gameId){ return handle(await fetch(`${API_BASE}/games/join/${encodeURIComponent(gameId)}`,{headers:headers(true)})); }
export async function getGame(gameId){ return handle(await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}`,{headers:headers(true)})); }
export async function getBoard(gameId){ return handle(await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}/board`,{headers:headers(true)})); }
export async function playCard(gameId, cellId, playerCardId){
  const r = await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}/board`, {
    method:'PATCH', headers:headers(true), body:JSON.stringify({ cell:String(cellId), card:String(playerCardId) })
  });
  return handle(r);
}