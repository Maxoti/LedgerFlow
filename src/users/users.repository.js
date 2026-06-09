const pool = require("../config/db");

async function save(user) {
  const { id, email, passwordHash, createdAt } = user;

  const result = await pool.query(
    `INSERT INTO users (id, email, password_hash, created_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, email, passwordHash, createdAt]
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

async function findById(id) {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = { save, findByEmail, findById };