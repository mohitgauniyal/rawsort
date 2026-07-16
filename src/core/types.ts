/**
 * Core TypeScript interfaces for rawsort
 */

export interface RawsortConfig {
  geminiApiKey: string;
  filePath: string;
  categories: string[];
  dryRun?: boolean;
}

export interface SortResult {
  success: boolean;
  originalPath: string;
  charCount: number;
  categoriesFound: string[];
  message: string;
  error?: string;
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
