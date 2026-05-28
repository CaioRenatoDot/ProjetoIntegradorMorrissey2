import { useEffect, useState } from "react";
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
    }, 180);

    return () => window.clearTimeout(timer);
  }, [isNavSearchOpen]);

  return (
    <nav className="sticky top-0 z-50 min-h-16 border-b border-[#2e2e2e] bg-[#1a1a1a]">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:gap-x-4 md:flex-nowrap md:gap-x-6 md:py-0">
        <BrandLogo className="order-1 mr-auto md:order-none md:mr-6" />

        <div className="order-4 flex h-11 w-full items-center justify-center gap-4 overflow-x-auto border-t border-[#2e2e2e] text-[12px] font-semibold uppercase tracking-[0.13em] text-[#aaa] sm:gap-5 sm:text-[13px] md:order-none md:h-16 md:w-auto md:justify-start md:overflow-visible md:border-t-0">
          <a
            className={activePage === "home" ? activeLinkClassName : linkClassName}
            href="#catalog"
            onClick={() => onNavigate("home")}
          >
            Series
          </a>
          <a
            className={activePage === "diary" ? activeLinkClassName : linkClassName}
            href="#diary"
            onClick={() => onNavigate("diary")}
          >
            Diary
          </a>
          <a
            className={activePage === "lists" ? activeLinkClassName : linkClassName}
            href="#lists"
            onClick={() => onNavigate("lists")}
          >
            Lists
          </a>
        </div>

        <form
          className={`flex min-w-0 items-center overflow-hidden transition-all duration-300 ease-out md:order-none md:ml-auto md:w-auto ${
            isNavSearchOpen
              ? "order-3 w-full translate-y-0 pt-1 opacity-100"
              : "order-2 w-auto -translate-y-1 pt-0 opacity-100"
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
            <Search aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <input
            id="nav-search"
            className={`h-9 min-w-0 rounded border border-transparent bg-[#2a2a2a] text-sm text-white outline-none transition-all duration-300 ease-out placeholder:text-[#aaa] focus:border-[#00c030] ${
              isSearchFieldExpanded
                ? "ml-2 w-[calc(100%-44px)] px-3 opacity-100 md:w-76"
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

        <div className="order-2 flex items-center gap-2 md:order-none md:ml-0">
          {isLoggedIn ? (
            <>
              <span className="inline-flex min-h-9 max-w-32 items-center justify-center truncate rounded border border-zinc-700 px-3 text-sm font-bold text-slate-200 sm:max-w-44">
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
                className="inline-flex min-h-9 items-center justify-center rounded border border-zinc-700 px-3 text-sm font-bold text-slate-200 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                onClick={onLoginClick}
                type="button"
              >
                Sign in
              </button>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded border border-[#00c030] bg-[#00c030] px-3 text-sm font-black text-[#fff] transition hover:border-[#22d646] hover:bg-[#22d646]"
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
    </nav>
  );
}
