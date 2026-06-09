const pool = require("../config/db");

async function saveUser(user) {
  const { id, email, passwordHash, phone, createdAt } = user;

  const result = await pool.query(
    `INSERT INTO users (id, email, password_hash, phone, created_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, email, passwordHash, phone, createdAt]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

module.exports = { saveUser, findByEmail };