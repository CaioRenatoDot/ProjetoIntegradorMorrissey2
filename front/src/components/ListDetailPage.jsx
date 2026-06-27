import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import { fallbackPoster } from "../data/constants";
import { deleteList, getList, getPublicList } from "../services/api";

export default function ListDetailPage({ isPublic, listId, onBack, onSeriesSelect }) {
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchList() {
      setIsLoading(true);
      setError("");

      try {
        let data;

        if (isPublic) {
          data = await getPublicList(listId);
        } else {
          const token = localStorage.getItem("watchd_token");
          if (!token) {
            if (isMounted) setError("Sign in again to view this list.");
            if (isMounted) setIsLoading(false);
            return;
          }
          data = await getList(token, listId);
        }

        if (isMounted) setList(data.list);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchList();

    return () => {
      isMounted = false;
    };
  }, [isPublic, listId]);

  async function handleDeleteList() {
    if (!window.confirm(`Delete "${list.title}"? This cannot be undone.`)) return;

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

  if (!isLoading && !list) {
    return (
      <section className="py-8">
        <BackButton onBack={onBack} />
        <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error || "List not found."}
        </p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between gap-4">
        <BackButton onBack={onBack} />

        {!isPublic && list && (
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
          {isPublic ? "Community List" : "Your List"}
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          {list?.title}
        </h1>
        {list && (
          <p className="mt-3 text-sm font-bold text-slate-400 sm:text-base">
            {isPublic
              ? `${list.items.length} ${list.items.length === 1 ? "title" : "titles"} · Created by ${list.user?.displayName || list.user?.name}`
              : `${list.items.length} ${list.items.length === 1 ? "title" : "titles"}`}
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
          {Array.from({ length: 6 }, (_, index) => (
            <article key={index} className="overflow-hidden rounded border border-slate-700 bg-slate-900">
              <div className="h-56 animate-pulse bg-slate-800 sm:h-64 lg:h-72" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-2/5 animate-pulse rounded bg-slate-800" />
              </div>
            </article>
          ))}
        </section>
      ) : list?.items.length ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-5">
          {list.items.map((item) => (
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
