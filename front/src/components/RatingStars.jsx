import { Star } from "lucide-react";

export default function RatingStars({
  interactive = false,
  onRate,
  rating = 0,
  size = 18,
}) {
  const starValues = [1, 2, 3, 4, 5];

  return (
    <div aria-label={`${rating} star rating`} className="flex items-center gap-0.5">
      {starValues.map((starValue) => (
        <RatingStar
          interactive={interactive}
          key={starValue}
          onRate={onRate}
          rating={rating}
          size={size}
          starValue={starValue}
        />
      ))}
    </div>
  );
}

function RatingStar({ interactive, onRate, rating, size, starValue }) {
  const fillRatio = Math.max(0, Math.min(1, rating - (starValue - 1)));
  const fillPercent = fillRatio >= 1 ? 100 : fillRatio >= 0.5 ? 50 : 0;

  const stack = (
    <span
      className="relative inline-block flex-none text-slate-700"
      style={{ height: size, width: size }}
    >
      <Star aria-hidden="true" className="absolute inset-0" size={size} strokeWidth={2} />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden text-slate-400"
        style={{ width: `${fillPercent}%` }}
      >
        <Star aria-hidden="true" fill="currentColor" size={size} strokeWidth={2} />
      </span>
    </span>
  );

  if (!interactive) {
    return stack;
  }

  function handleClick(event) {
    if (!onRate) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const clickedLeftHalf = event.clientX - bounds.left < bounds.width / 2;

    onRate(clickedLeftHalf ? starValue - 0.5 : starValue);
  }

  return (
    <button
      aria-label={`Rate ${starValue - 0.5} or ${starValue} stars`}
      className="rounded p-0.5 transition hover:scale-110"
      onClick={handleClick}
      type="button"
    >
      {stack}
    </button>
  );
}
