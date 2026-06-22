import { useEffect, useMemo, useState } from "react";
import { searchShows } from "../services/tvmaze";
import ListPosterStrip from "./ListPosterStrip";

export default function ListCard({ list, onSelect }) {
  const previewItems = useMemo(() => list.items.slice(0, 4), [list.items]);
  const [posters, setPosters] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPreviewPosters() {
      const results = await Promise.all(
        previewItems.map(async (item) => {
          try {
            const matches = await searchShows(item.search);
            const matchedShow =
              matches.find((show) => {
                return show.name?.trim().toLowerCase() === item.name.trim().toLowerCase();
              }) || matches[0];

            return matchedShow?.image?.medium || matchedShow?.image?.original || "";
          } catch {
            return "";
          }
        })
      );

      if (isMounted) {
        setPosters(results);
      }
    }

    fetchPreviewPosters();

    return () => {
      isMounted = false;
    };
  }, [previewItems]);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(list.id)}
      className="flex w-full flex-col overflow-hidden rounded border border-slate-800 bg-slate-950 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#00c030]/70 hover:shadow-[#00c030]/10 focus:outline-none focus:ring-4 focus:ring-[#00c030]/20"
      aria-label={`View full list: ${list.title}`}
    >
      <ListPosterStrip posters={posters} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-7 items-center rounded-md border border-white/10 bg-zinc-900/80 px-2.5 text-xs font-medium uppercase tracking-wide text-slate-200 shadow-sm shadow-black/20">
            {list.category}
          </span>
          <span className="text-sm font-bold text-slate-500">
            {list.items.length} items
          </span>
        </div>

        <h2 className="mt-4 text-xl font-black leading-tight text-white">
          {list.title}
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-400">
          Created by {list.creator}
        </p>
      </div>
    </button>
  );
}
