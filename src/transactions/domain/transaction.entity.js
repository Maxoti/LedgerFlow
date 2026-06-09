class Transaction {
  constructor({ id, walletId, type, amount, reference, createdAt = new Date() }) {
    if (!["CREDIT", "DEBIT"].includes(type)) {
      throw new Error(`Invalid transaction type: ${type}`);
    }
    if (amount <= 0) {
      throw new Error("Transaction amount must be greater than 0");
    }
    if (!walletId) throw new Error("walletId is required");
    if (!reference) throw new Error("reference is required");

    this.id = id;
    this.walletId = walletId;
    this.type = type;
    this.amount = amount;
    this.reference = reference;
    this.createdAt = createdAt;
  }
}

module.exports = Transaction;