import { Bookmark, GripVertical, Heart, ListChecks, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { communityLists } from "../data/communityLists";
import {
  getFavorites,
  getWatchlist,
  removeFromWatchlist,
  reorderFavorites,
} from "../services/api";
import { getSavedSeriesReviews } from "../utils/seriesReviews";
import UserAvatar from "./UserAvatar";

const favoriteLimit = 4;
const watchlistPreviewLimit = 8;

function normalizeText(value) {
  return value.trim().toLowerCase();
}

export default function ProfilePage({
  currentUserName,
  isLoggedIn,
  onListSelect,
  onSeriesSelect,
}) {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [watchlistStatus, setWatchlistStatus] = useState("");
  const [isWatchlistExpanded, setIsWatchlistExpanded] = useState(false);
  const [removingWatchlistItemId, setRemovingWatchlistItemId] = useState(null);
  const [isAdjustingFavoriteOrder, setIsAdjustingFavoriteOrder] = useState(false);
  const [draggedFavoriteId, setDraggedFavoriteId] = useState(null);

  const userLists = useMemo(() => {
    const normalizedUserName = normalizeText(currentUserName || "");

    return communityLists.filter((list) => {
      const normalizedCreator = normalizeText(list.creator);
      return (
        normalizedCreator === normalizedUserName ||
        normalizedCreator.startsWith(normalizedUserName)
      );
    });
  }, [currentUserName]);

  const reviewedSeriesCount = Object.keys(getSavedSeriesReviews()).length;

  useEffect(() => {
    let isMounted = true;

    async function fetchFavorites() {
      if (!isLoggedIn) {
        setFavoriteItems([]);
        setFavoriteError("");
        setIsAdjustingFavoriteOrder(false);
        return;
      }

      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setFavoriteItems([]);
        setFavoriteError("Sign in again to load your favorites.");
        return;
      }

      setIsFavoritesLoading(true);
      setFavoriteError("");

      try {
        const data = await getFavorites(token);
        if (isMounted) setFavoriteItems(data.items || []);
      } catch (error) {
        if (isMounted) {
          setFavoriteItems([]);
          setFavoriteError(error.message);
        }
      } finally {
        if (isMounted) setIsFavoritesLoading(false);
      }
    }

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    let isMounted = true;

    async function fetchWatchlist() {
      if (!isLoggedIn) {
        setWatchlistItems([]);
        setWatchlistError("");
        setWatchlistStatus("");
        setIsWatchlistExpanded(false);
        return;
      }

      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setWatchlistItems([]);
        setWatchlistError("Sign in again to load your watchlist.");
        setWatchlistStatus("");
        return;
      }

      setIsWatchlistLoading(true);
      setWatchlistError("");
      setWatchlistStatus("");

      try {
        const data = await getWatchlist(token);
        if (isMounted) setWatchlistItems(data.items || []);
      } catch (error) {
        if (isMounted) {
          setWatchlistItems([]);
          setWatchlistError(error.message);
        }
      } finally {
        if (isMounted) setIsWatchlistLoading(false);
      }
    }

    fetchWatchlist();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  async function handleRemoveWatchlistItem(itemId) {
    const token = localStorage.getItem("watchd_token");

    if (!token) {
      setWatchlistError("Sign in again to update your watchlist.");
      return;
    }

    setRemovingWatchlistItemId(itemId);
    setWatchlistError("");
    setWatchlistStatus("");

    try {
      await removeFromWatchlist(token, itemId);
      setWatchlistItems((currentItems) => {
        return currentItems.filter((item) => item.id !== itemId);
      });
      setWatchlistStatus("Series removed from your Watchlist.");
    } catch (error) {
      setWatchlistError(error.message);
    } finally {
      setRemovingWatchlistItemId(null);
    }
  }

  async function handleFavoriteDrop(targetMovieId) {
    if (!draggedFavoriteId || draggedFavoriteId === targetMovieId) return;

    const token = localStorage.getItem("watchd_token");

    if (!token) {
      setFavoriteError("Sign in again to update your favorites.");
      return;
    }

    const sourceIndex = favoriteItems.findIndex((item) => {
      return item.movieId === draggedFavoriteId;
    });
    const targetIndex = favoriteItems.findIndex((item) => {
      return item.movieId === targetMovieId;
    });

    if (sourceIndex < 0 || targetIndex < 0) return;

    const previousFavorites = [...favoriteItems];
    const nextFavorites = [...favoriteItems];
    const [movedFavorite] = nextFavorites.splice(sourceIndex, 1);
    nextFavorites.splice(targetIndex, 0, movedFavorite);

    setFavoriteItems(nextFavorites);
    setDraggedFavoriteId(null);
    setFavoriteError("");

    try {
      await reorderFavorites(
        token,
        nextFavorites.map((favorite) => favorite.id)
      );
    } catch (error) {
      setFavoriteItems(previousFavorites);
      setFavoriteError(error.message);
    }
  }

  const stats = [
    { icon: Heart, label: "Favorites", value: favoriteItems.length },
    { icon: Bookmark, label: "Watchlist", value: watchlistItems.length },
    { icon: Star, label: "Watched", value: reviewedSeriesCount },
    { icon: ListChecks, label: "Lists", value: userLists.length },
  ];

  return (
    <section className="py-8 sm:py-12">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <UserAvatar
              className="ring-4 ring-slate-900"
              name={isLoggedIn ? currentUserName : "Guest"}
              size="lg"
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00c030]">
                Watchd member
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none text-white sm:text-6xl">
                {isLoggedIn ? currentUserName : "Guest"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
                {isLoggedIn
                  ? "A personal shelf for favorite series, titles to watch, reviews, and curated lists."
                  : "Sign in to build your personal Watchd shelf."}
              </p>
            </div>
          </div>

          {isLoggedIn && (
            <div className="grid grid-cols-4 overflow-hidden rounded border border-slate-800 bg-slate-950 shadow-xl shadow-black/20">
              {stats.map((stat) => (
                <StatCell key={stat.label} stat={stat} />
              ))}
            </div>
          )}
        </div>
      </header>

      {!isLoggedIn ? (
        <EmptyState
          title="You need to be signed in"
          description="After signing in, this page will show your favorite series, Watchlist, and created lists."
        />
      ) : (
        <div className="mt-5 space-y-10">
          <FavoriteShelf
            draggedFavoriteId={draggedFavoriteId}
            error={favoriteError}
            favoriteItems={favoriteItems}
            isAdjusting={isAdjustingFavoriteOrder}
            isLoading={isFavoritesLoading}
            onAdjustToggle={() => {
              setIsAdjustingFavoriteOrder((currentValue) => !currentValue);
              setDraggedFavoriteId(null);
            }}
            onDragEnd={() => setDraggedFavoriteId(null)}
            onDragStart={setDraggedFavoriteId}
            onDrop={handleFavoriteDrop}
            onSeriesSelect={onSeriesSelect}
          />

          <section>
            <ShelfHeader
              action={isWatchlistExpanded ? "Show preview" : null}
              eyebrow="Default list"
              title={isWatchlistExpanded ? "Full Watchlist" : "Watchlist"}
              description="A permanent list in every profile for titles you want to watch later."
              count={`${watchlistItems.length} saved`}
              onActionClick={() => setIsWatchlistExpanded(false)}
            />

            {watchlistError && (
              <p className="mb-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
                {watchlistError}
              </p>
            )}

            {watchlistStatus && (
              <p className="mb-4 rounded border border-[#00c030]/30 bg-[#00c030]/10 px-4 py-3 text-sm font-bold text-[#32d85a]">
                {watchlistStatus}
              </p>
            )}

            {isWatchlistLoading ? (
              <PosterSkeletonGrid />
            ) : (
              <PosterGrid
                emptyDescription="Open a series detail page and add it to your Watchlist for later."
                emptyTitle="Your Watchlist is empty"
                isExpanded={isWatchlistExpanded}
                items={watchlistItems}
                onExpand={() => setIsWatchlistExpanded(true)}
                onRemoveItem={handleRemoveWatchlistItem}
                onSeriesSelect={onSeriesSelect}
                previewLimit={watchlistPreviewLimit}
                removingItemId={removingWatchlistItemId}
              />
            )}
          </section>

          <section>
            <ShelfHeader
              eyebrow="User shelves"
              title="Created Lists"
              description="Collections created by this profile. Frontend-only for now."
              count={`${userLists.length} lists`}
            />

            {userLists.length ? (
              <div className="divide-y divide-slate-800 overflow-hidden rounded border border-slate-800 bg-slate-950 shadow-xl shadow-black/20">
                {userLists.map((list) => (
                  <button
                    aria-label={`Open list ${list.title}`}
                    className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-900/70 sm:grid-cols-[1fr_auto] sm:items-center"
                    key={list.id}
                    onClick={() => onListSelect(list.id)}
                    type="button"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#00c030]/10 px-2 py-1 text-xs font-black uppercase tracking-wide text-[#32d85a]">
                          {list.category}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {list.items.length} titles
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-black text-white">
                        {list.title}
                      </h3>
                      <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-400">
                        {list.items.map((item) => item.name).join(" / ")}
                      </p>
                    </div>
                    <p className="text-sm font-black text-[#00c030]">Open list</p>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No created lists yet"
                description="This profile does not have created lists in the frontend mock data yet."
              />
            )}
          </section>
        </div>
      )}
    </section>
  );
}

function FavoriteShelf({
  draggedFavoriteId,
  error,
  favoriteItems,
  isAdjusting,
  isLoading,
  onAdjustToggle,
  onDragEnd,
  onDragStart,
  onDrop,
  onSeriesSelect,
}) {
  const emptySlotCount = Math.max(favoriteLimit - favoriteItems.length, 0);

  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-[#101318] px-4 py-5 shadow-2xl shadow-black/20 sm:px-6">
      <header className="mx-auto mb-5 flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Favorite Series</h2>
          <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">
            {favoriteItems.length}/{favoriteLimit} selected
          </p>
        </div>
        <button
          className="inline-flex min-h-9 w-fit items-center rounded border border-[#00c030]/60 bg-[#00c030]/10 px-4 text-sm font-black text-[#32d85a] transition hover:bg-[#00c030]/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-600"
          disabled={favoriteItems.length < 2 || isLoading}
          onClick={onAdjustToggle}
          type="button"
        >
          {isAdjusting ? "Done" : "Adjust order"}
        </button>
      </header>

      {error && (
        <p className="mx-auto mb-4 max-w-3xl rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className="aspect-[2/3] animate-pulse rounded border border-slate-800 bg-slate-900" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : favoriteItems.length ? (
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {favoriteItems.map((item) => (
            <button
              aria-label={`Open details for ${item.title}`}
              className={`group min-w-0 text-left ${
                isAdjusting ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              draggable={isAdjusting}
              key={item.id}
              onClick={() => {
                if (!isAdjusting) onSeriesSelect?.(Number(item.movieId), "profile");
              }}
              onDragEnd={onDragEnd}
              onDragOver={(event) => {
                if (isAdjusting) event.preventDefault();
              }}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                onDragStart(item.movieId);
              }}
              onDrop={(event) => {
                event.preventDefault();
                onDrop(item.movieId);
              }}
              type="button"
            >
              <div
                className={`relative overflow-hidden rounded border bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030] group-hover:shadow-[#00c030]/10 ${
                  draggedFavoriteId === item.movieId
                    ? "border-[#00c030] opacity-60"
                    : "border-slate-700"
                }`}
              >
                {isAdjusting && (
                  <span className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded bg-slate-950/90 text-[#00c030]">
                    <GripVertical aria-hidden="true" className="h-4 w-4" />
                  </span>
                )}
                <img
                  alt={`Poster for ${item.title}`}
                  className="aspect-[2/3] w-full object-cover"
                  src={item.posterUrl || `${import.meta.env.BASE_URL}assets/W.png`}
                />
              </div>
              <h3 className="mt-2 line-clamp-2 text-xs font-black leading-5 text-slate-100">
                {item.title}
              </h3>
            </button>
          ))}

          {Array.from({ length: emptySlotCount }, (_, index) => (
            <div
              className="grid aspect-[2/3] place-items-center rounded border border-dashed border-slate-800 bg-slate-950/60 text-center"
              key={`empty-favorite-${index}`}
            >
              <p className="px-3 text-xs font-black uppercase tracking-wide text-slate-600">
                Empty slot
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No favorite series yet"
          description="Open a series detail page and mark it as Favorite."
        />
      )}
    </section>
  );
}

function PosterGrid({
  emptyDescription,
  emptyTitle,
  isExpanded = true,
  items,
  onExpand,
  onRemoveItem,
  onSeriesSelect,
  previewLimit,
  removingItemId,
}) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const hasMoreItems = !isExpanded && previewLimit && items.length > previewLimit;
  const visibleItems = hasMoreItems ? items.slice(0, previewLimit) : items;
  const hiddenItemsCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
      {visibleItems.map((item) => (
        <div className="group min-w-0" key={item.id || item.movieId}>
          <div className="relative">
            <button
              aria-label={`Open details for ${item.title}`}
              className="block w-full text-left"
              onClick={() => onSeriesSelect?.(Number(item.movieId), "profile")}
              type="button"
            >
              <div className="overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030] group-hover:shadow-[#00c030]/10">
                <img
                  alt={`Poster for ${item.title}`}
                  className="aspect-[2/3] w-full object-cover"
                  src={item.posterUrl || `${import.meta.env.BASE_URL}assets/W.png`}
                />
              </div>
            </button>

            {onRemoveItem && (
              <button
                aria-label={`Remove ${item.title} from Watchlist`}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-red-400/40 bg-slate-950/90 text-red-200 opacity-100 shadow-lg shadow-black/40 transition hover:border-red-300 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                disabled={removingItemId === item.id}
                onClick={() => onRemoveItem(item.id)}
                title="Remove from Watchlist"
                type="button"
              >
                {removingItemId === item.id ? (
                  <span className="text-xs font-black">...</span>
                ) : (
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-xs font-black leading-5 text-slate-100">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {item.releaseYear || item.type}
          </p>
        </div>
      ))}

      {hasMoreItems && (
        <button
          aria-label="View full Watchlist"
          className="group grid aspect-[2/3] place-items-center rounded border border-slate-800 bg-slate-950 text-center transition hover:border-[#00c030] hover:bg-slate-900"
          onClick={onExpand}
          type="button"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-slate-700 bg-[#14181c] text-3xl font-black leading-none text-slate-300 transition group-hover:border-[#00c030] group-hover:text-[#32d85a]">
            ...
          </span>
          <span className="px-3 text-xs font-black uppercase tracking-wide text-slate-500">
            {hiddenItemsCount} more
          </span>
        </button>
      )}
    </div>
  );
}

function StatCell({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-20 border-r border-slate-800 px-4 py-3 text-center last:border-r-0">
      <div className="mx-auto grid h-6 w-6 place-items-center text-[#00c030]">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>
      <p className="mt-1 text-2xl font-black text-white">{stat.value}</p>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        {stat.label}
      </p>
    </div>
  );
}

function ShelfHeader({ action, count, description, eyebrow, onActionClick, title }) {
  return (
    <header className="mb-4 flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00c030]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-black uppercase tracking-wide text-slate-500">
          {count}
        </p>
        {action && (
          <button
            className="min-h-9 rounded border border-slate-700 px-3 text-sm font-black text-slate-200 transition hover:border-[#00c030] hover:text-white"
            onClick={onActionClick}
            type="button"
          >
            {action}
          </button>
        )}
      </div>
    </header>
  );
}

function PosterSkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index}>
          <div className="aspect-[2/3] animate-pulse rounded border border-slate-800 bg-slate-900" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ description, title }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
