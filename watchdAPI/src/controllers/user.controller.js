const prisma = require("../config/prisma");

async function getPublicProfile(req, res) {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
        where: {
            username
        }
    });

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
        }
    });
}

module.exports = {
    getPublicProfile
};
