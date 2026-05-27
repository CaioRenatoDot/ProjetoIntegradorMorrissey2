import { Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import SeriesReviewForm from "./SeriesReviewForm";
import { fallbackPoster } from "../data/constants";
import { getShowById } from "../services/tvmaze";
import { cleanSummary, getGenres } from "../utils/format";
import { getSeriesReview, saveSeriesReview } from "../utils/seriesReviews";

export default function SeriesDetailPage({ onBack, showId }) {
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

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
    const savedReview = getSeriesReview(showId);

    setUserRating(savedReview?.rating || 0);
    setReview(savedReview?.review || "");
    setReviewStatus("");
  }, [showId]);

  function handleSaveReview(event) {
    event.preventDefault();

    const trimmedReview = review.trim();

    saveSeriesReview(showId, {
      rating: userRating,
      review: trimmedReview,
    });
    setReview(trimmedReview);
    setReviewStatus("Review saved.");
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

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400">
            {cleanSummary(show.summary)}
          </p>

          <SeriesReviewForm
            onReviewChange={setReview}
            onSave={handleSaveReview}
            onStarClick={setUserRating}
            review={review}
            status={reviewStatus}
            userRating={userRating}
          />
        </div>
      </div>
    </section>
  );
}
