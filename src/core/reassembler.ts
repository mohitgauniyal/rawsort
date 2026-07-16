/**
 * Reassembler for rawsort.
 *
 * Builds the final sorted document from the ORIGINAL unit text. The model's
 * output influences only which category a unit lands in — never the bytes that
 * get written. Ordering is fully deterministic:
 *   - categories appear in the order given by the config
 *   - within a category, units keep their original file order
 *   - empty categories are omitted
 */

import { Unit } from "./types.js";

export class Reassembler {
  static reassemble(
    units: Unit[],
    labels: Map<number, string>,
    categories: string[]
  ): string {
    const byCategory = new Map<string, Unit[]>();
    for (const category of categories) byCategory.set(category, []);

    // Preserve original order by iterating units in id order.
    const ordered = [...units].sort((a, b) => a.id - b.id);
    for (const unit of ordered) {
      const category = labels.get(unit.id);
      if (category && byCategory.has(category)) {
        byCategory.get(category)!.push(unit);
      }
    }

    const sections: string[] = [];
    for (const category of categories) {
      const items = byCategory.get(category)!;
      if (items.length === 0) continue;
      const body = items.map((u) => u.text).join("\n");
      sections.push(`## ${category}\n${body}`);
    }

    return sections.join("\n\n") + (sections.length > 0 ? "\n" : "");
  }
}
