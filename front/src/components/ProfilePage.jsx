import { Bookmark, Clipboard, GripVertical, Heart, Link, ListChecks, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getListsByCreator } from "../data/communityLists";
import { fallbackPoster } from "../data/constants";
import {
  getFavorites,
  getMyReviews,
  getWatchlist,
  removeFromWatchlist,
  reorderFavorites,
} from "../services/api";
import { searchShows } from "../services/tvmaze";
import ListPosterStrip from "./ListPosterStrip";
import UserAvatar from "./UserAvatar";

const favoriteLimit = 4;
const watchlistPreviewLimit = 8;
const recentActivityLimit = 4;
const listPreviewLimit = 3;

export default function ProfilePage({
  currentUserName,
  isLoggedIn,
  onDiaryClick,
  onEditProfileClick,
  onListSelect,
  onSeriesSelect,
  onViewAllLists,
  profileDetails,
}) {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [recentActivityItems, setRecentActivityItems] = useState([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [isRecentActivityLoading, setIsRecentActivityLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [recentActivityError, setRecentActivityError] = useState("");
  const [watchlistStatus, setWatchlistStatus] = useState("");
  const [isWatchlistExpanded, setIsWatchlistExpanded] = useState(false);
  const [removingWatchlistItemId, setRemovingWatchlistItemId] = useState(null);
  const [isAdjustingFavoriteOrder, setIsAdjustingFavoriteOrder] = useState(false);
  const [draggedFavoriteId, setDraggedFavoriteId] = useState(null);
  const [profileUrlStatus, setProfileUrlStatus] = useState("");
  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false);
  const [listPreviewImages, setListPreviewImages] = useState({});
  const [reviewedSeriesCount, setReviewedSeriesCount] = useState(0);
  const profileActionsRef = useRef(null);

  const userLists = useMemo(() => getListsByCreator(currentUserName), [currentUserName]);

  useEffect(() => {
    let isMounted = true;

    async function fetchListPreviews() {
      if (!userLists.length) {
        setListPreviewImages({});
        return;
      }

      const previewEntries = await Promise.all(
        userLists.map(async (list) => {
          const posters = await Promise.all(
            list.items.slice(0, 4).map(async (item) => {
              try {
                const results = await searchShows(item.search);
                const matchedShow =
                  results.find((show) => {
                    return show.name?.trim().toLowerCase() === item.name.trim().toLowerCase();
                  }) || results[0];

                return matchedShow?.image?.medium || matchedShow?.image?.original || "";
              } catch {
                return "";
              }
            })
          );

          return [list.id, posters];
        })
      );

      if (isMounted) {
        setListPreviewImages(Object.fromEntries(previewEntries));
      }
    }

    fetchListPreviews();

    return () => {
      isMounted = false;
    };
  }, [userLists]);

  useEffect(() => {
    if (!isProfileActionsOpen) return undefined;

    function handleDocumentPointerDown(event) {
      if (profileActionsRef.current?.contains(event.target)) return;
      setIsProfileActionsOpen(false);
    }

    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") setIsProfileActionsOpen(false);
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isProfileActionsOpen]);
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

    async function fetchRecentActivity() {
      if (!isLoggedIn) {
        setRecentActivityItems([]);
        setRecentActivityError("");
        setReviewedSeriesCount(0);
        return;
      }

      const token = localStorage.getItem("watchd_token");

      if (!token) {
        setRecentActivityItems([]);
        setRecentActivityError("Sign in again to load your activity.");
        setReviewedSeriesCount(0);
        return;
      }

      setIsRecentActivityLoading(true);
      setRecentActivityError("");

      try {
        const data = await getMyReviews(token);

        if (!isMounted) return;

        setReviewedSeriesCount(data.items.length);
        setRecentActivityItems(
          data.items.slice(0, recentActivityLimit).map((item) => ({
            movieId: item.movieId,
            title: item.title,
            posterUrl: item.posterUrl || "",
            rating: item.rating || 0,
            review: item.text || "",
            updatedAt: item.updatedAt,
          }))
        );
      } catch (error) {
        if (isMounted) {
          setRecentActivityItems([]);
          setReviewedSeriesCount(0);
          setRecentActivityError(error.message);
        }
      } finally {
        if (isMounted) setIsRecentActivityLoading(false);
      }
    }

    fetchRecentActivity();

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


  async function handleCopyProfileUrl() {
    const profileUrl = `${window.location.origin}${window.location.pathname}#profile`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = profileUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setProfileUrlStatus("Copied");
      setIsProfileActionsOpen(false);
    } catch (error) {
      setProfileUrlStatus("Could not copy");
    }

    window.setTimeout(() => setProfileUrlStatus(""), 1800);
  }
  const stats = [
    { icon: Heart, label: "Favorites", value: favoriteItems.length },
    { icon: Bookmark, label: "Watchlist", value: watchlistItems.length },
    { icon: Star, label: "Watchd", value: reviewedSeriesCount },
    { icon: ListChecks, label: "Lists", value: userLists.length },
  ];
  const profileName = profileDetails?.displayName || currentUserName;

  return (
    <section className="mx-auto max-w-6xl py-7 sm:py-10">
      <header className="pb-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <UserAvatar
              className="ring-2 ring-slate-700/70"
              name={isLoggedIn ? profileName : "Guest"}
              size="lg"
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black leading-none text-white sm:text-3xl">
                {isLoggedIn ? profileName : "Guest"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isLoggedIn && (
                  <>
                    <button
                      className="min-h-8 rounded border border-slate-600 bg-slate-700/80 px-3 text-xs font-black uppercase tracking-wide text-slate-100 transition hover:border-[#00c030] hover:bg-slate-600"
                      onClick={onEditProfileClick}
                      type="button"
                    >
                      EDIT PROFILE
                    </button>

                    <div className="relative" ref={profileActionsRef}>
                      <button
                        aria-expanded={isProfileActionsOpen}
                        aria-label="Open profile actions"
                        className="grid h-8 w-8 place-items-center rounded-full border border-slate-600 bg-slate-800 text-sm font-black leading-none text-slate-200 transition hover:border-[#00c030] hover:bg-slate-700 hover:text-white"
                        onClick={() => setIsProfileActionsOpen((currentValue) => !currentValue)}
                        title="Profile actions"
                        type="button"
                      >
                        <span className="-mt-1">...</span>
                      </button>

                      {isProfileActionsOpen && (
                        <div className="absolute left-0 top-10 z-20 w-48 overflow-hidden rounded border border-slate-600/70 bg-slate-800 py-1 shadow-xl shadow-black/30 sm:left-auto sm:right-0">
                          <button
                            className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-xs font-black uppercase tracking-wide text-slate-200 transition hover:bg-slate-700 hover:text-white"
                            onClick={handleCopyProfileUrl}
                            type="button"
                          >
                            <Clipboard aria-hidden="true" className="h-4 w-4 text-[#00c030]" />
                            Copy profile URL
                          </button>
                        </div>
                      )}

                      {profileUrlStatus && (
                        <span className="absolute left-1/2 top-10 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-100 shadow-lg shadow-black/25">
                          {profileUrlStatus}
                        </span>
                      )}
                    </div>
                  </>
                )}
                <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-bold text-slate-400">
                  Watchd member
                </span>
              </div>
            </div>
          </div>

          {isLoggedIn && (
            <div className="flex flex-wrap items-center gap-y-3 text-left sm:justify-end">
              {stats.map((stat, index) => (
                <StatCell
                  isFirst={index === 0}
                  key={stat.label}
                  stat={stat}
                />
              ))}
            </div>
          )}
        </div>

        {isLoggedIn && <ProfileTabs onDiaryClick={onDiaryClick} />}
      </header>

      {!isLoggedIn ? (
        <EmptyState
          title="You need to be signed in"
          description="After signing in, this page will show your favorite series, Watchlist, and created lists."
        />
      ) : (
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-9">
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

            <RecentActivityShelf
              error={recentActivityError}
              isLoading={isRecentActivityLoading}
              items={recentActivityItems}
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
          </div>

          <ProfileBioPanel
            currentUserName={profileName}
            listPreviewImages={listPreviewImages}
            onListSelect={onListSelect}
            onViewAllLists={onViewAllLists}
            profileDetails={profileDetails}
            stats={stats}
            userLists={userLists}
          />
        </div>
      )}
    </section>
  );
}

function ProfileShelfHeader({ action, title }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-700 pb-2">
      <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-[#9abbd1]">
        {title}
      </h2>
      {action}
    </header>
  );
}

function ProfileTabs({ onDiaryClick }) {
  const tabs = [
    "Profile",
    "Series",
    "Diary",
    "Reviews",
    "Watchlist",
    "Lists",
  ];

  const tabHandlers = {
    Diary: onDiaryClick,
  };

  return (
    <nav className="mt-7 overflow-x-auto rounded border border-slate-800 bg-slate-950/30 px-4" aria-label="Profile sections">
      <div className="mx-auto flex w-max min-w-max items-center justify-center gap-6">
        {tabs.map((tab) => (
          <button
            className={`relative min-h-12 text-sm font-semibold transition hover:text-white ${
              tab === "Profile" ? "text-white" : "text-slate-400"
            }`}
            key={tab}
            onClick={tabHandlers[tab]}
            type="button"
          >
            {tab}
            {tab === "Profile" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#00c030]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

function ProfileBioPanel({
  currentUserName,
  listPreviewImages,
  onListSelect,
  onViewAllLists,
  profileDetails,
  stats,
  userLists,
}) {
  const bio =
    profileDetails?.bio ||
    `${currentUserName} is building a shelf of favorite series, recent ratings, and titles saved for later.`;
  const location = profileDetails?.location || "";
  const website = profileDetails?.website || "";

  return (
    <aside className="space-y-8 lg:pt-[76px]">
      <section>
        <ProfileShelfHeader title="Bio" />
        <div className="space-y-4 text-sm font-semibold leading-6 text-slate-400">
          {(location || website) && (
            <div className="space-y-2">
              {location && (
                <p className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  {location}
                </p>
              )}
              {website && (
                <p className="flex min-w-0 items-center gap-2">
                  <Link aria-hidden="true" className="h-4 w-4 flex-none text-slate-500" />
                  <span className="truncate">{website}</span>
                </p>
              )}
            </div>
          )}
          <p>{bio}</p>
        </div>
      </section>

      <section>
        <ProfileShelfHeader title="Profile Stats" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-black leading-none text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <ProfileShelfHeader title="Created Lists" />

        {userLists.length ? (
          <>
            <div className="space-y-4">
              {userLists.slice(0, listPreviewLimit).map((list) => (
                <button
                  aria-label={`Open list ${list.title}`}
                  className="group block w-full overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-left transition hover:-translate-y-1 hover:border-[#00c030] hover:shadow-lg hover:shadow-black/30"
                  key={list.id}
                  onClick={() => onListSelect(list.id)}
                  type="button"
                >
                  <ListPosterStrip posters={listPreviewImages[list.id]} />

                  <div className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-6 items-center rounded-md border border-white/10 bg-zinc-900/80 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-200 shadow-sm shadow-black/20">
                        {list.category}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {list.items.length} titles
                      </span>
                    </div>
                    <h3 className="mt-2 truncate text-sm font-black text-white">
                      {list.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <ListChecks aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      Created by {list.creator}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {userLists.length > listPreviewLimit && (
              <button
                className="mt-4 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-slate-700 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white"
                onClick={onViewAllLists}
                type="button"
              >
                Show more
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.6} />
              </button>
            )}
          </>
        ) : (
          <p className="rounded border border-slate-800 bg-slate-950/60 px-4 py-6 text-center text-sm font-semibold text-slate-400">
            No created lists yet.
          </p>
        )}
      </section>
    </aside>
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
  const visibleFavoriteItems = favoriteItems.slice(0, favoriteLimit);
  const emptySlotCount = Math.max(favoriteLimit - visibleFavoriteItems.length, 0);

  return (
    <section>
      <ProfileShelfHeader
        action={
          <button
            className="min-h-8 rounded border border-slate-700 px-3 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={favoriteItems.length < 2 || isLoading}
            onClick={onAdjustToggle}
            type="button"
          >
            {isAdjusting ? "DONE" : "ADJUST ORDER"}
          </button>
        }
        title="Favorite Series"
      />

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <PosterSkeletonGrid count={4} variant="large" />
      ) : visibleFavoriteItems.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visibleFavoriteItems.map((item) => (
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
                className={`relative overflow-hidden rounded border bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030] ${
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
                  src={item.posterUrl || fallbackPoster}
                />
              </div>
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

function RecentActivityShelf({ error, isLoading, items, onSeriesSelect }) {
  return (
    <section>
      <ProfileShelfHeader
        action={
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
            All
          </span>
        }
        title="Recent Activity"
      />

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {isLoading ? (
        <PosterSkeletonGrid count={4} variant="large" />
      ) : items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <ActivityCard
              item={item}
              key={item.movieId}
              onSeriesSelect={onSeriesSelect}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recent activity yet"
          description="Rate or review a series to make it appear here."
        />
      )}
    </section>
  );
}

function ActivityCard({ item, onSeriesSelect }) {
  return (
    <article className="group min-w-0">
      <button
        aria-label={`Open details for ${item.title}`}
        className="block w-full text-left"
        onClick={() => onSeriesSelect?.(Number(item.movieId), "profile")}
        type="button"
      >
        <div className="overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-lg shadow-black/30 transition group-hover:-translate-y-1 group-hover:border-[#00c030]">
          <img
            alt={`Poster for ${item.title}`}
            className="aspect-[2/3] w-full object-cover"
            src={item.posterUrl || fallbackPoster}
          />
        </div>
        <div className="mt-2 flex items-center gap-1 text-slate-500">
          <RatingStars rating={item.rating} />
          {item.review && (
            <Heart
              aria-hidden="true"
              className="ml-1 h-3.5 w-3.5"
              fill="currentColor"
            />
          )}
          <ListChecks aria-hidden="true" className="h-3.5 w-3.5" />
        </div>
      </button>
    </article>
  );
}

function RatingStars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index + 1 <= rating;
        return (
          <Star
            aria-hidden="true"
            className={`h-3.5 w-3.5 ${isFilled ? "text-slate-400" : "text-slate-700"}`}
            fill={isFilled ? "currentColor" : "none"}
            key={index}
          />
        );
      })}
    </span>
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(82px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(104px,1fr))]">
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
                  src={item.posterUrl || fallbackPoster}
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

function StatCell({ isFirst, stat }) {
  return (
    <div
      className={`px-4 text-center sm:px-5 ${
        isFirst ? "" : "border-l border-slate-700/60"
      }`}
    >
      <p className="text-2xl font-black leading-none text-white sm:text-3xl">
        {stat.value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {stat.label}
      </p>
    </div>
  );
}

function ShelfHeader({ action, count, eyebrow, onActionClick, title }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-700 pb-2">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-sm font-medium uppercase tracking-[0.22em] text-[#9abbd1]">
          {title}
        </h2>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
          {count}
        </p>
        {action && (
          <button
            className="min-h-8 rounded border border-slate-700 px-3 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white"
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

function PosterSkeletonGrid({ count = 8, variant = "default" }) {
  const gridClassName =
    variant === "large"
      ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
      : "grid grid-cols-[repeat(auto-fill,minmax(82px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(104px,1fr))]";

  return (
    <div className={gridClassName}>
      {Array.from({ length: count }, (_, index) => (
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
    <div className="rounded border border-slate-800 bg-slate-950/60 px-5 py-8 text-center">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}








