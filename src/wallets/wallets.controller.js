const walletService = require("./wallets.service");

async function createWallet(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) throw new Error("userId is required");

    const wallet = await walletService.createWallet(userId);
    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
}

async function creditWallet(req, res, next) {
  try {
    const { walletId } = req.params;
    const { amount, reference } = req.body;

    const wallet = await walletService.creditWallet(walletId, amount, reference);
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
}

async function debitWallet(req, res, next) {
  try {
    const { walletId } = req.params;
    const { amount, reference } = req.body;

    const wallet = await walletService.debitWallet(walletId, amount, reference);
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
}

module.exports = { createWallet, creditWallet, debitWallet };