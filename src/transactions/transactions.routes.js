const express = require("express");
const controller = require("./transactions.controller");

const router = express.Router();

router.get(
  "/wallet/:walletId",
  controller.getWalletTransactions
);

module.exports = router;