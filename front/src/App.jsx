import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import DiaryPage from "./components/DiaryPage";
import EditProfilePage from "./components/EditProfilePage";
import Hero from "./components/Hero";
import AccessibilityMenu from "./components/AccessibilityMenu";
import HomeFooter from "./components/HomeFooter";
import ListDetailPage from "./components/ListDetailPage";
import ListPage from "./components/ListPage";
import LoginScreen from "./components/LoginScreen";
import MyListsPage from "./components/MyListsPage";
import MySeriesPage from "./components/MySeriesPage";
import MyWatchlistPage from "./components/MyWatchlistPage";
import Navbar from "./components/Navbar";
import ProfilePage from "./components/ProfilePage";
import ResultsSection from "./components/ResultsSection";
import SearchResultsPage from "./components/SearchResultsPage";
import SeriesDetailPage from "./components/SeriesDetailPage";
import { getMostPopularShows, searchShows } from "./services/tvmaze";
import { deleteAccount, login, logout, register, getMe, updateProfile } from "./services/api";
import { clearSessionToken, getSessionToken, saveSessionToken } from "./services/session";
import {
  BASE_PATH,
  LIST_HASH_PREFIX,
  SERIES_HASH_PREFIX,
  getHashFromPage,
  getHistoryState,
  getNavigationFromLocation,
} from "./utils/routes";


