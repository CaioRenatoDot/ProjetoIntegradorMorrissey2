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

export async function updateProfile(token, profile){
    const response = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
            Authorization:`Bearer ${token}`,
        },
        body: JSON.stringify(profile),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao atualizar perfil.");
    }

    return data;
}

export async function deleteAccount(token, password) {
    const response = await fetch(`${API_URL}/auth/me`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao excluir conta.");
    }

    return data;
}

export async function getReviews(movieId, token) {
    const response = await fetch(`${API_URL}/reviews/${movieId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar reviews.");
    }

    return data;
}

export async function getMyReviews(token) {
    const response = await fetch(`${API_URL}/reviews/mine`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar suas reviews.");
    }

    return data;
}

export async function saveReview(token, review) {
    const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(review),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao salvar review.");
    }

    return data;
}

export async function getMyLists(token) {
    const response = await fetch(`${API_URL}/lists`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar listas.");
    }

    return data;
}

export async function getList(token, listId) {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar lista.");
    }

    return data;
}

export async function createList(token, { title, category }) {
    const response = await fetch(`${API_URL}/lists`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar lista.");
    }

    return data;
}

export async function deleteList(token, listId) {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover lista.");
    }

    return data;
}

export async function addListItem(token, listId, item) {
    const response = await fetch(`${API_URL}/lists/${listId}/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao adicionar item na lista.");
    }

    return data;
}

export async function removeListItem(token, listId, itemId) {
    const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover item da lista.");
    }

    return data;
}

export async function getAllLists(){
    const response = await fetch(`${API_URL}/lists/all`);

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar listas." );
    }

    return data;
}

export async function getPublicList(listId){
    const response = await fetch(`${API_URL}/lists/public/${listId}`);

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar lista.");

    }

    return data;
}

export async function getPublicProfile(username) {
    const response = await fetch(`${API_URL}/users/${username}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar perfil.");
    }

    return data;
}
