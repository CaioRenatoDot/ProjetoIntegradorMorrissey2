const express = require('express');

const authMiddleware = require("../middlewares/auth.middleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuth.middleware");
const reviewController = require("../controllers/review.controller");
const { asyncHandler } = require("../middlewares/error.middleware");

const reviewRoutes = express.Router();

reviewRoutes.get("/mine", authMiddleware, asyncHandler(reviewController.listMine));
reviewRoutes.get("/:movieId", optionalAuthMiddleware, asyncHandler(reviewController.listForMovie));
reviewRoutes.post("/", authMiddleware, asyncHandler(reviewController.upsert));
reviewRoutes.delete("/:id", authMiddleware, asyncHandler(reviewController.remove));

module.exports = reviewRoutes;
