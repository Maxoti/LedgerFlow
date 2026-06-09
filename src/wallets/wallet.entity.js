class Wallet {
  constructor({ id, userId, balance = 0, currency = "KES" }) {
    this.id = id;
    this.userId = userId;
    this.balance = balance;
    this.currency = currency;
  }

  credit(amount) {
    if (amount <= 0) throw new Error("Credit amount must be > 0");
    this.balance += amount;
  }

  debit(amount) {
    if (amount <= 0) throw new Error("Debit amount must be > 0");
    if (this.balance < amount) throw new Error("Insufficient funds");

    this.balance -= amount;
  }
}

module.exports = Wallet;