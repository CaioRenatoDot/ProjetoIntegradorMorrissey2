import { useEffect, useRef, useState } from "react";
import { ChevronDown, DoorOpen, LogIn, Search, Settings, User } from "lucide-react";
import BrandLogo from "./BrandLogo";
import ClearButton from "./ClearButton";
import UserAvatar from "./UserAvatar";

export default function Navbar({
  currentUserName,
  isLoggedIn,
  isNavSearchOpen,
  activePage,
  onLoginClick,
  onLogout,
  onNavigate,
  onProfileClick,
  onRegisterClick,
  onSearchOpen,
  onSearchSubmit,
  onSearchClose,
  onSettingsClick,
  query,
  setQuery,
}) {
  const [isSearchFieldExpanded, setIsSearchFieldExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);
  const linkClassName =
    "flex h-full flex-none items-center border-b-2 border-transparent px-2 transition hover:border-[#00c030] hover:text-white md:px-0";
  const activeLinkClassName =
    "flex h-full flex-none items-center border-b-2 border-[#00c030] px-2 text-white transition hover:border-[#00c030] hover:text-white md:px-0";

  useEffect(() => {
    if (!isNavSearchOpen) {
      setIsSearchFieldExpanded(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsSearchFieldExpanded(true);
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
    }, 180);

    return () => window.clearTimeout(timer);
  }, [isNavSearchOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    function handleDocumentPointerDown(event) {
      if (userMenuRef.current?.contains(event.target)) return;
      setIsUserMenuOpen(false);
    }

    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") setIsUserMenuOpen(false);
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isUserMenuOpen]);

  function handleUserMenuAction(action) {
    setIsUserMenuOpen(false);
    action?.();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2e2e2e] bg-[#1a1a1a]">
      <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-5 md:min-h-16 md:flex-row md:items-center md:gap-x-6 md:px-4 md:py-0">
        <div className="flex min-h-16 w-full items-center justify-between gap-3 md:min-h-14 md:contents">
          <BrandLogo className="order-1 min-w-0 md:mr-6" />

          <div className="order-2 ml-auto flex flex-none items-center gap-2.5 md:order-4 md:ml-0">
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="inline-flex h-9 max-w-40 items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/70 py-1 pl-1 pr-3 text-sm font-bold text-slate-200 shadow-sm shadow-black/20 transition hover:border-[#00c030]/80 hover:bg-zinc-800 hover:text-white sm:max-w-56"
                  onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  <UserAvatar
                    className="ring-1 ring-white/15 shadow-none"
                    name={currentUserName}
                    size="nav"
                  />
                  <span className="min-w-0 truncate leading-none">{currentUserName}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 flex-none text-slate-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.6}
                  />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute left-0 top-full z-50 mt-2 min-w-full overflow-hidden rounded-md border border-zinc-700/80 bg-zinc-900 py-1 shadow-xl shadow-black/50"
                    role="menu"
                  >
                    <button
                      className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-xs font-bold text-slate-200 transition hover:bg-zinc-800 hover:text-white"
                      onClick={() => handleUserMenuAction(onProfileClick)}
                      role="menuitem"
                      type="button"
                    >
                      <User aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.4} />
                      View profile
                    </button>
                    <button
                      className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-xs font-bold text-slate-200 transition hover:bg-zinc-800 hover:text-white"
                      onClick={() => handleUserMenuAction(onSettingsClick)}
                      role="menuitem"
                      type="button"
                    >
                      <Settings aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.4} />
                      Settings
                    </button>
                    <div className="my-1 h-px bg-zinc-800" />
                    <button
                      className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-xs font-bold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleUserMenuAction(onLogout)}
                      role="menuitem"
                      type="button"
                    >
                      <DoorOpen aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-zinc-900/80 px-2.5 text-sm font-medium text-slate-200 shadow-sm shadow-black/20 transition hover:border-zinc-500/80 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] sm:px-3"
                  onClick={onLoginClick}
                  type="button"
                >
                  <LogIn
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-white"
                    strokeWidth={2.5}
                  />
                  Sign in
                </button>
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md border border-[#00c030]/70 bg-transparent px-2.5 text-sm font-medium text-[#7ee895] transition hover:border-[#00c030] hover:bg-[#00c030]/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] sm:px-3"
                  onClick={onRegisterClick}
                  type="button"
                >
                  <span className="sm:hidden">Join</span>
                  <span className="hidden sm:inline">Create account</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-x-2 border-t border-[#2e2e2e] py-1.5 md:contents md:py-0">
          <div className="order-1 flex h-11 min-w-0 flex-1 items-center justify-start gap-3 overflow-x-auto text-[12px] font-semibold uppercase tracking-[0.13em] text-[#aaa] sm:gap-4 sm:text-[13px] md:order-2 md:h-16 md:w-auto md:flex-none md:justify-start md:overflow-visible">
            <a
              className={
                activePage === "home" ? activeLinkClassName : linkClassName
              }
              href="#catalog"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("home");
              }}
            >
              Series
            </a>
            <a
              className={
                activePage === "diary" ? activeLinkClassName : linkClassName
              }
              href="#diary"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("diary");
              }}
            >
              Diary
            </a>
            <a
              className={
                activePage === "lists" ? activeLinkClassName : linkClassName
              }
              href="#lists"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("lists");
              }}
            >
              Lists
            </a>

            {isLoggedIn && (
              <a
                className={
                  activePage === "myLists" ? activeLinkClassName : linkClassName
                }
                href="#my-lists"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("myLists");
                }}
              >
                My Lists
              </a>
            )}
          </div>

          <form
            className={`order-2 flex min-w-0 items-center justify-end overflow-hidden transition-all duration-300 ease-out md:order-3 md:ml-auto md:w-auto ${
              isNavSearchOpen
                ? "w-full pb-2 md:pb-0"
                : "w-9 flex-none pb-0"
            }`}
            onSubmit={onSearchSubmit}
          >
            <label className="sr-only" htmlFor="nav-search">
              Search series
            </label>
            <button
              className={`grid h-9 w-9 flex-none place-items-center rounded border transition ${
                isNavSearchOpen
                  ? "border-zinc-700 bg-zinc-800 text-white"
                  : "border-transparent bg-transparent text-[#aaa] hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              }`}
              aria-label="Open search"
              onClick={onSearchOpen}
              type="button"
            >
              <Search
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={2.4}
              />
            </button>
            <div
              className={`relative flex min-w-0 items-center transition-all duration-300 ease-out ${
                isSearchFieldExpanded
                  ? "ml-2 w-[calc(100%-44px)] opacity-100 md:w-72"
                  : "w-0 opacity-0"
              }`}
            >
              <input
                id="nav-search"
                ref={searchInputRef}
                className={`h-9 w-full min-w-0 rounded border border-transparent bg-[#2a2a2a] pl-3 text-sm text-white outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00c030] ${
                  query ? "pr-8" : "pr-3"
                }`}
                minLength="2"
                onBlur={(event) => {
                  // Se o foco foi para outro elemento do proprio form de busca
                  // (ex: o botao de limpar, via Tab), nao fecha o campo.
                  const nextFocusTarget = event.relatedTarget;
                  if (nextFocusTarget && event.currentTarget.closest("form")?.contains(nextFocusTarget)) {
                    return;
                  }
                  onSearchClose();
                }}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                required
                type="text"
                value={query}
              />
              {query && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ClearButton
                    label="Clear search"
                    onClear={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}







