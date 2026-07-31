const prisma = require("../config/prisma");

async function findManyByUser(userId) {
    return prisma.favoriteSeries.findMany({
        where: { userId },
        orderBy: { position: "asc" }
    });
}

async function countByUser(userId) {
    return prisma.favoriteSeries.count({ where: { userId } });
}

async function findByUserAndMovie(userId, movieId) {
    return prisma.favoriteSeries.findFirst({ where: { userId, movieId } });
}

async function create(data) {
    return prisma.favoriteSeries.create({ data });
}

async function findOwnedById(id, userId) {
    return prisma.favoriteSeries.findFirst({ where: { id, userId } });
}

async function remove(id) {
    return prisma.favoriteSeries.delete({ where: { id } });
}

async function reorder(ids, userId) {
    const updates = ids.map((id, index) =>
        prisma.favoriteSeries.updateMany({
            where: { id, userId },
            data: { position: index }
        })
    );

    return prisma.$transaction(updates);
}

module.exports = {
    findManyByUser,
    countByUser,
    findByUserAndMovie,
    create,
    findOwnedById,
    remove,
    reorder
};
