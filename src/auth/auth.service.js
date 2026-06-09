const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const repo = require("./auth.repository");
const env = require("../config/env");

async function register({ email, password, phone }) {
  const existing = await repo.findByEmail(email);
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await repo.saveUser({
    id: Date.now().toString(),
    email,
    passwordHash,
    phone,
    createdAt: new Date(),
  });

  return { id: user.id, email: user.email, phone: user.phone };
}

async function login({ email, password }) {
  const user = await repo.findByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, email: user.email } };
}

module.exports = { register, login };