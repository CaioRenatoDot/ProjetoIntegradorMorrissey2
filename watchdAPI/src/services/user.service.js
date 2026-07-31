const prisma = require("../config/prisma");

async function findPublicProfileByUsername(username) {
    return prisma.user.findUnique({
        where: { username },
        include: {
            favoriteSeries: {
                orderBy: { position: "asc" }
            },
            reviews: {
                orderBy: { updatedAt: "desc" }
            },
            lists: {
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        orderBy: { position: "asc" },
                        take: 4,
                        select: { posterUrl: true }
                    },
                    _count: {
                        select: { items: true }
                    }
                }
            }
        }
    });
}

module.exports = {
    findPublicProfileByUsername
};
