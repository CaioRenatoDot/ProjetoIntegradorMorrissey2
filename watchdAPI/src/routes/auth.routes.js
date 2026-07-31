const express = require('express');

const  authController = require('../controllers/auth.controller');
const authRoutes = express.Router();
const authMiddleware = require("../middlewares/auth.middleware")
const { asyncHandler } = require("../middlewares/error.middleware")

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.post("/logout", asyncHandler(authController.logout));
authRoutes.get("/me", authMiddleware, asyncHandler(authController.me));
authRoutes.put("/me", authMiddleware, asyncHandler(authController.updateProfile));
authRoutes.delete("/me", authMiddleware, asyncHandler(authController.deleteAccount));

module.exports = authRoutes;
