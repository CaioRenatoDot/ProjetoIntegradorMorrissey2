const prisma = require("../config/prisma");

async function findByUserAndMovie(userId, movieId) {
    return prisma.watchListItem.findFirst({ where: { userId, movieId } });
}

async function create(data) {
    return prisma.watchListItem.create({ data });
}

async function findManyByUser(userId) {
    return prisma.watchListItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
}

async function findOwnedById(id, userId) {
    return prisma.watchListItem.findFirst({ where: { id, userId } });
}

async function remove(id) {
    return prisma.watchListItem.delete({ where: { id } });
}

module.exports = {
    findByUserAndMovie,
    create,
    findManyByUser,
    findOwnedById,
    remove
};
