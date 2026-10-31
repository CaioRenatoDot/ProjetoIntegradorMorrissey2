const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { app, request, signIn, testUser } = require("./helpers");
const authService = require("../src/services/auth.service");

describe("POST /auth/register", () => {
    it("recusa quando falta campo obrigatorio", async () => {
        const res = await request(app).post("/auth/register").send({ email: "a@b.com" });

        assert.equal(res.status, 400);
        assert.equal(res.body.code, "MISSING_FIELDS");
    });

    it("recusa senha sem numero", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ name: "Caio", email: "a@b.com", password: "abcdefgh" });

        assert.equal(res.status, 400);
        assert.equal(res.body.code, "PASSWORD_NO_NUMBER");
    });

    it("recusa senha acima de 72 bytes, que o bcrypt cortaria", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ name: "Caio", email: "a@b.com", password: "a1".repeat(40) });

        assert.equal(res.body.code, "PASSWORD_TOO_LONG");
    });

    it("recusa nome muito longo", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ name: "x".repeat(61), email: "a@b.com", password: "abc12345" });

        assert.equal(res.body.code, "INVALID_FIELD");
    });

    it("recusa email ja cadastrado", async (t) => {
        t.mock.method(authService, "findUserByEmail", async () => testUser);

        const res = await request(app)
            .post("/auth/register")
            .send({ name: "Caio", email: testUser.email, password: "abc12345" });

        assert.equal(res.body.code, "EMAIL_IN_USE");
    });
});

describe("POST /auth/login", () => {
    it("da o mesmo erro para usuario inexistente e senha errada", async (t) => {
        t.mock.method(authService, "findUserByEmailOrUsername", async () => null);
        const missingUser = await request(app)
            .post("/auth/login")
            .send({ email: "ninguem@b.com", password: "abc12345" });

        t.mock.method(authService, "findUserByEmailOrUsername", async () => ({ ...testUser, password: "hash" }));
        t.mock.method(authService, "verifyPassword", async () => false);
        const wrongPassword = await request(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: "errada123" });

        assert.equal(missingUser.body.code, "INVALID_CREDENTIALS");
        assert.equal(wrongPassword.body.code, "INVALID_CREDENTIALS");
    });

    it("recusa email que nao e texto sem estourar 500", async () => {
        const res = await request(app).post("/auth/login").send({ email: { $ne: "" }, password: "x" });

        assert.equal(res.status, 400);
    });

    it("seta o cookie de sessao quando as credenciais batem", async (t) => {
        t.mock.method(authService, "findUserByEmailOrUsername", async () => ({ ...testUser, password: "hash" }));
        t.mock.method(authService, "verifyPassword", async () => true);

        const res = await request(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: "abc12345" });

        assert.equal(res.status, 200);
        assert.match(res.headers["set-cookie"][0], /^watchd_token=.+HttpOnly/);
    });
});

describe("rotas protegidas", () => {
    it("sem token responde 401 com code UNAUTHENTICATED", async () => {
        const res = await request(app).get("/auth/me");

        assert.equal(res.status, 401);
        assert.equal(res.body.code, "UNAUTHENTICATED");
    });

    it("token assinado com outro segredo e recusado", async () => {
        const jwt = require("jsonwebtoken");
        const token = jwt.sign({ id: testUser.id }, "outro-segredo");

        const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

        assert.equal(res.status, 401);
    });

    it("com token valido devolve o usuario", async (t) => {
        const auth = signIn(t);

        const res = await request(app).get("/auth/me").set("Authorization", auth);

        assert.equal(res.status, 200);
        assert.equal(res.body.user.username, testUser.username);
    });
});

describe("PUT /auth/me", () => {
    it("recusa website que nao e http ou https", async (t) => {
        const auth = signIn(t);
        const update = t.mock.method(authService, "updateProfile", async () => testUser);

        const res = await request(app)
            .put("/auth/me")
            .set("Authorization", auth)
            .send({ website: "javascript:alert(1)" });

        assert.equal(res.status, 400);
        assert.equal(update.mock.callCount(), 0);
    });

    it("recusa bio maior que o limite", async (t) => {
        const auth = signIn(t);

        const res = await request(app)
            .put("/auth/me")
            .set("Authorization", auth)
            .send({ bio: "x".repeat(241) });

        assert.equal(res.status, 400);
    });
});
