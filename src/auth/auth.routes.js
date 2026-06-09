const express = require("express");
const controller = require("./auth.controller");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);

module.exports = router;