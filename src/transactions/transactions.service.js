const Transaction = require("./domain/transaction.entity");
const repo = require("./transactions.repository");

async function createTransaction({ walletId, type, amount, reference }, client) {
  const transaction = new Transaction({
    id: Date.now().toString(),
    walletId,
    type,
    amount,
    reference,
  });

  return repo.save(transaction, client);
}

async function getWalletTransactions(walletId) {
  return repo.findByWalletId(walletId);
}

module.exports = { createTransaction, getWalletTransactions };