const express = require('express');

const userController = require("../controllers/user.controller");
const { asyncHandler } = require("../middlewares/error.middleware");

const userRoutes = express.Router();

userRoutes.get("/:username", asyncHandler(userController.getPublicProfile));

module.exports = userRoutes;
