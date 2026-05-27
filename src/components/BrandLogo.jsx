import watchedLabel from "../../watchedlabel.png";

export default function BrandLogo({ className = "", onClick }) {
  function handleClick(event) {
    if (!onClick) return;

    event.preventDefault();
    onClick(event);
  }

  return (
    <a
      className={`flex flex-none items-center gap-2 ${className}`}
      href="/"
      onClick={handleClick}
      aria-label="Watchd"
    >
      <img
        className="h-7 w-auto flex-none"
        src={watchedLabel}
        alt=""
        aria-hidden="true"
      />
      <span className="font-serif text-2xl font-bold leading-none text-white">
        Watchd
      </span>
    </a>
  );
}
