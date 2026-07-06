import { AlignLeft, Heart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackPoster } from "../data/constants";
import { deleteReview, getFavorites, getMyReviews } from "../services/api";
import BackButton from "./BackButton";
import Modal from "./Modal";
import RatingStars from "./RatingStars";
import UserAvatar from "./UserAvatar";

const rowGridClass =
  "grid grid-cols-[3rem_2.25rem_minmax(0,1fr)_5.5rem_2.75rem] items-center gap-3 px-3 sm:grid-cols-[4rem_2.5rem_minmax(0,1fr)_4.5rem_7rem_4.5rem_4rem] sm:gap-4 sm:px-5";

export default function DiaryPage({ currentUserName, isLoggedIn, onBack, onSeriesSelect }) {
  const [reviews, setReviews] = useState([]);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDiaryData() {
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

      try {
        const favoritesData = await getFavorites(token);
        if (isMounted) {
          setFavoriteMovieIds(new Set(favoritesData.items.map((item) => item.movieId)));
        }
      } catch {
      }
    }

    fetchDiaryData();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  async function handleDeleteReview(reviewId) {
    const token = localStorage.getItem("watchd_token");
    if (!token) return false;

    if (!window.confirm("Delete this review? This cannot be undone.")) return false;

    setDeletingReviewId(reviewId);
    setError("");

    try {
      await deleteReview(token, reviewId);
      setReviews((currentReviews) => currentReviews.filter((item) => item.id !== reviewId));
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setDeletingReviewId(null);
    }
  }

  const diaryRows = buildDiaryRows(reviews);

  return (
    <section id="diary" className="py-8 sm:py-12">
      <BackButton onBack={onBack} />

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
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="h-16 animate-pulse rounded border border-slate-800 bg-slate-900"
              key={index}
            />
          ))}
        </div>
      ) : diaryRows.length ? (
        <div className="overflow-hidden rounded border border-slate-800 bg-slate-950 shadow-xl shadow-black/20">
          <div
            className={`${rowGridClass} border-b border-slate-800 bg-slate-900/80 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500`}
          >
            <p>Month</p>
            <p>Day</p>
            <p>Series</p>
            <p className="hidden sm:block">Released</p>
            <p>Rating</p>
            <p className="hidden text-center sm:block">Fav.</p>
            <p className="text-center">Review</p>
          </div>

          <div className="divide-y divide-slate-800/80">
            {diaryRows.map((row) => (
              <DiaryRow
                currentUserName={currentUserName}
                isDeleting={deletingReviewId === row.review.id}
                isFavorite={favoriteMovieIds.has(row.review.movieId)}
                key={row.review.id}
                onDelete={handleDeleteReview}
                onSeriesSelect={onSeriesSelect}
                review={row.review}
                showMonth={row.showMonth}
              />
            ))}
          </div>
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

function DiaryRow({
  currentUserName,
  isDeleting,
  isFavorite,
  onDelete,
  onSeriesSelect,
  review,
  showMonth,
}) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const posterUrl = review.posterUrl || fallbackPoster;
  const isClickable = Boolean(review.movieId && onSeriesSelect);

  const entryDate = new Date(review.updatedAt);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short" }).format(entryDate);
  const dayLabel = String(entryDate.getDate()).padStart(2, "0");
  const releasedYear = (review.releaseYear || "").slice(0, 4);

  function handleOpenSeries() {
    if (isClickable) onSeriesSelect(Number(review.movieId));
  }

  return (
    <div className={`${rowGridClass} group py-2.5 transition hover:bg-slate-900/60`}>
      <div>
        {showMonth && (
          <div className="w-12 rounded-md border border-slate-700 bg-slate-800 py-1.5 text-center shadow-md shadow-black/40 sm:w-14">
            <p className="text-xs font-black uppercase leading-tight tracking-wide text-slate-100">
              {monthLabel}
            </p>
            <p className="text-[10px] font-bold leading-tight text-slate-400">
              {entryDate.getFullYear()}
            </p>
          </div>
        )}
      </div>

      <p className="text-xl font-light text-slate-500 sm:text-2xl">{dayLabel}</p>

      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label={isClickable ? `Open details for ${review.title}` : undefined}
          className="block h-14 w-10 flex-none overflow-hidden rounded border border-slate-700 bg-slate-900 shadow shadow-black/30 transition group-hover:border-[#00c030] disabled:cursor-default"
          disabled={!isClickable}
          onClick={handleOpenSeries}
          type="button"
        >
          <img
            alt={`Poster for ${review.title}`}
            className="h-full w-full object-cover"
            src={posterUrl}
          />
        </button>
        <button
          className="truncate text-left text-base font-black text-white transition hover:text-[#32d85a] disabled:cursor-default disabled:hover:text-white sm:text-lg"
          disabled={!isClickable}
          onClick={handleOpenSeries}
          type="button"
        >
          {review.title}
        </button>
      </div>

      <p className="hidden text-sm font-bold text-slate-400 sm:block">{releasedYear}</p>

      <RatingStars rating={review.rating} size={14} />

      <div className="hidden justify-center sm:flex">
        <Heart
          aria-label={isFavorite ? "Favorite" : undefined}
          className={`h-4 w-4 ${isFavorite ? "fill-current text-orange-500" : "text-slate-700"}`}
        />
      </div>

      <div className="flex justify-center">
        <button
          aria-label={`Open review of ${review.title}`}
          className={`grid h-8 w-8 place-items-center rounded transition hover:bg-slate-800 hover:text-white ${
            review.text ? "text-slate-400" : "text-slate-700"
          }`}
          onClick={() => setIsReviewOpen(true)}
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
      </div>

      {isReviewOpen && (
        <Modal onClose={() => setIsReviewOpen(false)} title={review.title}>
          <div className="flex gap-5">
            <div className="relative h-48 w-32 flex-none">
              <img
                alt={`Poster for ${review.title}`}
                className="h-full w-full rounded border border-slate-700 object-cover shadow-lg shadow-black/40"
                src={posterUrl}
              />
              {onDelete && (
                <button
                  aria-label="Delete review"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-red-300 backdrop-blur transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isDeleting}
                  onClick={async () => {
                    const deleted = await onDelete(review.id);
                    if (deleted) setIsReviewOpen(false);
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <UserAvatar name={currentUserName} size="md" />
                <p className="text-base font-bold text-slate-300">
                  <span className="text-white">{currentUserName}</span>{" "}
                  <span className="text-slate-500">reviewed</span>
                </p>
              </div>
              <div className="mt-4">
                <RatingStars rating={review.rating} size={24} />
              </div>

              {review.text && (
                <p className="mt-4 whitespace-pre-line wrap-break-word text-base leading-7 text-slate-300">
                  {review.text}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
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

function buildDiaryRows(reviews) {
  let lastMonthKey = null;

  return reviews.map((review) => {
    const entryDate = new Date(review.updatedAt);
    const monthKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}`;
    const showMonth = monthKey !== lastMonthKey;
    lastMonthKey = monthKey;

    return { review, showMonth };
  });
}
