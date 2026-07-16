/**
 * Tests for Reassembler
 */

import { describe, it, expect } from "@jest/globals";
import { Reassembler } from "../../src/core/reassembler";
import { Unit } from "../../src/core/types";

const CATS = ["Quotes", "Links", "Reference Notes"];

const units: Unit[] = [
  { id: 1, text: "quote A" },
  { id: 2, text: "https://a.com" },
  { id: 3, text: "quote B" },
  { id: 4, text: "loose note" },
];

describe("Reassembler", () => {
  it("groups units under category headers in config order", () => {
    const labels = new Map<number, string>([
      [1, "Quotes"],
      [2, "Links"],
      [3, "Quotes"],
      [4, "Reference Notes"],
    ]);
    const out = Reassembler.reassemble(units, labels, CATS);
    expect(out).toBe(
      "## Quotes\nquote A\nquote B\n\n## Links\nhttps://a.com\n\n## Reference Notes\nloose note\n"
    );
  });

  it("preserves original order within a category", () => {
    const labels = new Map<number, string>([
      [1, "Quotes"],
      [3, "Quotes"],
    ]);
    const out = Reassembler.reassemble(
      [units[2], units[0]], // pass in reversed; id order should still win
      labels,
      CATS
    );
    expect(out.indexOf("quote A")).toBeLessThan(out.indexOf("quote B"));
  });

  it("omits categories with no units", () => {
    const labels = new Map<number, string>([[1, "Quotes"]]);
    const out = Reassembler.reassemble([units[0]], labels, CATS);
    expect(out).toBe("## Quotes\nquote A\n");
    expect(out).not.toContain("## Links");
  });

  it("uses original untouched text, never the label", () => {
    const multiline: Unit[] = [{ id: 1, text: "line1\nline2\nline3" }];
    const labels = new Map<number, string>([[1, "Reference Notes"]]);
    const out = Reassembler.reassemble(multiline, labels, CATS);
    expect(out).toContain("line1\nline2\nline3");
  });

  it("returns empty string when nothing is categorized", () => {
    const out = Reassembler.reassemble([], new Map(), CATS);
    expect(out).toBe("");
  });
});
