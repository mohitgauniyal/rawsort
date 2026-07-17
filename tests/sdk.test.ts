/**
 * Tests for the public SDK surface (src/index.ts).
 */

import { describe, it, expect } from "@jest/globals";
import { classifyText, verifyProof } from "../src/index";
import { TextModel } from "../src/index";

class FakeModel implements TextModel {
  constructor(private response: string) {}
  async generate(): Promise<string> {
    return this.response;
  }
}

const CATS = ["Quotes", "Links", "Reference Notes"];

describe("SDK: classifyText + verifyProof", () => {
  it("classifies text and returns an independently verifiable proof", async () => {
    const input = "a wise quote\n\nhttps://example.com";
    const model = new FakeModel('{"1":"Quotes","2":"Links"}');

    const { sorted, proof, integrityValid } = await classifyText(input, {
      categories: CATS,
      textModel: model,
    });

    expect(integrityValid).toBe(true);
    expect(sorted).toContain("## Quotes\na wise quote");
    expect(sorted).toContain("## Links\nhttps://example.com");

    // The whole point: a third party can verify without trusting us.
    const verdict = verifyProof(input, sorted, proof);
    expect(verdict.valid).toBe(true);
  });

  it("verification fails if the output is altered after the fact", async () => {
    const input = "keep this exactly\n\nhttps://example.com";
    const model = new FakeModel('{"1":"Quotes","2":"Links"}');
    const { sorted, proof } = await classifyText(input, {
      categories: CATS,
      textModel: model,
    });

    const tampered = sorted.replace("keep this exactly", "keep this exactlyX");
    expect(verifyProof(input, tampered, proof).valid).toBe(false);
  });
});
