const express = require("express");
const walletRoutes = require("../wallets/wallets.routes");
const transactionRoutes = require("../transactions/transactions.routes");
const authRoutes = require("../auth/auth.routes");
const userRoutes = require("../users/users.routes");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes — no auth required
router.use("/auth", authRoutes);

// Protected routes — auth required
router.use("/wallets", authMiddleware, walletRoutes);
router.use("/transactions", authMiddleware, transactionRoutes);
router.use("/users", authMiddleware, userRoutes);

module.exports = router;