const API_URL = "/api"

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login.")
    }

    return data;

}

export async function register(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar conta.");
    }

    return data;
}

export async function getMe(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar usuario.")
    }

    return data;
}

export async function getWatchlist(token) {
    const response = await fetch(`${API_URL}/watchlist`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar watchlist");
    }
    return data;
}

export async function addToWatchlist(token, item) {
    const response = await fetch(`${API_URL}/watchlist`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),

    });
    const data = await response.json();



    if (!response.ok) {
        throw new Error(data.message || "Erro ao adicionar item na watchlist.")
    }

    return data;
}

export async function removeFromWatchlist(token, itemId) {
    const response = await fetch(`${API_URL}/watchlist/${itemId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover item da watchlist.")
    }

    return data;
}

export async function getFavorites(token) {
    const response = await fetch(`${API_URL}/favorites`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar favoritos.");
    }

    return data;
}

export async function addFavorite(token, item) {
    const response = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao adicionar favorito.");
    }

    return data;
}

export async function removeFavorite(token, favoriteId) {
    const response = await fetch(`${API_URL}/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover favorito.");
    }

    return data;
}

export async function reorderFavorites(token, ids) {
    const response = await fetch(`${API_URL}/favorites/reorder`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao reordenar favoritos.");
    }

    return data;
}
