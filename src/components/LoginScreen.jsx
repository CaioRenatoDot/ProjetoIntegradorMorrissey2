import { useEffect, useMemo, useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import {
  fallbackPoster,
  rowShiftLeft,
  rowShiftRight,
} from "../data/constants";
import { getMostPopularShows } from "../services/tvmaze";
import BrandLogo from "./BrandLogo";
import Label from "./Label";
import SkeletonPosterRow from "./SkeletonPosterRow";

export default function LoginScreen({
  email,
  mode = "login",
  onBack,
  onEmailChange,
  onLogin,
  onModeChange,
  series,
}) {
  const isRegisterMode = mode === "register";
  const [renderedMode, setRenderedMode] = useState(mode);
  const [isModeVisible, setIsModeVisible] = useState(true);
  const isRenderedRegisterMode = renderedMode === "register";
  const fallbackShows = useMemo(
    () =>
      series.length
        ? series.slice(0, 8)
        : [
            {
              id: "mock-1",
              name: "Breaking Bad",
              image: { medium: fallbackPoster },
            },
            { id: "mock-2", name: "Dark", image: { medium: fallbackPoster } },
            {
              id: "mock-3",
              name: "The Office",
              image: { medium: fallbackPoster },
            },
          ],
    [series]
  );
  const fallbackRows = useMemo(() => buildPosterRows(fallbackShows), [fallbackShows]);
  const [posterRows, setPosterRows] = useState(fallbackRows);
  const [isRowsLoading, setIsRowsLoading] = useState(true);
  const [rowStep, setRowStep] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchLoginRows() {
      setIsRowsLoading(true);

      try {
        const popularShows = await getMostPopularShows({ limit: 24, pages: 6 });
        const rows = buildPosterRows(popularShows);

        if (isMounted) setPosterRows(rows);
      } catch {
        if (isMounted) setPosterRows(fallbackRows);
      } finally {
        if (isMounted) setIsRowsLoading(false);
      }
    }

    fetchLoginRows();

    return () => {
      isMounted = false;
    };
  }, [fallbackRows]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRowStep((currentStep) => (currentStep + 1) % rowShiftLeft.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mode === renderedMode) return undefined;

    setIsModeVisible(false);

    const swapTimer = window.setTimeout(() => {
      setRenderedMode(mode);
      window.requestAnimationFrame(() => setIsModeVisible(true));
    }, 120);

    return () => window.clearTimeout(swapTimer);
  }, [mode, renderedMode]);

  return (
    <section className="grid min-h-screen w-full overflow-hidden bg-black lg:grid-cols-[3fr_2fr]">
      <div className="relative flex min-h-[440px] flex-col justify-center gap-5 overflow-hidden bg-[#050505] py-8 lg:min-h-[720px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,192,48,0.18),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.72),transparent_48%,rgba(0,0,0,0.72))]" />

        <div className="absolute left-6 top-8 z-20 sm:left-10">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c030]">
            Your next obsession starts here
          </p>
          <h2 className="mt-2 max-w-md text-2xl font-black text-white sm:text-3xl">
            Sign in and keep discovering unforgettable stories.
          </h2>
        </div>

        <div className="relative z-10 mt-28 space-y-5 sm:mt-36">
          {isRowsLoading
            ? fallbackRows.map((row, index) => (
                <SkeletonPosterRow key={row.query} reverse={index % 2 !== 0} />
              ))
            : posterRows.map((row, index) => (
                <PosterRow
                  directionClass={
                    index % 2 === 0
                      ? rowShiftRight[rowStep]
                      : rowShiftLeft[rowStep]
                  }
                  key={row.query}
                  query={row.query}
                  shows={row.shows}
                />
              ))}
        </div>
      </div>

      <div className="flex items-center bg-[#0d0d0d] p-6 sm:p-10">
        <div className="w-full">
          <BrandLogo className="mb-12" onClick={onBack} />

          <div
            className={`transition duration-200 ease-out ${
              isModeVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >
            <h1 className="text-4xl font-black text-white">
              {isRenderedRegisterMode ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isRenderedRegisterMode
                ? "Build your profile and start saving your favorite series."
                : "Sign in to keep watching."}
            </p>

            {isRenderedRegisterMode ? (
              <RegisterForm
                email={email}
                onEmailChange={onEmailChange}
                onRegister={onLogin}
              />
            ) : (
              <LoginForm
                email={email}
                onEmailChange={onEmailChange}
                onLogin={onLogin}
              />
            )}

            <p className="mt-8 text-sm text-slate-500">
              {isRenderedRegisterMode ? "Already have an account?" : "New here?"}{" "}
              <button
                className="font-bold text-[#00c030] transition hover:text-[#32d85a]"
                onClick={() =>
                  onModeChange(isRenderedRegisterMode ? "login" : "register")
                }
                type="button"
              >
                {isRenderedRegisterMode ? "Sign in" : "Create account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildPosterRows(shows) {
  const rowSize = Math.ceil(shows.length / 3);

  return Array.from({ length: 3 }, (_, index) => {
    const rowShows = shows.slice(index * rowSize, index * rowSize + rowSize);
    return {
      query: `top-rated-${index}`,
      shows: rowShows.length ? rowShows : shows,
    };
  });
}

function RegisterForm({ email, onEmailChange, onRegister }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const passwordsDoNotMatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;

  function handleRegister(event) {
    event.preventDefault();

    if (passwordsDoNotMatch) return;

    onRegister(event);
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleRegister}>
      <LoginField
        Icon={User}
        id="register-name"
        label="Name"
        placeholder="Your name"
        type="text"
      />
      <LoginField
        Icon={Mail}
        id="register-email"
        label="Email"
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="caio@email.com"
        type="email"
        value={email}
      />
      <LoginField
        Icon={Lock}
        id="register-password"
        label="Password"
        minLength="6"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Create a password"
        type="password"
        value={password}
      />
      <LoginField
        Icon={Lock}
        id="register-confirm-password"
        label="Confirm password"
        minLength="6"
        onChange={(event) => setPasswordConfirmation(event.target.value)}
        placeholder="Repeat your password"
        type="password"
        value={passwordConfirmation}
      />
      {passwordsDoNotMatch && (
        <p className="text-sm font-bold text-red-300">
          Passwords need to match.
        </p>
      )}

      <div className="text-sm">
        <Label />
      </div>

      <button
        className="min-h-12 w-full rounded-md bg-[#00c030] px-5 font-black text-[#ffffff] shadow-[0_0_28px_rgba(0,192,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#32d85a] hover:shadow-[0_14px_30px_rgba(0,192,48,0.22)] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none disabled:hover:translate-y-0"
        disabled={passwordsDoNotMatch}
      >
        Create account
      </button>
    </form>
  );
}

function LoginForm({ email, onEmailChange, onLogin }) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onLogin}>
      <LoginField
        Icon={Mail}
        id="login-email"
        label="Email"
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="caio@email.com"
        type="email"
        value={email}
      />
      <LoginField
        Icon={Lock}
        id="login-password"
        label="Password"
        placeholder="Enter any password"
        type="password"
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <Label />
        <a
          className="font-bold text-[#00c030] transition hover:text-[#32d85a]"
          href="#login"
        >
          Forgot password
        </a>
      </div>

      <button className="min-h-12 w-full rounded-md bg-[#00c030] px-5 font-black text-[#ffffff] shadow-[0_0_28px_rgba(0,192,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#32d85a] hover:shadow-[0_14px_30px_rgba(0,192,48,0.22)]">
        Sign in
      </button>
    </form>
  );
}

function LoginField({ Icon, id, label, ...inputProps }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-300" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          strokeWidth={2.4}
        />
        <input
          className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 pl-11 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-[#00c030] focus:bg-black focus:ring-4 focus:ring-[#00c030]/15"
          id={id}
          required
          {...inputProps}
        />
      </div>
    </div>
  );
}

function PosterRow({ directionClass, query, shows }) {
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-max gap-3 transition-transform duration-[1900ms] ease-linear sm:gap-4 ${directionClass}`}
      >
        {[...shows, ...shows].map((show, showIndex) => (
          <article
            className="relative w-24 flex-none sm:w-32 lg:w-36"
            key={`${query}-${show.id}-${showIndex}`}
          >
            <img
              className="aspect-[2/3] w-full rounded-lg border border-slate-500/30 object-cover shadow-2xl shadow-black/50"
              src={show.image?.medium || fallbackPoster}
              alt={`Poster for ${show.name}`}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
