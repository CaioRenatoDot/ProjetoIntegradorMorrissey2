const prisma = require("../config/prisma");

// O perfil publico so exibe as atividades e listas mais recentes; os totais
// das estatisticas vem do _count, sem precisar carregar tudo.
const RECENT_REVIEWS_TAKE = 12;
const RECENT_LISTS_TAKE = 12;

async function findPublicProfileByUsername(username) {
    return prisma.user.findUnique({
        where: { username },
        include: {
            favoriteSeries: {
                orderBy: { position: "asc" }
            },
            reviews: {
                orderBy: { updatedAt: "desc" },
                take: RECENT_REVIEWS_TAKE
            },
            lists: {
                orderBy: { createdAt: "desc" },
                take: RECENT_LISTS_TAKE,
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
            },
            _count: {
                select: { favoriteSeries: true, lists: true, reviews: true }
            }
        }
    });
}

module.exports = {
    findPublicProfileByUsername
};
