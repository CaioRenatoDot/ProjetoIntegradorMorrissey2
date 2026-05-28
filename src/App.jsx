import { useEffect, useState } from "react";
import DiaryPage from "./components/DiaryPage";
import Hero from "./components/Hero";
import ListPage from "./components/ListPage";
import LoginScreen from "./components/LoginScreen";
import Navbar from "./components/Navbar";
import ResultsSection from "./components/ResultsSection";
import SeriesDetailPage from "./components/SeriesDetailPage";
import { getMostPopularShows, searchShows } from "./services/tvmaze";
import { shuffleItems } from "./utils/arrays";

export default function App() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [series, setSeries] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isNavSearchOpen, setIsNavSearchOpen] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [selectedShowId, setSelectedShowId] = useState(null);
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
  }

  function handleMockLogin(account) {
    setCurrentUserName(account.displayName);
    setIsLoggedIn(true);
    setIsLoginVisible(false);
  }

  function handleLogout() {
    setCurrentUserName("");
    setIsLoggedIn(false);
  }

  function openAuthScreen(mode) {
    setAuthMode(mode);
    setIsLoginVisible(true);
  }

  function handleNavigate(page) {
    setSelectedShowId(null);
    setActivePage(page);
  }

  function handleSeriesSelect(showId) {
    setSelectedShowId(showId);
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
            onBack={() => setIsLoginVisible(false)}
            onEmailChange={setLoginEmail}
            onLogin={handleMockLogin}
            onModeChange={setAuthMode}
          />
        ) : activePage === "lists" ? (
          <ListPage />
        ) : activePage === "diary" ? (
          <DiaryPage
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
          />
        ) : activePage === "details" && selectedShowId ? (
          <SeriesDetailPage
            onBack={() => {
              setSelectedShowId(null);
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

            <div className="mx-auto mb-10 hidden w-full overflow-hidden rounded border border-slate-800 bg-slate-950 sm:block sm:h-[110px] lg:h-[120px]">
              <img
                className="h-full w-full object-cover object-left"
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
    </main>
  );
}
