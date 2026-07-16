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

  // --- v0.3: consecutive lines without blank separators split into units ---

  it("splits consecutive standalone lines (no blank lines) into separate units", () => {
    const input = [
      "The only way to do great work is to love what you do.",
      "https://github.com/awesome-js/library",
      "TODO: Fix bug in authentication module",
      "Remember: Consistency beats perfection",
    ].join("\n");
    const units = Segmenter.segment(input);
    expect(units).toHaveLength(4);
  });

  it("keeps a brace block together even without surrounding blank lines", () => {
    const input = [
      "some note above",
      "function fib(n) {",
      "  if (n <= 1) return n;",
      "  return fib(n - 1) + fib(n - 2);",
      "}",
      "some note below",
    ].join("\n");
    const units = Segmenter.segment(input);
    expect(units).toHaveLength(3);
    expect(units[1].text).toBe(
      "function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}"
    );
  });

  it("keeps an indented continuation with its parent line", () => {
    const input = ["parent line", "   indented child", "   another child", "next top-level"].join(
      "\n"
    );
    const units = Segmenter.segment(input);
    expect(units).toHaveLength(2);
    expect(units[0].text).toBe("parent line\n   indented child\n   another child");
    expect(units[1].text).toBe("next top-level");
  });

  it("keeps a fenced code block as one unit", () => {
    const input = [
      "before",
      "```js",
      "const x = 1;",
      "",
      "const y = 2;",
      "```",
      "after",
    ].join("\n");
    const units = Segmenter.segment(input);
    expect(units).toHaveLength(3);
    expect(units[1].text).toBe("```js\nconst x = 1;\n\nconst y = 2;\n```");
  });

  it("balanced brackets on one line do not trigger a merge", () => {
    const input = [
      "const f = (n) => n <= 1 ? n : f(n-1) + f(n-2);",
      "another separate note",
    ].join("\n");
    const units = Segmenter.segment(input);
    expect(units).toHaveLength(2);
  });
});
