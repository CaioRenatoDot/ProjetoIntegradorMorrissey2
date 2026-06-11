import BrandLogo from "./BrandLogo";

export default function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 w-full border-t border-[#2e2e2e] bg-[#1a1a1a] px-5 py-6 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-5 text-sm font-bold text-slate-300 sm:flex-row sm:items-center">
        <BrandLogo className="w-fit" />

        <p>
          &copy; {year} - Watchd
        </p>
      </div>
    </footer>
  );
}
