import { fallbackPoster } from "../data/constants";

export default function ListPosterStrip({ posters, slotCount = 4 }) {
  const isLoading = !posters;
  const slots = isLoading
    ? Array.from({ length: slotCount }, () => "")
    : Array.from({ length: slotCount }, (_, index) => posters[index] || fallbackPoster);

  return (
    <div className="flex h-32 w-full overflow-hidden bg-slate-900 sm:h-36">
      {slots.map((src, index) => (
        <div
          className="relative h-full flex-1 overflow-hidden border-l-2 border-slate-950/80 first:border-l-0"
          key={index}
        >
          {isLoading || !src ? (
            <div className="h-full w-full animate-pulse bg-slate-800" />
          ) : (
            <img alt="" aria-hidden="true" className="h-full w-full object-cover" src={src} />
          )}
        </div>
      ))}
    </div>
  );
}
