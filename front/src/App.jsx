import { useEffect, useState } from "react";
import DiaryPage from "./components/DiaryPage";
import EditProfilePage from "./components/EditProfilePage";
import Hero from "./components/Hero";
import HomeFooter from "./components/HomeFooter";
import ListDetailPage from "./components/ListDetailPage";
import ListPage from "./components/ListPage";
import LoginScreen from "./components/LoginScreen";
import MyListsPage from "./components/MyListsPage";
import Navbar from "./components/Navbar";
import ProfilePage from "./components/ProfilePage";
import ResultsSection from "./components/ResultsSection";
import SearchResultsPage from "./components/SearchResultsPage";
import SeriesDetailPage from "./components/SeriesDetailPage";
import { getMostPopularShows, searchShows } from "./services/tvmaze";
import { login, register, getMe, updateProfile } from "./services/api";

function getAuthModeFromHistoryState(state) {
  if (!state || typeof state !== "object") return null;

  const mode = state.watchdAuthMode;
  if (mode === "login" || mode === "register" || mode === "forgot") {
    return mode;
  }

  return null;
}

function getPageFromHash(hash) {
  if (hash === "#diary") return "diary";
  if (hash === "#lists") return "lists";
  if (hash === "#my-lists") return "myLists";
  if (hash === "#profile") return "profile";
  if (hash === "#edit-profile") return "editProfile";
  if (hash === "#search") return "search";
  return "home";
}

function getHashFromPage(page) {
  if (page === "diary") return "#diary";
  if (page === "lists") return "#lists";
  if (page === "myLists") return "#my-lists";
  if (page === "profile") return "#profile";
  if (page === "editProfile") return "#edit-profile";
  if (page === "search") return "#search";
  return "#catalog";
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function slideToElement(elementId, { duration = 1100, offset = 86 } = {}) {
  const target = document.getElementById(elementId);
  if (!target) return () => { };

  const startY = window.scrollY;
  const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
  const distance = targetY - startY;
  let animationFrameId = null;
  let startTime = null;

  function animate(currentTime) {
    if (!startTime) startTime = currentTime;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      animationFrameId = window.requestAnimationFrame(animate);
    }
  }

  animationFrameId = window.requestAnimationFrame(animate);

  return () => {
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
  };
}

const popularSeriesStep = 18;
const maxPopularSeriesLimit = popularSeriesStep * 4;

function getDefaultProfileDetails(displayName = "") {
  return {
    displayName,
    location: "World",
    website: "",
    bio: "Building a shelf of favorite series, recent ratings, and titles saved for later.",
  };
}

function mapUserToProfileDetails(user) {
  const defaults = getDefaultProfileDetails(user.name);

  return {
    displayName: user.displayName || defaults.displayName,
    location: user.location || defaults.location,
    website: user.website || defaults.website,
    bio: user.bio || defaults.bio,
  };
}

