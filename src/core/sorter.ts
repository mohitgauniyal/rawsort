/**
 * Main sorter logic for rawsort
 */

import fs from "fs";
import os from "os";
import path from "path";
import { AuditProof, RawsortConfig, SortResult } from "./types.js";
import { GeminiClient, TextModel } from "./gemini.js";
import { Segmenter } from "./segmenter.js";
import { Classifier } from "./classifier.js";
import { Reassembler } from "./reassembler.js";
import { ContentValidator } from "./validator.js";
import { Proof } from "./proof.js";

/** Result of classifying a string in-memory (the SDK primitive, no file I/O). */
export interface ClassifyResult {
  sorted: string;
  categoriesFound: string[];
  integrityValid: boolean;
  proof: AuditProof;
}

export class Sorter {
  private config: RawsortConfig;
  private classifier: Classifier;

  /**
   * `model` is injectable so the pipeline can be tested with a fake model.
   * In production it defaults to the Gemini client built from the config key.
   */
  constructor(config: RawsortConfig, model?: TextModel) {
    this.config = config;
    this.classifier = new Classifier(
      model ?? new GeminiClient(config.geminiApiKey, config.model)
    );
  }

  /**
   * The SDK primitive: classify a string in memory and return the reorganized
   * text plus a verifiable audit proof. No file I/O — safe to embed anywhere.
   * Throws if the integrity gate fails (which should never happen, since the
   * output is reassembled from originals).
   */
  async classifyText(content: string): Promise<ClassifyResult> {
    // Segment into units, classify each (LLM only returns labels), then
    // rebuild the document from the original, untouched unit text.
    const units = Segmenter.segment(content);
    const labels = await this.classifier.classify(units, this.config.categories);
    const sorted = Reassembler.reassemble(units, labels, this.config.categories);

    // Final safety assertion: reassembly is built from originals, so this
    // should always pass; if it ever fails we refuse to return a result.
    const validation = ContentValidator.validateIntegrity(content, sorted);
    if (!validation.isValid) {
      throw new Error(`Integrity check failed: ${validation.message}`);
    }

    const proof = Proof.generate(
      content,
      sorted,
      units,
      labels,
      this.config.categories,
      this.config.model
    );

    return {
      sorted,
      categoriesFound: validation.categoriesFound,
      integrityValid: validation.isValid,
      proof,
    };
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

      let result: ClassifyResult;
      try {
        result = await this.classifyText(content);
      } catch (err) {
        return {
          success: false,
          originalPath: filePath,
          charCount: originalCharCount,
          categoriesFound: [],
          message: "Validation failed",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }

      // Write back if not dry-run (backing up the original first)
      let backupPath: string | undefined;
      if (!this.config.dryRun) {
        backupPath = this.backupFile(filePath, content);
        this.writeFile(filePath, result.sorted);
      }

      return {
        success: true,
        originalPath: filePath,
        charCount: originalCharCount,
        categoriesFound: result.categoriesFound,
        message: `Successfully sorted! Found ${result.categoriesFound.length} categories.`,
        backupPath,
        proof: result.proof,
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
