export const API_BASE = 'https://app-nineturns-dev-aqd8f2dmhtg5e0hw.centralus-01.azurewebsites.net';

function key() { return localStorage.getItem('playerKey') || ''; }
function headers(auth=false){ const h={'Content-Type':'application/json'}; if(auth) h['player-api-key']=key(); return h; }
async function handle(res){ if(!res.ok){ let t=await res.text(); try{t=(JSON.parse(t).message)||t;}catch{} throw new Error(t||`${res.status} ${res.statusText}`);} return res.json(); }

// Players
export async function createPlayer(name,email){
  const r = await fetch(`${API_BASE}/players/create`, {method:'POST',headers:headers(),body:JSON.stringify({name,email})});
  return handle(r);
}
export async function getPlayer(playerId){
  const r = await fetch(`${API_BASE}/players/${encodeURIComponent(playerId)}`, {headers:headers(true)});
  return handle(r);
}

// Cards (owned by player)
export async function getMyCards(){
  // Canonical route
  let r = await fetch(`${API_BASE}/cards`, { headers: headers(true) });
  if (r.status === 404) r = await fetch(`${API_BASE}/players/cards`, { headers: headers(true) }); // legacy fallback
  return handle(r);
}
async function move(path){
  const r = await fetch(`${API_BASE}${path}`, { method:'PATCH', headers: headers(true) });
  return handle(r);
}
export async function moveToDeck(playerCardId){
  const id = String(playerCardId || '').trim();
  if (!id) throw new Error('Card id missing.');
  return move(`/cards/move/${encodeURIComponent(id)}/to/deck`);
}
export async function moveToPool(playerCardId){
  const id = String(playerCardId || '').trim();
  if (!id) throw new Error('Card id missing.');
  return move(`/cards/move/${encodeURIComponent(id)}/to/pool`);
}

// Games
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