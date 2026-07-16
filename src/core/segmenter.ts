/**
 * Segmenter for rawsort.
 *
 * Splits raw scratchpad content into atomic units. A unit is a run of one or
 * more non-blank lines separated from its neighbours by one or more blank
 * lines, so a multi-line snippet (code block, wrapped quote) stays together and
 * is never scattered across categories.
 *
 * Existing Markdown category headers (## ...) are stripped, so re-sorting an
 * already-sorted file is idempotent: the headers are treated as structure, not
 * content, and are regenerated on reassembly.
 */

import { Unit } from "./types.js";

export class Segmenter {
  private static readonly HEADER_RE = /^#{1,6}\s+\S/;

  /**
   * Splits content into units. Blank-line-separated blocks become units; the
   * original text of each block is preserved exactly (internal newlines kept,
   * surrounding blank lines dropped). Category headers are removed entirely.
   */
  static segment(content: string): Unit[] {
    const lines = content.split(/\r?\n/);

    const units: Unit[] = [];
    let current: string[] = [];
    let nextId = 1;

    const flush = () => {
      if (current.length === 0) return;
      // Drop trailing blank lines that may have accumulated inside a block edge.
      const text = current.join("\n");
      if (text.trim().length > 0) {
        units.push({ id: nextId++, text });
      }
      current = [];
    };

    for (const rawLine of lines) {
      const isBlank = rawLine.trim().length === 0;
      const isHeader = this.HEADER_RE.test(rawLine.trim());

      if (isHeader) {
        // A header ends the current block and is itself discarded.
        flush();
        continue;
      }

      if (isBlank) {
        flush();
        continue;
      }

      current.push(rawLine);
    }

    flush();
    return units;
  }
}
