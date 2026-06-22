import { CalendarDays, MessageSquareQuote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackPoster } from "../data/constants";
import { getMyReviews } from "../services/api";
import Modal from "./Modal";
import UserAvatar from "./UserAvatar";

export default function DiaryPage({ currentUserName, isLoggedIn, onSeriesSelect }) {
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
        setError("Sign in again to load your activity.");
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

  const groupedReviews = groupReviewsByDate(reviews);

  return (
    <section id="diary" className="py-8 sm:py-12">
      <header className="mb-8 border-b border-slate-800 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Diary
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          User Activity Log
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          A running history of what you've watched, rated and reviewed.
        </p>
      </header>

      {!isLoggedIn ? (
        <EmptyState
          description="Sign in to see your reviews here."
          title="You need to be signed in"
        />
      ) : error ? (
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="h-28 animate-pulse rounded border border-slate-800 bg-slate-900"
              key={index}
            />
          ))}
        </div>
      ) : groupedReviews.length ? (
        <div className="space-y-10">
          {groupedReviews.map((group) => (
            <section key={group.date}>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[#00c030]/50 bg-[#00c030]/10 text-[#00c030]">
                  <CalendarDays className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                  {group.date}
                </h2>
                <span className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              <div className="divide-y divide-slate-800 overflow-hidden rounded border border-slate-800 bg-slate-950 shadow-xl shadow-black/20">
                {group.items.map((item) => (
                  <DiaryEntry
                    currentUserName={currentUserName}
                    key={item.id}
                    onSeriesSelect={onSeriesSelect}
                    review={item}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Rate and review a series to start your diary."
          title="No logs yet"
        />
      )}
    </section>
  );
}

function DiaryEntry({ currentUserName, onSeriesSelect, review }) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const posterUrl = review.posterUrl || fallbackPoster;
  const isClickable = Boolean(review.movieId && onSeriesSelect);
  const isLongReview = (review.text || "").length > 160;

  function handleOpenSeries(event) {
    event.stopPropagation();
    if (isClickable) onSeriesSelect(Number(review.movieId));
  }

  return (
    <article
      className="group flex cursor-pointer gap-4 p-4 transition hover:bg-slate-900/60 sm:gap-5 sm:p-5"
      onClick={() => setIsReviewOpen(true)}
    >
      <button
        aria-label={isClickable ? `Open details for ${review.title}` : undefined}
        className="block flex-none overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-lg shadow-black/30 transition group-hover:border-[#00c030] disabled:cursor-default"
        disabled={!isClickable}
        onClick={handleOpenSeries}
        type="button"
      >
        <img
          alt={`Poster for ${review.title}`}
          className="h-24 w-16 object-cover sm:h-28 sm:w-20"
          src={posterUrl}
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <UserAvatar name={currentUserName} size="sm" />
          <p className="text-sm font-bold text-slate-300">
            <span className="text-white">{currentUserName}</span>{" "}
            <span className="text-slate-500">reviewed</span>
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <button
            className="text-left text-lg font-black text-white transition group-hover:text-[#32d85a] disabled:cursor-default disabled:group-hover:text-white"
            disabled={!isClickable}
            onClick={handleOpenSeries}
            type="button"
          >
            {review.title}
          </button>
          <StarRating rating={review.rating} />
        </div>

        {review.text && (
          <p className="mt-2 flex gap-2 text-sm leading-6 text-slate-400">
            <MessageSquareQuote
              aria-hidden="true"
              className="mt-1 h-4 w-4 flex-none text-slate-600"
            />
            <span className={isLongReview ? "line-clamp-3" : undefined}>
              {review.text}
            </span>
          </p>
        )}
      </div>

      {isReviewOpen && (
        <Modal onClose={() => setIsReviewOpen(false)} title={review.title}>
          <div className="flex gap-5">
            <img
              alt={`Poster for ${review.title}`}
              className="h-48 w-32 flex-none rounded border border-slate-700 object-cover shadow-lg shadow-black/40"
              src={posterUrl}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <UserAvatar name={currentUserName} size="md" />
                <p className="text-base font-bold text-slate-300">
                  <span className="text-white">{currentUserName}</span>{" "}
                  <span className="text-slate-500">reviewed</span>
                </p>
              </div>
              <div className="mt-4">
                <StarRating rating={review.rating} size={24} />
              </div>
            </div>
          </div>

          {review.text && (
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-300">
              {review.text}
            </p>
          )}
        </Modal>
      )}
    </article>
  );
}

function StarRating({ rating, size = 18 }) {
  return (
    <div className="flex gap-0.5 text-[#00c030]" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isSelected = index < rating;

        return (
          <Star
            fill={isSelected ? "currentColor" : "none"}
            key={index}
            size={size}
          />
        );
      })}
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

function groupReviewsByDate(reviews) {
  const groups = new Map();

  reviews.forEach((review) => {
    const dateKey = new Date(review.updatedAt).toDateString();

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }

    groups.get(dateKey).push(review);
  });

  return Array.from(groups, ([dateKey, items]) => ({
    date: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(
      new Date(dateKey)
    ),
    items,
  }));
}
