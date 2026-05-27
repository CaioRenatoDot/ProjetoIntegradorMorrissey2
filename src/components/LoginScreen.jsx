import { useEffect, useMemo, useState } from "react";
import { KeyRound, Lock, Mail, MailCheck, User } from "lucide-react";
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
  const isRenderedForgotMode = renderedMode === "forgot";
  const authCopy = getAuthCopy(renderedMode);
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
    <section className="grid min-h-dvh w-full overflow-hidden bg-black lg:min-h-screen lg:grid-cols-[3fr_2fr]">
      <div className="relative hidden min-h-[720px] flex-col justify-center gap-5 overflow-hidden bg-[#050505] py-8 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,192,48,0.18),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.72),transparent_48%,rgba(0,0,0,0.72))]" />

        <div className="absolute left-10 top-8 z-20">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c030]">
            {authCopy.eyebrow}
          </p>
          <h2 className="mt-2 max-w-md text-3xl font-black leading-tight text-white">
            {authCopy.feature}
          </h2>
        </div>

        <div className="relative z-10 mt-36 space-y-5">
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

      <div className="flex min-h-dvh items-center bg-[radial-gradient(circle_at_top_left,rgba(0,192,48,0.14),transparent_34%),#0d0d0d] px-5 py-6 sm:p-10 lg:min-h-0 lg:bg-[#0d0d0d]">
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <BrandLogo className="mb-7 sm:mb-12" onClick={onBack} />

          <div
            className={`transition duration-200 ease-out ${
              isModeVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >
            <div className="mb-6 lg:hidden">
              <p className="text-xs font-black uppercase tracking-wide text-[#00c030]">
                {authCopy.eyebrow}
              </p>
              <p className="mt-2 text-lg font-black leading-tight text-white">
                {authCopy.feature}
              </p>
            </div>

            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              {authCopy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {authCopy.description}
            </p>

            {isRenderedForgotMode ? (
              <ForgotPasswordForm
                email={email}
                onEmailChange={onEmailChange}
                onModeChange={onModeChange}
              />
            ) : isRenderedRegisterMode ? (
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
                onModeChange={onModeChange}
              />
            )}

            <p className="mt-8 text-sm text-slate-500">
              {authCopy.switchLabel}{" "}
              <button
                className="font-bold text-[#00c030] transition hover:text-[#32d85a]"
                onClick={() => onModeChange(authCopy.switchMode)}
                type="button"
              >
                {authCopy.switchAction}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function getAuthCopy(mode) {
  if (mode === "register") {
    return {
      description: "Build your profile and start saving your favorite series.",
      eyebrow: "Your next obsession starts here",
      feature: "Create your Watchd account and keep every story close.",
      switchAction: "Sign in",
      switchLabel: "Already have an account?",
      switchMode: "login",
      title: "Create your account",
    };
  }

  if (mode === "forgot") {
    return {
      description: "Enter your email and we will send a reset link.",
      eyebrow: "Back in one step",
      feature: "Reset your password and return to your watchlist.",
      switchAction: "Sign in",
      switchLabel: "Remembered your password?",
      switchMode: "login",
      title: "Forgot password",
    };
  }

  return {
    description: "Sign in to keep watching.",
    eyebrow: "Your next obsession starts here",
    feature: "Sign in and keep discovering unforgettable stories.",
    switchAction: "Create account",
    switchLabel: "New here?",
    switchMode: "register",
    title: "Welcome back",
  };
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

function LoginForm({ email, onEmailChange, onLogin, onModeChange }) {
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

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Label />
        <button
          className="font-bold text-[#00c030] transition hover:text-[#32d85a]"
          onClick={() => onModeChange("forgot")}
          type="button"
        >
          Forgot password
        </button>
      </div>

      <button className="min-h-12 w-full rounded-md bg-[#00c030] px-5 font-black text-[#ffffff] shadow-[0_0_28px_rgba(0,192,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#32d85a] hover:shadow-[0_14px_30px_rgba(0,192,48,0.22)]">
        Sign in
      </button>
    </form>
  );
}

function ForgotPasswordForm({ email, onEmailChange, onModeChange }) {
  const [isSent, setIsSent] = useState(false);

  function handleResetRequest(event) {
    event.preventDefault();
    setIsSent(true);
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleResetRequest}>
      <LoginField
        Icon={Mail}
        id="forgot-email"
        label="Email"
        onChange={(event) => {
          onEmailChange(event.target.value);
          setIsSent(false);
        }}
        placeholder="caio@email.com"
        type="email"
        value={email}
      />

      {isSent && (
        <div className="flex items-start gap-3 rounded-md border border-[#00c030]/30 bg-[#00c030]/10 p-4 text-sm leading-6 text-slate-200">
          <MailCheck
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 flex-none text-[#00c030]"
            strokeWidth={2.4}
          />
          <p>
            If this email is registered, a reset link is on its way.
          </p>
        </div>
      )}

      <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#00c030] px-5 font-black text-[#ffffff] shadow-[0_0_28px_rgba(0,192,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#32d85a] hover:shadow-[0_14px_30px_rgba(0,192,48,0.22)]">
        <KeyRound aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
        Send reset link
      </button>

      <button
        className="min-h-12 w-full rounded-md border border-zinc-800 px-5 font-black text-slate-200 transition hover:border-[#00c030]/70 hover:text-white"
        onClick={() => onModeChange("login")}
        type="button"
      >
        Back to sign in
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
          className="min-h-12 w-full min-w-0 rounded-md border border-zinc-800 bg-zinc-900 px-4 pl-11 text-base text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-[#00c030] focus:bg-black focus:ring-4 focus:ring-[#00c030]/15 sm:text-sm"
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
        className={`flex w-max gap-2 transition-transform duration-[1900ms] ease-linear sm:gap-3 lg:gap-4 ${directionClass}`}
      >
        {[...shows, ...shows].map((show, showIndex) => (
          <article
            className="relative w-20 flex-none sm:w-28 md:w-32 lg:w-36"
            key={`${query}-${show.id}-${showIndex}`}
          >
            <img
              className="aspect-[2/3] w-full rounded border border-slate-500/30 object-cover shadow-2xl shadow-black/50 sm:rounded-lg"
              src={show.image?.medium || fallbackPoster}
              alt={`Poster for ${show.name}`}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
