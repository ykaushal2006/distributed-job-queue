const Redis = require("ioredis");
const redis = new Redis({ host: "127.0.0.1", port: 6379 });

const VISIBILITY_TIMEOUT_MS = 30000; // 30 seconds

async function recoverStuckJobs() {
  console.log("Reaper checking for stuck jobs...");

  const cutoff = Date.now() - VISIBILITY_TIMEOUT_MS;

  // Find jobs in "processing" with a timestamp OLDER than the cutoff
  const stuckJobs = await redis.zrangebyscore("processing", 0, cutoff);

  for (const job of stuckJobs) {
    await redis.zrem("processing", job);
    await redis.lpush("myqueue", job);
    console.log("Recovered stuck job:", job);
  }

  console.log(`Reaper finished. Recovered ${stuckJobs.length} job(s).`);
}

const CHECK_INTERVAL_MS = 10000; // check every 10 seconds

async function startReaper() {
  console.log("Reaper started. Checking every", CHECK_INTERVAL_MS / 1000, "seconds...");
  while (true) {
    await recoverStuckJobs();
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
  }
}

startReaper();