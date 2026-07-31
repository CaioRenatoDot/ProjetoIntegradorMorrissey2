// Configuracao da sessao em cookie.
//
// Em producao o front (GitHub Pages) e a API ficam em dominios diferentes, o
// que obriga o cookie a ser SameSite=None + Secure para o navegador aceitar
// envia-lo. Em desenvolvimento tudo roda em localhost, onde Secure quebraria o
// cookie no http, entao usamos SameSite=Lax.
const isProduction = process.env.NODE_ENV === "production";

const COOKIE_NAME = "watchd_token";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias, igual a validade do JWT
};

// O token pode chegar pelo cookie (fluxo novo) ou pelo header Authorization
// (mantido para nao quebrar clientes antigos e facilitar testes via curl).
function getTokenFromRequest(req) {
    const cookieToken = req.cookies ? req.cookies[COOKIE_NAME] : null;

    if (cookieToken) {
        return cookieToken;
    }

    const authHeader = req.headers.authorization;

    return authHeader ? authHeader.split(" ")[1] : null;
}

module.exports = {
    COOKIE_NAME,
    cookieOptions,
    getTokenFromRequest
};
