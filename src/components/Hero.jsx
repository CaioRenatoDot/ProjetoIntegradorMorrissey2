import { useEffect, useMemo, useState } from "react";
import { fallbackPoster } from "../data/constants";
import { getMostPopularShows } from "../services/tvmaze";

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
      className="relative left-1/2 mb-6 flex min-h-[calc(100vh-64px)] w-[100dvw] -translate-x-1/2 items-center overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#10151a_0%,#14181c_78%)] px-4 py-8 pb-8 sm:py-10 sm:pb-10 lg:py-0 lg:pb-8"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col">
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
            className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/85 p-2 shadow-2xl shadow-black/30 backdrop-blur transition focus-within:border-[#00c030] focus-within:ring-4 focus-within:ring-[#00c030]/15"
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
            <button className="min-h-11 flex-none rounded-md bg-[#00c030] px-4 text-sm font-black text-white transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:px-6 sm:text-base">
              Search
            </button>
          </form>
        </div>

        <div className="relative min-h-[360px] self-center overflow-hidden lg:min-h-[560px]">
          {isHeroLoading ? (
            <HeroPosterSkeleton />
          ) : (
            <HeroPosterCarousel series={heroSeries} />
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20 mx-auto grid max-w-md grid-cols-3 gap-3 rounded border border-slate-700 bg-slate-950/85 p-3 shadow-2xl shadow-black/40 backdrop-blur">
            <Metric label="Series" value="10K+" />
            <Metric label="Genres" value="80+" />
            <Metric label="Discover" value="Now" valueClassName="text-[#00c030]" />
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
  const animatedValue = useAnimatedMetric(value);

  return (
    <div className="text-center">
      <p className={`text-xl font-black ${valueClassName}`}>{animatedValue}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function useAnimatedMetric(value) {
  const metric = useMemo(() => parseMetricValue(value), [value]);
  const [displayValue, setDisplayValue] = useState(metric.initialValue);

  useEffect(() => {
    setDisplayValue(metric.initialValue);

    if (!metric.canAnimate) {
      setDisplayValue(metric.finalValue);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayValue(metric.finalValue);
      return undefined;
    }

    const duration = 2400;
    let animationFrame;
    let startTime;

    function animate(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(metric.number * easedProgress);

      setDisplayValue(`${currentValue}${metric.suffix}`);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [metric]);

  return displayValue;
}

function parseMetricValue(value) {
  if (typeof value !== "string") {
    return {
      canAnimate: false,
      finalValue: value,
      initialValue: value,
    };
  }

  const match = value.match(/^(\d+)(.*)$/);

  if (!match) {
    return {
      canAnimate: false,
      finalValue: value,
      initialValue: value,
    };
  }

  const number = Number(match[1]);
  const suffix = match[2];

  return {
    canAnimate: Number.isFinite(number),
    finalValue: value,
    initialValue: `0${suffix}`,
    number,
    suffix,
  };
}

function PosterSkeleton({ className, highlight = false }) {
  return (
    <div className={className} aria-hidden="true">
      <div
        className={`aspect-[2/3] w-full animate-pulse rounded border bg-slate-800/90 shadow-2xl ${highlight
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
