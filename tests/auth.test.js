const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'test@ledgerflow.com'");
});

describe("Auth — Register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@ledgerflow.com",
        password: "Test1234!",
        phone: "0700000001",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@ledgerflow.com");
  });

  it("should reject registration with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@ledgerflow.com" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("should reject duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@ledgerflow.com",
        password: "Test1234!",
        phone: "0700000001",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already registered/i);
  });
});

describe("Auth — Login", () => {
  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@ledgerflow.com",
        password: "Test1234!",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@ledgerflow.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it("should reject login with unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "ghost@ledgerflow.com",
        password: "Test1234!",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});