"""Lightweight async load test for the public read path.

Not part of CI — a hand-run smoke of throughput and the cache under concurrency.
Hammers the hottest anonymous endpoints (corpus browse, categories, word
detail, health) and reports p50/p95/p99 latency, RPS, and the cache HIT ratio
reported via the `X-Cache` header.

Usage:
    python -m scripts.loadtest --base http://localhost:8000 --requests 2000 --concurrency 50
"""
import argparse
import asyncio
import time
from collections import Counter

import httpx

ENDPOINTS = [
    "/api/v1/words?page=1&page_size=24",
    "/api/v1/words?page=1&page_size=24&level=A1",
    "/api/v1/words?page=2&page_size=24",
    "/api/v1/categories",
    "/health",
]


def percentile(values, pct):
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = min(len(ordered) - 1, int(len(ordered) * pct / 100))
    return ordered[idx]


async def worker(client, base, paths, latencies, statuses, cache_marks, budget):
    while budget["n"] > 0:
        budget["n"] -= 1
        path = paths[budget["n"] % len(paths)]
        start = time.perf_counter()
        try:
            resp = await client.get(base + path, timeout=10.0)
            latencies.append((time.perf_counter() - start) * 1000)
            statuses[resp.status_code] += 1
            cache_marks[resp.headers.get("X-Cache", "-")] += 1
        except Exception as exc:  # noqa: BLE001 — record and keep going
            statuses[type(exc).__name__] += 1


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://localhost:8000")
    parser.add_argument("--requests", type=int, default=2000)
    parser.add_argument("--concurrency", type=int, default=50)
    args = parser.parse_args()

    latencies: list[float] = []
    statuses: Counter = Counter()
    cache_marks: Counter = Counter()
    budget = {"n": args.requests}

    started = time.perf_counter()
    async with httpx.AsyncClient() as client:
        await asyncio.gather(*[
            worker(client, args.base, ENDPOINTS, latencies, statuses, cache_marks, budget)
            for _ in range(args.concurrency)
        ])
    wall = time.perf_counter() - started

    done = len(latencies)
    print("requests:   {}".format(args.requests))
    print("completed:  {}  in {:.2f}s".format(done, wall))
    print("throughput: {:.0f} req/s".format(done / wall if wall else 0))
    print("latency ms: p50={:.1f}  p95={:.1f}  p99={:.1f}  max={:.1f}".format(
        percentile(latencies, 50), percentile(latencies, 95),
        percentile(latencies, 99), max(latencies) if latencies else 0,
    ))
    print("status:     {}".format(dict(statuses)))
    print("cache:      {}".format(dict(cache_marks)))


if __name__ == "__main__":
    asyncio.run(main())
