const transactionService = require("./transactions.service");

async function getWalletTransactions(req, res, next) {
  try {
    const { walletId } = req.params;

    const transactions = await transactionService.getWalletTransactions(walletId);

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const { walletId } = req.params;
    const { type, amount, reference } = req.body;

    const transaction = await transactionService.createTransaction({
      walletId,
      type,
      amount,
      reference,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
}

module.exports = { getWalletTransactions, createTransaction };