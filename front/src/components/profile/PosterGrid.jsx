import { Trash2 } from "lucide-react";
import { fallbackPoster } from "../../data/constants";
import { EmptyState } from "./ProfileShared";

export default function PosterGrid({
  emptyDescription,
  emptyTitle,
  isExpanded = true,
  items,
  onExpand,
  onRemoveItem,
  onSeriesSelect,
  previewLimit,
  removingItemId,
}) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const hasMoreItems = !isExpanded && previewLimit && items.length > previewLimit;
  const visibleItems = hasMoreItems ? items.slice(0, previewLimit) : items;
  const hiddenItemsCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(82px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(104px,1fr))]">
      {visibleItems.map((item) => (
        <div className="group min-w-0" key={item.id || item.movieId}>
          <div className="relative">
            <button
              aria-label={`Open details for ${item.title}`}
              className="block w-full text-left"
              onClick={() => onSeriesSelect?.(Number(item.movieId), "profile")}
              type="button"
            >
              <div className="overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030] group-hover:shadow-[#00c030]/10">
                <img
                  alt={`Poster for ${item.title}`}
                  className="aspect-[2/3] w-full object-cover"
                  src={item.posterUrl || fallbackPoster}
                />
              </div>
            </button>

            {onRemoveItem && (
              <button
                aria-label={`Remove ${item.title} from Watchlist`}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-red-400/40 bg-slate-950/90 text-red-200 opacity-100 shadow-lg shadow-black/40 transition hover:border-red-300 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                disabled={removingItemId === item.id}
                onClick={() => onRemoveItem(item.id)}
                title="Remove from Watchlist"
                type="button"
              >
                {removingItemId === item.id ? (
                  <span className="text-xs font-black">...</span>
                ) : (
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-200">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {item.releaseYear || item.type}
          </p>
        </div>
      ))}

      {hasMoreItems && (
        <button
          aria-label="View full Watchlist"
          className="group grid aspect-[2/3] place-items-center rounded border border-slate-800 bg-slate-950 text-center transition hover:border-[#00c030] hover:bg-slate-900"
          onClick={onExpand}
          type="button"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-slate-700 bg-[#14181c] text-3xl font-black leading-none text-slate-300 transition group-hover:border-[#00c030] group-hover:text-[#32d85a]">
            ...
          </span>
          <span className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {hiddenItemsCount} more
          </span>
        </button>
      )}
    </div>
  );
}
