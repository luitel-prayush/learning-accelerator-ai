type RouteHandler = () => string;
type RouteMount = () => void | Promise<void>;

type RouteDef = { view: RouteHandler; mount?: RouteMount };

const routes: Record<string, RouteDef> = {};

export function registerRoute(path: string, handler: RouteHandler, mount?: RouteMount) {
  routes[path] = { view: handler, mount };
}

export function navigate(hash: string) {
  if (location.hash !== hash) location.hash = hash;
  else render();
}

let outlet: HTMLDivElement;

export function initRouter(target: HTMLDivElement) {
  outlet = target;
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/';
  render();
}

async function render() {
  const path = location.hash || '#/';
  const route = routes[path] || routes['#/404'];
  outlet.innerHTML = route ? route.view() : `<fast-card class="p-6">Not Found</fast-card>`;
  if (route?.mount) await route.mount();
}
