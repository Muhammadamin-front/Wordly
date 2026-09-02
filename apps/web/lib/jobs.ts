import { apiFetch, ApiError } from "@/lib/api";

export interface Job<T> {
  id: string;
  kind: string;
  status: "queued" | "running" | "done" | "failed";
  result: T | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 2_000;
/** Comfortably past the worker's own 180s job timeout, so a job that is
 *  still going gets the chance to finish rather than being abandoned here. */
const POLL_TIMEOUT_MS = 240_000;

/** Waits for a queued job to finish and returns its result.
 *
 *  Long AI work now runs in a worker rather than inside the request, so the
 *  browser submits, gets a job id, and reads the answer when it is ready —
 *  no request held open for the length of a model call. */
export async function waitForJob<T>(jobId: string, signal?: AbortSignal): Promise<T> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const job = await apiFetch<Job<T>>(`/jobs/${jobId}`, { auth: true });
    if (job.status === "done" && job.result !== null) return job.result;
    if (job.status === "failed") {
      throw new ApiError(502, job.error ?? "The AI service could not finish this.");
    }
    if (Date.now() >= deadline) {
      throw new ApiError(504, "This is taking longer than expected. Try again shortly.");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
