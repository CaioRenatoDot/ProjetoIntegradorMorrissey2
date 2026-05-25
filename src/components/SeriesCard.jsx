import { fallbackPoster } from "../data/constants";
import { cleanSummary, getGenres } from "../utils/format";

export default function SeriesCard({ show }) {
  const rating = show.rating?.average ?? "N/A";

  return (
    <article className="group overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/30">
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={show.image?.medium || fallbackPoster}
          alt={`Poster da serie ${show.name}`}
        />
        <div className="absolute right-2 top-2 rounded bg-slate-950/85 px-2 py-1 text-xs font-black text-emerald-400">
          {rating}
        </div>
      </div>

      <div className="space-y-2 p-3">
        <h2 className="line-clamp-1 text-sm font-black text-slate-50">
          {show.name}
        </h2>
        <p className="line-clamp-1 text-xs font-bold text-slate-400">
          {getGenres(show)}
        </p>
        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
          {cleanSummary(show.summary)}
        </p>
      </div>
    </article>
  );
}
