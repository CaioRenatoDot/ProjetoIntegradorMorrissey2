import { useEffect, useState } from "react";
import { fallbackPoster } from "../data/constants";
import { getMyReviews } from "../services/api";
import BackButton from "./BackButton";
import RatingStars from "./RatingStars";

export default function MySeriesPage({ isLoggedIn, onBack, onSeriesSelect }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchMyReviews() {
      if (!isLoggedIn) {
        setReviews([]);
        setError("");
        return;
      }

      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setReviews([]);
        setError("Sign in again to load your series.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getMyReviews(token);
        if (isMounted) setReviews(data.items);
      } catch (requestError) {
        if (isMounted) {
          setReviews([]);
          setError(requestError.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMyReviews();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  return (
    <section id="series" className="py-6 sm:py-10">
      <BackButton onBack={onBack} />

      <header className="mb-6 border-b border-slate-800 pb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Series
        </p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
          Series You've Watched
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Every series you've rated and reviewed, all in one place.
        </p>
      </header>

      {!isLoggedIn ? (
        <EmptyState
          description="Sign in to see your watched series here."
          title="You need to be signed in"
        />
      ) : error ? (
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      ) : isLoading ? (
        <PosterSkeletonGrid />
      ) : reviews.length ? (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Watched
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {reviews.length} {reviews.length === 1 ? "series" : "series"}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))] sm:gap-3">
            {reviews.map((item, index) => (
              <div
                className="animate-slide-in-up"
                key={item.id}
                style={{ animationDelay: `${(index % 18) * 40}ms` }}
              >
                <SeriesCard item={item} onSeriesSelect={onSeriesSelect} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          description="Rate and review a series to see it appear here."
          title="No series logged yet"
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
      <div className="mt-1 flex justify-center">
        <RatingStars rating={item.rating} size={11} />
      </div>
    </article>
  );
}

function PosterSkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))] sm:gap-3">
      {Array.from({ length: 18 }, (_, index) => (
        <div key={index}>
          <div className="aspect-[2/3] animate-pulse rounded border border-slate-800 bg-slate-900" />
          <div className="mx-auto mt-1.5 h-2.5 w-3/5 animate-pulse rounded bg-slate-800" />
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
