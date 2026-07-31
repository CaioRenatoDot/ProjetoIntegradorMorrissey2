const listService = require("../services/list.service");

async function listMine(req, res) {
    const lists = await listService.findManyByUser(req.user.id);

    const items = lists.map((list) => ({
        id: list.id,
        title: list.title,
        category: list.category,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
        itemsCount: list._count.items,
        previewPosters: list.items.map((item) => item.posterUrl || "")
    }))

    return res.json({ items })
}
async function getOne(req, res) {
    const { id } = req.params;

    const list = await listService.findOwnedByIdWithItems(id, req.user.id);
    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    return res.json({ list });
}

async function create(req, res) {
    const { title, category } = req.body;

    if (!title) {
        return res.status(400).json({
            message: "title e obrigatorio."
        });
    }
    const list = await listService.create(req.user.id, { title, category });

    return res.status(201).json({
        message: "Lista criada com sucesso.",
        item: list
    });
}

async function remove(req, res) {
    const { id } = req.params;

    const list = await listService.findOwnedById(id, req.user.id);

    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    await listService.remove(id);

    return res.json({
        message: "Lista removida com sucesso."
    });
}

async function addItem(req, res) {
    const { id } = req.params;
    const { movieId, title, posterUrl, releaseYear, type } = req.body;

    if (!movieId || !title || !type) {
        return res.status(400).json({
            message: "movieId, title e type sao obrigatorios."
        });
    }

    const list = await listService.findOwnedById(id, req.user.id);

    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    const itemAlreadyExists = await listService.findItemByMovie(id, movieId);

    if (itemAlreadyExists) {
        return res.status(400).json({
            message: "Este item ja esta nesta lista."
        });
    }

    const itemsCount = await listService.countItems(id);

    const item = await listService.addItem(id, {
        movieId,
        title,
        posterUrl,
        releaseYear,
        type,
        position: itemsCount
    });

    return res.status(201).json({
        message: "Item adicionado a lista.",
        item
    });
}

async function removeItem(req, res) {
    const { id, itemId } = req.params;

    const list = await listService.findOwnedById(id, req.user.id);

    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    const item = await listService.findItemInList(itemId, id);

    if (!item) {
        return res.status(404).json({
            message: "Item nao encontrado nesta lista."
        });
    }

    await listService.removeItem(itemId);

    return res.json({
        message: "Item removido da lista."
    });
}

async function listAll(req, res) {
    const lists = await listService.findAllPublic();

    const items = lists.map((list) => ({
        id: list.id,
        title: list.title,
        category: list.category,
        createdAt: list.createdAt,
        itemsCount: list._count.items,
        creator: list.user.displayName || list.user.name,
        creatorUsername: list.user.username,
        previewPosters: list.items.map((item) => item.posterUrl || "")
    }));

    return res.json({ items });
}

async function getPublicOne(req, res) {
    const { id } = req.params;

    const list = await listService.findPublicById(id);

    if (!list) {
        return res.status(404).json({ message: "Lista nao encontrada." });
    }

    return res.json({ list });
}

module.exports = {
    listMine,
    listAll,
    getOne,
    getPublicOne,
    create,
    remove,
    addItem,
    removeItem
};
