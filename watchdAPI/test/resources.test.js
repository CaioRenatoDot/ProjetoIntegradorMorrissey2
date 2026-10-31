const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { app, request, signIn } = require("./helpers");
const favoriteService = require("../src/services/favorite.service");
const listService = require("../src/services/list.service");
const reviewService = require("../src/services/review.service");
const watchlistService = require("../src/services/watchlist.service");

const series = { movieId: "169", title: "Breaking Bad", type: "series" };

describe("checagem de dono", () => {
    it("nao remove item da watchlist de outro usuario", async (t) => {
        const auth = signIn(t);
        const owned = t.mock.method(watchlistService, "findOwnedById", async () => null);
        const remove = t.mock.method(watchlistService, "remove", async () => {});

        const res = await request(app).delete("/watchlist/item-de-outro").set("Authorization", auth);

        assert.equal(res.status, 404);
        assert.deepEqual(owned.mock.calls[0].arguments, ["item-de-outro", "user-1"]);
        assert.equal(remove.mock.callCount(), 0);
    });

    it("nao apaga lista de outro usuario", async (t) => {
        const auth = signIn(t);
        t.mock.method(listService, "findOwnedById", async () => null);
        const remove = t.mock.method(listService, "remove", async () => {});

        const res = await request(app).delete("/lists/lista-de-outro").set("Authorization", auth);

        assert.equal(res.status, 404);
        assert.equal(remove.mock.callCount(), 0);
    });
});

describe("favoritos", () => {
    it("responde 400 quando o limite de 4 ja foi atingido", async (t) => {
        const auth = signIn(t);
        t.mock.method(favoriteService, "findByUserAndMovie", async () => null);
        t.mock.method(favoriteService, "createWithinLimit", async () => null);

        const res = await request(app).post("/favorites").set("Authorization", auth).send(series);

        assert.equal(res.status, 400);
        assert.match(res.body.message, /4 series/);
    });

    it("recusa snapshot de serie com campo gigante", async (t) => {
        const auth = signIn(t);

        const res = await request(app)
            .post("/favorites")
            .set("Authorization", auth)
            .send({ ...series, posterUrl: "x".repeat(501) });

        assert.equal(res.status, 400);
    });
});

describe("POST /reviews", () => {
    it("recusa nota fora dos passos de 0.5", async (t) => {
        const auth = signIn(t);

        const res = await request(app)
            .post("/reviews")
            .set("Authorization", auth)
            .send({ ...series, rating: 3.3 });

        assert.equal(res.status, 400);
    });

    it("recusa nota em texto", async (t) => {
        const auth = signIn(t);

        const res = await request(app)
            .post("/reviews")
            .set("Authorization", auth)
            .send({ ...series, rating: "5" });

        assert.equal(res.status, 400);
    });

    it("cria a review quando ainda nao existe", async (t) => {
        const auth = signIn(t);
        t.mock.method(reviewService, "findByUserAndMovie", async () => null);
        const create = t.mock.method(reviewService, "create", async (data) => ({ id: "r1", ...data }));

        const res = await request(app)
            .post("/reviews")
            .set("Authorization", auth)
            .send({ ...series, rating: 4.5, text: "Muito boa" });

        assert.equal(res.status, 201);
        assert.equal(create.mock.calls[0].arguments[0].userId, "user-1");
    });
});

describe("GET /lists/all", () => {
    const fakeList = (id) => ({
        id,
        title: `Lista ${id}`,
        category: null,
        createdAt: new Date(),
        _count: { items: 0 },
        user: { name: "Caio", displayName: null, username: "caio" },
        items: []
    });

    it("pagina com skip/take e avisa se tem proxima pagina", async (t) => {
        const find = t.mock.method(listService, "findAllPublic", async ({ take }) =>
            Array.from({ length: take }, (_, index) => fakeList(String(index)))
        );

        const res = await request(app).get("/lists/all?page=2&limit=5");

        assert.deepEqual(find.mock.calls[0].arguments[0], { skip: 5, take: 6 });
        assert.equal(res.body.items.length, 5);
        assert.equal(res.body.hasMore, true);
    });

    it("limita o tamanho da pagina", async (t) => {
        const find = t.mock.method(listService, "findAllPublic", async () => []);

        await request(app).get("/lists/all?limit=1000");

        assert.equal(find.mock.calls[0].arguments[0].take, 51);
    });
});

describe("errorHandler", () => {
    it("JSON malformado vira 400 INVALID_JSON", async () => {
        const res = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/json")
            .send("{ nao e json");

        assert.equal(res.status, 400);
        assert.equal(res.body.code, "INVALID_JSON");
    });

    it("corpo acima de 20kb vira 413", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "a@b.com", password: "x".repeat(25 * 1024) });

        assert.equal(res.status, 413);
    });

    it("rota inexistente vira 404", async () => {
        const res = await request(app).get("/nao-existe");

        assert.equal(res.status, 404);
        assert.equal(res.body.code, "ROUTE_NOT_FOUND");
    });
});
