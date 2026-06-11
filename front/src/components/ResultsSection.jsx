import SeriesCard from "./SeriesCard";
import SkeletonCard from "./SkeletonCard";

export default function ResultsSection({
  hasSearched,
  isLoading,
  onSeriesSelect,
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
          {hasSearched ? `Results for ${searchTerm}` : "All Series"}
        </h2>
        <p className="flex-none text-right text-sm font-bold text-slate-400">
          {isLoading
            ? "Searching..."
            : `${series.length} result${series.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {isLoading ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {series.map((show) => (
            <SeriesCard key={show.id} onSelect={onSeriesSelect} show={show} />
          ))}
        </section>
      )}
    </>
  );
}
