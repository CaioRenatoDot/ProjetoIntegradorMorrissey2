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
};

function translateAuthMessage(message, fallback) {
    if (!message) return fallback;
    return AUTH_ERROR_TRANSLATIONS[message] || message;
}

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(translateAuthMessage(data.message, "Could not sign in."));
    }

    return data;

}

export async function logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
        credentials: "include",
        method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao encerrar a sessao.");
    }

    return data;
}

export async function register(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(translateAuthMessage(data.message, "Could not create your account."));
    }

    return data;
}

export async function getMe(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar usuario.")
    }

    return data;
}

export async function getWatchlist(token) {
    const response = await fetch(`${API_URL}/watchlist`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar watchlist");
    }
    return data;
}

export async function addToWatchlist(token, item) {
    const response = await fetch(`${API_URL}/watchlist`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover item da watchlist.")
    }

    return data;
}

export async function getFavorites(token) {
    const response = await fetch(`${API_URL}/favorites`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar favoritos.");
    }

    return data;
}

export async function addFavorite(token, item) {
    const response = await fetch(`${API_URL}/favorites`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover favorito.");
    }

    return data;
}

export async function reorderFavorites(token, ids) {
    const response = await fetch(`${API_URL}/favorites/reorder`, {
        credentials: "include",
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
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
        credentials: "include",
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
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
        credentials: "include",
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao excluir conta.");
    }

    return data;
}

export async function getReviews(movieId) {
    // Rota com auth opcional: o cookie, quando existe, destaca a review do
    // proprio usuario.
    const response = await fetch(`${API_URL}/reviews/${movieId}`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar reviews.");
    }

    return data;
}

export async function getMyReviews(token) {
    const response = await fetch(`${API_URL}/reviews/mine`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar suas reviews.");
    }

    return data;
}

export async function saveReview(token, review) {
    const response = await fetch(`${API_URL}/reviews`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(review),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao salvar review.");
    }

    return data;
}

export async function deleteReview(token, reviewId) {
    const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover review.");
    }

    return data;
}

export async function getMyLists(token) {
    const response = await fetch(`${API_URL}/lists`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar listas.");
    }

    return data;
}

export async function getList(token, listId) {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar lista.");
    }

    return data;
}

export async function createList(token, { title, category }) {
    const response = await fetch(`${API_URL}/lists`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao remover lista.");
    }

    return data;
}

export async function addListItem(token, listId, item) {
    const response = await fetch(`${API_URL}/lists/${listId}/items`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
        credentials: "include",
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
