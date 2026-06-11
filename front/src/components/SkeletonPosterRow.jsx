export default function SkeletonPosterRow({ reverse = false }) {
  const placeholders = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-max gap-2 sm:gap-3 lg:gap-4 ${
          reverse ? "-translate-x-24" : "translate-x-0"
        }`}
      >
        {placeholders.map((item) => (
          <div
            className="aspect-[2/3] w-20 flex-none animate-pulse rounded border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-black/40 sm:w-28 sm:rounded-lg md:w-32 lg:w-36"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
