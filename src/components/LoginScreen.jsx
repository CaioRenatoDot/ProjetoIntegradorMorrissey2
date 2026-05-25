import { useEffect, useMemo, useState } from "react";
import {
  fallbackPoster,
  loginRowSearches,
  rowShiftLeft,
  rowShiftRight,
} from "../data/constants";
import { searchShows } from "../services/tvmaze";
import Label from "./Label";
import SkeletonPosterRow from "./SkeletonPosterRow";

export default function LoginScreen({
  email,
  onBack,
  onEmailChange,
  onLogin,
  series,
}) {
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
  const [posterRows, setPosterRows] = useState(
    loginRowSearches.map((query) => ({ query, shows: fallbackShows }))
  );
  const [isRowsLoading, setIsRowsLoading] = useState(true);
  const [rowStep, setRowStep] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchLoginRows() {
      const usedIds = new Set();
      setIsRowsLoading(true);

      try {
        const rows = await Promise.all(
          loginRowSearches.map(async (query) => {
            const shows = (await searchShows(query))
              .filter((show) => show.image?.medium && !usedIds.has(show.id))
              .slice(0, 8);

            shows.forEach((show) => usedIds.add(show.id));
            return { query, shows: shows.length ? shows : fallbackShows };
          })
        );

        if (isMounted) setPosterRows(rows);
      } catch {
        if (isMounted) {
          setPosterRows(
            loginRowSearches.map((query) => ({ query, shows: fallbackShows }))
          );
        }
      } finally {
        if (isMounted) setIsRowsLoading(false);
      }
    }

    fetchLoginRows();

    return () => {
      isMounted = false;
    };
  }, [fallbackShows]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRowStep((currentStep) => (currentStep + 1) % rowShiftLeft.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="grid min-h-screen w-full overflow-hidden bg-black lg:grid-cols-[3fr_2fr]">
      <div className="relative flex min-h-[440px] flex-col justify-center gap-5 overflow-hidden bg-[#050505] py-8 lg:min-h-[720px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,192,48,0.18),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.72),transparent_48%,rgba(0,0,0,0.72))]" />

        <div className="absolute left-6 top-8 z-20 sm:left-10">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c030]">
            Seu proximo vicio comeca aqui
          </p>
          <h2 className="mt-2 max-w-md text-2xl font-black text-white sm:text-3xl">
            Entre e continue descobrindo historias memoraveis.
          </h2>
        </div>

        <div className="relative z-10 mt-28 space-y-5 sm:mt-36">
          {isRowsLoading
            ? loginRowSearches.map((query, index) => (
                <SkeletonPosterRow key={query} reverse={index % 2 !== 0} />
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
          <button
            className="mb-12 font-serif text-3xl font-bold text-white"
            onClick={onBack}
            type="button"
          >
            Watchd
          </button>

          <h1 className="text-4xl font-black text-white">Bem-vindo de volta</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Faca login para continuar assistindo
          </p>

          <LoginForm
            email={email}
            onEmailChange={onEmailChange}
            onLogin={onLogin}
          />

          <p className="mt-8 text-sm text-slate-500">
            Novo por aqui?{" "}
            <a
              className="font-bold text-[#00c030] transition hover:text-[#32d85a]"
              href="#login"
            >
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function LoginForm({ email, onEmailChange, onLogin }) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onLogin}>
      <LoginField
        icon="@"
        id="login-email"
        label="Email"
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="caio@email.com"
        type="email"
        value={email}
      />
      <LoginField
        icon="#"
        id="login-password"
        label="Senha"
        placeholder="Digite qualquer senha"
        type="password"
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <Label />
        <a
          className="font-bold text-[#00c030] transition hover:text-[#32d85a]"
          href="#login"
        >
          Esqueci minha senha
        </a>
      </div>

      <button className="min-h-12 w-full rounded-md bg-[#00c030] px-5 font-black text-[#0d0d0d] shadow-[0_0_28px_rgba(0,192,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#32d85a] hover:shadow-[0_14px_30px_rgba(0,192,48,0.22)]">
        Entrar
      </button>
    </form>
  );
}

function LoginField({ icon, id, label, ...inputProps }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-300" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
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
            className="w-24 flex-none sm:w-32 lg:w-36"
            key={`${query}-${show.id}-${showIndex}`}
          >
            <img
              className="aspect-[2/3] w-full rounded-lg border border-slate-500/30 object-cover shadow-2xl shadow-black/50"
              src={show.image?.medium || fallbackPoster}
              alt={`Poster da serie ${show.name}`}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
