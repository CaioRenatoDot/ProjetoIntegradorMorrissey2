// Unico lugar que sabe onde o token da sessao fica guardado. O acesso ao
// localStorage pode falhar (modo privado, armazenamento bloqueado), e nesse
// caso a sessao segue so pelo cookie.
const TOKEN_KEY = "watchd_token";

export function getSessionToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSessionToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Sem armazenamento disponivel; o cookie httpOnly continua valendo.
  }
}

export function clearSessionToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nada a limpar.
  }
}
