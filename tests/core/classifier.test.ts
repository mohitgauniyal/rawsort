/**
 * Tests for Classifier (uses a fake model — no network).
 */

import { describe, it, expect } from "@jest/globals";
import { Classifier } from "../../src/core/classifier";
import { TextModel } from "../../src/core/gemini";
import { Unit } from "../../src/core/types";

/** A model that returns scripted responses and records prompts it received. */
class FakeModel implements TextModel {
  prompts: string[] = [];
  constructor(private responses: string[]) {}
  async generate(prompt: string): Promise<string> {
    this.prompts.push(prompt);
    return this.responses.shift() ?? "{}";
  }
}

const CATS = [
  "Quotes & Inspiration",
  "Links & Resources",
  "Ideas & TODO",
  "Reference Notes",
];

const units: Unit[] = [
  { id: 1, text: "a wise quote" },
  { id: 2, text: "https://example.com" },
  { id: 3, text: "TODO: ship it" },
];

describe("Classifier", () => {
  it("maps units to the categories the model returns", async () => {
    const model = new FakeModel([
      '{"1":"Quotes & Inspiration","2":"Links & Resources","3":"Ideas & TODO"}',
    ]);
    const labels = await new Classifier(model).classify(units, CATS);
    expect(labels.get(1)).toBe("Quotes & Inspiration");
    expect(labels.get(2)).toBe("Links & Resources");
    expect(labels.get(3)).toBe("Ideas & TODO");
  });

  it("coerces an unknown/invented category to Reference Notes", async () => {
    const model = new FakeModel(['{"1":"Nonsense Category","2":"Links & Resources","3":"Ideas & TODO"}']);
    const labels = await new Classifier(model).classify(units, CATS);
    expect(labels.get(1)).toBe("Reference Notes");
  });

  it("assigns omitted units to Reference Notes", async () => {
    const model = new FakeModel(['{"2":"Links & Resources"}']);
    const labels = await new Classifier(model).classify(units, CATS);
    expect(labels.get(1)).toBe("Reference Notes");
    expect(labels.get(3)).toBe("Reference Notes");
    expect(labels.size).toBe(3);
  });

  it("ignores ids the model invents", async () => {
    const model = new FakeModel(['{"1":"Ideas & TODO","99":"Links & Resources"}']);
    const labels = await new Classifier(model).classify(units, CATS);
    expect(labels.has(99)).toBe(false);
    expect(labels.size).toBe(3);
  });

  it("tolerates code fences and surrounding prose", async () => {
    const model = new FakeModel([
      'Here you go:\n```json\n{"1":"Quotes & Inspiration","2":"Links & Resources","3":"Ideas & TODO"}\n```',
    ]);
    const labels = await new Classifier(model).classify(units, CATS);
    expect(labels.get(2)).toBe("Links & Resources");
  });

  it("retries once on unparseable output, then succeeds", async () => {
    const model = new FakeModel([
      "sorry, I cannot do that",
      '{"1":"Ideas & TODO","2":"Links & Resources","3":"Ideas & TODO"}',
    ]);
    const labels = await new Classifier(model).classify(units, CATS);
    expect(labels.get(1)).toBe("Ideas & TODO");
    expect(model.prompts.length).toBe(2);
  });

  it("throws (fail-closed) after two unparseable responses", async () => {
    const model = new FakeModel(["nope", "still nope"]);
    await expect(new Classifier(model).classify(units, CATS)).rejects.toThrow();
  });

  it("sends redacted placeholders, not raw secrets, to the model", async () => {
    // Assembled from parts so the literal never appears contiguously in source.
    const secret = ["sk", "live", "EXAMPLEkeyNOTREAL123"].join("_");
    const secretUnits: Unit[] = [{ id: 1, text: `api_key=${secret}` }];
    const model = new FakeModel(['{"1":"Reference Notes"}']);
    await new Classifier(model).classify(secretUnits, CATS);
    expect(model.prompts[0]).not.toContain(secret);
    expect(model.prompts[0]).toContain("[REDACTED");
  });

  it("returns an empty map for no units without calling the model", async () => {
    const model = new FakeModel([]);
    const labels = await new Classifier(model).classify([], CATS);
    expect(labels.size).toBe(0);
    expect(model.prompts.length).toBe(0);
  });
});
