const Wallet = require("./wallet.entity");
const repo = require("./wallets.repository");
const transactionService = require("../transactions/transactions.service");
const pool = require("../config/db");

async function createWallet(userId) {
  const wallet = new Wallet({
    id: Date.now().toString(),
    userId,
    balance: 0,
  });

  return repo.save(wallet);
}

async function creditWallet(walletId, amount, reference) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const wallet = await repo.findById(walletId, client);
    if (!wallet) throw new Error("Wallet not found");

    wallet.credit(amount);
    await repo.save(wallet, client);

    await transactionService.createTransaction({
      walletId,
      type: "CREDIT",
      amount,
      reference,
    }, client);

    await client.query("COMMIT");
    return wallet;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function debitWallet(walletId, amount, reference) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const wallet = await repo.findById(walletId, client);
    if (!wallet) throw new Error("Wallet not found");

    wallet.debit(amount);
    await repo.save(wallet, client);

    await transactionService.createTransaction({
      walletId,
      type: "DEBIT",
      amount,
      reference,
    }, client);

    await client.query("COMMIT");
    return wallet;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { createWallet, creditWallet, debitWallet };