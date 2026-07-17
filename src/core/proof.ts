/**
 * Verifiable integrity proof for rawsort.
 *
 * This is the core of rawsort's guarantee: not "we checked it internally" but a
 * portable, independently verifiable record. Given the original input, the
 * sorted output, and an AuditProof, anyone can recompute every hash and confirm
 * the multiset of content units is byte-for-byte identical — without trusting
 * rawsort, the model, or the caller.
 *
 * The proof attests two different kinds of claim:
 *   - INTEGRITY (verifiable): the content units are preserved exactly. Anyone
 *     can recompute this from (original, sorted) alone.
 *   - CLASSIFICATION (attested): which category each unit was assigned. This is
 *     a record of the decision, not something a verifier can re-derive without
 *     re-running the model.
 */

import crypto from "crypto";
import { Segmenter } from "./segmenter.js";
import { AuditProof, ProofUnit, Unit, VerifyResult } from "./types.js";

const PROOF_VERSION = "1";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function multiset(hashes: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const h of hashes) m.set(h, (m.get(h) || 0) + 1);
  return m;
}

function multisetEqual(a: Map<string, number>, b: Map<string, number>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

export class Proof {
  /**
   * Builds an audit proof for a completed sort. `inputUnits` are the segmented
   * original units; `labels` maps unit id -> assigned category.
   */
  static generate(
    original: string,
    sorted: string,
    inputUnits: Unit[],
    labels: Map<number, string>,
    taxonomy: string[],
    model?: string
  ): AuditProof {
    const units: ProofUnit[] = inputUnits.map((u) => ({
      id: u.id,
      hash: sha256(u.text),
      category: labels.get(u.id) ?? "",
    }));

    // Integrity: the multiset of unit hashes in the output must equal the input.
    const outputUnits = Segmenter.segment(sorted);
    const preserved = multisetEqual(
      multiset(units.map((u) => u.hash)),
      multiset(outputUnits.map((u) => sha256(u.text)))
    );

    return {
      tool: "rawsort",
      proofVersion: PROOF_VERSION,
      createdAt: new Date().toISOString(),
      algorithm: "sha256",
      model,
      taxonomy,
      inputDigest: sha256(original),
      outputDigest: sha256(sorted),
      units,
      integrity: { preserved, unitCount: units.length },
    };
  }

  /**
   * Independently verifies a proof against the original and sorted content.
   * Recomputes every hash from scratch — a passing result does not depend on
   * trusting whoever produced the proof.
   */
  static verify(
    original: string,
    sorted: string,
    proof: AuditProof
  ): VerifyResult {
    const checks: VerifyResult["checks"] = [];

    checks.push({
      name: "input-digest",
      passed: sha256(original) === proof.inputDigest,
      detail: "sha256(original) matches proof.inputDigest",
    });
    checks.push({
      name: "output-digest",
      passed: sha256(sorted) === proof.outputDigest,
      detail: "sha256(sorted) matches proof.outputDigest",
    });

    // Recompute input units from the original and confirm they match the proof.
    const recomputedInput = multiset(
      Segmenter.segment(original).map((u) => sha256(u.text))
    );
    const proofInput = multiset(proof.units.map((u) => u.hash));
    checks.push({
      name: "input-units-match-proof",
      passed: multisetEqual(recomputedInput, proofInput),
      detail: "content units recomputed from original match the proof's units",
    });

    // The core claim: output content units are exactly the input content units.
    const recomputedOutput = multiset(
      Segmenter.segment(sorted).map((u) => sha256(u.text))
    );
    const integrityHolds = multisetEqual(proofInput, recomputedOutput);
    checks.push({
      name: "content-preserved",
      passed: integrityHolds,
      detail: "output content units are identical to input content units",
    });
    checks.push({
      name: "proof-claims-integrity",
      passed: proof.integrity.preserved === true,
      detail: "the proof itself asserts integrity was preserved",
    });

    return { valid: checks.every((c) => c.passed), checks };
  }
}
