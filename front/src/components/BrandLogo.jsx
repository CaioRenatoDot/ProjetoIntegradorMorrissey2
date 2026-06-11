export default function BrandLogo({ className = "", onClick }) {
  const baseUrl = import.meta.env.BASE_URL;

  function handleClick(event) {
    if (!onClick) return;

    event.preventDefault();
    onClick(event);
  }

  return (
    <a
      className={`flex flex-none items-center gap-2 ${className}`}
      href={baseUrl}
      onClick={handleClick}
      aria-label="Watchd"
    >
      <img
        className="h-7 w-auto flex-none"
        src={`${baseUrl}assets/watchedlabel.png`}
        alt=""
        aria-hidden="true"
      />
      <span className="font-serif text-2xl font-bold leading-none text-white">
        Watchd
      </span>
    </a>
  );
}
