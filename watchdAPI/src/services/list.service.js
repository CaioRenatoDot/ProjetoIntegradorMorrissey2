const prisma = require("../config/prisma");

const PREVIEW_ITEMS_TAKE = 4;

async function findManyByUser(userId) {
    return prisma.list.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                orderBy: { position: "asc" },
                take: PREVIEW_ITEMS_TAKE,
                select: { posterUrl: true }
            },
            _count: { select: { items: true } }
        }
    });
}

async function findOwnedByIdWithItems(id, userId) {
    return prisma.list.findFirst({
        where: { id, userId },
        include: {
            items: { orderBy: { position: "asc" } }
        }
    });
}

async function findOwnedById(id, userId) {
    return prisma.list.findFirst({ where: { id, userId } });
}

async function create(userId, { title, category }) {
    return prisma.list.create({ data: { userId, title, category } });
}

async function remove(id) {
    return prisma.list.delete({ where: { id } });
}

async function findItemByMovie(listId, movieId) {
    return prisma.listItem.findFirst({ where: { listId, movieId } });
}

async function countItems(listId) {
    return prisma.listItem.count({ where: { listId } });
}

async function addItem(listId, { movieId, title, posterUrl, releaseYear, type, position }) {
    return prisma.listItem.create({
        data: { listId, movieId, title, posterUrl, releaseYear, type, position }
    });
}

async function findItemInList(itemId, listId) {
    return prisma.listItem.findFirst({ where: { id: itemId, listId } });
}

async function removeItem(itemId) {
    return prisma.listItem.delete({ where: { id: itemId } });
}

async function findAllPublic() {
    return prisma.list.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { username: true, name: true, displayName: true } },
            items: {
                orderBy: { position: "asc" },
                take: PREVIEW_ITEMS_TAKE,
                select: { posterUrl: true }
            },
            _count: { select: { items: true } }
        }
    });
}

async function findPublicById(id) {
    return prisma.list.findFirst({
        where: { id },
        include: {
            user: { select: { username: true, name: true, displayName: true } },
            items: { orderBy: { position: "asc" } }
        }
    });
}

module.exports = {
    findManyByUser,
    findOwnedByIdWithItems,
    findOwnedById,
    create,
    remove,
    findItemByMovie,
    countItems,
    addItem,
    findItemInList,
    removeItem,
    findAllPublic,
    findPublicById
};
