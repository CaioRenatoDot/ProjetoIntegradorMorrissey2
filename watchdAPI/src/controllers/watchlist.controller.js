const watchlistService = require("../services/watchlist.service");

async function create(req, res) {
    const { movieId, title, posterUrl, releaseYear, type } = req.body;

    if (!movieId || !title || !type) {
        return res.status(400).json({
            message: "movieId, title e type sao obrigatorios"
        });
    }

    const itemAlreadyExists = await watchlistService.findByUserAndMovie(req.user.id, movieId);

    if (itemAlreadyExists) {
        return res.status(400).json({
            message: "Este item ja esta na sua watchlist."
        });
    }

    const item = await watchlistService.create({
        userId: req.user.id,
        movieId,
        title,
        posterUrl,
        releaseYear,
        type
    });

    return res.status(201).json({
        message: "Filme foi adicionado a sua Watchlist",
        item
    });
}

async function list(req, res) {
    const items = await watchlistService.findManyByUser(req.user.id);

    return res.json({
        items
    });
}

async function remove(req, res) {
    const { id } = req.params;

    const item = await watchlistService.findOwnedById(id, req.user.id);

    if (!item) {
        return res.status(404).json({
            message: "Item nao encontrado"
        });
    }

    await watchlistService.remove(id);

    return res.json({
        message: "Item foi deletado com sucesso."
    });
}

module.exports = {
    create,
    list,
    remove
};
