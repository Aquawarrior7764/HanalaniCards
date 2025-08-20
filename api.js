// Set this to the server base from the docs.
// For the dev server shown in the PDF:
export const API_BASE = 'https://app-nineturns-dev-aqd8f2dmhtg5e0hw.centralus-01.azurewebsites.net';

function key() { return localStorage.getItem('playerKey') || ''; }
function headers(auth=false) {
  const h = {'Content-Type': 'application/json'};
  if (auth) h['player-api-key'] = key(); // required on most player actions
  return h;
}
export async function createPlayer(name, email) {
  const res = await fetch(`${API_BASE}/players/create`, {
    method: 'POST', headers: headers(), body: JSON.stringify({name, email})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { id, name, clan, key, deck: [] }
}
export async function getMyCards() {
  const res = await fetch(`${API_BASE}/players/cards`, { headers: headers(true) });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { deck: [...], pool: [...] }
}
export async function moveToDeck(playerCardId) {
  const res = await fetch(`${API_BASE}/players/cards/move/${playerCardId}/to/deck`, {
    method: 'PATCH', headers: headers(true)
  });
  if (!res.ok) throw new Error(await res.text()); // 409 if deck already has five
  return res.json();
}
export async function moveToPool(playerCardId) {
  const res = await fetch(`${API_BASE}/players/cards/move/${playerCardId}/to/pool`, {
    method: 'PATCH', headers: headers(true)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function createGame() {
  const res = await fetch(`${API_BASE}/games/create`, { method:'POST', headers: headers(true) });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { id }
}
export async function findOpenGames() {
  const res = await fetch(`${API_BASE}/games/find`, { headers: headers(true) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function joinGame(gameId) {
  const res = await fetch(`${API_BASE}/games/join/${gameId}`, { headers: headers(true) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function getBoard(gameId) {
  const res = await fetch(`${API_BASE}/games/${gameId}/board`, { headers: headers(true) });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // [{ CellId, Row, Column, PlayerId, CardId }, ...]
}
export async function playCard(gameId, cellId, cardId) {
  const res = await fetch(`${API_BASE}/games/${gameId}/board`, {
    method:'PATCH', headers: headers(true), body: JSON.stringify({ cell: cellId, card: cardId })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
