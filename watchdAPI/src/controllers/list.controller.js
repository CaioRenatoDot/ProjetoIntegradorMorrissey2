const prisma = require("../config/prisma")

async function listMine(req, res) {
    const lists = await prisma.list.findMany({
        where: {
            userId: req.user.id
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: { items: true }
            }
        }
    });

    const items = lists.map((list) => ({
        id: list.id,
        title: list.title,
        category: list.category,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
        itemsCount: list._count.items
    }))

    return res.json({ items })
}
async function getOne(req, res) {
    const { id } = req.params;

    const list = await prisma.list.findFirst({
        where: {
            id,
            userId: req.user.id
        },
        include: {
            items: {
                orderBy: { position: "asc" }
            }
        }
    });
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
    const list = await prisma.list.create({
        data: {
            userId: req.user.id,
            title,
            category
        }
    });

    return res.status(201).json({
        message: "Lista criada com sucesso.",
        item: list
    });
}

async function remove(req, res) {
    const { id } = req.params;

    const list = await prisma.list.findFirst({
        where: {
            id,
            userId: req.user.id
        }
    });

    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    await prisma.list.delete({
        where: { id }
    });

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

    const list = await prisma.list.findFirst({
        where: {
            id,
            userId: req.user.id
        }
    });

    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    const itemAlreadyExists = await prisma.listItem.findFirst({
        where: {
            listId: id,
            movieId
        }
    });

    if (itemAlreadyExists) {
        return res.status(400).json({
            message: "Este item ja esta nesta lista."
        });
    }

    const itemsCount = await prisma.listItem.count({
        where: { listId: id }
    });

    const item = await prisma.listItem.create({
        data: {
            listId: id,
            movieId,
            title,
            posterUrl,
            releaseYear,
            type,
            position: itemsCount
        }
    });

    return res.status(201).json({
        message: "Item adicionado a lista.",
        item
    });
}

async function removeItem(req, res) {
    const { id, itemId } = req.params;

    const list = await prisma.list.findFirst({
        where: {
            id,
            userId: req.user.id
        }
    });

    if (!list) {
        return res.status(404).json({
            message: "Lista nao encontrada."
        });
    }

    const item = await prisma.listItem.findFirst({
        where: {
            id: itemId,
            listId: id
        }
    });

    if (!item) {
        return res.status(404).json({
            message: "Item nao encontrado nesta lista."
        });
    }

    await prisma.listItem.delete({
        where: { id: itemId }
    });

    return res.json({
        message: "Item removido da lista."
    });
}

async function listAll(req, res) {
    const lists = await prisma.list.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { username: true, name: true, displayName: true }
            },
            items: {
                orderBy: { position: "asc" },
                take: 4,
                select: { posterUrl: true }
            },
            _count: {
                select: { items: true }
            }
        }
    });

    const items = lists.map((list) => ({
        id: list.id,
        title: list.title,
        category: list.category,
        createdAt: list.createdAt,
        itemsCount: list._count.items,
        creator: list.user.displayName || list.user.name,
        previewPosters: list.items.map((item) => item.posterUrl || "")
    }));

    return res.json({ items });
}

async function getPublicOne(req, res) {
    const { id } = req.params;

    const list = await prisma.list.findFirst({
        where: { id },
        include: {
            user: {
                select: { username: true, name: true, displayName: true }
            },
            items: {
                orderBy: { position: "asc" }
            }
        }
    });

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