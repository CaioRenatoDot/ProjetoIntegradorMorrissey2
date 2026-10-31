import { GripVertical } from "lucide-react";
import { useState } from "react";
import { fallbackPoster } from "../../data/constants";
import Confetti from "../Confetti";
import { EmptyState, PosterSkeletonGrid, ProfileShelfHeader } from "./ProfileShared";

const favoriteLimit = 4;

export default function FavoriteShelf({
  draggedFavoriteId,
  error,
  favoriteItems,
  isAdjusting,
  isLoading,
  onAdjustToggle,
  onDragEnd,
  onDragStart,
  onDrop,
  onSeriesSelect,
  readOnly,
}) {
  const visibleFavoriteItems = favoriteItems.slice(0, favoriteLimit);
  const emptySlotCount = Math.max(favoriteLimit - visibleFavoriteItems.length, 0);
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <section className="relative">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <ProfileShelfHeader
        action={
          readOnly ? null : (
            <button
              className="min-h-8 rounded border border-slate-700 px-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={favoriteItems.length < 2 || isLoading}
              onClick={() => {
                // So comemora ao FINALIZAR o reordenamento (DONE), nao ao
                // entrar no modo de ajuste.
                if (isAdjusting) setShowConfetti(true);
                onAdjustToggle();
              }}
              type="button"
            >
              {isAdjusting ? "DONE" : "ADJUST ORDER"}
            </button>
          )
        }
        title="Favorite Series"
      />

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <PosterSkeletonGrid count={4} variant="large" />
      ) : visibleFavoriteItems.length ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {visibleFavoriteItems.map((item) => (
            <button
              aria-label={`Open details for ${item.title}`}
              className={`group min-w-0 text-left ${
                isAdjusting ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              draggable={isAdjusting}
              key={item.id}
              onClick={() => {
                if (!isAdjusting) onSeriesSelect?.(Number(item.movieId), "profile");
              }}
              onDragEnd={onDragEnd}
              onDragOver={(event) => {
                if (isAdjusting) event.preventDefault();
              }}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                onDragStart(item.movieId);
              }}
              onDrop={(event) => {
                event.preventDefault();
                onDrop(item.movieId);
              }}
              type="button"
            >
              <div
                className={`relative overflow-hidden rounded border bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030] ${
                  draggedFavoriteId === item.movieId
                    ? "border-[#00c030] opacity-60"
                    : "border-slate-700"
                }`}
              >
                {isAdjusting && (
                  <span className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded bg-slate-950/90 text-[#00c030]">
                    <GripVertical aria-hidden="true" className="h-4 w-4" />
                  </span>
                )}
                <img
                  alt={`Poster for ${item.title}`}
                  className="aspect-[2/3] w-full object-cover"
                  src={item.posterUrl || fallbackPoster}
                />
              </div>
            </button>
          ))}

          {Array.from({ length: emptySlotCount }, (_, index) => (
            <div
              className="grid aspect-[2/3] place-items-center rounded border border-dashed border-slate-800 bg-slate-950/60 text-center"
              key={`empty-favorite-${index}`}
            >
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Empty slot
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No favorite series yet"
          description="Open a series detail page and mark it as Favorite."
        />
      )}
    </section>
  );
}
