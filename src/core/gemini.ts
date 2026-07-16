/**
 * Gemini API client wrapper for rawsort.
 *
 * This is now a thin, generic text-generation adapter. All prompt building and
 * response parsing lives in the classifier, which depends only on the small
 * `TextModel` interface below — so it can be unit-tested with a fake model and
 * swapped for a local/offline model later without touching classification logic.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/** Minimal contract the classifier depends on. */
export interface TextModel {
  generate(prompt: string): Promise<string>;
}

export class GeminiClient implements TextModel {
  private client: GoogleGenerativeAI;
  private model = "gemini-flash-latest";

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
