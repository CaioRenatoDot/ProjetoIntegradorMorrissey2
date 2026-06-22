import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { communityLists } from "../data/communityLists";
import ListCard from "./ListCard";

export default function ListPage({ onListSelect }) {
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
            <ListCard key={list.id} list={list} onSelect={onListSelect} />
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
