export default function SkeletonCard() {
  return (
    <article>
      <div className="aspect-2/3 animate-pulse rounded border border-slate-800 bg-slate-900" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-slate-800" />
      </div>
    </article>
  );
}
