import { useEffect, useMemo, useState } from "react";
import { fallbackPoster } from "../data/constants";

const carouselInterval = 3200;
const drumSlots = [
  {
    className:
      "pointer-events-none -left-[34%] top-[24%] z-0 w-[32%] rotate-[-18deg] opacity-0",
    imageClassName: "border-slate-800",
    offset: -2,
  },
  {
    className:
      "left-[4%] top-[18%] z-10 w-[34%] rotate-[-10deg] opacity-85",
    imageClassName: "border-slate-700",
    offset: -1,
  },
  {
    className:
      "left-[30%] top-0 z-20 w-[40%] rotate-0 opacity-100 shadow-emerald-950/40",
    imageClassName: "border-emerald-500/70",
    offset: 0,
  },
  {
    className:
      "left-[62%] top-[18%] z-10 w-[34%] rotate-[10deg] opacity-85",
    imageClassName: "border-slate-700",
    offset: 1,
  },
  {
    className:
      "pointer-events-none left-[102%] top-[24%] z-0 w-[32%] rotate-[18deg] opacity-0",
    imageClassName: "border-slate-800",
    offset: 2,
  },
];

export default function Hero({
  isLoading,
  onSearchSubmit,
  query,
  series,
  setQuery,
}) {
  return (
    <header
      id="catalog"
      className="relative left-1/2 mb-10 min-h-[calc(100vh-64px)] w-screen -translate-x-1/2 overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#10151a_0%,#14181c_78%)] px-4 pb-10"
    >
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center py-10">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
            Series catalog
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Find something to watch
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Explore a random selection of titles or search by name to find a
            specific result.
          </p>

          <form
            id="search"
            className="mt-8 flex flex-col gap-3 rounded border border-slate-700 bg-slate-950/80 p-3 shadow-2xl shadow-black/30 backdrop-blur sm:max-w-2xl sm:flex-row"
            onSubmit={onSearchSubmit}
          >
            <label className="sr-only" htmlFor="series-search">
              Search series
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
            <button className="min-h-11 rounded bg-[#00c030] px-6 font-black text-white transition hover:bg-emerald-400">
              Search
            </button>
          </form>
        </div>

        <div className="relative min-h-[360px] self-center overflow-hidden lg:min-h-[560px]">
          {isLoading ? <HeroPosterSkeleton /> : <HeroPosterCarousel series={series} />}

          <div className="absolute bottom-0 left-0 right-0 z-20 mx-auto grid max-w-md grid-cols-3 gap-3 rounded border border-slate-700 bg-slate-950/85 p-3 shadow-2xl shadow-black/40 backdrop-blur">
            <Metric label="Results" value={series.length} />
            <Metric label="Data" value="TVMaze" />
            <Metric label="Search" value="Live" valueClassName="text-[#00c030]" />
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroPosterCarousel({ series }) {
  const posterPool = useMemo(
    () => {
      const basePosters = series.length
        ? series
        : [
            {
              id: "fallback-1",
              name: "Featured series",
              image: { medium: fallbackPoster },
            },
            {
              id: "fallback-2",
              name: "Recommended series",
              image: { medium: fallbackPoster },
            },
            {
              id: "fallback-3",
              name: "Popular series",
              image: { medium: fallbackPoster },
            },
          ];

      const carouselPosters =
        basePosters.length >= drumSlots.length
          ? basePosters
          : Array.from(
              { length: drumSlots.length },
              (_, index) => basePosters[index % basePosters.length]
            );

      return carouselPosters.map((poster, index) => ({
        ...poster,
        carouselKey: `${poster.id || poster.name}-${index}`,
      }));
    },
    [series]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [posterPool]);

  useEffect(() => {
    if (posterPool.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex(
        (currentIndex) => (currentIndex + 1) % posterPool.length
      );
    }, carouselInterval);

    return () => window.clearInterval(interval);
  }, [posterPool.length]);

  return (
    <div className="absolute inset-0">

      {drumSlots.map((slot) => {
        const poster =
          posterPool[
            (activeIndex + slot.offset + posterPool.length) % posterPool.length
          ];

        return (
          <PosterPreview
            altName={poster?.name || "featured"}
            className={`absolute origin-center transition-all duration-700 ease-in-out ${slot.className}`}
            imageClassName={`${slot.imageClassName} bg-slate-950 shadow-black/50`}
            key={poster?.carouselKey}
            poster={poster?.image?.medium}
          />
        );
      })}
    </div>
  );
}

function HeroPosterSkeleton() {
  return (
    <div className="absolute inset-0">
      <PosterSkeleton className="absolute left-0 top-8 w-[38%] rotate-[-8deg] opacity-85 sm:left-8 lg:left-0 lg:top-16" />
      <PosterSkeleton
        className="absolute left-[28%] top-0 z-10 w-[44%]"
        highlight
      />
      <PosterSkeleton className="absolute right-0 top-12 w-[34%] rotate-[7deg] opacity-85 sm:right-8 lg:right-0 lg:top-24" />
    </div>
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

function PosterSkeleton({ className, highlight = false }) {
  return (
    <div className={className} aria-hidden="true">
      <div
        className={`aspect-[2/3] w-full animate-pulse rounded border bg-slate-800/90 shadow-2xl ${
          highlight
            ? "border-emerald-500/40 shadow-emerald-950/30"
            : "border-slate-700 shadow-black/50"
        }`}
      />
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
        alt={`Poster for ${altName}`}
      />
    </div>
  );
}
