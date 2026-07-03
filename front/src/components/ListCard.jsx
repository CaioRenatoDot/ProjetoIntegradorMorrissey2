import { Trash2 } from "lucide-react";
import ListPosterStrip from "./ListPosterStrip";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default function ListCard({ list, onSelect, onCreatorSelect, onDelete }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded border border-slate-800 bg-slate-950 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#00c030]/70 hover:shadow-[#00c030]/10 focus-within:ring-4 focus-within:ring-[#00c030]/20">
      <div
        aria-label={`View full list: ${list.title}`}
        className="flex cursor-pointer flex-col text-left focus:outline-none"
        onClick={() => onSelect?.(list.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.(list.id);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <ListPosterStrip posters={list.previewPosters} />

        <div className="px-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            {list.category && (
              <span className="inline-flex h-7 items-center rounded-md border border-white/10 bg-zinc-900/80 px-2.5 text-xs font-medium uppercase tracking-wide text-slate-200 shadow-sm shadow-black/20">
                {list.category}
              </span>
            )}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500">
                {list.itemsCount} {list.itemsCount === 1 ? "item" : "items"}
              </span>
              {onDelete && (
                <button
                  aria-label={`Delete ${list.title}`}
                  className="text-slate-500 transition hover:text-red-400"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(list.id);
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <h2 className="mt-4 text-xl font-black leading-tight text-white">
            {list.title}
          </h2>
        </div>
      </div>

      {list.creator ? (
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
      ) : (
        list.createdAt && (
          <p className="px-5 pb-5 pt-2 text-sm font-semibold text-slate-400">
            Created on{" "}
            <span className="font-black text-slate-300">
              {dateFormatter.format(new Date(list.createdAt))}
            </span>
          </p>
        )
      )}
    </article>
  );
}
