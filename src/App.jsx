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
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <img
        className="h-72 w-full object-cover"
        src={show.image?.medium || fallbackPoster}
        alt={`Poster da serie ${show.name}`}
      />

      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            {genres}
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {show.name}
          </h2>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {cleanSummary(show.summary)}
        </p>

        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
          Nota {rating}
        </span>
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
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
            Watchd
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Encontre sua proxima serie
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Pesquise pelo nome da serie e veja resultados reais da API TVMaze.
          </p>
        </header>

        <form
          className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="series-search">
            Buscar serie
          </label>
          <input
            id="series-search"
            className="min-h-12 flex-1 rounded-md border border-slate-200 px-4 text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            minLength="2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: The Office, Dark, Friends..."
            required
            type="search"
            value={query}
          />
          <button className="min-h-12 rounded-md bg-emerald-600 px-6 font-bold text-white transition hover:bg-emerald-700">
            Buscar
          </button>
        </form>

        {error && (
          <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">Resultados para {searchTerm}</h2>
          <p className="text-sm font-bold text-slate-500">
            {isLoading
              ? "Buscando..."
              : `${series.length} resultado${series.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">
            Carregando dados...
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((show) => (
              <SeriesCard key={show.id} show={show} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
