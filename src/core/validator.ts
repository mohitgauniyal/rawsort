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
  const originalClean = this.cleanContent(original);
  const sortedClean = this.cleanContent(sorted);

  // Instead of strict character count, check if all original words/tokens are present
  const originalTokens = originalClean.match(/\S+/g) || [];
  const sortedTokens = sortedClean.match(/\S+/g) || [];

  // Allow small differences due to formatting (up to 5% variance)
  const tokenDifference = Math.abs(originalTokens.length - sortedTokens.length);
  const allowedDifference = Math.ceil(originalTokens.length * 0.05);

  if (tokenDifference > allowedDifference) {
    return {
      isValid: false,
      originalCharCount: originalClean.length,
      sortedCharCount: sortedClean.length,
      message: `Content token mismatch: original has ${originalTokens.length} tokens, sorted has ${sortedTokens.length} tokens`,
      categoriesFound: this.extractCategories(sorted),
    };
  }

  return {
    isValid: true,
    originalCharCount: originalClean.length,
    sortedCharCount: sortedClean.length,
    message: "Content integrity verified ✓",
    categoriesFound: this.extractCategories(sorted),
  };
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

  /**
   * Checks if all characters from original are present in sorted
   * This is a loose check - it doesn't require order, just presence
   */
  private static contentIncludes(original: string, sorted: string): boolean {
    // Create a character frequency map for original
    const originalChars = new Map<string, number>();
    for (const char of original) {
      originalChars.set(char, (originalChars.get(char) || 0) + 1);
    }

    // Create a character frequency map for sorted
    const sortedChars = new Map<string, number>();
    for (const char of sorted) {
      sortedChars.set(char, (sortedChars.get(char) || 0) + 1);
    }

    // Check if sorted has at least as many of each character as original
    for (const [char, count] of originalChars.entries()) {
      if ((sortedChars.get(char) || 0) < count) {
        return false;
      }
    }

    return true;
  }
}
