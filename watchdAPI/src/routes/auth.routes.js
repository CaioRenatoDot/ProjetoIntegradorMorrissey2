const express = require('express');

const  authController = require('../controllers/auth.controller');
const authRoutes = express.Router();
const authMiddleware = require("../middlewares/auth.middleware")

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authMiddleware, authController.me);
authRoutes.put("/me", authMiddleware,authController.updateProfile);
authRoutes.delete("/me", authMiddleware, authController.deleteAccount);

module.exports = authRoutes;