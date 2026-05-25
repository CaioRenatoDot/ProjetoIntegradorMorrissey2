export default function SkeletonPosterRow({ reverse = false }) {
  const placeholders = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-max gap-3 sm:gap-4 ${
          reverse ? "-translate-x-24" : "translate-x-0"
        }`}
      >
        {placeholders.map((item) => (
          <div
            className="h-36 w-24 flex-none animate-pulse rounded-lg border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-black/40 sm:h-48 sm:w-32 lg:h-54 lg:w-36"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
