const express = require('express');

const authMiddleware = require("../middlewares/auth.middleware");
const watchlistController = require("../controllers/watchlist.controller");
const watchlistRouters = express.Router();

watchlistRouters.use(authMiddleware);

watchlistRouters.post("/", watchlistController.create);
watchlistRouters.get("/", watchlistController.list);
watchlistRouters.delete("/:id", watchlistController.remove);

module.exports = watchlistRouters;
