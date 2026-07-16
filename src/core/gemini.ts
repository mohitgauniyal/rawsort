/**
 * Gemini API client wrapper for rawsort.
 *
 * This is a thin, generic text-generation adapter. All prompt building and
 * response parsing lives in the classifier, which depends only on the small
 * `TextModel` interface below — so it can be unit-tested with a fake model and
 * swapped for a local/offline model later without touching classification logic.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "./retry.js";

/** Minimal contract the classifier depends on. */
export interface TextModel {
  generate(prompt: string): Promise<string>;
}

/**
 * flash-lite is more than enough for label-only classification and is the model
 * with free-tier quota on typical accounts (the full flash model often reports
 * `limit: 0` free quota). Override via config `model` if your account differs.
 */
export const DEFAULT_MODEL = "gemini-flash-lite-latest";

export class GeminiClient implements TextModel {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    // Retry transient 503/429/network failures with exponential backoff.
    return withRetry(async () => {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        throw new Error(
          `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });
  }
}
