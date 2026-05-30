import { useEffect, useState } from "react";
import DiaryPage from "./components/DiaryPage";
import Hero from "./components/Hero";
import HomeFooter from "./components/HomeFooter";
import ListDetailPage from "./components/ListDetailPage";
import ListPage from "./components/ListPage";
import LoginScreen from "./components/LoginScreen";
import Navbar from "./components/Navbar";
import ResultsSection from "./components/ResultsSection";
import SeriesDetailPage from "./components/SeriesDetailPage";
import { getMostPopularShows, searchShows } from "./services/tvmaze";
import { shuffleItems } from "./utils/arrays";

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
  return "home";
}

function getHashFromPage(page) {
  if (page === "diary") return "#diary";
  if (page === "lists") return "#lists";
  return "#catalog";
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
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [detailReturnPage, setDetailReturnPage] = useState("home");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSeries() {
      setIsLoading(true);
      setError("");

      try {
        if (!hasSearched) {
          const popularShows = await getMostPopularShows({
            limit: 60,
            pages: 6,
          });

          setSeries(shuffleItems(popularShows).slice(0, 18));
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
  }, [hasSearched, searchTerm]);

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

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Enter a series name to search.");
      return;
    }

    setSearchTerm(trimmedQuery);
    setHasSearched(true);
    setIsLoginVisible(false);
    setActivePage("home");
    setSelectedShowId(null);
    setSelectedListId(null);
  }

  function handleMockLogin(account) {
    setCurrentUserName(account.displayName);
    setIsLoggedIn(true);
    closeAuthScreen();
  }

  function handleLogout() {
    setCurrentUserName("");
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

  function handleListSelect(listId) {
    setSelectedShowId(null);
    setSelectedListId(listId);
    setActivePage("listDetails");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSeriesSelect(showId, returnPage = "home") {
    setSelectedShowId(showId);
    setDetailReturnPage(returnPage);
    setActivePage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          onLoginClick={() => openAuthScreen("login")}
          onLogout={handleLogout}
          onRegisterClick={() => openAuthScreen("register")}
          onSearchClose={() => setIsNavSearchOpen(false)}
          onSearchOpen={() => setIsNavSearchOpen(true)}
          onSearchSubmit={handleSubmit}
          query={query}
          setQuery={setQuery}
        />
      )}

      <div
        className={
          isLoginVisible
            ? "w-full overflow-hidden"
            : "mx-auto w-full max-w-[1360px] px-4 pb-10 sm:px-6 lg:px-8"
        }
      >
        {isLoginVisible ? (
          <LoginScreen
            email={loginEmail}
            mode={authMode}
            onBack={closeAuthScreen}
            onEmailChange={setLoginEmail}
            onLogin={handleMockLogin}
            onModeChange={handleAuthModeChange}
          />
        ) : activePage === "lists" ? (
          <ListPage onListSelect={handleListSelect} />
        ) : activePage === "listDetails" && selectedListId ? (
          <ListDetailPage
            listId={selectedListId}
            onBack={() => setActivePage("lists")}
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "listDetails")}
          />
        ) : activePage === "diary" ? (
          <DiaryPage
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
          />
        ) : activePage === "details" && selectedShowId ? (
          <SeriesDetailPage
            onBack={() => {
              setSelectedShowId(null);
              if (detailReturnPage === "listDetails" && selectedListId) {
                setActivePage("listDetails");
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
              onSearchSubmit={handleSubmit}
              query={query}
              series={series}
              setQuery={setQuery}
            />

            <div className="mx-auto mb-10 hidden w-full max-w-[950px] overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-[0_18px_46px_rgba(0,0,0,0.5)] sm:block">
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
              hasSearched={hasSearched}
              isLoading={isLoading}
              onSeriesSelect={handleSeriesSelect}
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
