import { ChevronDown } from "lucide-react";
import SeriesCard from "./SeriesCard";
import SkeletonCard from "./SkeletonCard";

export default function ResultsSection({
  hasMore,
  hasSearched,
  isLoading,
  onSeriesSelect,
  onShowMore,
  searchTerm,
  series,
}) {
  return (
    <>
      <div
        id="results"
        className="mb-6 flex items-center justify-between gap-4 border-b border-slate-800 pb-4"
      >
        <h2 className="text-xl font-black text-white sm:text-2xl">
          {hasSearched ? `Results for ${searchTerm}` : "Most Popular"}
        </h2>
        <p className="flex-none text-right text-sm font-bold text-slate-400">
          {isLoading
            ? "Searching..."
            : `${series.length} result${series.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {isLoading ? (
        <section className="grid grid-cols-4 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4">
          {Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-4 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4">
          {series.map((show, index) => (
            <div
              className="animate-slide-in-up"
              key={show.id}
              style={{ animationDelay: `${(index % 12) * 40}ms` }}
            >
              <SeriesCard onSelect={onSeriesSelect} show={show} />
            </div>
          ))}
        </section>
      )}

      {!hasSearched && !isLoading && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded border border-slate-700 px-6 text-sm font-black uppercase tracking-wide text-slate-300 transition-colors duration-300 hover:border-[#00c030] hover:text-white"
            onClick={onShowMore}
            type="button"
          >
            <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#00c030]/10 transition-transform duration-300 ease-out group-hover:scale-y-100" />
            <span className="leading-none">Show more</span>
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 flex-none"
              strokeWidth={2.6}
            />
          </button>
        </div>
      )}
    </>
  );
}
