import { describe, expect, it } from "vitest";
import {
  BASE_PATH,
  getHashFromPage,
  getNavigationFromLocation,
  getPageFromHash,
  getRouteFromLocation,
} from "./routes";

const at = (hash, pathname = BASE_PATH) => ({ hash, pathname });

describe("hash das paginas", () => {
  it("ida e volta pagina <-> hash para todas as paginas conhecidas", () => {
    for (const page of ["diary", "mySeries", "myWatchlist", "lists", "myLists", "profile", "editProfile", "search"]) {
      expect(getPageFromHash(getHashFromPage(page))).toBe(page);
    }
  });

  it("a watchlist tem hash proprio (antes caia na home ao recarregar)", () => {
    expect(getHashFromPage("myWatchlist")).toBe("#my-watchlist");
  });

  it("hash desconhecido ou vazio vai para a home", () => {
    expect(getPageFromHash("")).toBe("home");
    expect(getPageFromHash("#catalog")).toBe("home");
    expect(getHashFromPage("home")).toBe("#catalog");
  });
});

describe("getRouteFromLocation", () => {
  it("le o id da serie da URL", () => {
    expect(getRouteFromLocation(at("#series/169"))).toMatchObject({ page: "details", showId: 169 });
  });

  it("ignora id de serie invalido", () => {
    expect(getRouteFromLocation(at("#series/abc")).page).toBe("home");
    expect(getRouteFromLocation(at("#series/")).page).toBe("home");
  });

  it("le o id da lista da URL", () => {
    expect(getRouteFromLocation(at("#list/a1b2-c3"))).toMatchObject({
      page: "listDetails",
      listId: "a1b2-c3",
    });
  });

  it("le o username do path do perfil publico", () => {
    expect(getRouteFromLocation(at("", `${BASE_PATH}caio`))).toMatchObject({
      page: "publicProfile",
      username: "caio",
    });
  });
});

describe("getNavigationFromLocation", () => {
  it("sem history.state usa as paginas de origem padrao", () => {
    expect(getNavigationFromLocation(at("#series/1"), null)).toMatchObject({
      page: "details",
      showId: 1,
      detailReturnPage: "home",
      listDetailReturnPage: "lists",
    });
  });

  it("recupera de onde o usuario veio pelo history.state", () => {
    const state = {
      watchdReturnPage: "listDetails",
      watchdReturnListId: "lista-1",
      watchdListReturnPage: "myLists",
      watchdUsername: "caio",
    };

    expect(getNavigationFromLocation(at("#series/1"), state)).toMatchObject({
      page: "details",
      listId: "lista-1",
      username: "caio",
      detailReturnPage: "listDetails",
      listDetailReturnPage: "myLists",
    });
  });
});
