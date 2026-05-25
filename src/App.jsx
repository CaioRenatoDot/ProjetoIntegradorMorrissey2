import { useEffect, useState } from "react";

const fallbackPoster =
  "https://placehold.co/420x590/111827/f8fafc?text=Sem+imagem";

function cleanSummary(summary) {
  if (!summary) return "Sinopse indisponivel.";
  return summary.replace(/<[^>]*>/g, "");
}

function SeriesCard({ show }) {
  const genres = show.genres?.length ? show.genres.join(", ") : "Sem genero";
  const rating = show.rating?.average ?? "N/A";

  return (
    <article className="group overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/30">
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={show.image?.medium || fallbackPoster}
          alt={`Poster da serie ${show.name}`}
        />
        <div className="absolute right-2 top-2 rounded bg-slate-950/85 px-2 py-1 text-xs font-black text-emerald-400">
          {rating}
        </div>
      </div>

      <div className="space-y-2 p-3">
        <h2 className="line-clamp-1 text-sm font-black text-slate-50">
          {show.name}
        </h2>
        <p className="line-clamp-1 text-xs font-bold text-slate-400">
          {genres}
        </p>
        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
          {cleanSummary(show.summary)}
        </p>
      </div>
    </article>
  );
}

function LoginScreen({ email, onBack, onEmailChange, onLogin }) {
  return (
    <section className="grid min-h-[calc(100vh-64px)] place-items-center py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/40">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
          Watchd account
        </p>
        <h1 className="mt-3 text-3xl font-black text-white">Entrar</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Acesse seu diario, listas e historico de series. Este login e apenas
          um mock visual.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onLogin}>
          <div>
            <label
              className="mb-2 block text-sm font-bold text-slate-300"
              htmlFor="login-email"
            >
              Email
            </label>
            <input
              className="min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              id="login-email"
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="caio@email.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-bold text-slate-300"
              htmlFor="login-password"
            >
              Senha
            </label>
            <input
              className="min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              id="login-password"
              placeholder="Digite qualquer senha"
              required
              type="password"
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 font-semibold text-slate-400">
              <input className="accent-emerald-500" type="checkbox" />
              Lembrar acesso
            </label>
            <a
              className="font-bold text-emerald-400 hover:text-emerald-300"
              href="#login"
            >
              Esqueci a senha
            </a>
          </div>

          <button className="min-h-11 w-full rounded bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400">
            Entrar
          </button>
        </form>

        <button
          className="mt-4 w-full rounded border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
          onClick={onBack}
          type="button"
        >
          Voltar para o catalogo
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [query, setQuery] = useState("breaking bad");
  const [searchTerm, setSearchTerm] = useState("breaking bad");
  const [series, setSeries] = useState([]);
  const [isNavSearchOpen, setIsNavSearchOpen] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("caio@email.com");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSeries() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(
            searchTerm
          )}`
        );

        if (!response.ok) {
          throw new Error("Nao foi possivel buscar as series.");
        }

        const data = await response.json();
        setSeries(data.map((item) => item.show));
      } catch (requestError) {
        setError(requestError.message);
        setSeries([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeries();
  }, [searchTerm]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Digite o nome de uma serie para pesquisar.");
      return;
    }

    setSearchTerm(trimmedQuery);
    setIsLoginVisible(false);
  }

  function handleMockLogin(event) {
    event.preventDefault();
    setIsLoggedIn(true);
    setIsLoginVisible(false);
  }

  return (
    <main className="min-h-screen bg-[#14181c] text-slate-100">
      <nav className="letterboxd-navbar">
        <div className="letterboxd-navbar__inner">
          <a className="letterboxd-navbar__logo" href="/">
            <span>Watchd</span>
          </a>

          <div className="letterboxd-navbar__links">
            <a className="is-active" href="#catalogo">
              Films
            </a>
            <a href="#resultados">Diary</a>
            <a href="#resultados">Lists</a>
          </div>

          <form
            className={`letterboxd-navbar__search ${
              isNavSearchOpen ? "is-open" : ""
            }`}
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="nav-search">
              Buscar serie
            </label>
            <button
              aria-label="Abrir busca"
              onClick={() => setIsNavSearchOpen(true)}
              type="button"
            >
              ⌕
            </button>
            <input
              id="nav-search"
              minLength="2"
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => setIsNavSearchOpen(false)}
              placeholder="Search"
              required
              type="search"
              value={query}
            />
          </form>

          <div className="letterboxd-navbar__actions">
            {isLoggedIn ? (
              <button className="letterboxd-navbar__sign-in" type="button">
                Caio
              </button>
            ) : (
              <button
                className="letterboxd-navbar__sign-in"
                onClick={() => setIsLoginVisible(true)}
                type="button"
              >
                Sign in
              </button>
            )}
            <button
              className="letterboxd-navbar__create"
              onClick={() => setIsLoginVisible(true)}
              type="button"
            >
              Create account
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {isLoginVisible ? (
          <LoginScreen
            email={loginEmail}
            onBack={() => setIsLoginVisible(false)}
            onEmailChange={setLoginEmail}
            onLogin={handleMockLogin}
          />
        ) : (
          <>
        <header
          id="catalogo"
          className="relative left-1/2 mb-10 w-screen -translate-x-1/2 overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#10151a_0%,#14181c_78%)] px-4 pb-10 pt-6"
        >
          <div className="mx-auto grid min-h-[620px] max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center py-10">
              <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
                Catalogo de series
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Encontre sua proxima serie
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Busque uma serie, veja poster, nota e sinopse em uma grade
                simples para descobrir o que assistir depois.
              </p>

              <form
                id="buscar"
                className="mt-8 flex flex-col gap-3 rounded border border-slate-700 bg-slate-950/80 p-3 shadow-2xl shadow-black/30 backdrop-blur sm:max-w-2xl sm:flex-row"
                onSubmit={handleSubmit}
              >
                <label className="sr-only" htmlFor="series-search">
                  Buscar serie
                </label>
                <input
                  id="series-search"
                  className="min-h-11 flex-1 rounded border border-slate-700 bg-slate-950 px-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  minLength="2"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex: The Office, Dark, Friends..."
                  required
                  type="search"
                  value={query}
                />
                <button className="min-h-11 rounded bg-emerald-500 px-6 font-black text-slate-950 transition hover:bg-emerald-400">
                  Buscar
                </button>
              </form>
            </div>

            <div className="relative min-h-[360px] self-center lg:min-h-[560px]">
              <div className="absolute left-0 top-8 w-[38%] rotate-[-8deg] opacity-85 sm:left-8 lg:left-0 lg:top-16">
                <img
                  className="aspect-[2/3] w-full rounded border border-slate-700 object-cover shadow-2xl shadow-black/50"
                  src={series[1]?.image?.medium || fallbackPoster}
                  alt={`Poster da serie ${series[1]?.name || "em destaque"}`}
                />
              </div>
              <div className="absolute left-[28%] top-0 z-10 w-[44%]">
                <img
                  className="aspect-[2/3] w-full rounded border border-emerald-500/70 object-cover shadow-2xl shadow-emerald-950/40"
                  src={series[0]?.image?.medium || fallbackPoster}
                  alt={`Poster da serie ${series[0]?.name || "principal"}`}
                />
              </div>
              <div className="absolute right-0 top-12 w-[34%] rotate-[7deg] opacity-85 sm:right-8 lg:right-0 lg:top-24">
                <img
                  className="aspect-[2/3] w-full rounded border border-slate-700 object-cover shadow-2xl shadow-black/50"
                  src={series[2]?.image?.medium || fallbackPoster}
                  alt={`Poster da serie ${series[2]?.name || "recomendado"}`}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 mx-auto grid max-w-md grid-cols-3 gap-3 rounded border border-slate-700 bg-slate-950/85 p-3 shadow-2xl shadow-black/40 backdrop-blur">
                <div>
                  <p className="text-xl font-black text-white">
                    {series.length}
                  </p>
                  <p className="text-xs font-bold text-slate-500">resultados</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">TVMaze</p>
                  <p className="text-xs font-bold text-slate-500">dados</p>
                </div>
                <div>
                  <p className="text-xl font-black text-emerald-400">Live</p>
                  <p className="text-xs font-bold text-slate-500">busca</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </p>
        )}

        <div
          id="resultados"
          className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <h2 className="text-lg font-black text-white">
            Resultados para {searchTerm}
          </h2>
          <p className="text-sm font-bold text-slate-400">
            {isLoading
              ? "Buscando..."
              : `${series.length} resultado${series.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="rounded border border-slate-700 bg-slate-900 p-8 text-center font-bold text-slate-400">
            Carregando dados...
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {series.map((show) => (
              <SeriesCard key={show.id} show={show} />
            ))}
          </section>
        )}
          </>
        )}
      </div>
    </main>
  );
}
