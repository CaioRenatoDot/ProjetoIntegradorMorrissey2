import { Star } from "lucide-react";
import { fallbackPoster } from "../data/constants";

export default function SeriesCard({ onSelect, show }) {
  const rating = show.rating?.average;

  return (
    <article className="group min-w-0">
      <button
        className="block w-full text-left"
        onClick={() => onSelect(show.id)}
        type="button"
      >
        <div className="relative overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-emerald-500 group-hover:shadow-emerald-950/20">
          <img
            alt={`Poster for ${show.name}`}
            className="aspect-2/3 w-full object-cover transition duration-300 group-hover:scale-105"
            src={show.image?.medium || fallbackPoster}
          />

          {rating != null && (
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded bg-slate-950/85 px-1.5 py-1 text-[11px] font-semibold tabular-nums text-slate-100 backdrop-blur-sm">
              <Star aria-hidden="true" className="h-3 w-3 text-amber-400" fill="currentColor" />
              {rating}
            </div>
          )}
        </div>

        <h2 className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-200 sm:text-sm">
          {show.name}
        </h2>
      </button>
    </article>
  );
}
