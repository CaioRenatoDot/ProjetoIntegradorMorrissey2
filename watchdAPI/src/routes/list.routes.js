const express = require("express");

const listController = require("../controllers/list.controller");
const listRoutes = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

listRoutes.use(authMiddleware);

listRoutes.get("/", listController.listMine);
listRoutes.post("", listController.create);
listRoutes.get("/:id", listController.getOne);
listRoutes.delete("/:id", listController.remove);
listRoutes.post("/:id/items", listController.addItem);
listRoutes.delete("/:id/items/:itemId",listController.removeItem);

module.exports = listRoutes;