# Backend Order Processing System (WIP)

This repository contains the foundation of a backend system designed to process orders **reliably under failure conditions**.  
The goal is to simulate real-world backend infrastructure using:

- Node.js + TypeScript  
- Docker  
- EC2  
- Async workers  
- Recovery processes  

Business logic will be added incrementally.


## 🎯 Objective

Build a **single-service backend system** that supports:

- Order creation  
- Inventory reservation  
- Payment processing  
- Order confirmation  
- Asynchronous notifications  
- Failure recovery  

With a strong focus on:

- Idempotency  
- Crash recovery  
- Async processing  
- Real-world infrastructure patterns  


## 🏗 Current Architecture

The system runs **three separate processes** from the same codebase:

| Process | Role |
|--------|------|
| API Server | Handles HTTP requests |
| Worker | Processes async jobs |
| Recovery Worker | Fixes stuck/incomplete orders |

All processes are containerized using Docker and can be deployed to EC2.


## Run Locally

Build and start all services:

```bash
docker compose up --build
```

Or use the helper scripts:

```bash
npm run docker:local:up
npm run docker:ps
```


## Load / Stress Testing

A simple built-in stress runner is included so you can probe limits without adding extra tools.

```bash
npm run stress:test -- --base-url http://localhost:3000 --requests 1000 --concurrency 100
```

### Supported options

- `--base-url` (default: `http://localhost:3000`)
- `--endpoint` (default: `/create`)
- `--requests` (default: `500`)
- `--concurrency` (default: `50`)
- `--timeout-ms` (default: `10000`)
- `--warmup` (default: `10`)

The script prints:

- success/error rates
- HTTP status distribution
- latency (`min`, `avg`, `p50`, `p95`, `p99`, `max`)
- throughput in requests per second

### Suggested progression

1. Start small (`200 req`, `20 concurrency`) and verify near-100% success.
2. Double concurrency each run and watch for rising `p95/p99` latency.
3. Track when non-200 statuses or timeouts begin.
4. Repeat with worker/recovery enabled to compare behavior under realistic async load.

> Note: `/create` currently inserts into DB and attempts queue enqueue. This means DB and queue availability strongly affect your results.
