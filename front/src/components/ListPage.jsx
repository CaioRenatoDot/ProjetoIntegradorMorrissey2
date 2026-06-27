import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllLists } from "../services/api";
import ListCard from "./ListCard";

const PAGE_SIZE = 6;

export default function ListPage({ onListSelect }) {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    async function fetchLists() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getAllLists();
        if (isMounted) setLists(data.items);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchLists();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleLists = lists.slice(0, visibleCount);
  const hasMore = visibleCount < lists.length;

  return (
    <section id="lists" className="py-8 sm:py-12">
      <header className="mb-8 border-b border-slate-800 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Lists
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          Community Lists
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Discover collections created by users and find new series to watch or
          save for later.
        </p>
      </header>

      {error ? (
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div
              key={index}
              className="h-60 animate-pulse rounded border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      ) : lists.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleLists.map((list, index) => (
              <div
                key={list.id}
                className="animate-slide-in-up"
                style={{ animationDelay: `${(index % PAGE_SIZE) * 40}ms` }}
              >
                <ListCard list={list} onSelect={onListSelect} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded border border-slate-700 px-6 text-sm font-black uppercase tracking-wide text-slate-300 transition-colors duration-300 hover:border-[#00c030] hover:text-white"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                type="button"
              >
                <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#00c030]/10 transition-transform duration-300 ease-out group-hover:scale-y-100" />
                <span className="leading-none">Show more</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 flex-none"
                  strokeWidth={2.6}
                />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
          <h2 className="text-lg font-black text-white">No lists yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            Be the first to create a list.
          </p>
        </div>
      )}
    </section>
  );
}
