const API_URL = "/api"

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`,{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

const data = await response.json();

if(!response.ok){
    throw new Error(data.message || "Erro ao fazer login.")
}

return data;

}

export async function register(name, email, password){
    const response = await fetch(`${API_URL}/auth/register`,{
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body : JSON.stringify({name, email, password}),
    });
    const data = await response.json();

    if (!response.ok){
        throw new Error(data.message || "Erro ao criar conta.");
    }

    return data;
}

export async function getMe(token){
    const response = await fetch(`${API_URL}/auth/me`,{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar usuario.")
    }

    return data;
}