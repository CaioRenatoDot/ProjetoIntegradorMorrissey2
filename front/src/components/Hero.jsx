import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fallbackPoster } from "../data/constants";
import { getMostPopularShows } from "../services/tvmaze";

export default function Hero({
  isLoading,
  onSearchSubmit,
  onSeriesSelect,
  query,
  series,
  setQuery,
}) {
  const [popularSeries, setPopularSeries] = useState([]);
  const [isPopularLoading, setIsPopularLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPopularSeries() {
      try {
        const shows = await getMostPopularShows({ limit: 12, pages: 6 });
        if (isMounted) {
          setPopularSeries(shows);
        }
      } catch {
        if (isMounted) {
          setPopularSeries([]);
        }
      } finally {
        if (isMounted) {
          setIsPopularLoading(false);
        }
      }
    }

    fetchPopularSeries();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroSeries = popularSeries.length ? popularSeries : series;
  const isHeroLoading = !heroSeries.length && (isLoading || isPopularLoading);

  return (
    <header
      id="catalog"
      className="relative left-1/2 mb-6 w-dvw -translate-x-1/2 overflow-hidden bg-[radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#10151a_0%,#14181c_85%)] py-14 sm:py-20"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find something to watch
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
          Explore a random selection of titles or search by name to find a
          specific result.
        </p>

        <form
          id="search"
          className="mt-7 flex w-full max-w-2xl items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/85 p-2 shadow-2xl shadow-black/30 backdrop-blur transition focus-within:border-[#00c030] focus-within:ring-4 focus-within:ring-[#00c030]/15"
          onSubmit={onSearchSubmit}
        >
          <label className="sr-only" htmlFor="series-search">
            Search series
          </label>
          <input
            id="series-search"
            className="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 sm:text-base"
            minLength="2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: The Office, Dark, Friends..."
            required
            type="search"
            value={query}
          />
          <button className="group inline-flex min-h-11 flex-none items-center justify-center gap-2 rounded-md bg-[#00c030] px-4 text-sm font-black uppercase tracking-wide text-white/85 shadow-lg shadow-[#00c030]/25 transition duration-300 hover:bg-[#32d85a] hover:text-white hover:shadow-xl hover:shadow-[#00c030]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-95 sm:px-6">
            <Search
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              strokeWidth={2.6}
            />
            Search
          </button>
        </form>

      </div>

      <div className="relative mt-10 sm:mt-12">
        {isHeroLoading ? (
          <HeroMarqueeSkeleton />
        ) : (
          <HeroPosterMarquee onSeriesSelect={onSeriesSelect} series={heroSeries} />
        )}
      </div>

      <div className="mx-auto mt-10 h-1.5 w-24 rounded-full bg-slate-700 sm:mt-12" />
    </header>
  );
}

function HeroPosterMarquee({ onSeriesSelect, series }) {
  const posterPool = useMemo(() => {
    const basePosters = series.length
      ? series
      : Array.from({ length: 8 }, (_, index) => ({
        id: `fallback-${index}`,
        name: "Featured series",
        image: { medium: fallbackPoster },
      }));

    return basePosters.slice(0, 16).map((poster, index) => ({
      ...poster,
      carouselKey: `${poster.id || poster.name}-${index}`,
    }));
  }, [series]);

  const loopPosters = [...posterPool, ...posterPool];

  return (
    <div className="relative w-full overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[#14181c] to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[#14181c] to-transparent sm:w-28" />

      <div className="animate-marquee flex w-max gap-4">
        {loopPosters.map((poster, index) => {
          const isClickable = Boolean(onSeriesSelect) && typeof poster.id === "number";

          return (
            <button
              aria-label={isClickable ? `Open details for ${poster.name}` : undefined}
              className="w-28 flex-none overflow-hidden rounded border border-slate-700 shadow-lg shadow-black/40 transition hover:-translate-y-1 hover:border-emerald-500 disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-slate-700 sm:w-36 lg:w-40"
              disabled={!isClickable}
              key={`${poster.carouselKey}-${index}`}
              onClick={() => isClickable && onSeriesSelect(poster.id)}
              type="button"
            >
              <img
                alt={`Poster for ${poster.name}`}
                className="aspect-2/3 w-full object-cover"
                src={poster.image?.medium || fallbackPoster}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroMarqueeSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="aspect-2/3 w-28 flex-none animate-pulse rounded border border-slate-800 bg-slate-800/80 sm:w-36 lg:w-40"
          key={index}
        />
      ))}
    </div>
  );
}

