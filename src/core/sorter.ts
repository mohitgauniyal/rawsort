/**
 * Main sorter logic for rawsort
 */

import fs from "fs";
import os from "os";
import path from "path";
import { RawsortConfig, SortResult } from "./types.js";
import { GeminiClient } from "./gemini.js";
import { ContentValidator } from "./validator.js";

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

      // Write back if not dry-run (backing up the original first)
      let backupPath: string | undefined;
      if (!this.config.dryRun) {
        backupPath = this.backupFile(filePath, content);
        this.writeFile(filePath, sortedContent);
      }

      return {
        success: true,
        originalPath: filePath,
        charCount: originalCharCount,
        categoriesFound: validation.categoriesFound,
        message: `Successfully sorted! Found ${validation.categoriesFound.length} categories.`,
        backupPath,
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

  /**
   * Writes a timestamped copy of the original content next to the file so a
   * bad sort can always be reverted. Returns the backup path.
   */
  private backupFile(filePath: string, originalContent: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${filePath}.${timestamp}.backup`;
    try {
      fs.writeFileSync(backupPath, originalContent, "utf-8");
      return backupPath;
    } catch (error) {
      throw new Error(
        `Cannot write backup file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private expandPath(filePath: string): string {
    if (filePath === "~" || filePath.startsWith("~/") || filePath.startsWith("~\\")) {
      return path.join(os.homedir(), filePath.slice(1));
    }
    return path.resolve(filePath);
  }
}
