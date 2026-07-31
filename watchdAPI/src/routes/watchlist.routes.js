const express = require('express');

const authMiddleware = require("../middlewares/auth.middleware");
const watchlistController = require("../controllers/watchlist.controller");
const { asyncHandler } = require("../middlewares/error.middleware");
const watchlistRouters = express.Router();

watchlistRouters.use(authMiddleware);

watchlistRouters.post("/", asyncHandler(watchlistController.create));
watchlistRouters.get("/", asyncHandler(watchlistController.list));
watchlistRouters.delete("/:id", asyncHandler(watchlistController.remove));

module.exports = watchlistRouters;
