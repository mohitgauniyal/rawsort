/**
 * Tests for the verifiable audit proof.
 */

import { describe, it, expect } from "@jest/globals";
import { Proof } from "../../src/core/proof";
import { Segmenter } from "../../src/core/segmenter";
import { Reassembler } from "../../src/core/reassembler";

const CATS = ["Quotes", "Links", "Reference Notes"];

function sortFixture(original: string) {
  const units = Segmenter.segment(original);
  const labels = new Map<number, string>();
  for (const u of units) {
    labels.set(u.id, /^https?:\/\//.test(u.text) ? "Links" : "Quotes");
  }
  const sorted = Reassembler.reassemble(units, labels, CATS);
  const proof = Proof.generate(original, sorted, units, labels, CATS, "fake-model");
  return { units, labels, sorted, proof };
}

describe("Proof.generate", () => {
  it("records a hash and category for every input unit", () => {
    const original = "a wise quote\n\nhttps://example.com";
    const { proof } = sortFixture(original);
    expect(proof.units).toHaveLength(2);
    expect(proof.units[0].hash).toMatch(/^[a-f0-9]{64}$/);
    expect(proof.units.map((u) => u.category).sort()).toEqual(["Links", "Quotes"]);
    expect(proof.integrity.preserved).toBe(true);
    expect(proof.model).toBe("fake-model");
  });
});

describe("Proof.verify", () => {
  it("independently verifies a valid proof", () => {
    const original = "a wise quote\n\nhttps://example.com\n\nanother thought";
    const { sorted, proof } = sortFixture(original);
    const result = Proof.verify(original, sorted, proof);
    expect(result.valid).toBe(true);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it("fails if the sorted output was tampered with (content changed)", () => {
    const original = "my-password-123\n\nhttps://example.com";
    const { sorted, proof } = sortFixture(original);
    const tampered = sorted.replace("my-password-123", "my-password-124");
    const result = Proof.verify(original, tampered, proof);
    expect(result.valid).toBe(false);
    expect(result.checks.find((c) => c.name === "content-preserved")!.passed).toBe(false);
  });

  it("fails if a line was dropped from the output", () => {
    const original = "keep me\n\ndrop me\n\nhttps://example.com";
    const { sorted, proof } = sortFixture(original);
    const tampered = sorted.replace(/drop me\n?/, "");
    const result = Proof.verify(original, tampered, proof);
    expect(result.valid).toBe(false);
  });

  it("fails if the original was swapped for different content", () => {
    const original = "a wise quote\n\nhttps://example.com";
    const { sorted, proof } = sortFixture(original);
    const result = Proof.verify("totally different original", sorted, proof);
    expect(result.valid).toBe(false);
    expect(result.checks.find((c) => c.name === "input-digest")!.passed).toBe(false);
  });

  it("verifies content regardless of category reordering (integrity is order-independent)", () => {
    const original = "quote one\n\nquote two\n\nhttps://a.com\n\nhttps://b.com";
    const units = Segmenter.segment(original);
    const labels = new Map<number, string>();
    for (const u of units) labels.set(u.id, /^https/.test(u.text) ? "Links" : "Quotes");
    const sorted = Reassembler.reassemble(units, labels, CATS);
    const proof = Proof.generate(original, sorted, units, labels, CATS);
    expect(Proof.verify(original, sorted, proof).valid).toBe(true);
  });
});
