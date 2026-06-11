import { useEffect, useRef, useState } from "react";
import { DoorOpen, Search } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar({
  currentUserName,
  isLoggedIn,
  isNavSearchOpen,
  activePage,
  onLoginClick,
  onLogout,
  onNavigate,
  onRegisterClick,
  onSearchOpen,
  onSearchSubmit,
  onSearchClose,
  query,
  setQuery,
}) {
  const [isSearchFieldExpanded, setIsSearchFieldExpanded] = useState(false);
  const searchInputRef = useRef(null);
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

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2e2e2e] bg-[#1a1a1a]">
      <div className="mx-auto flex max-w-6xl flex-col px-3 sm:px-4 md:min-h-16 md:flex-row md:items-center md:gap-x-6 md:px-4 md:py-0">
        <div className="flex min-h-14 w-full items-center justify-between gap-3 md:contents">
          <BrandLogo className="order-1 min-w-0 md:mr-6" />

          <div className="order-2 ml-auto flex flex-none items-center gap-2 md:order-4 md:ml-0">
            {isLoggedIn ? (
              <>
                <span className="inline-flex min-h-9 max-w-24 items-center justify-center truncate rounded border border-zinc-700 px-3 text-sm font-bold text-slate-200 sm:max-w-44">
                  {currentUserName}
                </span>
                <button
                  aria-label="Log out"
                  className="grid h-9 w-9 place-items-center rounded border border-red-500/70 text-red-400 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={onLogout}
                  type="button"
                >
                  <DoorOpen
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2.4}
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-flex min-h-9 items-center justify-center rounded border border-zinc-700 px-2.5 text-sm font-bold text-slate-200 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white sm:px-3"
                  onClick={onLoginClick}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className="inline-flex min-h-9 items-center justify-center rounded border border-[#00c030] bg-[#00c030] px-2.5 text-sm font-black text-white transition hover:border-[#22d646] hover:bg-[#22d646] sm:px-3"
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

        <div className="flex w-full flex-wrap items-center gap-x-2 border-t border-[#2e2e2e] md:contents">
          <div className="order-1 flex h-11 min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto text-[12px] font-semibold uppercase tracking-[0.13em] text-[#aaa] sm:gap-4 sm:text-[13px] md:order-2 md:h-16 md:w-auto md:flex-none md:justify-start md:overflow-visible">
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
            <input
              id="nav-search"
              ref={searchInputRef}
              className={`h-9 min-w-0 rounded border border-transparent bg-[#2a2a2a] text-sm text-white outline-none transition-all duration-300 ease-out placeholder:text-[#aaa] focus:border-[#00c030] ${
                isSearchFieldExpanded
                  ? "ml-2 w-[calc(100%-44px)] px-3 opacity-100 md:w-72"
                  : "w-0 p-0 opacity-0"
              }`}
              minLength="2"
              onBlur={onSearchClose}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              required
              type="search"
              value={query}
            />
          </form>
        </div>
      </div>
    </nav>
  );
}
