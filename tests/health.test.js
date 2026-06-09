const request = require("supertest");
const app = require("../src/app");

describe("Health Check", () => {
  it("should return 200 and running status", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});