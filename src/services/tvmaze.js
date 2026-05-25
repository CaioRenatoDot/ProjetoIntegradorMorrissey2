const apiBaseUrl = "https://api.tvmaze.com/search/shows";

export async function searchShows(term) {
  const response = await fetch(`${apiBaseUrl}?q=${encodeURIComponent(term)}`);

  if (!response.ok) {
    throw new Error("Nao foi possivel buscar as series.");
  }

  const data = await response.json();
  return data.map((item) => item.show);
}
