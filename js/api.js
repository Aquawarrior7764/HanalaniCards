export const API_BASE = 'https://app-nineturns-dev-aqd8f2dmhtg5e0hw.centralus-01.azurewebsites.net';

function key() { return localStorage.getItem('playerKey') || ''; }
function headers(auth=false) {
  const h = {'Content-Type': 'application/json'};
  if (auth) h['player-api-key'] = key(); // docs: player-api-key header required
  return h;
}
async function handle(res) {
  if (!res.ok) {
    let t = await res.text(); try { const j = JSON.parse(t); t = j.message || t; } catch {}
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function createPlayer(name, email) {
  const res = await fetch(`${API_BASE}/players/create`, {
    method: 'POST', headers: headers(), body: JSON.stringify({name, email})
  });
  return handle(res); // -> { id, name, clan, key, deck: [] }
}
export async function getPlayer(playerId) {
  const res = await fetch(`${API_BASE}/players/${playerId}`, { headers: headers(true) });
  return handle(res); // -> { id, name, clan, key, deck: [] }
}

export async function getMyCards() {
  const res = await fetch(`${API_BASE}/players/cards`, { headers: headers(true) });
  return handle(res); // -> { deck:[{Id, Name, n,s,e,w,Path}], pool:[...] }
}
export async function moveToDeck(playerCardId) {
  const res = await fetch(`${API_BASE}/players/cards/move/${playerCardId}/to/deck`, {
    method: 'PATCH', headers: headers(true)
  });
  return handle(res);
}
export async function moveToPool(playerCardId) {
  const res = await fetch(`${API_BASE}/players/cards/move/${playerCardId}/to/pool`, {
    method: 'PATCH', headers: headers(true)
  });
  return handle(res);
}

export async function createGame() {
  const res = await fetch(`${API_BASE}/games/create`, { method:'POST', headers: headers(true) });
  return handle(res); // -> { id }
}
export async function findOpenGames() {
  const res = await fetch(`${API_BASE}/games/find`, { headers: headers(true) });
  return handle(res);
}
export async function joinGame(gameId) {
  const res = await fetch(`${API_BASE}/games/join/${gameId}`, { headers: headers(true) });
  return handle(res);
}
export async function getGame(gameId) {
  const res = await fetch(`${API_BASE}/games/${gameId}`, { headers: headers(true) });
  return handle(res); // -> { id, Open, Completed, CurrentTurn, Winner, ... }
}
export async function getBoard(gameId) {
  const res = await fetch(`${API_BASE}/games/${gameId}/board`, { headers: headers(true) });
  return handle(res); // -> [{ CellId, Row, Column, PlayerId, CardId }, ...]
}
export async function playCard(gameId, cellId, playerCardId) {
  const res = await fetch(`${API_BASE}/games/${gameId}/board`, {
    method:'PATCH', headers: headers(true), body: JSON.stringify({ cell: cellId, card: playerCardId })
  });
  return handle(res);
}