const express = require('express');

const userController = require("../controllers/user.controller");

const userRoutes = express.Router();

userRoutes.get("/:username", userController.getPublicProfile);

module.exports = userRoutes;
