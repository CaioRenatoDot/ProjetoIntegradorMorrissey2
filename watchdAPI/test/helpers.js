// Carregado antes do app em todo teste. Os services sao trocados por mocks,
// mas se algum ficar sem mock a query precisa falhar rapido em vez de chegar
// no banco de verdade configurado no .env (o dotenv nao sobrescreve variaveis
// que ja existem).
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/watchd_test";
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const jwt = require("jsonwebtoken");
const request = require("supertest");

const app = require("../src/app");
const authService = require("../src/services/auth.service");

const testUser = {
    id: "user-1",
    name: "Caio",
    email: "caio@example.com",
    username: "caio",
    usernameChangedAt: null,
    displayName: null,
    location: null,
    website: null,
    bio: null
};

// Faz o authMiddleware aceitar a request como testUser.
function signIn(t, user = testUser) {
    t.mock.method(authService, "findUserById", async () => user);
    return `Bearer ${jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET)}`;
}

module.exports = {
    app,
    request,
    signIn,
    testUser
};
