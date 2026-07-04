import { useEffect, useState } from "react";
import { fallbackPoster } from "../data/constants";
import { getWatchlist } from "../services/api";

export default function MyWatchlistPage({ isLoggedIn, onSeriesSelect }) {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchWatchlist() {
      if (!isLoggedIn) {
        setWatchlistItems([]);
        setError("");
        return;
      }

      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setWatchlistItems([]);
        setError("Sign in again to load your watchlist.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getWatchlist(token);
        if (isMounted) setWatchlistItems(data.items);
      } catch (requestError) {
        if (isMounted) {
          setWatchlistItems([]);
          setError(requestError.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchWatchlist();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  return (
    <section id="watchlist" className="py-6 sm:py-10">
      <header className="mb-6 border-b border-slate-800 pb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Watchlist
        </p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
          Series You Want to Watch
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Every series you've saved to watch later, all in one place.
        </p>
      </header>

      {!isLoggedIn ? (
        <EmptyState
          description="Sign in to see your watchlist here."
          title="You need to be signed in"
        />
      ) : error ? (
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      ) : isLoading ? (
        <PosterSkeletonGrid />
      ) : watchlistItems.length ? (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              To Watch
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {watchlistItems.length} {watchlistItems.length === 1 ? "series" : "series"}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))] sm:gap-3">
            {watchlistItems.map((item) => (
              <SeriesCard item={item} key={item.id} onSeriesSelect={onSeriesSelect} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          description="Add a series to your watchlist to see it appear here."
          title="No series saved yet"
        />
      )}
    </section>
  );
}

function SeriesCard({ item, onSeriesSelect }) {
  const isClickable = Boolean(item.movieId && onSeriesSelect);

  return (
    <article className="group min-w-0">
      <button
        aria-label={isClickable ? `Open details for ${item.title}` : undefined}
        className="block w-full text-left disabled:cursor-default"
        disabled={!isClickable}
        onClick={() => isClickable && onSeriesSelect(Number(item.movieId))}
        title={item.title}
        type="button"
      >
        <div className="overflow-hidden rounded border border-slate-800 bg-slate-950 shadow-md shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030]">
          <img
            alt={`Poster for ${item.title}`}
            className="aspect-[2/3] w-full object-cover"
            src={item.posterUrl || fallbackPoster}
          />
        </div>
      </button>
    </article>
  );
}

function PosterSkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))] sm:gap-3">
      {Array.from({ length: 18 }, (_, index) => (
        <div key={index}>
          <div className="aspect-[2/3] animate-pulse rounded border border-slate-800 bg-slate-900" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ description, title }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
