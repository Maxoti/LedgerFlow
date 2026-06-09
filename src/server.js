const app = require("./app");
const env = require("./config/env");
const { connectRedis } = require("./config/redis");
const pool = require("./config/db");

async function startServer() {
  try {
    // Test DB connection
    await pool.query("SELECT 1");
    console.log("Database connection verified");

    // Connect Redis
    await connectRedis();

    // Start Express
    app.listen(env.PORT, () => {
      console.log(`LedgerFlow running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();