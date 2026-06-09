const pool = require("../config/db");
const Wallet = require("./wallet.entity");

async function save(wallet, client = pool) {
  const { id, userId, balance, currency } = wallet;

  const result = await client.query(
    `INSERT INTO wallets (id, user_id, balance, currency)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
       SET balance = EXCLUDED.balance,
           updated_at = NOW()
     RETURNING *`,
    [id, userId, balance, currency]
  );

  return result.rows[0];
}

async function findById(walletId, client = pool) {
  const result = await client.query(
    `SELECT * FROM wallets WHERE id = $1 FOR UPDATE`,
    [walletId]
  );

  if (!result.rows[0]) return null;

  const row = result.rows[0];

  // Reconstruct as Wallet instance so credit/debit methods are available
  return new Wallet({
    id: row.id,
    userId: row.user_id,
    balance: parseFloat(row.balance),
    currency: row.currency,
  });
}

async function findByUserId(userId, client = pool) {
  const result = await client.query(
    `SELECT * FROM wallets WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

module.exports = { save, findById, findByUserId };