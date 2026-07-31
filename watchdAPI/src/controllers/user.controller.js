const userService = require("../services/user.service");

async function getPublicProfile(req, res) {
    const { username } = req.params;

    const user = await userService.findPublicProfileByUsername(username);

    if (!user) {
        return res.status(404).json({
            message: "Usuario nao encontrado."
        });
    }

    return res.json({
        user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.name,
            location: user.location,
            website: user.website,
            bio: user.bio
        },
        favorites: user.favoriteSeries,
        recentActivity: user.reviews.map((review) => ({
            movieId: review.movieId,
            title: review.title,
            posterUrl: review.posterUrl || "",
            rating: review.rating || 0,
            text: review.text || "",
            updatedAt: review.updatedAt
        })),
        lists: user.lists.map((list) => ({
            id: list.id,
            title: list.title,
            category: list.category,
            itemsCount: list._count.items,
            previewPosters: list.items.map((item) => item.posterUrl || "")
        })),
        stats: {
            favorites: user.favoriteSeries.length,
            lists: user.lists.length,
            watchd: user.reviews.length
        }
    });
}

module.exports = {
    getPublicProfile
};
