const prisma = require("../config/prisma");

async function list(req, res) {
    const items = await prisma.favoriteSeries.findMany({
        where: {
            userId: req.user.id,
        },
        orderBy: {
            position: "asc",
        },
    });

    return res.json({ items });
}

async function create(req, res) {
    const { movieId, title, posterUrl, releaseYear, type } = req.body;

    if (!movieId || !title || !type) {
        return res.status(400).json({
            message: "movieId, title e type sao obrigatorios.",
        });
    }

    const favoritesCount = await prisma.favoriteSeries.count({
        where: {
            userId: req.user.id,
        },
    });

    if (favoritesCount >= 4) {
        return res.status(400).json({
            message: "Voce so pode ter 4 series favoritas.",
        });
    }

    const favoriteAlreadyExists = await prisma.favoriteSeries.findFirst({
        where: {
            userId: req.user.id,
            movieId,
        },
    });

    if (favoriteAlreadyExists) {
        return res.status(400).json({
            message: "Esta serie ja esta nos seus favoritos.",
        });
    }

    const item = await prisma.favoriteSeries.create({
        data: {
            userId: req.user.id,
            movieId,
            title,
            posterUrl,
            releaseYear,
            type,
            position: favoritesCount,
        },
    });

    return res.status(201).json({
        message: "Serie adicionada aos favoritos.",
        item,
    });
}

async function remove(req, res) {
    const { id } = req.params;

    const item = await prisma.favoriteSeries.findFirst({
        where: {
            id,
            userId: req.user.id,
        },
    });

    if (!item) {
        return res.status(404).json({
            message: "Favorito nao encontrado.",
        });
    }

    await prisma.favoriteSeries.delete({
        where: {
            id,
        },
    });

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

    const updates = ids.map((id, index) => {
        return prisma.favoriteSeries.updateMany({
            where: {
                id,
                userId: req.user.id,
            },
            data: {
                position: index,
            },
        });
    });

    await prisma.$transaction(updates);

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
