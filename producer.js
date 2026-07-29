const Redis = require("ioredis");

process.loadEnvFile?.();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  db: Number(process.env.REDIS_DB || 0),
  password: process.env.REDIS_PASSWORD || undefined,
});

const queueName = process.env.QUEUE_NAME || "myqueue";

async function addJob(jobData) {
  await redis.lpush(queueName, JSON.stringify(jobData));
  console.log("Job added:", jobData);
}

addJob({ type: "send_email", to: "a@test.com" });
