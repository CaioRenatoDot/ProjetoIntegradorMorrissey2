const express = require("express")

const favoriteController = require('../controllers/favorite.controller');
const favoriteRoutes = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")

favoriteRoutes.use(authMiddleware);

favoriteRoutes.get("/", favoriteController.list);
favoriteRoutes.post("/", favoriteController.create);
favoriteRoutes.delete("/:id", favoriteController.remove);
favoriteRoutes.put("/reorder", favoriteController.reorder);

module.exports = favoriteRoutes;