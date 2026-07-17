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
  /** Verifiable audit proof of the run (present on success). */
  proof?: AuditProof;
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

/** One unit in an audit proof: its content hash and assigned category. */
export interface ProofUnit {
  id: number;
  hash: string;
  category: string;
}

/**
 * A portable, independently verifiable record that a classification run
 * reorganized content without altering it. Given the original input, the sorted
 * output, and this proof, a third party can recompute every hash and confirm
 * the multiset of content units is identical — no trust in rawsort required.
 */
export interface AuditProof {
  tool: "rawsort";
  proofVersion: string;
  createdAt: string;
  algorithm: "sha256";
  model?: string;
  taxonomy: string[];
  inputDigest: string;
  outputDigest: string;
  units: ProofUnit[];
  integrity: {
    preserved: boolean;
    unitCount: number;
  };
}

/** Outcome of independently verifying an AuditProof. */
export interface VerifyResult {
  valid: boolean;
  checks: { name: string; passed: boolean; detail?: string }[];
}
