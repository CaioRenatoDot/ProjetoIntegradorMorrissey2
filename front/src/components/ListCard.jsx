import ListPosterStrip from "./ListPosterStrip";

export default function ListCard({ list, onSelect, onCreatorSelect }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded border border-slate-800 bg-slate-950 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#00c030]/70 hover:shadow-[#00c030]/10 focus-within:ring-4 focus-within:ring-[#00c030]/20">
      <button
        type="button"
        onClick={() => onSelect?.(list.id)}
        className="flex flex-col text-left focus:outline-none"
        aria-label={`View full list: ${list.title}`}
      >
        <ListPosterStrip posters={list.previewPosters} />

        <div className="px-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            {list.category && (
              <span className="inline-flex h-7 items-center rounded-md border border-white/10 bg-zinc-900/80 px-2.5 text-xs font-medium uppercase tracking-wide text-slate-200 shadow-sm shadow-black/20">
                {list.category}
              </span>
            )}
            <span className="ml-auto text-sm font-bold text-slate-500">
              {list.itemsCount} {list.itemsCount === 1 ? "item" : "items"}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-black leading-tight text-white">
            {list.title}
          </h2>
        </div>
      </button>

      <p className="px-5 pb-5 pt-2 text-sm font-semibold text-slate-400">
        Created by{" "}
        {list.creatorUsername ? (
          <button
            type="button"
            onClick={() => onCreatorSelect?.(list.creatorUsername)}
            className="font-black text-slate-200 underline-offset-2 transition hover:text-[#00c030] hover:underline"
          >
            {list.creator}
          </button>
        ) : (
          <span className="font-black text-slate-300">{list.creator}</span>
        )}
      </p>
    </article>
  );
}
