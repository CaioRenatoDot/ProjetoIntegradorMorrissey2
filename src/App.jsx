import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import LoginScreen from "./components/LoginScreen";
import Navbar from "./components/Navbar";
import ResultsSection from "./components/ResultsSection";
import { randomFilmSearches } from "./data/constants";
import { searchShows } from "./services/tvmaze";
import { getRandomItems, shuffleItems } from "./utils/arrays";

export default function App() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [series, setSeries] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isNavSearchOpen, setIsNavSearchOpen] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("caio@email.com");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSeries() {
      setIsLoading(true);
      setError("");

      try {
        if (!hasSearched) {
          const selectedSearches = getRandomItems(randomFilmSearches, 4);
          const responses = await Promise.all(
            selectedSearches.map((term) => searchShows(term))
          );

          const uniqueShows = new Map();
          responses
            .flat()
            .filter((show) => show.image?.medium)
            .forEach((show) => uniqueShows.set(show.id, show));

          setSeries(shuffleItems([...uniqueShows.values()]).slice(0, 18));
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
      setError("Digite o nome de uma serie para pesquisar.");
      return;
    }

    setSearchTerm(trimmedQuery);
    setHasSearched(true);
    setIsLoginVisible(false);
  }

  function handleMockLogin(event) {
    event.preventDefault();
    setIsLoggedIn(true);
    setIsLoginVisible(false);
  }

  return (
    <main className="min-h-screen bg-[#14181c] text-slate-100">
      {!isLoginVisible && (
        <Navbar
          isLoggedIn={isLoggedIn}
          isNavSearchOpen={isNavSearchOpen}
          onLoginClick={() => setIsLoginVisible(true)}
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
            : "mx-auto max-w-6xl px-4 pb-8"
        }
      >
        {isLoginVisible ? (
          <LoginScreen
            email={loginEmail}
            onBack={() => setIsLoginVisible(false)}
            onEmailChange={setLoginEmail}
            onLogin={handleMockLogin}
            series={series}
          />
        ) : (
          <>
            <Hero
              onSearchSubmit={handleSubmit}
              query={query}
              series={series}
              setQuery={setQuery}
            />

            {error && (
              <p className="mb-6 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
                {error}
              </p>
            )}

            <ResultsSection
              hasSearched={hasSearched}
              isLoading={isLoading}
              searchTerm={searchTerm}
              series={series}
            />
          </>
        )}
      </div>
    </main>
  );
}
