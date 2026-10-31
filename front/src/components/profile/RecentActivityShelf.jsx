import { Heart, ListChecks } from "lucide-react";
import { fallbackPoster } from "../../data/constants";
import RatingStars from "../RatingStars";
import { EmptyState, PosterSkeletonGrid, ProfileShelfHeader } from "./ProfileShared";

export default function RecentActivityShelf({ error, isLoading, items, onSeriesSelect }) {
  return (
    <section>
      <ProfileShelfHeader
        action={
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
            All
          </span>
        }
        title="Recent Activity"
      />

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <PosterSkeletonGrid count={4} variant="large" />
      ) : items.length ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {items.map((item) => (
            <ActivityCard
              item={item}
              key={item.movieId}
              onSeriesSelect={onSeriesSelect}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recent activity yet"
          description="Rate or review a series to make it appear here."
        />
      )}
    </section>
  );
}

function ActivityCard({ item, onSeriesSelect }) {
  return (
    <article className="group min-w-0">
      <button
        aria-label={`Open details for ${item.title}`}
        className="block w-full text-left"
        onClick={() => onSeriesSelect?.(Number(item.movieId), "profile")}
        type="button"
      >
        <div className="overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030]">
          <img
            alt={`Poster for ${item.title}`}
            className="aspect-[2/3] w-full object-cover"
            src={item.posterUrl || fallbackPoster}
          />
        </div>
        <div className="mt-2 flex items-center gap-1 text-slate-500">
          <RatingStars rating={item.rating} size={14} />
          {item.review && (
            <Heart
              aria-hidden="true"
              className="ml-1 h-3.5 w-3.5"
              fill="currentColor"
            />
          )}
          <ListChecks aria-hidden="true" className="h-3.5 w-3.5" />
        </div>
      </button>
    </article>
  );
}
