/**
 * Tests for the retry helper.
 */

import { describe, it, expect } from "@jest/globals";
import { withRetry, isTransientError } from "../../src/core/retry";

const noSleep = async () => {};

describe("isTransientError", () => {
  it("flags 503/429/overloaded/network errors as retryable", () => {
    expect(isTransientError(new Error("[503 Service Unavailable] overloaded"))).toBe(true);
    expect(isTransientError(new Error("[429 Too Many Requests]"))).toBe(true);
    expect(isTransientError(new Error("fetch failed"))).toBe(true);
    expect(isTransientError(new Error("ETIMEDOUT"))).toBe(true);
  });

  it("does not flag genuine errors as retryable", () => {
    expect(isTransientError(new Error("[400] invalid request"))).toBe(false);
    expect(isTransientError(new Error("API key not valid"))).toBe(false);
  });
});

describe("withRetry", () => {
  it("returns immediately on first success without retrying", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        return "ok";
      },
      { sleep: noSleep }
    );
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  it("retries transient failures then succeeds", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error("[503] overloaded");
        return "recovered";
      },
      { sleep: noSleep, baseDelayMs: 0 }
    );
    expect(result).toBe("recovered");
    expect(calls).toBe(3);
  });

  it("gives up after the configured number of retries", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error("[503] overloaded");
        },
        { retries: 2, sleep: noSleep }
      )
    ).rejects.toThrow("503");
    expect(calls).toBe(3); // initial + 2 retries
  });

  it("does not retry a non-transient error", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error("API key not valid");
        },
        { sleep: noSleep }
      )
    ).rejects.toThrow("API key not valid");
    expect(calls).toBe(1);
  });
});
