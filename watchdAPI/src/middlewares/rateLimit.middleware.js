const rateLimit = require("express-rate-limit");

// Limites generosos o bastante para uso normal (login errado por engano,
// grading, etc.) mas que ja dificultam um ataque de forca bruta contra uma
// conta especifica.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: "TOO_MANY_ATTEMPTS", message: "Muitas tentativas de login. Tente novamente em alguns minutos." }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: "TOO_MANY_ACCOUNTS", message: "Muitas contas criadas a partir desta rede. Tente novamente mais tarde." }
});

module.exports = { loginLimiter, registerLimiter };
