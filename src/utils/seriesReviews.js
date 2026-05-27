const reviewStorageKey = "watchd-series-reviews";

export function getSeriesReview(showId) {
  return getSavedSeriesReviews()[showId];
}

export function saveSeriesReview(showId, reviewData) {
  const savedReviews = getSavedSeriesReviews();

  savedReviews[showId] = {
    ...reviewData,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(reviewStorageKey, JSON.stringify(savedReviews));
}

function getSavedSeriesReviews() {
  try {
    const savedReviews = localStorage.getItem(reviewStorageKey);
    return savedReviews ? JSON.parse(savedReviews) : {};
  } catch {
    return {};
  }
}
