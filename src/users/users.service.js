const repo = require("./users.repository");

async function getUserById(userId) {
  const user = await repo.findById(userId);
  if (!user) throw new Error("User not found");

  // Never return password hash
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function getUserByEmail(email) {
  return repo.findByEmail(email);
}

module.exports = { getUserById, getUserByEmail };