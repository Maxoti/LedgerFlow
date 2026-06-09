function canTransfer(senderWallet,amount) {
  return senderWallet.balance >= amount;
}