# Vocora performance monitoring

## Baseline and current instrumentation

Do not tune endpoints based on a feeling. Vocora already exposes a safe baseline
for measurement:

- every API response has `X-Request-ID`, `X-Response-Time-ms`, and
  `Server-Timing: app;dur=...`;
- requests above `SLOW_REQUEST_MS` (default: 1000 ms) are logged with method,
  path, response status, duration, and request ID only;
- public vocabulary/category reads use Redis-backed response caching in
  production and expose `X-Cache: HIT|MISS`;
- Next image optimisation is enabled for AVIF/WebP and bounded image sizes.

Run the read-path load-test after a deploy and retain its output with the
release record:

```bash
docker compose exec api python -m scripts.loadtest \
  --base http://127.0.0.1:8000 --requests 2000 --concurrency 50
```

Record p50/p95/p99, throughput, non-2xx results, and cache-hit ratio. Compare
like-for-like runs; production data and cache warmth materially affect results.

## Investigating a regression

1. Start with the proxy/API log using the request ID and route, not the request
   body. Error logging intentionally excludes tokens, emails, cookies, and
   passwords.
2. Compare `X-Cache` and `Server-Timing` on the affected request. A cache miss
   is expected after deploy or expiry; sustained misses need Redis/config review.
3. Use PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` only on a staging copy or a
   carefully bounded read-only production query. Add an index only when a real
   plan shows the need.
4. For frontend regressions, capture Core Web Vitals in the browser (LCP, INP,
   CLS) and inspect the route's network waterfall. Avoid adding a large client
   analytics SDK until a product/operations owner selects and approves one.

## Guardrails

- Do not log request/response bodies in a performance tool.
- Do not cache authenticated responses without a user-specific cache key and
  explicit invalidation plan.
- Optimise a measured bottleneck, then repeat the same measurement to verify
  the improvement.
