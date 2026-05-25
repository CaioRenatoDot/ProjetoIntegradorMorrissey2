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

export default function App() {
  const [query, setQuery] = useState("breaking bad");
  const [searchTerm, setSearchTerm] = useState("breaking bad");
  const [series, setSeries] = useState([]);
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
  }

  return (
    <main className="min-h-screen bg-[#14181c] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
            Watchd
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Encontre sua proxima serie
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Busque uma serie, veja poster, nota e sinopse em uma grade simples
            inspirada no Letterboxd.
          </p>
        </header>

        <form
          className="mb-6 flex flex-col gap-3 rounded border border-slate-700 bg-slate-900 p-3 shadow-lg shadow-black/20 sm:flex-row"
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

        {error && (
          <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </p>
        )}

        <div className="mb-4 flex items-center justify-between gap-4">
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
      </div>
    </main>
  );
}
