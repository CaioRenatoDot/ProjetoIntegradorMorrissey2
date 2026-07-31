const express = require('express');

const  authController = require('../controllers/auth.controller');
const authRoutes = express.Router();
const authMiddleware = require("../middlewares/auth.middleware")
const { asyncHandler } = require("../middlewares/error.middleware")
const { loginLimiter, registerLimiter } = require("../middlewares/rateLimit.middleware")

authRoutes.post("/register", registerLimiter, asyncHandler(authController.register));
authRoutes.post("/login", loginLimiter, asyncHandler(authController.login));
authRoutes.post("/logout", asyncHandler(authController.logout));
authRoutes.get("/me", authMiddleware, asyncHandler(authController.me));
authRoutes.put("/me", authMiddleware, asyncHandler(authController.updateProfile));
authRoutes.delete("/me", authMiddleware, asyncHandler(authController.deleteAccount));

module.exports = authRoutes;
