/**
 * Tests for Segmenter
 */

import { describe, it, expect } from "@jest/globals";
import { Segmenter } from "../../src/core/segmenter";

describe("Segmenter", () => {
  it("splits blank-line-separated blocks into units", () => {
    const units = Segmenter.segment("first thing\n\nsecond thing\n\nthird");
    expect(units.map((u) => u.text)).toEqual([
      "first thing",
      "second thing",
      "third",
    ]);
  });

  it("keeps a multi-line block as a single unit", () => {
    const code = "function greet(n) {\n  return `Hi ${n}`;\n}";
    const units = Segmenter.segment(`a quote\n\n${code}\n\nTODO: fix bug`);
    expect(units).toHaveLength(3);
    expect(units[1].text).toBe(code);
  });

  it("assigns sequential ids starting at 1", () => {
    const units = Segmenter.segment("a\n\nb\n\nc");
    expect(units.map((u) => u.id)).toEqual([1, 2, 3]);
  });

  it("strips existing markdown category headers (idempotent re-sort)", () => {
    const alreadySorted =
      "## Quotes & Inspiration\na quote\n\n## Ideas & TODO\nTODO: fix bug";
    const units = Segmenter.segment(alreadySorted);
    expect(units.map((u) => u.text)).toEqual(["a quote", "TODO: fix bug"]);
  });

  it("treats multiple blank lines as a single separator", () => {
    const units = Segmenter.segment("a\n\n\n\nb");
    expect(units.map((u) => u.text)).toEqual(["a", "b"]);
  });

  it("returns no units for empty or whitespace-only content", () => {
    expect(Segmenter.segment("")).toHaveLength(0);
    expect(Segmenter.segment("   \n\n  \n")).toHaveLength(0);
  });

  it("does not treat a '#hashtag' line as a header", () => {
    const units = Segmenter.segment("#todo buy milk");
    expect(units).toHaveLength(1);
    expect(units[0].text).toBe("#todo buy milk");
  });
});
