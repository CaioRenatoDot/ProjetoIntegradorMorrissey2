const reviewService = require("../services/review.service");

async function listForMovie(req, res) {
    const { movieId } = req.params;

    const reviews = await reviewService.findManyByMovie(movieId);

    const items = reviews.map((review) => ({
        id: review.id,
        movieId: review.movieId,
        title: review.title,
        posterUrl: review.posterUrl,
        releaseYear: review.releaseYear,
        type: review.type,
        rating: review.rating,
        text: review.text,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        isMine: req.user?.id === review.userId,
        user: {
            id: review.user.id,
            name: review.user.displayName || review.user.name
        }
    }));

    return res.json({ items });
}

async function listMine(req, res) {
    const reviews = await reviewService.findManyByUser(req.user.id);

    return res.json({ items: reviews });
}

async function upsert(req, res) {
    const { movieId, title, posterUrl, releaseYear, type, rating, text } = req.body;

    if (!movieId || !title || !type || !rating) {
        return res.status(400).json({
            message: "movieId, title, type e rating sao obrigatorios."
        });
    }

    if (rating < 0.5 || rating > 5 || Math.round(rating * 2) !== rating * 2) {
        return res.status(400).json({
            message: "rating precisa ser entre 0.5 e 5, em passos de 0.5."
        });
    }

    const existingReview = await reviewService.findByUserAndMovie(req.user.id, movieId);

    let review;

    if (existingReview) {
        review = await reviewService.update(existingReview.id, {
            rating,
            text: text || "",
            title,
            posterUrl,
            releaseYear,
            type
        });
    } else {
        review = await reviewService.create({
            userId: req.user.id,
            movieId,
            title,
            posterUrl,
            releaseYear,
            type,
            rating,
            text: text || ""
        });
    }

    return res.status(existingReview ? 200 : 201).json({
        message: "Review salva com sucesso.",
        item: review
    });
}

async function remove(req, res) {
    const { id } = req.params;

    const review = await reviewService.findOwnedById(id, req.user.id);

    if (!review) {
        return res.status(404).json({
            message: "Review nao encontrada."
        });
    }

    await reviewService.remove(id);

    return res.json({
        message: "Review removida com sucesso."
    });
}

module.exports = {
    listForMovie,
    listMine,
    upsert,
    remove
};
