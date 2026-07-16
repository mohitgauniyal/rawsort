/**
 * Main sorter logic for rawsort
 */

import fs from "fs";
import path from "path";
import { RawsortConfig, SortResult } from "./types.js";
import { GeminiClient } from "./gemini.js";
import { ContentValidator } from "./validator.js";
import { console } from "inspector/promises";

export class Sorter {
  private config: RawsortConfig;
  private geminiClient: GeminiClient;

  constructor(config: RawsortConfig) {
    this.config = config;
    this.geminiClient = new GeminiClient(config.geminiApiKey);
  }

  
  async sort(): Promise<SortResult> {
    try {
      // Expand tilde in path
      const filePath = this.expandPath(this.config.filePath);

      // Read the file
      const content = this.readFile(filePath);
      const originalCharCount = content.length;

      // Check if file is empty
      if (content.trim() === "") {
        return {
          success: false,
          originalPath: filePath,
          charCount: originalCharCount,
          categoriesFound: [],
          message: "File is empty. Nothing to sort.",
        };
      }

      // Call Gemini to sort
      const sortedContent = await this.geminiClient.sortContent(
        content,
        this.config.categories
      );

      // Add these lines before: const validation = ContentValidator.validateIntegrity(
    console.log("Original content length:", content.length);
    console.log("Sorted content length:", sortedContent.length);
    console.log("First 200 chars of original:", content.substring(0, 200));
    console.log("First 200 chars of sorted:", sortedContent.substring(0, 200));

      // Validate integrity
      const validation = ContentValidator.validateIntegrity(
        content,
        sortedContent
      );

      if (!validation.isValid) {
        return {
          success: false,
          originalPath: filePath,
          charCount: originalCharCount,
          categoriesFound: validation.categoriesFound,
          message: `Validation failed: ${validation.message}`,
          error: validation.message,
        };
      }

      // Write back if not dry-run
      if (!this.config.dryRun) {
        this.writeFile(filePath, sortedContent);
      }

      return {
        success: true,
        originalPath: filePath,
        charCount: originalCharCount,
        categoriesFound: validation.categoriesFound,
        message: `Successfully sorted! Found ${validation.categoriesFound.length} categories.`,
      };
    } catch (error) {
      return {
        success: false,
        originalPath: this.config.filePath,
        charCount: 0,
        categoriesFound: [],
        message: "Sort failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      throw new Error(
        `Cannot read file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private writeFile(filePath: string, content: string): void {
    try {
      fs.writeFileSync(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Cannot write file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private expandPath(filePath: string): string {
    if (filePath.startsWith("~")) {
      return path.join(process.env.HOME || "~", filePath.slice(1));
    }
    return path.resolve(filePath);
  }
}
