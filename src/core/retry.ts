/**
 * Small retry helper for transient model/network failures.
 *
 * The Gemini API intermittently returns 503 (overloaded) and 429 (rate limit)
 * even on healthy accounts. These are worth a few backed-off retries; genuine
 * errors (bad key, malformed request) are not, so they are surfaced
 * immediately.
 */

export interface RetryOptions {
  /** Number of retries after the initial attempt. */
  retries?: number;
  /** Base delay in ms; grows exponentially per attempt. */
  baseDelayMs?: number;
  /** Decides whether a given error is worth retrying. */
  isRetryable?: (err: unknown) => boolean;
  /** Injectable sleep (tests pass a no-op). */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * True for errors that are transient and safe to retry (HTTP 429/503, service
 * overloaded, or a bare network failure).
 */
export function isTransientError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("service unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit") ||
    msg.includes("fetch failed") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout")
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const retries = opts.retries ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  const isRetryable = opts.isRetryable ?? isTransientError;
  const sleep = opts.sleep ?? defaultSleep;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries || !isRetryable(err)) break;
      // Exponential backoff: base, 2x, 4x, ...
      await sleep(baseDelayMs * Math.pow(2, attempt));
    }
  }
  throw lastError;
}
