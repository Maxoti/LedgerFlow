const { client: redisClient } = require("../src/config/redis");
const pool = require("../src/config/db");

beforeAll(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
});

afterAll(async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  await pool.end();
});