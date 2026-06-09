const pool = require("../config/db");

async function save(transaction, client = pool) {
  const { id, walletId, type, amount, reference, createdAt } = transaction;

  const result = await client.query(
    `INSERT INTO transactions (id, wallet_id, type, amount, reference, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, walletId, type, amount, reference, createdAt]
  );

  return result.rows[0];
}

async function findByWalletId(walletId, client = pool) {
  const result = await client.query(
    `SELECT * FROM transactions
     WHERE wallet_id = $1
     ORDER BY created_at DESC`,
    [walletId]
  );

  return result.rows;
}

module.exports = { save, findByWalletId };