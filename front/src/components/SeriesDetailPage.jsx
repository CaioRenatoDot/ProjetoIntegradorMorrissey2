import { Calendar, Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import RatingStars from "./RatingStars";
import SeriesReviewForm from "./SeriesReviewForm";
import UserAvatar from "./UserAvatar";
import { fallbackPoster } from "../data/constants";
import {
  addFavorite,
  addToWatchlist,
  getFavorites,
  getReviews,
  removeFavorite,
  saveReview,
} from "../services/api";
import { getShowById } from "../services/tvmaze";
import { cleanSummary, getGenres } from "../utils/format";

export default function SeriesDetailPage({ onBack, showId }) {
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [watchlistStatus, setWatchlistStatus] = useState("");
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteItemId, setFavoriteItemId] = useState(null);
  const [favoriteStatus, setFavoriteStatus] = useState("");
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchShowDetails() {
      setIsLoading(true);
      setError("");

      try {
        const showDetails = await getShowById(showId);
        if (isMounted) {
          setShow(showDetails);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
          setShow(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchShowDetails();

    return () => {
      isMounted = false;
    };
  }, [showId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      setIsReviewsLoading(true);
      setReviewsError("");

      try {
        const token = localStorage.getItem("watchd_token");
        const data = await getReviews(showId, token);

        if (!isMounted) return;

        setReviews(data.items);

        const myReview = data.items.find((item) => item.isMine);
        setUserRating(myReview?.rating || 0);
        setReview(myReview?.text || "");
      } catch (error) {
        if (isMounted) setReviewsError(error.message);
      } finally {
        if (isMounted) setIsReviewsLoading(false);
      }
    }

    setReviewStatus("");
    setFavoriteStatus("");
    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [showId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFavoriteState() {
      const token = localStorage.getItem("watchd_token");

      setIsFavorite(false);
      setFavoriteItemId(null);

      if (!token) {
        return;
      }

      try {
        const data = await getFavorites(token);
        const favoriteItem = data.items.find((item) => {
          return item.movieId === String(showId);
        });

        if (isMounted) {
          setIsFavorite(Boolean(favoriteItem));
          setFavoriteItemId(favoriteItem?.id || null);
        }
      } catch (error) {
        if (isMounted) {
          setFavoriteStatus(error.message);
        }
      }
    }

    fetchFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [showId]);

  function buildSeriesPayload() {
    return {
      movieId: String(show.id),
      title: show.name,
      posterUrl: show.image?.medium || show.image?.original || "",
      releaseYear: show.premiered || "",
      type: "series",
    };
  }

  async function handleSaveReview(event) {
    event.preventDefault();

    const token = localStorage.getItem("watchd_token");

    if (!token) {
      setReviewStatus("You need to be signed in to save a review.");
      return;
    }

    if (!userRating) {
      setReviewStatus("Pick a star rating before saving.");
      return;
    }

    const trimmedReview = review.trim();

    setIsSavingReview(true);
    setReviewStatus("");

    try {
      await saveReview(token, {
        ...buildSeriesPayload(),
        rating: userRating,
        text: trimmedReview,
      });

      const data = await getReviews(showId, token);

      setReviews(data.items);
      setReview(trimmedReview);
      setReviewStatus("Review saved.");
    } catch (error) {
      setReviewStatus(error.message);
    } finally {
      setIsSavingReview(false);
    }
  }


  async function handleAddToWatchlist() {
    const token = localStorage.getItem("watchd_token");

    if (!token) {
      setWatchlistStatus("You need to be signed in to add this series.");
      return;
    }

    setIsAddingToWatchlist(true);
    setWatchlistStatus("");

    try {
      await addToWatchlist(token, buildSeriesPayload());
      setWatchlistStatus("Series added to your watchlist.");
    } catch (error) {
      setWatchlistStatus(error.message);
    } finally {
      setIsAddingToWatchlist(false);
    }
  }

  async function handleToggleFavorite() {
    const token = localStorage.getItem("watchd_token");

    if (!token) {
      setFavoriteStatus("You need to be signed in to favorite this series.");
      return;
    }

    setIsFavoriteLoading(true);
    setFavoriteStatus("");

    try {
      if (isFavorite && favoriteItemId) {
        await removeFavorite(token, favoriteItemId);
        setIsFavorite(false);
        setFavoriteItemId(null);
        setFavoriteStatus("Series removed from your favorites.");
        return;
      }

      const data = await addFavorite(token, buildSeriesPayload());
      setIsFavorite(true);
      setFavoriteItemId(data.item.id);
      setFavoriteStatus("Series added to your favorites.");
    } catch (error) {
      setFavoriteStatus(error.message);
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  if (isLoading) {
    return (
      <section className="py-10">
        <BackButton onBack={onBack} />
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="aspect-[2/3] animate-pulse rounded border border-slate-700 bg-slate-800" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded bg-slate-800" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-slate-800" />
            <div className="h-32 animate-pulse rounded bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !show) {
    return (
      <section className="py-10">
        <BackButton onBack={onBack} />
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error || "Could not load series details."}
        </p>
      </section>
    );
  }

  const rating = show.rating?.average ?? "N/A";
  const releaseDate = show.premiered
    ? new Intl.DateTimeFormat("en-US").format(
        new Date(`${show.premiered}T00:00:00`)
      )
    : "Release date unavailable";
  const imdbCode = show.externals?.imdb;

  return (
    <section className="py-8">
      <BackButton onBack={onBack} />

      <div className="grid items-start gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
        <div className="relative mx-auto w-full max-w-56 self-start overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30 sm:max-w-72 md:mx-0 md:max-w-[340px]">
          <img
            className="aspect-[2/3] w-full object-cover"
            src={show.image?.original || show.image?.medium || fallbackPoster}
            alt={`Poster for ${show.name}`}
          />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-slate-950/90 px-3 py-2 text-sm font-black text-emerald-400">
            <Star size={16} fill="currentColor" />
            Rating {rating}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
            Series details
          </p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            {show.name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-300">
            <span className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-700 bg-slate-900 px-3">
              <Calendar size={16} />
              {releaseDate}
            </span>
            <span className="inline-flex min-h-9 items-center rounded border border-slate-700 bg-slate-900 px-3">
              {getGenres(show)}
            </span>
            {imdbCode && (
              <a
                className="inline-flex min-h-9 items-center rounded border border-slate-700 bg-slate-900 px-3 text-slate-300 transition hover:border-emerald-500 hover:text-white"
                href={`https://www.imdb.com/title/${imdbCode}/`}
                rel="noreferrer"
                target="_blank"
              >
                IMDb
              </a>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="min-h-11 rounded bg-[#00c030] px-5 font-black text-white transition hover:bg-[#32d85a] disabled:cursor-not-allowed disabled:bg-zinc-700"
              disabled={isAddingToWatchlist}
              onClick={handleAddToWatchlist}
              type="button"
            >
              {isAddingToWatchlist ? "Adding..." : "Add to Watchlist"}
            </button>
            <button
              className={`inline-flex min-h-11 items-center gap-2 rounded border px-5 font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isFavorite
                  ? "border-[#00c030] bg-[#00c030]/10 text-[#00c030] hover:bg-[#00c030]/20"
                  : "border-slate-700 text-slate-200 hover:border-[#00c030] hover:text-white"
              }`}
              disabled={isFavoriteLoading}
              onClick={handleToggleFavorite}
              type="button"
            >
              <Heart
                aria-hidden="true"
                className="h-4 w-4"
                fill={isFavorite ? "currentColor" : "none"}
              />
              {isFavoriteLoading ? "Saving..." : isFavorite ? "Favorited" : "Favorite"}
            </button>
          </div>

          {(watchlistStatus || favoriteStatus) && (
            <div className="mt-3 space-y-1 text-sm font-bold text-slate-300">
              {watchlistStatus && <p>{watchlistStatus}</p>}
              {favoriteStatus && <p>{favoriteStatus}</p>}
            </div>
          )}

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400">
            {cleanSummary(show.summary)}
          </p>

          <SeriesReviewForm
            isSaving={isSavingReview}
            onReviewChange={setReview}
            onSave={handleSaveReview}
            onStarClick={setUserRating}
            review={review}
            status={reviewStatus}
            userRating={userRating}
          />
        </div>
      </div>

      <section className="mt-10 border-t border-slate-800 pt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-400">
              Community
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">Reviews</h2>
          </div>
          {!isReviewsLoading && (
            <p className="text-sm font-bold text-slate-500">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>

        {reviewsError && (
          <p className="mt-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
            {reviewsError}
          </p>
        )}

        {isReviewsLoading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                className="h-36 animate-pulse rounded border border-slate-800 bg-slate-900"
                key={index}
              />
            ))}
          </div>
        ) : reviews.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {reviews.map((item) => (
              <ReviewCard key={item.id} review={item} />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded border border-slate-800 bg-slate-950/60 px-5 py-8 text-center text-sm font-bold text-slate-400">
            No reviews yet. Be the first to share your thoughts about this series.
          </p>
        )}
      </section>
    </section>
  );
}

function ReviewCard({ review }) {
  const reviewDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(review.updatedAt)
  );

  return (
    <article className="flex flex-col rounded border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={review.user.name} size="sm" />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-black text-white">
              {review.user.name}
              {review.isMine && (
                <span className="rounded bg-[#00c030]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#32d85a]">
                  Your review
                </span>
              )}
            </p>
            <p className="text-xs font-bold text-slate-500">{reviewDate}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size={14} />
      </div>

      {review.text && (
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{review.text}</p>
      )}
    </article>
  );
}
