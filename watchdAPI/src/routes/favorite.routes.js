const express = require("express")

const favoriteController = require('../controllers/favorite.controller');
const favoriteRoutes = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const { asyncHandler } = require("../middlewares/error.middleware")

favoriteRoutes.use(authMiddleware);

favoriteRoutes.get("/", asyncHandler(favoriteController.list));
favoriteRoutes.post("/", asyncHandler(favoriteController.create));
favoriteRoutes.delete("/:id", asyncHandler(favoriteController.remove));
favoriteRoutes.put("/reorder", asyncHandler(favoriteController.reorder));

module.exports = favoriteRoutes;
