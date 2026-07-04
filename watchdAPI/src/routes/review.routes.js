const express = require('express');

const authMiddleware = require("../middlewares/auth.middleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuth.middleware");
const reviewController = require("../controllers/review.controller");

const reviewRoutes = express.Router();

reviewRoutes.get("/mine", authMiddleware, reviewController.listMine);
reviewRoutes.get("/:movieId", optionalAuthMiddleware, reviewController.listForMovie);
reviewRoutes.post("/", authMiddleware, reviewController.upsert);
reviewRoutes.delete("/:id", authMiddleware, reviewController.remove);

module.exports = reviewRoutes;
