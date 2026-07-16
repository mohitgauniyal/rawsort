/**
 * Gemini API client wrapper for rawsort
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model = "gemini-flash-latest";

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async sortContent(
    content: string,
    categories: string[]
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });

    const prompt = this.buildPrompt(content, categories);

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private buildPrompt(content: string, categories: string[]): string {
    const categoryList = categories.map((c) => `- ${c}`).join("\n");

    return `You are a text organizer. Your ONLY job is to reorganize the following content into sections based on categories.

CRITICAL RULES:
1. Do NOT modify any content. Keep every word, every character, every symbol exactly as it is.
2. Do NOT fix spelling, grammar, or formatting of the content.
3. Do NOT remove any lines or characters.
4. Do NOT add new categories. Only use the categories listed below.
5. Group similar items together under the appropriate category headers.
6. Use Markdown headers for category names: ## Category Name
7. If an item doesn't fit any category, put it under "Reference Notes".
8. Preserve all original formatting, URLs, code, credentials exactly as written.

ALLOWED CATEGORIES ONLY:
${categoryList}

CONTENT TO ORGANIZE:
${content}

OUTPUT:
Reorganize the content above into sections, one section per allowed category. Use only the categories listed above. Keep all content exactly as written.`;
  }
}
