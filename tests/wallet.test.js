const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");

let token;
let walletId;
let userId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'wallet_test@ledgerflow.com'");

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({
      email: "wallet_test@ledgerflow.com",
      password: "Test1234!",
      phone: "0700000002",
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "wallet_test@ledgerflow.com",
      password: "Test1234!",
    });

  token = loginRes.body.data.token;
  userId = registerRes.body.data.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'wallet_test@ledgerflow.com'");
});

describe("Wallet — Create", () => {
  it("should create a wallet for authenticated user", async () => {
    const res = await request(app)
      .post("/api/wallets")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balance).toBe("0.00");
    expect(res.body.data.currency).toBe("KES");

    walletId = res.body.data.id;
  });

  it("should reject wallet creation without auth token", async () => {
    const res = await request(app)
      .post("/api/wallets")
      .send({ userId });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Wallet — Credit", () => {
  it("should credit wallet successfully", async () => {
    const res = await request(app)
      .post(`/api/wallets/${walletId}/credit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 1000, reference: "REF-CREDIT-001" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.balance)).toBe(1000);
  });

  it("should reject credit with zero amount", async () => {
    const res = await request(app)
      .post(`/api/wallets/${walletId}/credit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 0, reference: "REF-CREDIT-002" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("should reject credit with negative amount", async () => {
    const res = await request(app)
      .post(`/api/wallets/${walletId}/credit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: -500, reference: "REF-CREDIT-003" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("Wallet — Debit", () => {
  it("should debit wallet successfully", async () => {
    const res = await request(app)
      .post(`/api/wallets/${walletId}/debit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 400, reference: "REF-DEBIT-001" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.balance)).toBe(600);
  });

  it("should reject debit exceeding balance", async () => {
    const res = await request(app)
      .post(`/api/wallets/${walletId}/debit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 9999, reference: "REF-DEBIT-002" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/insufficient/i);
  });

  it("should reject debit with zero amount", async () => {
    const res = await request(app)
      .post(`/api/wallets/${walletId}/debit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 0, reference: "REF-DEBIT-003" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("should never allow negative balance", async () => {
  // Attempt to overdraw completely
  const res = await request(app)
    .post(`/api/wallets/${walletId}/debit`)
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 99999, reference: "REF-OVERDRAW-001" });

  // Must be rejected
  expect(res.statusCode).toBe(500);
  expect(res.body.success).toBe(false);
  expect(res.body.error).toMatch(/insufficient/i);
});
});