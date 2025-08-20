import * as Onboard from './pages/onboard.js';
import * as Cards from './pages/cards.js';
import * as Play from './pages/play.js';
import * as Board from './pages/board.js';
import * as Settings from './pages/settings.js';

const routes = {
  '#onboard': Onboard.view,
  '#cards':   Cards.view,
  '#play':    Play.view,
  '#board':   Board.view,
  '#settings':Settings.view,
};
function mount() {
  const hash = location.hash || '#onboard';
  const [path, query] = hash.split('?');
  const view = routes[path] || Onboard.view;
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(view(new URLSearchParams(query || '')));
}
window.addEventListener('hashchange', mount);
window.addEventListener('DOMContentLoaded', mount);
