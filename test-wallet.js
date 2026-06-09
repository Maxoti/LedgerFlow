const repo = require("./src/wallets/wallets.repository");
const service = require("./src/wallets/wallets.service");

async function test() {
  const wallet = await service.createWallet("user-1");

  await service.creditWallet(wallet.id, 1000);
  await service.debitWallet(wallet.id, 200);

  const finalWallet = await repo.findById(wallet.id);

  console.log("Final wallet:", finalWallet);
}

test();