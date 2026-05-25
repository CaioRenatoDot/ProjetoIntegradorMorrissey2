export function cleanSummary(summary) {
  if (!summary) return "Sinopse indisponivel.";
  return summary.replace(/<[^>]*>/g, "");
}

export function getGenres(show) {
  return show.genres?.length ? show.genres.join(", ") : "Sem genero";
}
