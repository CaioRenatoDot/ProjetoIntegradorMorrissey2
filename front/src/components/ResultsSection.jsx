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
          {series.map((show) => (
            <SeriesCard key={show.id} onSelect={onSeriesSelect} show={show} />
          ))}
        </section>
      )}

      {!hasSearched && !isLoading && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded border border-slate-700 px-6 text-sm font-black uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white"
            onClick={onShowMore}
            type="button"
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
}
