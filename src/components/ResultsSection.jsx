import SeriesCard from "./SeriesCard";
import SkeletonCard from "./SkeletonCard";

export default function ResultsSection({
  hasSearched,
  isLoading,
  searchTerm,
  series,
}) {
  return (
    <>
      <div
        id="results"
        className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <h2 className="text-lg font-black text-white">
          {hasSearched ? `Results for ${searchTerm}` : "All Series"}
        </h2>
        <p className="text-sm font-bold text-slate-400">
          {isLoading
            ? "Searching..."
            : `${series.length} result${series.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {isLoading ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {series.map((show) => (
            <SeriesCard key={show.id} show={show} />
          ))}
        </section>
      )}
    </>
  );
}
