const API_URL = import.meta.env.VITE_API_URL || "/api";

// O backend responde em portugues; a UI de login/registro esta em ingles,
// entao traduzimos as mensagens conhecidas antes de exibi-las. "Email nao
// encontrado" e senha invalida caem na mesma frase para nao revelar se um
// email esta cadastrado.
const AUTH_ERROR_TRANSLATIONS = {
    "Nome, email e senha são obrigatórios.": "Name, email and password are required.",
    "Usuários já existe. Email em uso": "This email is already registered.",
    "Email e senha são obrigatórios!": "Email and password are required.",
    "Email nao encontrado.": "Invalid email or password.",
    "Email ou senha invalidos.": "Invalid email or password.",
    "A senha precisa ter pelo menos 8 caracteres.": "Password must be at least 8 characters long.",
    "A senha precisa ter pelo menos uma letra.": "Password must contain at least one letter.",
    "A senha precisa ter pelo menos um numero.": "Password must contain at least one number.",
};

function translateAuthMessage(message, fallback) {
    if (!message) return fallback;
    return AUTH_ERROR_TRANSLATIONS[message] || message;
}

// A sessao vive no cookie httpOnly, mas o front e a API ficam em dominios
// diferentes (GitHub Pages x Railway), o que torna esse cookie "de terceiros".
// Navegadores em janela anonima/InPrivate bloqueiam esse tipo de cookie, e a
// sessao morreria. Por isso mandamos tambem o token no header Authorization,
// que o backend aceita como alternativa quando nao ha cookie.
function authHeaders(extraHeaders) {
    const headers = { ...extraHeaders };
    const token = localStorage.getItem("watchd_token");

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// Le o corpo sem quebrar quando a resposta nao e JSON: um 502 do proxy ou a
// API fora do ar devolvem HTML, e o response.json() direto estourava com um
// "Unexpected token <" no lugar de uma mensagem util.
async function readJson(response) {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
}

// Centraliza o que toda chamada fazia igual: cookie, header de auth, corpo
// em JSON e erro com a mensagem do backend (ou a de fallback).
async function request(path, { method = "GET", body, errorMessage, translate } = {}) {
    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            credentials: "include",
            headers: authHeaders(body === undefined ? {} : { "Content-Type": "application/json" }),
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new Error("Could not reach the server. Check your connection and try again.");
    }

    const data = await readJson(response);

    if (!response.ok) {
        const message = translate
            ? translateAuthMessage(data.message, errorMessage)
            : data.message || errorMessage;
        throw new Error(message);
    }

    return data;
}

export function login(email, password) {
    return request("/auth/login", {
        method: "POST",
        body: { email, password },
        errorMessage: "Could not sign in.",
        translate: true,
    });
}

export function logout() {
    return request("/auth/logout", {
        method: "POST",
        errorMessage: "Erro ao encerrar a sessao.",
    });
}

export function register(name, email, password) {
    return request("/auth/register", {
        method: "POST",
        body: { name, email, password },
        errorMessage: "Could not create your account.",
        translate: true,
    });
}

export function getMe(token) {
    return request("/auth/me", { errorMessage: "Erro ao buscar usuario." });
}

export function getWatchlist(token) {
    return request("/watchlist", { errorMessage: "Erro ao buscar watchlist" });
}

export function addToWatchlist(token, item) {
    return request("/watchlist", {
        method: "POST",
        body: item,
        errorMessage: "Erro ao adicionar item na watchlist.",
    });
}

export function removeFromWatchlist(token, itemId) {
    return request(`/watchlist/${itemId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover item da watchlist.",
    });
}

export function getFavorites(token) {
    return request("/favorites", { errorMessage: "Erro ao buscar favoritos." });
}

export function addFavorite(token, item) {
    return request("/favorites", {
        method: "POST",
        body: item,
        errorMessage: "Erro ao adicionar favorito.",
    });
}

export function removeFavorite(token, favoriteId) {
    return request(`/favorites/${favoriteId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover favorito.",
    });
}

export function reorderFavorites(token, ids) {
    return request("/favorites/reorder", {
        method: "PUT",
        body: { ids },
        errorMessage: "Erro ao reordenar favoritos.",
    });
}

export function updateProfile(token, profile) {
    return request("/auth/me", {
        method: "PUT",
        body: profile,
        errorMessage: "Erro ao atualizar perfil.",
    });
}

export function deleteAccount(token, password) {
    return request("/auth/me", {
        method: "DELETE",
        body: { password },
        errorMessage: "Erro ao excluir conta.",
    });
}

// Rota com auth opcional: o cookie, quando existe, destaca a review do
// proprio usuario.
export function getReviews(movieId) {
    return request(`/reviews/${movieId}`, { errorMessage: "Erro ao buscar reviews." });
}

export function getMyReviews(token) {
    return request("/reviews/mine", { errorMessage: "Erro ao buscar suas reviews." });
}

export function saveReview(token, review) {
    return request("/reviews", {
        method: "POST",
        body: review,
        errorMessage: "Erro ao salvar review.",
    });
}

export function deleteReview(token, reviewId) {
    return request(`/reviews/${reviewId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover review.",
    });
}

export function getMyLists(token) {
    return request("/lists", { errorMessage: "Erro ao buscar listas." });
}

export function getList(token, listId) {
    return request(`/lists/${listId}`, { errorMessage: "Erro ao buscar lista." });
}

export function createList(token, { title, category }) {
    return request("/lists", {
        method: "POST",
        body: { title, category },
        errorMessage: "Erro ao criar lista.",
    });
}

export function deleteList(token, listId) {
    return request(`/lists/${listId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover lista.",
    });
}

export function addListItem(token, listId, item) {
    return request(`/lists/${listId}/items`, {
        method: "POST",
        body: item,
        errorMessage: "Erro ao adicionar item na lista.",
    });
}

export function removeListItem(token, listId, itemId) {
    return request(`/lists/${listId}/items/${itemId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover item da lista.",
    });
}

export function getAllLists({ page = 1, limit = 12 } = {}) {
    return request(`/lists/all?page=${page}&limit=${limit}`, {
        errorMessage: "Erro ao buscar listas.",
    });
}

export function getPublicList(listId) {
    return request(`/lists/public/${listId}`, { errorMessage: "Erro ao buscar lista." });
}

export function getPublicProfile(username) {
    return request(`/users/${encodeURIComponent(username)}`, {
        errorMessage: "Erro ao buscar perfil.",
    });
}
