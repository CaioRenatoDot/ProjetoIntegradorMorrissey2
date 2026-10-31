const jwt = require("jsonwebtoken")
const authService = require("../services/auth.service")
const { getTokenFromRequest } = require("../config/cookie")

async function authMiddleware(req, res, next){
    const token = getTokenFromRequest(req);

    if(!token){
        return res.status(401).json({
            code: "UNAUTHENTICATED",
            message: "Token nao informado."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await authService.findUserById(decoded.id);

        if(!user){
            return res.status(401).json({
                code: "UNAUTHENTICATED",
                message: "Usuario nao encontrado."
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
            code: "UNAUTHENTICATED",
            message: "Token invalido ou expirado."
        });
    }
}

module.exports = authMiddleware;