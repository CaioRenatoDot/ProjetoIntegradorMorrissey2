import { getSessionToken } from "./session";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// O backend responde em portugues e a UI esta em ingles. Cada erro da API
// traz um "code" estavel, e a traducao e feita por ele: comparar o texto da
// mensagem quebrava a traducao sempre que uma frase mudava no backend.
const ERROR_TRANSLATIONS = {
    MISSING_FIELDS: "Please fill in all required fields.",
    INVALID_FIELD: "One of the fields is invalid or too long.",
    EMAIL_IN_USE: "This email is already registered.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
    PASSWORD_NO_LETTER: "Password must contain at least one letter.",
    PASSWORD_NO_NUMBER: "Password must contain at least one number.",
    PASSWORD_TOO_LONG: "Password must be at most 72 characters long.",
    TOO_MANY_ATTEMPTS: "Too many login attempts. Please try again in a few minutes.",
    TOO_MANY_ACCOUNTS: "Too many accounts created from this network. Please try again later.",
    UNAUTHENTICATED: "Your session has expired. Please sign in again.",
    ALREADY_EXISTS: "This item already exists.",
    CONFLICT: "Could not save right now. Please try again.",
    PAYLOAD_TOO_LARGE: "The content you sent is too large.",
    INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
};

function getErrorMessage(data, fallback) {
    return ERROR_TRANSLATIONS[data.code] || data.message || fallback;
}

// A sessao vive no cookie httpOnly, mas o front e a API ficam em dominios
// diferentes (GitHub Pages x Railway), o que torna esse cookie "de terceiros".
// Navegadores em janela anonima/InPrivate bloqueiam esse tipo de cookie, e a
// sessao morreria. Por isso mandamos tambem o token no header Authorization,
// que o backend aceita como alternativa quando nao ha cookie.
function authHeaders(extraHeaders) {
    const headers = { ...extraHeaders };
    const token = getSessionToken();

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
async function request(path, { method = "GET", body, errorMessage } = {}) {
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
        throw new Error(getErrorMessage(data, errorMessage));
    }

    return data;
}

export function login(email, password) {
    return request("/auth/login", {
        method: "POST",
        body: { email, password },
        errorMessage: "Could not sign in.",
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
    });
}

export function getMe() {
    return request("/auth/me", { errorMessage: "Erro ao buscar usuario." });
}

export function getWatchlist() {
    return request("/watchlist", { errorMessage: "Erro ao buscar watchlist" });
}

export function addToWatchlist(item) {
    return request("/watchlist", {
        method: "POST",
        body: item,
        errorMessage: "Erro ao adicionar item na watchlist.",
    });
}

export function removeFromWatchlist(itemId) {
    return request(`/watchlist/${itemId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover item da watchlist.",
    });
}

export function getFavorites() {
    return request("/favorites", { errorMessage: "Erro ao buscar favoritos." });
}

export function addFavorite(item) {
    return request("/favorites", {
        method: "POST",
        body: item,
        errorMessage: "Erro ao adicionar favorito.",
    });
}

export function removeFavorite(favoriteId) {
    return request(`/favorites/${favoriteId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover favorito.",
    });
}

export function reorderFavorites(ids) {
    return request("/favorites/reorder", {
        method: "PUT",
        body: { ids },
        errorMessage: "Erro ao reordenar favoritos.",
    });
}

export function updateProfile(profile) {
    return request("/auth/me", {
        method: "PUT",
        body: profile,
        errorMessage: "Erro ao atualizar perfil.",
    });
}

export function deleteAccount(password) {
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

export function getMyReviews() {
    return request("/reviews/mine", { errorMessage: "Erro ao buscar suas reviews." });
}

export function saveReview(review) {
    return request("/reviews", {
        method: "POST",
        body: review,
        errorMessage: "Erro ao salvar review.",
    });
}

export function deleteReview(reviewId) {
    return request(`/reviews/${reviewId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover review.",
    });
}

export function getMyLists() {
    return request("/lists", { errorMessage: "Erro ao buscar listas." });
}

export function getList(listId) {
    return request(`/lists/${listId}`, { errorMessage: "Erro ao buscar lista." });
}

export function createList({ title, category }) {
    return request("/lists", {
        method: "POST",
        body: { title, category },
        errorMessage: "Erro ao criar lista.",
    });
}

export function deleteList(listId) {
    return request(`/lists/${listId}`, {
        method: "DELETE",
        errorMessage: "Erro ao remover lista.",
    });
}

export function addListItem(listId, item) {
    return request(`/lists/${listId}/items`, {
        method: "POST",
        body: item,
        errorMessage: "Erro ao adicionar item na lista.",
    });
}

export function removeListItem(listId, itemId) {
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
