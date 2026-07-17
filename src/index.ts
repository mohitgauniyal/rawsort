/**
 * rawsort — public SDK surface.
 *
 * The library entry point for embedding rawsort as a verifiable text
 * classification engine. Example:
 *
 *   import { classifyText, verifyProof } from "rawsort";
 *
 *   const { sorted, proof } = await classifyText(rawText, {
 *     geminiApiKey: process.env.GEMINI_API_KEY!,
 *     categories: ["Billing", "Bug Report", "Feature Request", "Other"],
 *   });
 *
 *   // Anyone can later confirm the source was never altered:
 *   const { valid } = verifyProof(rawText, sorted, proof);
 */

import { Sorter, ClassifyResult } from "./core/sorter.js";
import { Proof } from "./core/proof.js";
import { TextModel } from "./core/gemini.js";
import { AuditProof, RawsortConfig, VerifyResult } from "./core/types.js";

export type { ClassifyResult } from "./core/sorter.js";
export type {
  AuditProof,
  ProofUnit,
  RawsortConfig,
  VerifyResult,
  Unit,
} from "./core/types.js";
export type { TextModel } from "./core/gemini.js";
export { Sorter } from "./core/sorter.js";
export { Segmenter } from "./core/segmenter.js";
export { Redactor } from "./core/redactor.js";
export { Proof } from "./core/proof.js";

/** Options for {@link classifyText}. */
export interface ClassifyOptions {
  /** Gemini API key. Required unless a custom `model` is supplied. */
  geminiApiKey?: string;
  /** Allowed categories (the governed taxonomy). */
  categories: string[];
  /** Optional Gemini model override. */
  model?: string;
  /** Inject a custom TextModel (e.g. a local/offline model) for classification. */
  textModel?: TextModel;
}

/**
 * Classify free text into a fixed taxonomy and return the reorganized output
 * plus a verifiable audit proof. Pure and in-memory — no files touched.
 */
export async function classifyText(
  content: string,
  options: ClassifyOptions
): Promise<ClassifyResult> {
  const config: RawsortConfig = {
    geminiApiKey: options.geminiApiKey ?? "",
    filePath: "",
    categories: options.categories,
    model: options.model,
  };
  return new Sorter(config, options.textModel).classifyText(content);
}

/**
 * Independently verify an audit proof against the original and sorted content.
 * Recomputes every hash — a passing result does not require trusting rawsort.
 */
export function verifyProof(
  original: string,
  sorted: string,
  proof: AuditProof
): VerifyResult {
  return Proof.verify(original, sorted, proof);
}
