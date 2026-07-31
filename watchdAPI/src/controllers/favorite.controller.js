const favoriteService = require("../services/favorite.service");

async function list(req, res) {
    const items = await favoriteService.findManyByUser(req.user.id);

    return res.json({ items });
}

async function create(req, res) {
    const { movieId, title, posterUrl, releaseYear, type } = req.body;

    if (!movieId || !title || !type) {
        return res.status(400).json({
            message: "movieId, title e type sao obrigatorios.",
        });
    }

    const favoritesCount = await favoriteService.countByUser(req.user.id);

    if (favoritesCount >= 4) {
        return res.status(400).json({
            message: "Voce so pode ter 4 series favoritas.",
        });
    }

    const favoriteAlreadyExists = await favoriteService.findByUserAndMovie(req.user.id, movieId);

    if (favoriteAlreadyExists) {
        return res.status(400).json({
            message: "Esta serie ja esta nos seus favoritos.",
        });
    }

    const item = await favoriteService.create({
        userId: req.user.id,
        movieId,
        title,
        posterUrl,
        releaseYear,
        type,
        position: favoritesCount,
    });

    return res.status(201).json({
        message: "Serie adicionada aos favoritos.",
        item,
    });
}

async function remove(req, res) {
    const { id } = req.params;

    const item = await favoriteService.findOwnedById(id, req.user.id);

    if (!item) {
        return res.status(404).json({
            message: "Favorito nao encontrado.",
        });
    }

    await favoriteService.remove(id);

    return res.json({
        message: "Favorito removido com sucesso.",
    });
}

async function reorder(req, res) {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({
            message: "ids precisa ser uma lista.",
        });
    }

    await favoriteService.reorder(ids, req.user.id);

    return res.json({
        message: "Ordem dos favoritos atualizada.",
    });
}

module.exports = {
    list,
    create,
    remove,
    reorder,
};
