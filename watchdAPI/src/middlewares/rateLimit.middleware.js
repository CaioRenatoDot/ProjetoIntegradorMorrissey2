const rateLimit = require("express-rate-limit");

// Limites generosos o bastante para uso normal (login errado por engano,
// grading, etc.) mas que ja dificultam um ataque de forca bruta contra uma
// conta especifica.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again in a few minutes." }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many accounts created from this network. Please try again later." }
});

module.exports = { loginLimiter, registerLimiter };
