#!/usr/bin/env node
import { randomUUID } from 'node:crypto';

const DEFAULTS = {
  baseUrl: 'http://localhost:3000',
  endpoint: '/create',
  requests: 500,
  concurrency: 50,
  timeoutMs: 10000,
  warmup: 10,
};

function parseArgs(argv) {
  const options = { ...DEFAULTS };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (!arg.startsWith('--')) continue;

    switch (arg) {
      case '--base-url':
        options.baseUrl = value;
        i += 1;
        break;
      case '--endpoint':
        options.endpoint = value;
        i += 1;
        break;
      case '--requests':
        options.requests = Number(value);
        i += 1;
        break;
      case '--concurrency':
        options.concurrency = Number(value);
        i += 1;
        break;
      case '--timeout-ms':
        options.timeoutMs = Number(value);
        i += 1;
        break;
      case '--warmup':
        options.warmup = Number(value);
        i += 1;
        break;
      default:
        break;
    }
  }

  if (!Number.isFinite(options.requests) || options.requests <= 0) {
    throw new Error('--requests must be a positive number');
  }

  if (!Number.isFinite(options.concurrency) || options.concurrency <= 0) {
    throw new Error('--concurrency must be a positive number');
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error('--timeout-ms must be a positive number');
  }

  if (!Number.isFinite(options.warmup) || options.warmup < 0) {
    throw new Error('--warmup must be 0 or greater');
  }

  return options;
}

function percentile(sortedNumbers, p) {
  if (!sortedNumbers.length) return 0;
  const index = Math.ceil((p / 100) * sortedNumbers.length) - 1;
  return sortedNumbers[Math.max(0, Math.min(index, sortedNumbers.length - 1))];
}

async function performRequest(target, timeoutMs) {
  const requestId = randomUUID();
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'X-Id-Key': requestId,
      },
      signal: controller.signal,
    });

    const durationMs = performance.now() - startedAt;
    return {
      ok: response.ok,
      status: response.status,
      durationMs,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: performance.now() - startedAt,
      error: error?.name === 'AbortError' ? 'timeout' : error?.message ?? 'unknown error',
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function run() {
  const options = parseArgs(process.argv);
  const target = `${options.baseUrl.replace(/\/$/, '')}${options.endpoint}`;

  console.log('--- Stress test configuration ---');
  console.log(JSON.stringify({ ...options, target }, null, 2));

  for (let i = 0; i < options.warmup; i += 1) {
    await performRequest(target, options.timeoutMs);
  }

  let sent = 0;
  const results = [];
  const wallClockStart = performance.now();

  async function workerLoop() {
    while (sent < options.requests) {
      sent += 1;
      const result = await performRequest(target, options.timeoutMs);
      results.push(result);

      if (results.length % 50 === 0 || results.length === options.requests) {
        process.stdout.write(`\rCompleted ${results.length}/${options.requests}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(options.concurrency, options.requests) }, () => workerLoop());
  await Promise.all(workers);
  process.stdout.write('\n');

  const wallClockMs = performance.now() - wallClockStart;
  const latencySorted = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const successCount = results.filter((r) => r.ok).length;
  const timeoutCount = results.filter((r) => r.error === 'timeout').length;
  const errorCount = results.length - successCount;
  const statusCounts = results.reduce((acc, item) => {
    const key = String(item.status || 'ERR');
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const report = {
    requests: results.length,
    successCount,
    errorCount,
    timeoutCount,
    successRate: Number(((successCount / results.length) * 100).toFixed(2)),
    wallClockMs: Number(wallClockMs.toFixed(2)),
    throughputRps: Number(((results.length / wallClockMs) * 1000).toFixed(2)),
    latencyMs: {
      min: Number(latencySorted[0]?.toFixed(2) ?? 0),
      avg: Number((latencySorted.reduce((sum, n) => sum + n, 0) / latencySorted.length).toFixed(2)),
      p50: Number(percentile(latencySorted, 50).toFixed(2)),
      p95: Number(percentile(latencySorted, 95).toFixed(2)),
      p99: Number(percentile(latencySorted, 99).toFixed(2)),
      max: Number(latencySorted[latencySorted.length - 1]?.toFixed(2) ?? 0),
    },
    statusCounts,
  };

  console.log('--- Stress test report ---');
  console.log(JSON.stringify(report, null, 2));

  if (successCount !== results.length) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Stress test crashed:', error);
  process.exitCode = 1;
});
