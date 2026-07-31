const express = require("express");

const listController = require("../controllers/list.controller");
const listRoutes = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../middlewares/error.middleware");

// Rotas públicas, sem auth para listagem
listRoutes.get("/all", asyncHandler(listController.listAll));
listRoutes.get("/public/:id", asyncHandler(listController.getPublicOne));

//Rota protegida - precisa do auth
listRoutes.use(authMiddleware)

listRoutes.get("/", asyncHandler(listController.listMine));
listRoutes.post("", asyncHandler(listController.create));
listRoutes.get("/:id", asyncHandler(listController.getOne));
listRoutes.delete("/:id", asyncHandler(listController.remove));
listRoutes.post("/:id/items", asyncHandler(listController.addItem));
listRoutes.delete("/:id/items/:itemId", asyncHandler(listController.removeItem));

module.exports = listRoutes;
