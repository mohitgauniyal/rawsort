/**
 * Validator for rawsort - ensures content integrity after sorting
 */

import { ValidationResult } from "./types.js";

export class ContentValidator {
  /**
   * Validates that all original content is present in the sorted version
   * Ignores whitespace and Markdown headers
   */
  static validateIntegrity(
    original: string,
    sorted: string
  ): ValidationResult {
    const originalCharCount = this.cleanContent(original).length;
    const sortedCharCount = this.cleanContent(sorted).length;
    const categoriesFound = this.extractCategories(sorted);

    // Integrity is defined as: the multiset of content lines is preserved
    // exactly. Category headers (## ...) and blank lines are ignored, and each
    // line is trimmed, so re-grouping and re-indenting are allowed — but any
    // added, removed, or altered content line fails the check (fail-closed).
    const originalLines = this.contentLines(original, false);
    const sortedLines = this.contentLines(sorted, true);

    const diff = this.multisetDiff(originalLines, sortedLines);

    if (diff.missing.length > 0 || diff.added.length > 0) {
      const parts: string[] = [];
      if (diff.missing.length > 0) {
        parts.push(`${diff.missing.length} line(s) missing or altered`);
      }
      if (diff.added.length > 0) {
        parts.push(`${diff.added.length} line(s) added or altered`);
      }
      return {
        isValid: false,
        originalCharCount,
        sortedCharCount,
        message: `Content integrity mismatch: ${parts.join(", ")}`,
        categoriesFound,
      };
    }

    return {
      isValid: true,
      originalCharCount,
      sortedCharCount,
      message: "Content integrity verified ✓",
      categoriesFound,
    };
  }

  /**
   * Splits content into trimmed, non-empty lines. When `dropHeaders` is set,
   * Markdown category headers (## ...) are excluded so only real content
   * remains.
   */
  private static contentLines(content: string, dropHeaders: boolean): string[] {
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !(dropHeaders && /^#{1,6}\s+/.test(line)));
  }

  /**
   * Compares two multisets of strings, returning which entries are missing
   * from `after` and which were added that weren't in `before`.
   */
  private static multisetDiff(
    before: string[],
    after: string[]
  ): { missing: string[]; added: string[] } {
    const counts = new Map<string, number>();
    for (const line of before) counts.set(line, (counts.get(line) || 0) + 1);

    const added: string[] = [];
    for (const line of after) {
      const remaining = counts.get(line) || 0;
      if (remaining > 0) counts.set(line, remaining - 1);
      else added.push(line);
    }

    const missing: string[] = [];
    for (const [line, remaining] of counts.entries()) {
      for (let i = 0; i < remaining; i++) missing.push(line);
    }

    return { missing, added };
  }

  /**
   * Extracts category headers from markdown content
   */
  static extractCategories(content: string): string[] {
    const regex = /^##\s+(.+?)$/gm;
    const categories: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      categories.push(match[1].trim());
    }

    return [...new Set(categories)]; // Remove duplicates
  }

  /**
   * Cleans content by removing markdown headers and extra whitespace
   * But preserves all actual content characters
   */
  private static cleanContent(content: string): string {
  return (
    content
      // Remove markdown headers (## Category)
      .replace(/^##\s+.+?$/gm, "")
      // Remove all whitespace and newlines
      .replace(/\s+/g, "")
      // Trim
      .trim()
  );
}
}
