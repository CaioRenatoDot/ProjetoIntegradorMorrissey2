const jwt = require("jsonwebtoken")
const prisma = require("../config/prisma")
const { getTokenFromRequest } = require("../config/cookie")

async function authMiddleware(req, res, next){
    const token = getTokenFromRequest(req);

    if(!token){
        return res.status(401).json({
            message: "Token não informado."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if(!user){
            return res.status(401).json({
                message: "Usuário não encontrado."
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            usernameChangedAt: user.usernameChangedAt,
            displayName: user.displayName,
            location: user.location,
            website:user.website,
            bio:user.bio

        };

        return next();
        
    } catch (error) {
        return res.status(401).json({
            message: "Token invalido ou inspirado"
        });
    }
}

module.exports = authMiddleware;