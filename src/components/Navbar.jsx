export default function Navbar({
  isLoggedIn,
  isNavSearchOpen,
  onLoginClick,
  onSearchOpen,
  onSearchSubmit,
  onSearchClose,
  query,
  setQuery,
}) {
  return (
    <nav className="sticky top-0 z-50 min-h-16 border-b border-[#2e2e2e] bg-[#1a1a1a]">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-2 md:flex-nowrap md:py-0">
        <a
          className="flex-none font-serif text-2xl font-bold leading-none text-white"
          href="/"
        >
          Watchd
        </a>

        <div className="order-3 flex h-10 w-full items-center gap-5 overflow-x-auto text-[13px] font-semibold uppercase tracking-[0.13em] text-[#aaa] md:order-none md:h-16 md:w-auto md:overflow-visible">
          <a
            className="flex h-full flex-none items-center border-b-2 border-[#00c030] text-white transition hover:border-[#00c030] hover:text-white"
            href="#catalogo"
          >
            Filmes
          </a>
          <a
            className="flex h-full flex-none items-center border-b-2 border-transparent transition hover:border-[#00c030] hover:text-white"
            href="#resultados"
          >
            Diario
          </a>
          <a
            className="flex h-full flex-none items-center border-b-2 border-transparent transition hover:border-[#00c030] hover:text-white"
            href="#resultados"
          >
            Listas
          </a>
        </div>

        <form
          className="order-4 flex w-full items-center md:order-none md:ml-auto md:w-auto"
          onSubmit={onSearchSubmit}
        >
          <label className="sr-only" htmlFor="nav-search">
            Buscar serie
          </label>
          <button
            className={`grid h-9 w-9 place-items-center rounded border text-lg transition ${
              isNavSearchOpen
                ? "border-zinc-700 bg-zinc-800 text-white"
                : "border-transparent bg-transparent text-[#aaa] hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            }`}
            aria-label="Abrir busca"
            onClick={onSearchOpen}
            type="button"
          >
            &#8981;
          </button>
          <input
            id="nav-search"
            className={`h-9 rounded border border-transparent bg-[#2a2a2a] text-sm text-white outline-none transition-all duration-200 placeholder:text-[#aaa] focus:border-[#00c030] ${
              isNavSearchOpen
                ? "ml-2 w-[calc(100%-44px)] px-3 opacity-100 md:w-56"
                : "w-0 p-0 opacity-0"
            }`}
            minLength="2"
            onBlur={onSearchClose}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar"
            required
            type="search"
            value={query}
          />
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isLoggedIn ? (
            <button
              className="inline-flex min-h-9 items-center justify-center rounded border border-zinc-700 px-3 text-sm font-bold text-slate-200 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              type="button"
            >
              Caio
            </button>
          ) : (
            <button
              className="inline-flex min-h-9 items-center justify-center rounded border border-zinc-700 px-3 text-sm font-bold text-slate-200 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              onClick={onLoginClick}
              type="button"
            >
              Entrar
            </button>
          )}
          <button
            className="inline-flex min-h-9 items-center justify-center rounded border border-[#00c030] bg-[#00c030] px-3 text-sm font-black text-[#111] transition hover:border-[#22d646] hover:bg-[#22d646]"
            onClick={onLoginClick}
            type="button"
          >
            Criar conta
          </button>
        </div>
      </div>
    </nav>
  );
}
