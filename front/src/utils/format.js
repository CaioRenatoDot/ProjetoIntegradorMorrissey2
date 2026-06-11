export function cleanSummary(summary) {
  if (!summary) return "No synopsis available.";
  return summary.replace(/<[^>]*>/g, "");
}

export function getGenres(show) {
  return show.genres?.length ? show.genres.join(", ") : "No genre";
}