export default function App() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [series, setSeries] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isNavSearchOpen, setIsNavSearchOpen] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [activePage, setActivePage] = useState(() =>
    typeof window === "undefined" ? "home" : getPageFromHash(window.location.hash)
  );
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");
  const [profileDetails, setProfileDetails] = useState(() => getDefaultProfileDetails(""));
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [detailReturnPage, setDetailReturnPage] = useState("home");
  const [listDetailReturnPage, setListDetailReturnPage] = useState("lists");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const [popularSeriesLimit, setPopularSeriesLimit] = useState(popularSeriesStep);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("watchd_token");

      if (!token) {
        return;
      }

      try {
        const data = await getMe(token);

        setProfileDetails(mapUserToProfileDetails(data.user));
        setCurrentUserName(data.user.displayName || data.user.name);
        setCurrentUserEmail(data.user.email);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem("watchd_token");
        setCurrentUserName("");
        setCurrentUserEmail("");
        setIsLoggedIn(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    async function fetchSeries() {
      setIsLoading(true);
      setError("");

      try {
        if (!hasSearched) {
          const popularShows = await getMostPopularShows({
            limit: popularSeriesLimit,
            pages: 6,
          });

          setSeries(popularShows);
          return;
        }

        setSeries(await searchShows(searchTerm));
      } catch (requestError) {
        setError(requestError.message);
        setSeries([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeries();
  }, [hasSearched, searchTerm, popularSeriesLimit]);

  function handleShowMorePopularSeries() {
    setPopularSeriesLimit((currentLimit) =>
      Math.min(currentLimit + popularSeriesStep, maxPopularSeriesLimit)
    );
  }

  useEffect(() => {
    if (!shouldScrollToResults || isLoading || error || activePage !== "home") {
      return undefined;
    }

    let cancelSlide = () => { };
    let resetTimer = null;
    const scrollDuration = 1200;
    const timer = window.setTimeout(() => {
      cancelSlide = slideToElement("results", {
        duration: scrollDuration,
        offset: 86,
      });
      resetTimer = window.setTimeout(() => {
        setShouldScrollToResults(false);
      }, scrollDuration + 120);
    }, 120);

    return () => {
      window.clearTimeout(timer);
      if (resetTimer) window.clearTimeout(resetTimer);
      cancelSlide();
    };
  }, [activePage, error, isLoading, shouldScrollToResults, series]);

  useEffect(() => {
    function handlePopState(event) {
      const historyMode = getAuthModeFromHistoryState(event.state);

      if (historyMode) {
        setAuthMode(historyMode);
        setIsLoginVisible(true);
        return;
      }

      setIsLoginVisible(false);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setSelectedShowId(null);
      setSelectedListId(null);
      setActivePage(getPageFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function prepareSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a series name to search.");
      return null;
    }

    setSearchTerm(trimmedQuery);
    setHasSearched(true);
    setIsLoginVisible(false);
    setIsNavSearchOpen(false);
    setSelectedShowId(null);
    setSelectedListId(null);

    return trimmedQuery;
  }

  function handleHomeSearchSubmit(event) {
    event.preventDefault();

    if (!prepareSearch()) return;

    setActivePage("home");
    setShouldScrollToResults(true);

    if (window.location.hash !== "#catalog") {
      window.location.hash = "#catalog";
    }
  }

  function handleNavSearchSubmit(event) {
    event.preventDefault();

    if (!prepareSearch()) return;

    setActivePage("search");
    setShouldScrollToResults(false);

    if (window.location.hash !== "#search") {
      window.location.hash = "#search";
    }
  }

  async function handleLogin(credentials) {
    const data = await login(credentials.email, credentials.password);

    localStorage.setItem("watchd_token", data.token);

    const me = await getMe(data.token);

    setProfileDetails(mapUserToProfileDetails(me.user));
    setCurrentUserName(me.user.displayName || me.user.name);
    setCurrentUserEmail(me.user.email);
    setIsLoggedIn(true);
    closeAuthScreen();

  }

  async function handleRegister(credentials) {
    await register(credentials.name, credentials.email, credentials.password);

    const data = await login(credentials.email, credentials.password);

    localStorage.setItem("watchd_token", data.token);

    const me = await getMe(data.token);

    setProfileDetails(mapUserToProfileDetails(me.user));
    setCurrentUserName(me.user.displayName || me.user.name);
    setCurrentUserEmail(me.user.email);
    setIsLoggedIn(true);
    closeAuthScreen();
  }


  function handleLogout() {
    localStorage.removeItem("watchd_token");
    setCurrentUserName("");
    setCurrentUserEmail("");
    setProfileDetails(getDefaultProfileDetails(""));
    setIsLoggedIn(false);
  }

  function openAuthScreen(mode) {
    setAuthMode(mode);
    setIsLoginVisible(true);

    const currentHistoryMode = getAuthModeFromHistoryState(window.history.state);
    if (currentHistoryMode === mode) return;

    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};

    window.history.pushState(
      {
        ...currentState,
        watchdAuthMode: mode,
      },
      "",
      window.location.href
    );
  }

  function handleAuthModeChange(mode) {
    openAuthScreen(mode);
  }

  function closeAuthScreen() {
    if (getAuthModeFromHistoryState(window.history.state)) {
      window.history.back();
      return;
    }

    setIsLoginVisible(false);
  }

  function handleNavigate(page) {
    setSelectedShowId(null);
    setSelectedListId(null);
    setActivePage(page);

    const nextHash = getHashFromPage(page);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function handleListSelect(listId, returnPage = "lists") {
    setSelectedShowId(null);
    setSelectedListId(listId);
    setListDetailReturnPage(returnPage);
    setActivePage("listDetails");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSeriesSelect(showId, returnPage = "home") {
    setSelectedShowId(showId);
    setDetailReturnPage(returnPage);
    setActivePage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleProfileSave(nextProfile) {
    const token = localStorage.getItem("watchd_token");

    const normalizedProfile = {
      displayName: nextProfile.displayName.trim() || currentUserName,
      location: nextProfile.location.trim(),
      website: nextProfile.website.trim(),
      bio: nextProfile.bio.trim(),
    };

    setIsSavingProfile(true);
    setProfileSaveError("");

    try {
      const data = await updateProfile(token, normalizedProfile);

      setProfileDetails(mapUserToProfileDetails(data.user));
      setCurrentUserName(data.user.displayName || data.user.name);
      handleNavigate("profile");
    } catch (saveError) {
      setProfileSaveError(saveError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#14181c] text-slate-100">
      {!isLoginVisible && (
        <Navbar
          isLoggedIn={isLoggedIn}
          isNavSearchOpen={isNavSearchOpen}
          activePage={activePage}
          currentUserName={currentUserName}
          onNavigate={handleNavigate}
          onProfileClick={() => handleNavigate("profile")}
          onLoginClick={() => openAuthScreen("login")}
          onLogout={handleLogout}
          onRegisterClick={() => openAuthScreen("register")}
          onSearchClose={() => setIsNavSearchOpen(false)}
          onSearchOpen={() => setIsNavSearchOpen(true)}
          onSearchSubmit={handleNavSearchSubmit}
          query={query}
          setQuery={setQuery}
        />
      )}

      <div
        className={
          isLoginVisible
            ? "w-full overflow-hidden"
            : "mx-auto w-full max-w-1360px px-4 pb-10 sm:px-6 lg:px-8"
        }
      >
        {isLoginVisible ? (
          <LoginScreen
            email={loginEmail}
            mode={authMode}
            onBack={closeAuthScreen}
            onEmailChange={setLoginEmail}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onModeChange={handleAuthModeChange}
          />
        ) : activePage === "profile" ? (
          <ProfilePage
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
            onDiaryClick={() => handleNavigate("diary")}
            onEditProfileClick={() => handleNavigate("editProfile")}
            onListSelect={(listId) => handleListSelect(listId, "profile")}
            onSeriesSelect={handleSeriesSelect}
            onViewAllLists={() => handleNavigate("myLists")}
            profileDetails={profileDetails}
          />
        ) : activePage === "editProfile" ? (
          <EditProfilePage
            currentUserEmail={currentUserEmail}
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
            isSaving={isSavingProfile}
            onBack={() => handleNavigate("profile")}
            onSave={handleProfileSave}
            profileDetails={profileDetails}
            saveError={profileSaveError}
          />
        ) : activePage === "lists" ? (
          <ListPage onListSelect={handleListSelect} />
        ) : activePage === "myLists" ? (
          <MyListsPage
            isLoggedIn={isLoggedIn}
            onBack={() => handleNavigate("profile")}
          />
        ) : activePage === "listDetails" && selectedListId ? (
          <ListDetailPage
            listId={selectedListId}
            onBack={() => setActivePage(listDetailReturnPage)}
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "listDetails")}
          />
        ) : activePage === "diary" ? (
          <DiaryPage
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "diary")}
          />
        ) : activePage === "search" ? (
          <SearchResultsPage
            error={error}
            isLoading={isLoading}
            onSeriesSelect={handleSeriesSelect}
            searchTerm={searchTerm}
            series={series}
          />
        ) : activePage === "details" && selectedShowId ? (
          <SeriesDetailPage
            onBack={() => {
              setSelectedShowId(null);
              if (detailReturnPage === "listDetails" && selectedListId) {
                setActivePage("listDetails");
                return;
              }

              if (detailReturnPage === "profile") {
                setActivePage("profile");
                return;
              }

              if (detailReturnPage === "search") {
                setActivePage("search");
                return;
              }

              if (detailReturnPage === "diary") {
                setActivePage("diary");
                return;
              }

              setActivePage("home");
            }}
            showId={selectedShowId}
          />
        ) : (
          <>
            <Hero
              isLoading={isLoading}
              onSearchSubmit={handleHomeSearchSubmit}
              onSeriesSelect={handleSeriesSelect}
              query={query}
              series={series}
              setQuery={setQuery}
            />

            <div className="mx-auto mb-10 hidden w-full max-w-3xl overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-[0_18px_46px_rgba(0,0,0,0.5)] sm:block">
              <img
                className="block h-auto w-full"
                src={`${import.meta.env.BASE_URL}assets/banner.png`}
                alt="Watchd banner"
              />
            </div>

            {error && (
              <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
                {error}
              </p>
            )}

            <ResultsSection
              hasMore={popularSeriesLimit < maxPopularSeriesLimit}
              hasSearched={hasSearched}
              isLoading={isLoading}
              onSeriesSelect={handleSeriesSelect}
              onShowMore={handleShowMorePopularSeries}
              searchTerm={searchTerm}
              series={series}
            />
          </>
        )}
      </div>

      {!isLoginVisible && activePage === "home" && !selectedShowId && (
        <HomeFooter />
      )}
    </main>
  );
}









