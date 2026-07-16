/**
 * Tests for GeminiClient (thin text-generation adapter)
 */

import { describe, it, expect } from "@jest/globals";
import { GeminiClient } from "../../src/core/gemini";

describe("GeminiClient", () => {
  it("should construct with an API key", () => {
    const client = new GeminiClient("test-api-key");
    expect(client).toBeDefined();
    expect(typeof client.generate).toBe("function");
  });

  it("should surface errors from the underlying model as Gemini API errors", async () => {
    const client = new GeminiClient("invalid-key");
    await expect(client.generate("hello")).rejects.toThrow();
  });
});
