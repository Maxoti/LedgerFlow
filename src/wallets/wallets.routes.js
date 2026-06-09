const express = require("express");
const controller = require("./wallets.controller");

const router = express.Router();

router.post("/", controller.createWallet);
router.post("/:walletId/credit", controller.creditWallet);
router.post("/:walletId/debit", controller.debitWallet);

module.exports = router;