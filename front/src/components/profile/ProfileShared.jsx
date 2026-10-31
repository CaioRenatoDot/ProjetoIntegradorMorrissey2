// Pecas pequenas reaproveitadas pelas secoes do perfil.

export function ProfileShelfHeader({ action, title }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-700 pb-2">
      <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-[#9abbd1]">
        {title}
      </h2>
      {action}
    </header>
  );
}

export function ProfileTabs({ onDiaryClick, onSeriesClick, onListsClick, onWatchlistClick }) {
  const tabs = [
    "Profile",
    "Series",
    "Diary",
    "Watchlist",
    "Lists",
  ];

  const tabHandlers = {
    Series: onSeriesClick,
    Diary: onDiaryClick,
    Lists: onListsClick,
    Watchlist: onWatchlistClick,
  };

  return (
    <nav className="no-scrollbar mt-7 overflow-x-auto rounded border border-slate-800 bg-slate-950/30 px-4" aria-label="Profile sections">
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

export function StatCell({ isFirst, stat }) {
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

export function ShelfHeader({ action, count, eyebrow, onActionClick, title }) {
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
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {count}
        </p>
        {action && (
          <button
            className="min-h-8 rounded border border-slate-700 px-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white"
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

export function PosterSkeletonGrid({ count = 8, variant = "default" }) {
  const gridClassName =
    variant === "large"
      ? "grid grid-cols-4 gap-2 sm:gap-4"
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

export function EmptyState({ description, title }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950/60 px-5 py-8 text-center">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
