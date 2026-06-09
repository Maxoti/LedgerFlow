// This file documents which modules are allowed to talk to each other.
// Enforce these rules manually — no module should import outside its boundary.

const BOUNDARIES = {
  wallets: ["transactions"],         // wallets can call transactions
  transactions: [],                  // transactions calls nobody
  auth: ["users"],                   // auth can call users
  users: [],                         // users calls nobody
  notifications: ["users", "wallets"], // notifications can call users and wallets
};

module.exports = BOUNDARIES;