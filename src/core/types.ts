/**
 * Core TypeScript interfaces for rawsort
 */

export interface RawsortConfig {
  geminiApiKey: string;
  filePath: string;
  categories: string[];
  dryRun?: boolean;
  /** Optional Gemini model override; defaults to gemini-flash-lite-latest. */
  model?: string;
}

export interface SortResult {
  success: boolean;
  originalPath: string;
  charCount: number;
  categoriesFound: string[];
  message: string;
  error?: string;
  /** Path to the timestamped backup of the original file, if one was written. */
  backupPath?: string;
}

export interface ValidationResult {
  isValid: boolean;
  originalCharCount: number;
  sortedCharCount: number;
  message: string;
  categoriesFound: string[];
}

export interface CategorizedContent {
  [category: string]: string[];
}

/**
 * A single atomic block of the scratchpad. Blocks are separated by blank lines
 * and are never split across categories. `text` is the original, untouched
 * content; the engine only ever moves whole units, never rewrites them.
 */
export interface Unit {
  id: number;
  text: string;
}

/**
 * Result of redacting a unit's text before it is shown to the model. `safeText`
 * is what the model sees; the original `Unit.text` is what ends up in the file.
 */
export interface RedactionResult {
  safeText: string;
  redacted: boolean;
  type?: string;
}
