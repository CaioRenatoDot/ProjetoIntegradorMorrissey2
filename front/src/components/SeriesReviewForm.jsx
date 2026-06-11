import { Save, Star } from "lucide-react";

const maxReviewLength = 280;
const starCount = 5;

export default function SeriesReviewForm({
  onReviewChange,
  onSave,
  onStarClick,
  review,
  status,
  userRating,
}) {
  return (
    <form
      className="mt-8 max-w-3xl rounded border border-slate-700 bg-slate-900 p-4"
      onSubmit={onSave}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Your review</h2>
          <p className="text-sm font-bold text-slate-500">
            Add a star rating and write a short review.
          </p>
        </div>

        <div className="flex gap-1" aria-label="Star rating">
          {Array.from({ length: starCount }, (_, index) => {
            const starValue = index + 1;
            const isSelected = starValue <= userRating;

            return (
              <button
                aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
                className="group relative grid h-9 w-9 place-items-center text-slate-600 transition hover:scale-110 hover:text-emerald-400"
                key={starValue}
                onClick={() => onStarClick(starValue)}
                type="button"
              >
                <Star
                  aria-hidden="true"
                  className="h-[26px] w-[26px]"
                  strokeWidth={2.2}
                />
                <span
                  className="absolute left-[5px] top-1/2 h-[26px] -translate-y-1/2 overflow-hidden text-emerald-400 transition-[width] duration-500 ease-out"
                  style={{
                    transitionDelay: isSelected ? `${index * 90}ms` : "0ms",
                    width: isSelected ? "26px" : "0px",
                  }}
                >
                  <Star
                    aria-hidden="true"
                    className="h-[26px] w-[26px] flex-none"
                    fill="currentColor"
                    strokeWidth={2.2}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <label
        className="mt-4 block text-sm font-black text-slate-300"
        htmlFor="series-review"
      >
        Review
      </label>
      <textarea
        className="mt-2 min-h-28 w-full resize-none rounded border border-slate-700 bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        id="series-review"
        maxLength={maxReviewLength}
        onChange={(event) => onReviewChange(event.target.value)}
        placeholder="Write a quick opinion about the series..."
        value={review}
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold text-slate-500">
          {review.length}/{maxReviewLength} characters
        </p>
        <div className="flex items-center gap-3">
          {status && (
            <p className="text-sm font-bold text-emerald-400">{status}</p>
          )}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded bg-[#00c030] px-4 text-sm font-black text-white transition hover:bg-emerald-400"
            type="submit"
          >
            <Save size={17} />
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