function getAuthModeFromHistoryState(state) {
  if (!state || typeof state !== "object") return null;

  const mode = state.watchdAuthMode;
  if (mode === "login" || mode === "register" || mode === "forgot") {
    return mode;
  }

  return null;
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

// A API so aceita site com http(s); quem digita "meusite.com" ganha o
// https:// automaticamente em vez de um erro.
function normalizeWebsite(website) {
  const trimmed = website.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
  const [initialNavigation] = useState(getNavigationFromLocation);
  const [activePage, setActivePage] = useState(initialNavigation.page);
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [usernameChangedAt, setUsernameChangedAt] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");
  const [profileDetails, setProfileDetails] = useState(() => getDefaultProfileDetails(""));
  const [selectedShowId, setSelectedShowId] = useState(initialNavigation.showId);
  const [selectedListId, setSelectedListId] = useState(initialNavigation.listId);
  const [selectedUsername, setSelectedUsername] = useState(initialNavigation.username);
  const [detailReturnPage, setDetailReturnPage] = useState(initialNavigation.detailReturnPage);
  const [listDetailReturnPage, setListDetailReturnPage] = useState(
    initialNavigation.listDetailReturnPage
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const [popularSeriesLimit, setPopularSeriesLimit] = useState(popularSeriesStep);

  useEffect(() => {
    async function restoreSession() {
      const token = getSessionToken();

      if (!token) {
        return;
      }

      try {
        const data = await getMe();
        applySignedInUser(data.user);
      } catch (error) {
        clearSignedInUser();
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
    function syncRouteFromUrl() {
      const navigation = getNavigationFromLocation();

      setSelectedShowId(navigation.showId);
      setSelectedListId(navigation.listId);
      setSelectedUsername(navigation.username);
      setDetailReturnPage(navigation.detailReturnPage);
      setListDetailReturnPage(navigation.listDetailReturnPage);
      setActivePage(navigation.page);
    }

    window.addEventListener("hashchange", syncRouteFromUrl);
    window.addEventListener("popstate", syncRouteFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncRouteFromUrl);
      window.removeEventListener("popstate", syncRouteFromUrl);
    };
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
    setSelectedUsername(null);

    return trimmedQuery;
  }

  function handleHomeSearchSubmit(event) {
    event.preventDefault();

    if (!prepareSearch()) return;

    setActivePage("home");
    setShouldScrollToResults(true);

    const nextUrl = `${BASE_PATH}#catalog`;
    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }
  }

  function handleNavSearchSubmit(event) {
    event.preventDefault();

    if (!prepareSearch()) return;

    setActivePage("search");
    setShouldScrollToResults(false);

    const nextUrl = `${BASE_PATH}#search`;
    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }
  }

  function applySignedInUser(user) {
    setProfileDetails(mapUserToProfileDetails(user));
    setCurrentUserName(user.displayName || user.name);
    setCurrentUsername(user.username || "");
    setUsernameChangedAt(user.usernameChangedAt || null);
    setCurrentUserEmail(user.email);
    setIsLoggedIn(true);
  }

  function clearSignedInUser() {
    clearSessionToken();
    setCurrentUserName("");
    setCurrentUsername("");
    setUsernameChangedAt(null);
    setCurrentUserEmail("");
    setProfileDetails(getDefaultProfileDetails(""));
    setIsLoggedIn(false);
  }

  async function signIn(email, password) {
    const data = await login(email, password);
    saveSessionToken(data.token);

    const me = await getMe();
    applySignedInUser(me.user);
    closeAuthScreen();
  }

  async function handleLogin(credentials) {
    await signIn(credentials.email, credentials.password);
  }

  async function handleRegister(credentials) {
    await register(credentials.name, credentials.email, credentials.password);
    await signIn(credentials.email, credentials.password);
  }

  async function handleLogout() {
    // Limpa o cookie httpOnly no servidor; o token local serve de alternativa
    // quando o navegador bloqueia o cookie de terceiros.
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao encerrar a sessao:", error);
    }

    clearSignedInUser();
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

    const nextState = { ...currentState, watchdAuthMode: mode };

    // Alternar entre login e cadastro apenas troca o modo da entrada atual.
    // Empilhar uma entrada por troca deixava entradas antigas no historico, e
    // o history.back() do login bem-sucedido caia numa delas, reabrindo a tela
    // de cadastro em vez de sair do fluxo de autenticacao.
    if (currentHistoryMode) {
      window.history.replaceState(nextState, "", window.location.href);
      return;
    }

    window.history.pushState(nextState, "", window.location.href);
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
    const nextUrl = `${BASE_PATH}${getHashFromPage(page)}`;
    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }

    setSelectedShowId(null);
    setSelectedListId(null);
    setSelectedUsername(null);
    setActivePage(page);
  }

  function handleListSelect(listId, returnPage = "lists") {
    window.history.pushState(
      {
        watchdListId: listId,
        watchdListReturnPage: returnPage,
        watchdUsername: selectedUsername,
      },
      "",
      `${BASE_PATH}${LIST_HASH_PREFIX}${encodeURIComponent(listId)}`
    );

    setSelectedShowId(null);
    setSelectedListId(listId);
    setListDetailReturnPage(returnPage);
    setActivePage("listDetails");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUserSelect(username) {
    const nextUrl = `${BASE_PATH}${encodeURIComponent(username)}`;
    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }

    setSelectedShowId(null);
    setSelectedListId(null);
    setSelectedUsername(username);
    setActivePage("publicProfile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToMyProfile() {
    if (isLoggedIn && currentUsername) {
      handleUserSelect(currentUsername);
    } else {
      handleNavigate("profile");
    }
  }

  function handleSeriesSelect(rawShowId, returnPage = "home") {
    // Listas e reviews guardam o id como texto; a URL e lida como numero.
    // Normalizar aqui mantem o state e a rota comparaveis no botao voltar.
    const showId = Number(rawShowId);
    const isFromList = returnPage === "listDetails";

    window.history.pushState(
      {
        watchdShowId: showId,
        watchdReturnPage: returnPage,
        watchdReturnListId: isFromList ? selectedListId : null,
        watchdListReturnPage: isFromList ? listDetailReturnPage : null,
        watchdUsername: selectedUsername,
      },
      "",
      `${BASE_PATH}${SERIES_HASH_PREFIX}${showId}`
    );

    setSelectedShowId(showId);
    setDetailReturnPage(returnPage);
    setActivePage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Botao voltar de serie/lista. Se a entrada atual foi empilhada pelo
  // proprio app, o history.back() devolve a pagina anterior com URL e scroll.
  // Se o usuario chegou por um link direto, nao ha para onde voltar no
  // historico, entao navega para a pagina de origem (ou a padrao).
  function leaveDetailPage(stateKey, currentId, returnPage) {
    if (getHistoryState()[stateKey] === currentId && window.history.length > 1) {
      window.history.back();
      return;
    }

    if (returnPage === "publicProfile" && selectedUsername) {
      handleUserSelect(selectedUsername);
      return;
    }

    if (returnPage === "listDetails" && selectedListId) {
      handleListSelect(selectedListId, listDetailReturnPage);
      return;
    }

    handleNavigate(returnPage);
  }

  async function handleDeleteAccount(password) {
    await deleteAccount(password);

    handleLogout();
    handleNavigate("home");
  }

  async function handleProfileSave(nextProfile) {
    const normalizedProfile = {
      displayName: nextProfile.displayName.trim() || currentUserName,
      location: nextProfile.location.trim(),
      website: normalizeWebsite(nextProfile.website),
      bio: nextProfile.bio.trim(),
      ...(nextProfile.username ? { username: nextProfile.username } : {}),
    };

    setIsSavingProfile(true);
    setProfileSaveError("");

    try {
      const data = await updateProfile(normalizedProfile);

      setProfileDetails(mapUserToProfileDetails(data.user));
      setCurrentUserName(data.user.displayName || data.user.name);
      setCurrentUsername(data.user.username || "");
      setUsernameChangedAt(data.user.usernameChangedAt || null);

      if (data.user.username) {
        handleUserSelect(data.user.username);
      } else {
        handleNavigate("profile");
      }
    } catch (saveError) {
      setProfileSaveError(saveError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  const pageKey = isLoginVisible
    ? `auth`
    : activePage === "details"
      ? `details-${selectedShowId}`
      : activePage === "listDetails"
        ? `list-${selectedListId}`
        : activePage === "publicProfile"
          ? `user-${selectedUsername}`
          : activePage;

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen overflow-x-clip bg-[#14181c] text-slate-100">
      {!isLoginVisible && (
        <Navbar
          isLoggedIn={isLoggedIn}
          isNavSearchOpen={isNavSearchOpen}
          activePage={activePage}
          currentUserName={currentUserName}
          onNavigate={handleNavigate}
          onProfileClick={goToMyProfile}
          onLoginClick={() => openAuthScreen("login")}
          onLogout={handleLogout}
          onRegisterClick={() => openAuthScreen("register")}
          onSearchClose={() => setIsNavSearchOpen(false)}
          onSearchOpen={() => setIsNavSearchOpen(true)}
          onSearchSubmit={handleNavSearchSubmit}
          onSettingsClick={() => handleNavigate("editProfile")}
          query={query}
          setQuery={setQuery}
        />
      )}

      <div
        className={
          isLoginVisible
            ? "w-full overflow-hidden"
            : "mx-auto w-full max-w-340 px-4 pb-10 sm:px-6 lg:px-8"
        }
      >
        <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          key={pageKey}
          transition={{ duration: 0.18, ease: "easeOut" }}
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
            currentUsername={currentUsername}
            isLoggedIn={isLoggedIn}
            onDiaryClick={() => handleNavigate("diary")}
            onEditProfileClick={() => handleNavigate("editProfile")}
            onListSelect={(listId) => handleListSelect(listId, "profile")}
            onSeriesSelect={handleSeriesSelect}
            onSeriesTabClick={() => handleNavigate("mySeries")}
            onViewAllLists={() => handleNavigate("myLists")}
            onWatchlistTabClick={() => handleNavigate("myWatchlist")}
            profileDetails={profileDetails}
          />
        ) : activePage === "editProfile" ? (
          <EditProfilePage
            currentUserEmail={currentUserEmail}
            currentUserName={currentUserName}
            currentUsername={currentUsername}
            usernameChangedAt={usernameChangedAt}
            isLoggedIn={isLoggedIn}
            isSaving={isSavingProfile}
            onBack={() => handleNavigate("profile")}
            onDeleteAccount={handleDeleteAccount}
            onSave={handleProfileSave}
            profileDetails={profileDetails}
            saveError={profileSaveError}
          />
        ) : activePage === "lists" ? (
          <ListPage onListSelect={handleListSelect} onCreatorSelect={handleUserSelect} />
        ) : activePage === "publicProfile" && selectedUsername ? (
          <ProfilePage
            key={selectedUsername}
            currentUserName={currentUserName}
            currentUsername={currentUsername}
            isLoggedIn={isLoggedIn}
            onDiaryClick={() => handleNavigate("diary")}
            onEditProfileClick={() => handleNavigate("editProfile")}
            onListSelect={(listId) =>
              handleListSelect(
                listId,
                selectedUsername === currentUsername ? "profile" : "lists"
              )
            }
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "publicProfile")}
            onSeriesTabClick={() => handleNavigate("mySeries")}
            onViewAllLists={() => handleNavigate("myLists")}
            onWatchlistTabClick={() => handleNavigate("myWatchlist")}
            profileDetails={profileDetails}
            viewedUsername={selectedUsername}
          />
        ) : activePage === "myLists" ? (
          <MyListsPage
            isLoggedIn={isLoggedIn}
            onBack={() => handleNavigate("profile")}
            onListSelect={(listId) => handleListSelect(listId, "myLists")}
          />
        ) : activePage === "listDetails" && selectedListId ? (
          <ListDetailPage
            isPublic={listDetailReturnPage === "lists"}
            listId={selectedListId}
            onBack={() =>
              leaveDetailPage("watchdListId", selectedListId, listDetailReturnPage)
            }
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "listDetails")}
          />
        ) : activePage === "diary" ? (
          <DiaryPage
            currentUserName={currentUserName}
            isLoggedIn={isLoggedIn}
            onBack={() => handleNavigate("profile")}
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "diary")}
          />
        ) : activePage === "mySeries" ? (
          <MySeriesPage
            isLoggedIn={isLoggedIn}
            onBack={() => handleNavigate("profile")}
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "mySeries")}
          />
        ) : activePage === "myWatchlist" ? (
          <MyWatchlistPage
            isLoggedIn={isLoggedIn}
            onBack={() => handleNavigate("profile")}
            onSeriesSelect={(showId) => handleSeriesSelect(showId, "myWatchlist")}
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
            onSeriesSelect={(showId) => handleSeriesSelect(showId, detailReturnPage)}
            onBack={() => leaveDetailPage("watchdShowId", selectedShowId, detailReturnPage)}
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

            <div className="mx-auto mb-10 hidden w-full max-w-3xl sm:block">
              <p className="mb-1.5 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                Watchd · Ad
              </p>
              <div className="overflow-hidden rounded border border-slate-700 bg-slate-950 shadow-[0_18px_46px_rgba(0,0,0,0.5)]">
                <img
                  className="block h-auto w-full"
                  src={`${import.meta.env.BASE_URL}assets/banner.png`}
                  alt="Watchd banner"
                />
              </div>
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
        </motion.div>
        </AnimatePresence>
      </div>

      {!isLoginVisible && activePage === "home" && !selectedShowId && (
        <HomeFooter />
      )}

      {/* Fica fora da transicao de pagina para nao piscar ao navegar. */}
      <AccessibilityMenu />
    </main>
    </MotionConfig>
  );
}









