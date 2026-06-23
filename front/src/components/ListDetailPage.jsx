import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton";
import { fallbackPoster } from "../data/constants";
import { getCommunityListById } from "../data/communityLists";
import { deleteList, getList } from "../services/api";
import { searchShows } from "../services/tvmaze";

export default function ListDetailPage({ listId, onBack, onSeriesSelect }) {
  const communityList = useMemo(() => getCommunityListById(listId), [listId]);
  const isCommunityList = Boolean(communityList);

  const [shows, setShows] = useState([]);
  const [myList, setMyList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchCommunityListShows() {
      setIsLoading(true);
      setError("");

      try {
        const foundShows = await Promise.all(
          communityList.items.map(async (item) => {
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

    async function fetchMyList() {
      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setIsLoading(false);
        setError("Sign in again to view this list.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getList(token, listId);
        if (isMounted) setMyList(data.list);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (isCommunityList) {
      fetchCommunityListShows();
    } else {
      fetchMyList();
    }

    return () => {
      isMounted = false;
    };
  }, [communityList, isCommunityList, listId]);

  async function handleDeleteList() {
    if (!window.confirm(`Delete "${myList.title}"? This cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("watchd_token");
    if (!token) {
      setDeleteError("Sign in again to delete this list.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteList(token, listId);
      onBack();
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isCommunityList && !isLoading && !myList) {
    return (
      <section className="py-8">
        <BackButton onBack={onBack} />
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error || "List not found."}
        </p>
      </section>
    );
  }

  const headerEyebrow = isCommunityList ? "Community List" : "Your List";
  const headerTitle = isCommunityList ? communityList.title : myList?.title;
  const headerSubtitle = isCommunityList
    ? `Created by ${communityList.creator} · ${communityList.category}`
    : myList && `${myList.items.length} ${myList.items.length === 1 ? "title" : "titles"}`;
  const skeletonCount = isCommunityList ? communityList.items.length : 6;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between gap-4">
        <BackButton onBack={onBack} />

        {!isCommunityList && myList && (
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded border border-red-900/60 px-3 text-xs font-black uppercase tracking-wide text-red-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={handleDeleteList}
            type="button"
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            {isDeleting ? "Deleting..." : "Delete list"}
          </button>
        )}
      </div>

      <header className="mb-8 border-b border-slate-800 pb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          {headerEyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          {headerTitle}
        </h1>
        {headerSubtitle && (
          <p className="mt-3 text-sm font-bold text-slate-400 sm:text-base">
            {headerSubtitle}
          </p>
        )}
      </header>

      {(error || deleteError) && !isLoading && (
        <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {deleteError || error}
        </p>
      )}

      {isLoading ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <article
              key={index}
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
      ) : isCommunityList ? (
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
      ) : myList?.items.length ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {myList.items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded border border-slate-700 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/30"
            >
              <button
                className="block h-full w-full text-left"
                onClick={() => onSeriesSelect(Number(item.movieId))}
                type="button"
              >
                <img
                  className="h-56 w-full object-cover sm:h-64 lg:h-72"
                  src={item.posterUrl || fallbackPoster}
                  alt={`Poster for ${item.title}`}
                />
                <div className="p-4">
                  <h2 className="line-clamp-2 text-sm font-black text-slate-50">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Open details
                  </p>
                </div>
              </button>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
          <h2 className="text-lg font-black text-white">This list is empty</h2>
          <p className="mt-2 text-sm text-slate-400">
            Add series to this list to see them here.
          </p>
        </div>
      )}
    </section>
  );
}
