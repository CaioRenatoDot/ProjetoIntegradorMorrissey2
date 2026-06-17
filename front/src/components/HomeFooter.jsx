import BrandLogo from "./BrandLogo";

export default function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 w-full border-t border-slate-800 bg-[#101318] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <BrandLogo className="w-fit" />
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">
            A personal space to discover, save, favorite, and review series.
          </p>
        </div>

        <div className="text-sm font-bold text-slate-500 sm:text-right">
          <p>&copy; {year} Watchd. All rights reserved.</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-600">
            Projeto Integrador Morrissey - Oxetech Academy
          </p>
        </div>
      </div>
    </footer>
  );
}
