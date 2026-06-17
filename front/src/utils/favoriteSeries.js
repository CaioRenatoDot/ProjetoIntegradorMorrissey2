const favoriteSeriesLimit = 4;
const favoriteSeriesStorageKey = "watchd-favorite-series";

function normalizeShowId(showId) {
  return String(showId);
}

export function getFavoriteSeries() {
  try {
    const savedFavorites = localStorage.getItem(favoriteSeriesStorageKey);
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    return favorites.slice(0, favoriteSeriesLimit);
  } catch {
    return [];
  }
}

export function isFavoriteSeries(showId) {
  const normalizedShowId = normalizeShowId(showId);
  return getFavoriteSeries().some((series) => series.movieId === normalizedShowId);
}

export function saveFavoriteSeries(series) {
  const favorites = getFavoriteSeries();
  const normalizedShowId = normalizeShowId(series.movieId);
  const alreadyExists = favorites.some((favorite) => {
    return favorite.movieId === normalizedShowId;
  });

  if (alreadyExists) {
    return {
      favorites,
      limitReached: false,
    };
  }

  if (favorites.length >= favoriteSeriesLimit) {
    return {
      favorites,
      limitReached: true,
    };
  }

  const nextFavorites = [
    ...favorites,
    {
      ...series,
      movieId: normalizedShowId,
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(favoriteSeriesStorageKey, JSON.stringify(nextFavorites));
  return {
    favorites: nextFavorites,
    limitReached: false,
  };
}

export function removeFavoriteSeries(showId) {
  const normalizedShowId = normalizeShowId(showId);
  const nextFavorites = getFavoriteSeries().filter((favorite) => {
    return favorite.movieId !== normalizedShowId;
  });

  localStorage.setItem(favoriteSeriesStorageKey, JSON.stringify(nextFavorites));
  return nextFavorites;
}

export function reorderFavoriteSeries(nextFavorites) {
  const limitedFavorites = nextFavorites.slice(0, favoriteSeriesLimit);
  localStorage.setItem(favoriteSeriesStorageKey, JSON.stringify(limitedFavorites));
  return limitedFavorites;
}

export function toggleFavoriteSeries(series) {
  if (isFavoriteSeries(series.movieId)) {
    return {
      favorites: removeFavoriteSeries(series.movieId),
      isFavorite: false,
      limitReached: false,
    };
  }

  const result = saveFavoriteSeries(series);

  return {
    favorites: result.favorites,
    isFavorite: !result.limitReached,
    limitReached: result.limitReached,
  };
}
