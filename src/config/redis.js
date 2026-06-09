const { createClient } = require("redis");
const env = require("./env");

const client = createClient({ url: env.REDIS_URL });

client.on("connect", () => console.log("Redis connected"));
client.on("error", (err) => console.error("Redis error:", err.message));

async function connectRedis() {
  await client.connect();
}

module.exports = { client, connectRedis };