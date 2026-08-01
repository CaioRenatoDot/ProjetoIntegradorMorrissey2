import { Star } from "lucide-react";
import { fallbackPoster } from "../data/constants";
import { cleanSummary, getGenres } from "../utils/format";

export default function SearchResultsPage({
  error,
  isLoading,
  onSeriesSelect,
  searchTerm,
  series,
}) {
  const normalizedTerm = searchTerm ? `"${searchTerm}"` : "your search";

  return (
    <section className="mx-auto max-w-6xl py-8 sm:py-11">
      <header className="mb-6 border-b border-slate-700 pb-3">
        <h1 className="text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
          Showing matches for {normalizedTerm}
        </h1>
      </header>

      {error && (
        <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <SearchSkeletonList />
      ) : series.length ? (
        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {series.map((show) => (
            <SearchResultRow
              key={show.id}
              onSelect={() => onSeriesSelect(show.id, "search")}
              show={show}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-slate-800 bg-slate-950 px-5 py-12 text-center">
          <h2 className="text-lg font-black text-white">No series found</h2>
          <p className="mt-2 text-sm text-slate-400">
            Try another title in the search bar.
          </p>
        </div>
      )}
    </section>
  );
}

function SearchResultRow({ onSelect, show }) {
  const rating = show.rating?.average ?? "N/A";
  const year = show.premiered
    ? new Date(`${show.premiered}T00:00:00`).getFullYear()
    : "TBA";

  return (
    <article className="group py-4">
      <button
        className="grid w-full grid-cols-[64px_1fr] gap-4 text-left sm:grid-cols-[74px_1fr_auto] sm:items-center"
        onClick={onSelect}
        type="button"
      >
        <div className="overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-lg shadow-black/30 transition group-hover:border-[#00c030]">
          <img
            alt={`Poster for ${show.name}`}
            className="aspect-[2/3] w-full object-cover"
            src={show.image?.medium || show.image?.original || fallbackPoster}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="text-base font-semibold leading-6 text-white transition group-hover:text-[#32d85a] sm:text-lg">
              {show.name}
            </h2>
            <span className="text-sm font-bold text-slate-500">{year}</span>
          </div>
          <p className="mt-1 truncate text-xs font-bold uppercase tracking-wide text-slate-500">
            {getGenres(show)}
          </p>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-400">
            {cleanSummary(show.summary)}
          </p>
        </div>

        <div className="col-start-2 flex flex-wrap items-center gap-3 sm:col-start-auto sm:justify-end">
          <span className="inline-flex min-h-8 items-center gap-1 rounded border border-slate-700 bg-slate-950 px-3 text-xs font-semibold tabular-nums text-[#32d85a]">
            <Star aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
            {rating}
          </span>
          <span className="inline-flex min-h-8 items-center rounded border border-[#00c030]/50 bg-[#00c030]/10 px-3 text-xs font-semibold uppercase tracking-wide text-[#32d85a] transition group-hover:bg-[#00c030]/20">
            Open log
          </span>
        </div>
      </button>
    </article>
  );
}

function SearchSkeletonList() {
  return (
    <div className="divide-y divide-slate-800 border-y border-slate-800">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="grid grid-cols-[64px_1fr] gap-4 py-4 sm:grid-cols-[74px_1fr_auto] sm:items-center" key={index}>
          <div className="aspect-[2/3] animate-pulse rounded border border-slate-800 bg-slate-900" />
          <div className="min-w-0 space-y-3">
            <div className="h-4 w-2/5 animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-slate-900" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-900" />
          </div>
          <div className="hidden h-8 w-24 animate-pulse rounded border border-slate-800 bg-slate-900 sm:block" />
        </div>
      ))}
    </div>
  );
}
