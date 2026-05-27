const apiBaseUrl = "https://api.tvmaze.com";
let mostPopularShowsCache = null;

export async function searchShows(term) {
  const response = await fetch(
    `${apiBaseUrl}/search/shows?q=${encodeURIComponent(term)}`
  );

  if (!response.ok) {
    throw new Error("Could not search for series.");
  }

  const data = await response.json();
  return data.map((item) => item.show);
}

export async function getMostPopularShows({ limit = 24, pages = 6 } = {}) {
  if (!mostPopularShowsCache) {
    mostPopularShowsCache = Promise.all(
      Array.from({ length: pages }, (_, page) => fetchShowsPage(page))
    ).then((pagesData) =>
      pagesData
        .flat()
        .filter((show) => show.image?.medium && show.weight)
        .sort((firstShow, secondShow) => {
          return secondShow.weight - firstShow.weight;
        })
    );
  }

  const shows = await mostPopularShowsCache;
  return shows.slice(0, limit);
}

async function fetchShowsPage(page) {
  const response = await fetch(`${apiBaseUrl}/shows?page=${page}`);

  if (!response.ok) {
    throw new Error("Could not load top-rated series.");
  }

  return response.json();
}
