import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton";
import { fallbackPoster } from "../data/constants";
import { getCommunityListById } from "../data/communityLists";
import { searchShows } from "../services/tvmaze";

export default function ListDetailPage({ listId, onBack, onSeriesSelect }) {
  const selectedList = useMemo(() => getCommunityListById(listId), [listId]);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchListShows() {
      if (!selectedList) {
        setShows([]);
        setIsLoading(false);
        setError("List not found.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const foundShows = await Promise.all(
          selectedList.items.map(async (item) => {
            try {
              const results = await searchShows(item.search);
              const matchedShow =
                results.find(
                  (show) =>
                    show.name?.trim().toLowerCase() ===
                    item.name.trim().toLowerCase()
                ) || results[0];

              if (!matchedShow) {
                return { itemName: item.name, show: null };
              }

              return { itemName: item.name, show: matchedShow };
            } catch {
              return { itemName: item.name, show: null };
            }
          })
        );

        if (isMounted) {
          setShows(foundShows);
        }
      } catch {
        if (isMounted) {
          setError("Could not load this list right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchListShows();

    return () => {
      isMounted = false;
    };
  }, [selectedList]);

  if (!selectedList) {
    return (
      <section className="py-8">
        <BackButton onBack={onBack} />
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          List not found.
        </p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <BackButton onBack={onBack} />

      <header className="mb-8 border-b border-slate-800 pb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Community List
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          {selectedList.title}
        </h1>
        <p className="mt-3 text-sm font-bold text-slate-400 sm:text-base">
          Created by {selectedList.creator} · {selectedList.category}
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {selectedList.items.map((item) => (
            <article
              key={item.name}
              className="overflow-hidden rounded border border-slate-700 bg-slate-900"
            >
              <div className="h-56 animate-pulse bg-slate-800 sm:h-64 lg:h-72" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-2/5 animate-pulse rounded bg-slate-800" />
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {shows.map(({ itemName, show }) => (
            <article
              key={itemName}
              className="group overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/30"
            >
              {show?.id ? (
                <button
                  className="block h-full w-full text-left"
                  onClick={() => onSeriesSelect(show.id)}
                  type="button"
                >
                  <img
                    className="h-56 w-full object-cover sm:h-64 lg:h-72"
                    src={show.image?.medium || fallbackPoster}
                    alt={`Poster for ${show.name}`}
                  />
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-sm font-black text-slate-50">
                      {show.name}
                    </h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      Open details
                    </p>
                  </div>
                </button>
              ) : (
                <>
                  <img
                    className="h-56 w-full object-cover sm:h-64 lg:h-72"
                    src={fallbackPoster}
                    alt={`Poster unavailable for ${itemName}`}
                  />
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-sm font-black text-slate-50">
                      {itemName}
                    </h2>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Could not find this series
                    </p>
                  </div>
                </>
              )}
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
