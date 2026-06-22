import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import { createList, deleteList, getMyLists } from "../services/api";

export default function MyListsPage({ isLoggedIn, onBack }) {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchMyLists() {
      if (!isLoggedIn) {
        setLists([]);
        setError("");
        return;
      }

      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setLists([]);
        setError("Sign in again to load your lists.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getMyLists(token);
        if (isMounted) setLists(data.items);
      } catch (requestError) {
        if (isMounted) {
          setLists([]);
          setError(requestError.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMyLists();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  async function handleCreate(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const token = localStorage.getItem("watchd_token");
    if (!token) {
      setCreateError("Sign in again to create a list.");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const data = await createList(token, {
        title: trimmedTitle,
        category: category.trim() || null,
      });

      setLists((currentLists) => [{ ...data.item, itemsCount: 0 }, ...currentLists]);
      setTitle("");
      setCategory("");
    } catch (requestError) {
      setCreateError(requestError.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(listId) {
    const token = localStorage.getItem("watchd_token");
    if (!token) return;

    try {
      await deleteList(token, listId);
      setLists((currentLists) => currentLists.filter((list) => list.id !== listId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="py-8 sm:py-12">
      <BackButton onBack={onBack} />

      <header className="mb-8 border-b border-slate-800 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Your lists
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          Created Lists
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Every collection created by this profile, in one place.
        </p>
      </header>

      {!isLoggedIn ? (
        <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
          <h2 className="text-lg font-black text-white">Sign in required</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to create and see your lists.
          </p>
        </div>
      ) : (
        <>
          <form
            className="mb-8 flex flex-col gap-3 rounded border border-slate-800 bg-slate-950/60 p-5 sm:flex-row sm:items-end"
            onSubmit={handleCreate}
          >
            <label className="flex-1">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Title
              </span>
              <input
                className="mt-2 min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#00c030]"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Series to Watch at Night"
                value={title}
              />
            </label>

            <label className="flex-1">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Category
              </span>
              <input
                className="mt-2 min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#00c030]"
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Suspense"
                value={category}
              />
            </label>

            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#00c030] px-5 text-sm font-medium uppercase tracking-wide text-white shadow-lg shadow-[#00c030]/10 transition hover:bg-[#32d85a] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-slate-400 disabled:shadow-none"
              disabled={!title.trim() || isCreating}
              type="submit"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              {isCreating ? "Creating..." : "Create list"}
            </button>
          </form>

          {createError && (
            <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
              {createError}
            </p>
          )}

          {error ? (
            <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </p>
          ) : isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="h-28 animate-pulse rounded border border-slate-800 bg-slate-900" key={index} />
              ))}
            </div>
          ) : lists.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lists.map((list) => (
                <article className="rounded border border-slate-800 bg-slate-950 p-5" key={list.id}>
                  <div className="flex items-start justify-between gap-4">
                    {list.category && (
                      <span className="inline-flex h-7 items-center rounded-md border border-white/10 bg-zinc-900/80 px-2.5 text-xs font-medium uppercase tracking-wide text-slate-200">
                        {list.category}
                      </span>
                    )}
                    <button
                      aria-label={`Delete ${list.title}`}
                      className="text-slate-500 transition hover:text-red-400"
                      onClick={() => handleDelete(list.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="mt-4 text-xl font-black leading-tight text-white">
                    {list.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-400">
                    {list.itemsCount} {list.itemsCount === 1 ? "item" : "items"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
              <h2 className="text-lg font-black text-white">No created lists yet</h2>
              <p className="mt-2 text-sm text-slate-400">
                Create your first list using the form above.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
