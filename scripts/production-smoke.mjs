#!/usr/bin/env node

import { pathToFileURL } from "node:url";

export function validateApiParity(localHealth, publicHealth) {
  const errors = [];
  if (localHealth?.status !== "ok") errors.push("local API is not healthy");
  if (publicHealth?.status !== "ok") errors.push("public API is not healthy");
  if (!localHealth?.version || publicHealth?.version !== localHealth.version) {
    errors.push(`public API version ${publicHealth?.version ?? "missing"} does not match local ${localHealth?.version ?? "missing"}`);
  }
  if (!localHealth?.environment || publicHealth?.environment !== localHealth.environment) {
    errors.push(`public API environment ${publicHealth?.environment ?? "missing"} does not match local ${localHealth?.environment ?? "missing"}`);
  }
  return errors;
}

async function getJson(url) {
  const probeUrl = new URL(url);
  probeUrl.searchParams.set("deployment_probe", Date.now().toString());
  const response = await fetch(probeUrl, {
    cache: "no-store",
    headers: { "cache-control": "no-cache" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${probeUrl.origin} returned HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const localUrl = process.env.LOCAL_API_HEALTH_URL ?? "http://127.0.0.1:8000/health/detail";
  const publicUrl = process.env.PUBLIC_API_HEALTH_URL ?? "https://api.vocora.uz/health/detail";
  const webUrl = process.env.PUBLIC_WEB_URL ?? "https://vocora.uz/uz";

  const [localHealth, publicHealth, webResponse] = await Promise.all([
    getJson(localUrl),
    getJson(publicUrl),
    fetch(webUrl, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(20_000) }),
  ]);
  const errors = validateApiParity(localHealth, publicHealth);
  if (!webResponse.ok) errors.push(`public web returned HTTP ${webResponse.status}`);
  if (errors.length) throw new Error(errors.join("; "));
  console.log(`Public API matches local release ${localHealth.version}; public web is reachable.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`Production smoke failed: ${error.message}`);
    process.exitCode = 1;
  });
}
