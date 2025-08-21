export const API_BASE = 'https://app-nineturns-dev-aqd8f2dmhtg5e0hw.centralus-01.azurewebsites.net';

function key() { return localStorage.getItem('playerKey') || ''; }
function headers(auth=false) {
  const h = {'Content-Type':'application/json'};
  if (auth) h['player-api-key'] = key();
  return h;
}
async function handle(res) {
  if (!res.ok) {
    let t = await res.text(); try { const j = JSON.parse(t); t = j.message || t; } catch {}
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Players
export async function createPlayer(name, email) {
  const res = await fetch(`${API_BASE}/players/create`, {
    method:'POST', headers: headers(), body: JSON.stringify({name, email})
  });
  return handle(res); // { id, name, key, ... }
}
export async function getPlayer(playerId) {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(playerId)}`, { headers: headers(true) });
  return handle(res);
}

// Cards (owned by player)
export async function getMyCards() {
  const res = await fetch(`${API_BASE}/players/cards`, { headers: headers(true) });
  return handle(res); // { deck:[{Id,Name,n,e,s,w,Path,...}], pool:[...] }
}

// Some docs show /players/cards/move, others /cards/move.
// Try the /players/... route first; if it complains about pattern/404, try /cards/...
async function move(path) {
  const res = await fetch(`${API_BASE}${path}`, { method:'PATCH', headers: headers(true) });
  return handle(res);
}
export async function moveToDeck(playerCardId) {
  const id = String(playerCardId || '').trim();
  if (!id) throw new Error('This card has no valid id to move.');
  try {
    return await move(`/players/cards/move/${encodeURIComponent(id)}/to/deck`);
  } catch (e) {
    if (/pattern|not found|404/i.test(String(e.message))) {
      return await move(`/cards/move/${encodeURIComponent(id)}/to/deck`);
    }
    throw e;
  }
}
export async function moveToPool(playerCardId) {
  const id = String(playerCardId || '').trim();
  if (!id) throw new Error('This card has no valid id to move.');
  try {
    return await move(`/players/cards/move/${encodeURIComponent(id)}/to/pool`);
  } catch (e) {
    if (/pattern|not found|404/i.test(String(e.message))) {
      return await move(`/cards/move/${encodeURIComponent(id)}/to/pool`);
    }
    throw e;
  }
}

// Games
export async function createGame() {
  const res = await fetch(`${API_BASE}/games/create`, { method:'POST', headers: headers(true) });
  return handle(res); // { id }
}
export async function findOpenGames() {
  const res = await fetch(`${API_BASE}/games/find`, { headers: headers(true) });
  return handle(res);
}
export async function joinGame(gameId) {
  const res = await fetch(`${API_BASE}/games/join/${encodeURIComponent(gameId)}`, { headers: headers(true) });
  return handle(res);
}
export async function getGame(gameId) {
  const res = await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}`, { headers: headers(true) });
  return handle(res);
}
export async function getBoard(gameId) {
  const res = await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}/board`, { headers: headers(true) });
  return handle(res);
}
export async function playCard(gameId, cellId, playerCardId) {
  const res = await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}/board`, {
    method:'PATCH', headers: headers(true),
    body: JSON.stringify({ cell: String(cellId), card: String(playerCardId) })
  });
  return handle(res);
}