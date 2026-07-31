const Redis = require("ioredis");
const redis = new Redis({ host: "127.0.0.1", port: 6379 });

redis.defineCommand("claimJob", {
  numberOfKeys: 2,
  lua: `
    local job = redis.call('RPOP', KEYS[1])
    if job then
      redis.call('ZADD', KEYS[2], ARGV[1], job)
    end
    return job
  `,
});

async function processJob(jobString) {
  const job = JSON.parse(jobString);
  console.log("Processing job:", job);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate a 50% chance of failure, like a flaky third-party API
  if (Math.random() < 0.5) {
    throw new Error("Simulated failure: email service unavailable");
  }

  console.log("Finished job:", job);
}

async function processWithRetries(jobString) {
  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await processJob(jobString);
      return true; // success
    } catch (err) {
      attempt++;
      const backoffMs = Math.min(1000 * 2 ** attempt, 30000); // cap at 30s
      const jitter = Math.random() * 500; // up to 500ms random jitter
      console.log(
        `Job failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}. Retrying in ${Math.round((backoffMs + jitter) / 1000)}s`
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs + jitter));
    }
  }

  console.log("Job permanently failed after", MAX_RETRIES, "attempts:", jobString);
  return false; // exhausted retries
}

async function startWorker() {
  console.log("Worker started. Waiting for jobs...");
  while (true) {
    const timestamp = Date.now();
    const jobString = await redis.claimJob("myqueue", "processing", timestamp);

    if (jobString) {
      await processWithRetries(jobString);
      await redis.zrem("processing", jobString);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

startWorker();