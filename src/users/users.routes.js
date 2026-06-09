const express = require("express");
const controller = require("./users.controller");

const router = express.Router();

router.get("/profile", controller.getProfile);

module.exports = router;