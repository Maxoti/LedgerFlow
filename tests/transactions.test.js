const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");

let token;
let walletId;
let userId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'tx_test@ledgerflow.com'");

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({
      email: "tx_test@ledgerflow.com",
      password: "Test1234!",
      phone: "0700000003",
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "tx_test@ledgerflow.com",
      password: "Test1234!",
    });

  token = loginRes.body.data.token;
  userId = registerRes.body.data.id;

  const walletRes = await request(app)
    .post("/api/wallets")
    .set("Authorization", `Bearer ${token}`)
    .send({ userId });

  walletId = walletRes.body.data.id;

  await request(app)
    .post(`/api/wallets/${walletId}/credit`)
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 5000, reference: "REF-SETUP-001" });
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'tx_test@ledgerflow.com'");
});

describe("Transactions — Audit Trail", () => {
  it("should record a transaction after credit", async () => {
    await request(app)
      .post(`/api/wallets/${walletId}/credit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 500, reference: "REF-AUDIT-001" });

    const res = await request(app)
      .get(`/api/transactions/wallet/${walletId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const tx = res.body.data[0];
    expect(tx.type).toBe("CREDIT");
    expect(Number(tx.amount)).toBe(500);
    expect(tx.reference).toBe("REF-AUDIT-001");
  });

  it("should record a transaction after debit", async () => {
    await request(app)
      .post(`/api/wallets/${walletId}/debit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 200, reference: "REF-AUDIT-002" });

    const res = await request(app)
      .get(`/api/transactions/wallet/${walletId}`)
      .set("Authorization", `Bearer ${token}`);

    const debitTx = res.body.data.find(
      (tx) => tx.reference === "REF-AUDIT-002"
    );

    expect(debitTx).toBeDefined();
    expect(debitTx.type).toBe("DEBIT");
    expect(Number(debitTx.amount)).toBe(200);
  });

  it("should reject duplicate reference — idempotency", async () => {
    await request(app)
      .post(`/api/wallets/${walletId}/credit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100, reference: "REF-IDEMPOTENT-001" });

    const res = await request(app)
      .post(`/api/wallets/${walletId}/credit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100, reference: "REF-IDEMPOTENT-001" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("should return transactions in descending order", async () => {
    const res = await request(app)
      .get(`/api/transactions/wallet/${walletId}`)
      .set("Authorization", `Bearer ${token}`);

    const transactions = res.body.data;
    for (let i = 0; i < transactions.length - 1; i++) {
      const current = new Date(transactions[i].created_at);
      const next = new Date(transactions[i + 1].created_at);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }
  });
});