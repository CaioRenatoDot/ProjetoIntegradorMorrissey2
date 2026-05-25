import { fallbackPoster } from "../data/constants";

export default function Hero({ onSearchSubmit, query, series, setQuery }) {
  return (
    <header
      id="catalogo"
      className="relative left-1/2 mb-10 min-h-[calc(100vh-64px)] w-screen -translate-x-1/2 overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#10151a_0%,#14181c_78%)] px-4 pb-10"
    >
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center py-10">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
            Catalogo de series
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Encontre algo para assistir
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Explore uma selecao aleatoria de titulos ou pesquise pelo nome para
            encontrar um resultado especifico.
          </p>

          <form
            id="buscar"
            className="mt-8 flex flex-col gap-3 rounded border border-slate-700 bg-slate-950/80 p-3 shadow-2xl shadow-black/30 backdrop-blur sm:max-w-2xl sm:flex-row"
            onSubmit={onSearchSubmit}
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
          <PosterPreview
            altName={series[1]?.name || "em destaque"}
            className="absolute left-0 top-8 w-[38%] rotate-[-8deg] opacity-85 sm:left-8 lg:left-0 lg:top-16"
            poster={series[1]?.image?.medium}
          />
          <PosterPreview
            altName={series[0]?.name || "principal"}
            className="absolute left-[28%] top-0 z-10 w-[44%]"
            imageClassName="border-emerald-500/70 shadow-emerald-950/40"
            poster={series[0]?.image?.medium}
          />
          <PosterPreview
            altName={series[2]?.name || "recomendado"}
            className="absolute right-0 top-12 w-[34%] rotate-[7deg] opacity-85 sm:right-8 lg:right-0 lg:top-24"
            poster={series[2]?.image?.medium}
          />

          <div className="absolute bottom-0 left-0 right-0 z-20 mx-auto grid max-w-md grid-cols-3 gap-3 rounded border border-slate-700 bg-slate-950/85 p-3 shadow-2xl shadow-black/40 backdrop-blur">
            <Metric label="resultados" value={series.length} />
            <Metric label="dados" value="TVMaze" />
            <Metric label="busca" value="Ao vivo" valueClassName="text-emerald-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Metric({ label, value, valueClassName = "text-white" }) {
  return (
    <div>
      <p className={`text-xl font-black ${valueClassName}`}>{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function PosterPreview({
  altName,
  className,
  imageClassName = "border-slate-700 shadow-black/50",
  poster,
}) {
  return (
    <div className={className}>
      <img
        className={`aspect-[2/3] w-full rounded border object-cover shadow-2xl ${imageClassName}`}
        src={poster || fallbackPoster}
        alt={`Poster da serie ${altName}`}
      />
    </div>
  );
}
