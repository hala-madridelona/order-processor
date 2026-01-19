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
