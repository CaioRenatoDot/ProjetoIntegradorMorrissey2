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

export async function getShowById(showId) {
  const response = await fetch(`${apiBaseUrl}/shows/${showId}`);

  if (!response.ok) {
    throw new Error("Could not load series details.");
  }

  return response.json();
}

// Acervo compartilhado: as mesmas paginas alimentam a home e as sugestoes de
// series parecidas, entao a busca por semelhantes nao gera requisicao nova.
function getShowsPool({ pages = 6 } = {}) {
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

  return mostPopularShowsCache;
}

export async function getMostPopularShows({ limit = 24, pages = 6 } = {}) {
  const shows = await getShowsPool({ pages });
  return shows.slice(0, limit);
}

// Peso de cada genero pela raridade no acervo. Sem isso, "Drama" e "Action"
// (que quase toda serie tem) valeriam tanto quanto "Horror" ou "Espionage", e
// The Walking Dead acabava sugerindo procedural policial em vez de terror.
let genreWeightsCache = null;

function getGenreWeights(pool) {
  if (genreWeightsCache) return genreWeightsCache;

  const counts = new Map();
  pool.forEach((show) => {
    (show.genres || []).forEach((genre) => {
      counts.set(genre, (counts.get(genre) || 0) + 1);
    });
  });

  genreWeightsCache = new Map();
  counts.forEach((count, genre) => {
    // Quanto mais raro o genero, maior o peso.
    genreWeightsCache.set(genre, Math.log(pool.length / count));
  });

  return genreWeightsCache;
}

// A TVMaze nao tem endpoint de "series parecidas", entao montamos a sugestao
// pontuando o acervo pelos generos em comum, dando mais valor aos generos
// raros. Tipo, idioma e proximidade de nota servem so como desempate.
export async function getSimilarShows(show, { limit = 12 } = {}) {
  if (!show) return [];

  const genres = show.genres || [];
  if (!genres.length) return [];

  const pool = await getShowsPool();
  const genreWeights = getGenreWeights(pool);

  return pool
    .filter((candidate) => candidate.id !== show.id)
    .map((candidate) => {
      const sharedGenres = (candidate.genres || []).filter((genre) =>
        genres.includes(genre)
      );

      if (!sharedGenres.length) return { candidate, score: 0 };

      let score = sharedGenres.reduce((total, genre) => {
        return total + (genreWeights.get(genre) || 1) * 10;
      }, 0);

      // Premia quem cobre boa parte dos generos da serie original, para nao
      // subir series que so acertaram um genero raro por acaso.
      score *= sharedGenres.length / genres.length + 0.5;

      if (candidate.type === show.type) score += 3;
      if (candidate.language === show.language) score += 2;

      const rating = show.rating?.average;
      const candidateRating = candidate.rating?.average;
      if (rating && candidateRating) {
        score += Math.max(0, 3 - Math.abs(rating - candidateRating));
      }

      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return (second.candidate.weight || 0) - (first.candidate.weight || 0);
    })
    .slice(0, limit)
    .map((item) => item.candidate);
}

async function fetchShowsPage(page) {
  const response = await fetch(`${apiBaseUrl}/shows?page=${page}`);

  if (!response.ok) {
    throw new Error("Could not load top-rated series.");
  }

  return response.json();
}
