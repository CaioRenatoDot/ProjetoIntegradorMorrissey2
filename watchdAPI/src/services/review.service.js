const prisma = require("../config/prisma");

async function findManyByMovie(movieId) {
    return prisma.review.findMany({
        where: { movieId },
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { id: true, name: true, displayName: true } }
        }
    });
}

async function findManyByUser(userId) {
    return prisma.review.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" }
    });
}

async function findByUserAndMovie(userId, movieId) {
    return prisma.review.findFirst({ where: { userId, movieId } });
}

async function update(id, data) {
    return prisma.review.update({ where: { id }, data });
}

async function create(data) {
    return prisma.review.create({ data });
}

async function findOwnedById(id, userId) {
    return prisma.review.findFirst({ where: { id, userId } });
}

async function remove(id) {
    return prisma.review.delete({ where: { id } });
}

module.exports = {
    findManyByMovie,
    findManyByUser,
    findByUserAndMovie,
    update,
    create,
    findOwnedById,
    remove
};
