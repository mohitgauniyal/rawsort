/**
 * Segmenter for rawsort.
 *
 * Splits raw scratchpad content into atomic units — the things that get
 * classified and are never split across categories.
 *
 * Design: each non-blank line starts its own unit *by default*, so a stack of
 * distinct one-line notes becomes many units (not one lump). A line is only
 * merged into the previous unit when it is clearly a *continuation* of a
 * multi-line block:
 *
 *   - it sits inside a fenced code block (``` or ~~~), or
 *   - it is indented (leading whitespace), or
 *   - a bracket opened earlier in the block is still unclosed — which also
 *     captures the closing `}` / `)` / `]` sitting on its own line.
 *
 * Blank lines are hard separators. Existing Markdown category headers (## ...)
 * are stripped so re-sorting an already-sorted file is idempotent. Because the
 * output is always reassembled from original unit text, an imperfect
 * segmentation can only affect *categorization*, never content integrity.
 */

import { Unit } from "./types.js";

export class Segmenter {
  private static readonly HEADER_RE = /^#{1,6}\s+\S/;
  private static readonly FENCE_RE = /^(```|~~~)/;

  static segment(content: string): Unit[] {
    const lines = content.split(/\r?\n/);

    const units: Unit[] = [];
    let current: string[] = [];
    let openDepth = 0;
    let inFence = false;
    let nextId = 1;

    const flush = () => {
      if (current.length > 0 && current.join("\n").trim().length > 0) {
        units.push({ id: nextId++, text: current.join("\n") });
      }
      current = [];
      openDepth = 0;
    };

    for (const raw of lines) {
      const trimmed = raw.trim();

      // Inside a fenced block: everything (including blanks) is continuation
      // until the closing fence.
      if (inFence) {
        current.push(raw);
        if (this.FENCE_RE.test(trimmed)) {
          inFence = false;
          flush(); // a fenced block is a complete unit on its own
        }
        continue;
      }

      // Opening fence: starts a fresh unit.
      if (this.FENCE_RE.test(trimmed)) {
        flush();
        current.push(raw);
        inFence = true;
        continue;
      }

      // Blank line and category header are hard separators (header is dropped).
      if (trimmed.length === 0 || this.HEADER_RE.test(trimmed)) {
        flush();
        continue;
      }

      const indented = /^\s/.test(raw);
      const isContinuation = current.length > 0 && (indented || openDepth > 0);

      if (!isContinuation) flush();
      current.push(raw);
      openDepth = Math.max(0, openDepth + this.bracketDelta(raw));
    }

    flush();
    return units;
  }

  /**
   * Net change in open-bracket depth contributed by a line. Naive (not
   * string-aware), which is fine: a miscount can only merge/split a unit, never
   * corrupt content.
   */
  private static bracketDelta(line: string): number {
    let delta = 0;
    for (const ch of line) {
      if (ch === "{" || ch === "(" || ch === "[") delta++;
      else if (ch === "}" || ch === ")" || ch === "]") delta--;
    }
    return delta;
  }
}
