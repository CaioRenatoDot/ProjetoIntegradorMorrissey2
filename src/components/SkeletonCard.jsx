export default function SkeletonCard() {
  return (
    <article className="overflow-hidden rounded border border-slate-800 bg-slate-900/70">
      <div className="h-56 animate-pulse bg-slate-800 sm:h-64 lg:h-72" />
      <div className="min-h-36 space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800" />
        <div className="space-y-1 pt-1">
          <div className="h-3 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800" />
        </div>
      </div>
    </article>
  );
}
