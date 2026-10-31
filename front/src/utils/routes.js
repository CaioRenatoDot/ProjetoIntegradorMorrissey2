export const BASE_PATH = import.meta.env.BASE_URL;

// Uma tabela so para os dois sentidos (pagina -> hash e hash -> pagina):
// antes eram dois ifs separados e a watchlist so existia em um deles, entao
// recarregar a pagina da watchlist voltava para a home.
const PAGE_HASHES = {
  diary: "#diary",
  mySeries: "#my-series",
  myWatchlist: "#my-watchlist",
  lists: "#lists",
  myLists: "#my-lists",
  profile: "#profile",
  editProfile: "#edit-profile",
  search: "#search",
};

// Serie e lista tem URL propria (#series/123, #list/abc) para o link poder
// ser compartilhado e sobreviver a um refresh. De onde o usuario veio (para
// o botao voltar) fica no history.state, que nao aparece na URL.
export const SERIES_HASH_PREFIX = "#series/";
export const LIST_HASH_PREFIX = "#list/";

export function getPageFromHash(hash) {
  const page = Object.keys(PAGE_HASHES).find((key) => PAGE_HASHES[key] === hash);
  return page || "home";
}

export function getHashFromPage(page) {
  return PAGE_HASHES[page] || "#catalog";
}

export function getUsernameFromPath(pathname) {
  if (!pathname.startsWith(BASE_PATH)) return null;
  const segment = pathname.slice(BASE_PATH.length).replace(/\/+$/, "");
  return segment ? decodeURIComponent(segment) : null;
}

export function getRouteFromLocation({ hash, pathname } = window.location) {
  const route = { page: "home", showId: null, listId: null, username: null };

  if (hash.startsWith(SERIES_HASH_PREFIX)) {
    const showId = Number(hash.slice(SERIES_HASH_PREFIX.length));
    if (Number.isInteger(showId) && showId > 0) return { ...route, page: "details", showId };
  }

  if (hash.startsWith(LIST_HASH_PREFIX)) {
    const listId = decodeURIComponent(hash.slice(LIST_HASH_PREFIX.length));
    if (listId) return { ...route, page: "listDetails", listId };
  }

  const username = getUsernameFromPath(pathname);
  if (username) return { ...route, page: "publicProfile", username };

  return { ...route, page: getPageFromHash(hash) };
}

export function getHistoryState(state = window.history.state) {
  return state && typeof state === "object" ? state : {};
}

// Junta a rota da URL com o contexto guardado no history.state.
export function getNavigationFromLocation(
  location = window.location,
  historyState = window.history.state
) {
  const route = getRouteFromLocation(location);
  const state = getHistoryState(historyState);

  return {
    page: route.page,
    showId: route.showId,
    listId: route.listId || state.watchdReturnListId || null,
    username: route.username || state.watchdUsername || null,
    detailReturnPage: state.watchdReturnPage || "home",
    listDetailReturnPage: state.watchdListReturnPage || "lists",
  };
}
