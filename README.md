# Distributed Job Queue & Rate Limiter

A backend systems project exploring how production task queues work under the hood — built with Redis, Node.js, and Docker. The goal is to understand and implement core distributed-systems concepts (not just use a library that does it for you): atomic job handoff, crash recovery, rate limiting, and retry logic.

> **Status: In active development.** Producer is implemented and working. Worker/consumer, crash recovery, and rate limiting are in progress.

## Why this project

Most CRUD apps don't touch the concepts that matter in high-throughput backend systems — queuing, concurrency, fault tolerance, and graceful degradation under load. This project is a hands-on way to implement those concepts from scratch on top of Redis rather than just calling a managed queue service.

## Tech Stack

- **Runtime:** Node.js
- **Queue/Broker:** Redis
- **Containerization:** Docker (Redis run via Docker on Windows)

## Architecture (planned)

```
Producer(s) → Redis List (queue) → Worker(s) → Job processed
                    │
                    └── RPOPLPUSH → Processing list → visibility timeout → crash recovery
```

- **Producer:** Pushes jobs onto a Redis-backed queue
- **Worker(s):** Pull jobs off the queue and process them concurrently
- **Crash recovery:** Uses `RPOPLPUSH` to move jobs into a "processing" list with a visibility timeout, so a job isn't lost if a worker crashes mid-processing
- **Rate limiting:** Token bucket algorithm to cap job throughput
- **Retries:** Failed jobs retried with exponential backoff

## Current Progress

- [x] Redis setup via Docker
- [x] Producer script — pushes jobs to queue
- [ ] Worker script — consumes and processes jobs
- [ ] Crash recovery (RPOPLPUSH + visibility timeout)
- [ ] Token bucket rate limiter
- [ ] Retry logic with exponential backoff
- [ ] Horizontal scaling across multiple workers

## Setup (local)

```bash
# clone the repo
git clone https://github.com/ykaushal2006/distributed-job-queue.git
cd distributed-job-queue

# install dependencies
npm install

# start Redis via Docker
docker run -d -p 6379:6379 redis

# run the producer
node producer.js
```

> Note: You'll need a `.env` file with your own Redis connection details (not included in the repo — see `.env.example` if provided).

## What I learned so far

- How Redis lists can act as a lightweight message queue
- Why atomic operations (`RPOPLPUSH` vs plain `LPOP`) matter for not losing jobs on crash
- The tradeoffs between simple FIFO queues and queues that need to handle job dependencies/ordering constraints

## Roadmap

- Finish worker/consumer implementation
- Add crash recovery and visibility timeouts
- Implement token bucket rate limiting
- Add retry logic with exponential backoff
- Scale to multiple concurrent workers
- Add basic monitoring/logging for queue depth and job status