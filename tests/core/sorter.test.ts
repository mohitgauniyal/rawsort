/**
 * Integration test for the full sort pipeline (segment -> classify ->
 * reassemble -> validate -> write), using a fake model and a temp file.
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
import { Sorter } from "../../src/core/sorter";
import { TextModel } from "../../src/core/gemini";
import { RawsortConfig } from "../../src/core/types";

class FakeModel implements TextModel {
  constructor(private response: string) {}
  async generate(): Promise<string> {
    return this.response;
  }
}

const CATS = ["Quotes", "Links", "Ideas & TODO", "Reference Notes"];

let tmpFile: string;

beforeEach(() => {
  tmpFile = path.join(os.tmpdir(), `rawsort-test-${Date.now()}-${Math.random()}.txt`);
});

afterEach(() => {
  for (const f of fs.readdirSync(os.tmpdir())) {
    if (f.startsWith(path.basename(tmpFile).split(".")[0])) {
      try {
        fs.unlinkSync(path.join(os.tmpdir(), f));
      } catch {
        /* ignore */
      }
    }
  }
});

function makeConfig(overrides: Partial<RawsortConfig> = {}): RawsortConfig {
  return {
    geminiApiKey: "fake",
    filePath: tmpFile,
    categories: CATS,
    ...overrides,
  };
}

describe("Sorter (integration)", () => {
  it("sorts a file and preserves every original unit exactly", async () => {
    const original = "a wise quote\n\nhttps://example.com\n\nTODO: ship it";
    fs.writeFileSync(tmpFile, original, "utf-8");

    const model = new FakeModel(
      '{"1":"Quotes","2":"Links","3":"Ideas & TODO"}'
    );
    const result = await new Sorter(makeConfig(), model).sort();

    expect(result.success).toBe(true);
    const written = fs.readFileSync(tmpFile, "utf-8");
    expect(written).toContain("## Quotes\na wise quote");
    expect(written).toContain("## Links\nhttps://example.com");
    expect(written).toContain("## Ideas & TODO\nTODO: ship it");
    // Every original unit still present, byte-for-byte.
    for (const unit of ["a wise quote", "https://example.com", "TODO: ship it"]) {
      expect(written).toContain(unit);
    }
  });

  it("writes a backup of the original before overwriting", async () => {
    const original = "a wise quote\n\nhttps://example.com";
    fs.writeFileSync(tmpFile, original, "utf-8");

    const model = new FakeModel('{"1":"Quotes","2":"Links"}');
    const result = await new Sorter(makeConfig(), model).sort();

    expect(result.backupPath).toBeDefined();
    expect(fs.existsSync(result.backupPath!)).toBe(true);
    expect(fs.readFileSync(result.backupPath!, "utf-8")).toBe(original);
  });

  it("does not write in dry-run mode", async () => {
    const original = "a wise quote\n\nhttps://example.com";
    fs.writeFileSync(tmpFile, original, "utf-8");

    const model = new FakeModel('{"1":"Quotes","2":"Links"}');
    const result = await new Sorter(makeConfig({ dryRun: true }), model).sort();

    expect(result.success).toBe(true);
    expect(result.backupPath).toBeUndefined();
    expect(fs.readFileSync(tmpFile, "utf-8")).toBe(original);
  });

  it("is idempotent: re-sorting an already-sorted file is stable", async () => {
    const original = "a wise quote\n\nhttps://example.com";
    fs.writeFileSync(tmpFile, original, "utf-8");
    const model = new FakeModel('{"1":"Quotes","2":"Links"}');

    await new Sorter(makeConfig(), model).sort();
    const firstPass = fs.readFileSync(tmpFile, "utf-8");

    // Second pass with the same labels should produce identical output.
    await new Sorter(makeConfig(), new FakeModel('{"1":"Quotes","2":"Links"}')).sort();
    const secondPass = fs.readFileSync(tmpFile, "utf-8");

    expect(secondPass).toBe(firstPass);
  });

  it("reports failure for an empty file", async () => {
    fs.writeFileSync(tmpFile, "   \n\n  ", "utf-8");
    const model = new FakeModel("{}");
    const result = await new Sorter(makeConfig(), model).sort();
    expect(result.success).toBe(false);
    expect(result.message).toContain("empty");
  });
});
