const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

async function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(" ")[1] : null;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        req.user = user
            ? {
                id: user.id,
                name: user.name,
                displayName: user.displayName
            }
            : null;
    } catch (error) {
        req.user = null;
    }

    return next();
}

module.exports = optionalAuthMiddleware;
