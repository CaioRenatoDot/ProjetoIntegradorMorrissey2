import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fallbackPoster } from "../data/constants";
import { searchShows } from "../services/tvmaze";

const communityLists = [
  {
    id: 1,
    title: "Series to Watch at Night",
    creator: "Marina Lopes",
    category: "Suspense",
    items: [
      { name: "Dark", search: "Dark" },
      { name: "Mindhunter", search: "Mindhunter" },
      { name: "The Night Of", search: "The Night Of" },
      { name: "True Detective", search: "True Detective" },
    ],
  },
  {
    id: 2,
    title: "Horror Series for the Weekend",
    creator: "Rafael Costa",
    category: "Horror",
    items: [
      { name: "The Haunting of Hill House", search: "The Haunting of Hill House" },
      { name: "Marianne", search: "Marianne" },
      { name: "Archive 81", search: "Archive 81" },
      { name: "Penny Dreadful", search: "Penny Dreadful" },
    ],
  },
  {
    id: 3,
    title: "Short Series to Binge",
    creator: "Bianca Nunes",
    category: "Miniseries",
    items: [
      { name: "Chernobyl", search: "Chernobyl" },
      { name: "When They See Us", search: "When They See Us" },
      { name: "Maid", search: "Maid" },
      { name: "The Queen's Gambit", search: "The Queen's Gambit" },
    ],
  },
  {
    id: 4,
    title: "TV Classics to Watch at Least Once",
    creator: "Andre Silva",
    category: "Classics",
    items: [
      { name: "Breaking Bad", search: "Breaking Bad" },
      { name: "The Sopranos", search: "The Sopranos" },
      { name: "The Wire", search: "The Wire" },
      { name: "Mad Men", search: "Mad Men" },
    ],
  },
  {
    id: 5,
    title: "Light Comedies to Relax",
    creator: "Luiza Martins",
    category: "Comedy",
    items: [
      { name: "The Office", search: "The Office" },
      { name: "Brooklyn Nine-Nine", search: "Brooklyn Nine-Nine" },
      { name: "Parks and Recreation", search: "Parks and Recreation" },
      { name: "Modern Family", search: "Modern Family" },
    ],
  },
  {
    id: 6,
    title: "Animated Series with Great Stories",
    creator: "Caio Henrique",
    category: "Animation",
    items: [
      { name: "Arcane", search: "Arcane" },
      { name: "Avatar: The Last Airbender", search: "Avatar: The Last Airbender" },
      { name: "BoJack Horseman", search: "BoJack Horseman" },
      { name: "Castlevania", search: "Castlevania" },
    ],
  },
];

export default function ListPage() {
  const [listSearch, setListSearch] = useState("");

  const filteredLists = useMemo(() => {
    const normalizedSearch = listSearch.trim().toLowerCase();

    if (!normalizedSearch) return communityLists;

    return communityLists.filter((list) => {
      const searchableText = `${list.title} ${list.category}`.toLowerCase();
      return searchableText.includes(normalizedSearch);
    });
  }, [listSearch]);

  return (
    <section id="lists" className="py-8 sm:py-12">
      <header className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
            Lists
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Community Lists
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Discover public collections created by users and find new series to
            watch or save for later.
          </p>
        </div>

        <label className="relative w-full lg:max-w-sm">
          <span className="sr-only">Search lists by title or category</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            strokeWidth={2.4}
          />
          <input
            className="min-h-12 w-full rounded border border-slate-700 bg-slate-950 px-4 pl-11 text-sm font-semibold text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#00c030] focus:ring-4 focus:ring-[#00c030]/15"
            onChange={(event) => setListSearch(event.target.value)}
            placeholder="Search by title or category"
            type="search"
            value={listSearch}
          />
        </label>
      </header>

      {filteredLists.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
          <h2 className="text-lg font-black text-white">No lists found</h2>
          <p className="mt-2 text-sm text-slate-400">
            Try searching for another title or category.
          </p>
        </div>
      )}
    </section>
  );
}

function ListCard({ list }) {
  const previewItems = useMemo(() => list.items.slice(0, 3), [list.items]);
  const [previewShows, setPreviewShows] = useState(
    previewItems.map((item) => ({ name: item.name, poster: fallbackPoster }))
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchPreviewPosters() {
      const shows = await Promise.all(
        previewItems.map(async (item) => {
          try {
            const [show] = await searchShows(item.search);
            return {
              name: item.name,
              poster: show?.image?.medium || fallbackPoster,
            };
          } catch {
            return { name: item.name, poster: fallbackPoster };
          }
        })
      );

      if (isMounted) setPreviewShows(shows);
    }

    fetchPreviewPosters();

    return () => {
      isMounted = false;
    };
  }, [previewItems]);

  return (
    <article className="flex min-h-72 flex-col rounded border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#00c030]/70 hover:shadow-[#00c030]/10">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded bg-[#00c030]/10 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-[#32d85a]">
          {list.category}
        </span>
        <span className="text-sm font-bold text-slate-500">
          {list.items.length} items
        </span>
      </div>

      <h2 className="mt-5 text-xl font-black leading-tight text-white">
        {list.title}
      </h2>
      <p className="mt-2 text-sm font-semibold text-slate-400">
        Created by {list.creator}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {previewShows.map((show) => (
          <figure key={show.name} className="min-w-0">
            <img
              className="aspect-[2/3] w-full rounded border border-slate-800 bg-slate-900 object-cover shadow-lg shadow-black/30"
              src={show.poster}
              alt={`Cover for ${show.name}`}
            />
            <figcaption className="mt-2 line-clamp-2 min-h-10 text-xs font-bold leading-5 text-slate-300">
              {show.name}
            </figcaption>
          </figure>
        ))}
      </div>

      <button
        className="mt-auto min-h-11 w-full rounded border border-[#00c030] bg-[#00c030] px-4 pb-3 pt-3 text-sm font-black text-[#0d0d0d] transition hover:border-[#32d85a] hover:bg-[#32d85a]"
        type="button"
      >
        View Full List
      </button>
    </article>
  );
}
