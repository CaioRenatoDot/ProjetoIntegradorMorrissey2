const prisma = require("../config/prisma");

async function findManyByUser(userId) {
    return prisma.favoriteSeries.findMany({
        where: { userId },
        orderBy: { position: "asc" }
    });
}

async function findByUserAndMovie(userId, movieId) {
    return prisma.favoriteSeries.findFirst({ where: { userId, movieId } });
}

// Conta e cria na mesma transacao serializavel: com dois cliques rapidos as
// duas requests contavam 3 ao mesmo tempo e o usuario terminava com 5.
// Retorna null quando o limite ja foi atingido.
async function createWithinLimit(data, limit) {
    return prisma.$transaction(async (tx) => {
        const count = await tx.favoriteSeries.count({ where: { userId: data.userId } });

        if (count >= limit) {
            return null;
        }

        return tx.favoriteSeries.create({ data: { ...data, position: count } });
    }, { isolationLevel: "Serializable" });
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
    findByUserAndMovie,
    createWithinLimit,
    findOwnedById,
    remove,
    reorder
};
