import { Bookmark, Clipboard, Heart, ListChecks, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getFavorites,
  getMyLists,
  getMyReviews,
  getPublicProfile,
  getWatchlist,
  removeFromWatchlist,
  reorderFavorites,
} from "../services/api";
import UserAvatar from "./UserAvatar";
import FavoriteShelf from "./profile/FavoriteShelf";
import PosterGrid from "./profile/PosterGrid";
import ProfileBioPanel from "./profile/ProfileBioPanel";
import { EmptyState, PosterSkeletonGrid, ProfileTabs, ShelfHeader, StatCell } from "./profile/ProfileShared";
import RecentActivityShelf from "./profile/RecentActivityShelf";
import { getSessionToken } from "../services/session";

const watchlistPreviewLimit = 8;
const recentActivityLimit = 4;

export default function ProfilePage({
  currentUserName,
  currentUsername = "",
  isLoggedIn,
  onDiaryClick,
  onEditProfileClick,
  onListSelect,
  onSeriesSelect,
  onSeriesTabClick,
  onViewAllLists,
  onWatchlistTabClick,
  profileDetails,
  viewedUsername = null,
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
  const [userLists, setUserLists] = useState([]);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [listsError, setListsError] = useState("");
  const profileActionsRef = useRef(null);
  const [publicUser, setPublicUser] = useState(null);
  const isOwnProfile =
    isLoggedIn && (!viewedUsername || viewedUsername === currentUsername);
  const isPublicView = Boolean(viewedUsername) && !isOwnProfile;

  useEffect(() => {
    if (!isPublicView) return undefined;

    let isMounted = true;

    async function fetchPublicProfile() {
      setIsListsLoading(true);
      setIsFavoritesLoading(true);
      setIsRecentActivityLoading(true);
      setListsError("");
      setFavoriteError("");
      setRecentActivityError("");

      try {
        const data = await getPublicProfile(viewedUsername);
        if (!isMounted) return;

        setPublicUser(data.user);
        setFavoriteItems(data.favorites || []);
        setUserLists(data.lists || []);
        setListPreviewImages(
          Object.fromEntries(
            (data.lists || []).map((list) => [list.id, list.previewPosters || []])
          )
        );
        setRecentActivityItems(
          (data.recentActivity || []).slice(0, recentActivityLimit).map((item) => ({
            movieId: item.movieId,
            title: item.title,
            posterUrl: item.posterUrl || "",
            rating: item.rating || 0,
            review: item.text || "",
            updatedAt: item.updatedAt,
          }))
        );
        setReviewedSeriesCount(data.stats?.watchd || 0);
        setWatchlistItems([]);
      } catch (error) {
        if (isMounted) {
          setPublicUser(null);
          setListsError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsListsLoading(false);
          setIsFavoritesLoading(false);
          setIsRecentActivityLoading(false);
        }
      }
    }

    fetchPublicProfile();

    return () => {
      isMounted = false;
    };
  }, [isPublicView, viewedUsername]);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserLists() {
      if (isPublicView) return;

      if (!isLoggedIn) {
        setUserLists([]);
        setListsError("");
        return;
      }

      const token = getSessionToken();

      if (!token) {
        setUserLists([]);
        setListsError("Sign in again to load your lists.");
        return;
      }

      setIsListsLoading(true);
      setListsError("");

      try {
        const data = await getMyLists();
        if (isMounted) {
          const items = data.items || [];
          // GET /lists ja traz os 4 primeiros posteres de cada lista, entao nao
          // precisa buscar cada lista de novo so para montar a previa.
          setUserLists(items);
          setListPreviewImages(
            Object.fromEntries(items.map((list) => [list.id, list.previewPosters || []]))
          );
        }
      } catch (error) {
        if (isMounted) {
          setUserLists([]);
          setListsError(error.message);
        }
      } finally {
        if (isMounted) setIsListsLoading(false);
      }
    }

    fetchUserLists();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

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
      if (isPublicView) return;

      if (!isLoggedIn) {
        setFavoriteItems([]);
        setFavoriteError("");
        setIsAdjustingFavoriteOrder(false);
        return;
      }

      const token = getSessionToken();

      if (!token) {
        setFavoriteItems([]);
        setFavoriteError("Sign in again to load your favorites.");
        return;
      }

      setIsFavoritesLoading(true);
      setFavoriteError("");

      try {
        const data = await getFavorites();
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
      if (isPublicView) return;

      if (!isLoggedIn) {
        setRecentActivityItems([]);
        setRecentActivityError("");
        setReviewedSeriesCount(0);
        return;
      }

      const token = getSessionToken();

      if (!token) {
        setRecentActivityItems([]);
        setRecentActivityError("Sign in again to load your activity.");
        setReviewedSeriesCount(0);
        return;
      }

      setIsRecentActivityLoading(true);
      setRecentActivityError("");

      try {
        const data = await getMyReviews();

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
      if (isPublicView) return;

      if (!isLoggedIn) {
        setWatchlistItems([]);
        setWatchlistError("");
        setWatchlistStatus("");
        setIsWatchlistExpanded(false);
        return;
      }

      const token = getSessionToken();

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
        const data = await getWatchlist();
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
    const token = getSessionToken();

    if (!token) {
      setWatchlistError("Sign in again to update your watchlist.");
      return;
    }

    setRemovingWatchlistItemId(itemId);
    setWatchlistError("");
    setWatchlistStatus("");

    try {
      await removeFromWatchlist(itemId);
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

    const token = getSessionToken();

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
    ...(isPublicView
      ? []
      : [{ icon: Bookmark, label: "Watchlist", value: watchlistItems.length }]),
    { icon: Star, label: "Watchd", value: reviewedSeriesCount },
    { icon: ListChecks, label: "Lists", value: userLists.length },
  ];
  const displayedDetails = isPublicView
    ? {
        displayName: publicUser?.displayName || "",
        bio: publicUser?.bio || "",
        location: publicUser?.location || "",
        website: publicUser?.website || "",
      }
    : profileDetails;
  const profileName =
    displayedDetails?.displayName || (isPublicView ? "" : currentUserName);
  const headerUsername = isPublicView
    ? publicUser?.username || ""
    : isLoggedIn
      ? currentUsername || ""
      : "";

  return (
    <section className="mx-auto max-w-6xl py-7 sm:py-10">
      <header className="pb-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <UserAvatar
              className="ring-2 ring-slate-700/70"
              name={isPublicView ? profileName : isLoggedIn ? profileName : "Guest"}
              size="lg"
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black leading-none text-white sm:text-3xl">
                {isPublicView ? profileName : isLoggedIn ? profileName : "Guest"}
              </h1>
              {headerUsername && (
                <p className="mt-1 text-sm font-bold text-slate-500">
                  @{headerUsername}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!isPublicView && isLoggedIn && (
                  <>
                    <button
                      className="min-h-8 rounded border border-slate-600 bg-slate-700/80 px-3 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-[#00c030] hover:bg-slate-600"
                      onClick={onEditProfileClick}
                      type="button"
                    >
                      EDIT PROFILE
                    </button>

                    <div className="relative" ref={profileActionsRef}>
                      <button
                        aria-expanded={isProfileActionsOpen}
                        aria-label="Open profile actions"
                        className="grid h-8 w-8 place-items-center rounded-full border border-slate-600 bg-slate-800 text-sm font-semibold leading-none text-slate-200 transition hover:border-[#00c030] hover:bg-slate-700 hover:text-white"
                        onClick={() => setIsProfileActionsOpen((currentValue) => !currentValue)}
                        title="Profile actions"
                        type="button"
                      >
                        <span className="-mt-1">...</span>
                      </button>

                      {isProfileActionsOpen && (
                        <div className="absolute left-0 top-10 z-20 w-48 overflow-hidden rounded border border-slate-600/70 bg-slate-800 py-1 shadow-xl shadow-black/30 sm:left-auto sm:right-0">
                          <button
                            className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700 hover:text-white"
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

          {(isPublicView || isLoggedIn) && (
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

        {!isPublicView && isLoggedIn && (
          <ProfileTabs
            onDiaryClick={onDiaryClick}
            onListsClick={onViewAllLists}
            onSeriesClick={onSeriesTabClick}
            onWatchlistClick={onWatchlistTabClick}
          />
        )}
      </header>

      {!isPublicView && !isLoggedIn ? (
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
              readOnly={isPublicView}
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

            {!isPublicView && (
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
            )}
          </div>

          <ProfileBioPanel
            currentUserName={profileName}
            isListsLoading={isListsLoading}
            isPublicView={isPublicView}
            listPreviewImages={listPreviewImages}
            listsError={listsError}
            onListSelect={onListSelect}
            onViewAllLists={onViewAllLists}
            profileDetails={displayedDetails}
            stats={stats}
            userLists={userLists}
          />
        </div>
      )}
    </section>
  );
}
