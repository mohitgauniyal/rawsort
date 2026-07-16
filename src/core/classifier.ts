/**
 * Classifier for rawsort.
 *
 * Sends the model a numbered list of (redacted) units plus the fixed set of
 * allowed categories, and asks only for a mapping of unit id -> category. The
 * model never returns content, so it cannot corrupt it.
 *
 * Every guarantee is enforced here in code, not merely requested in the prompt:
 *   - a returned category that isn't in the allowed set  -> fallback category
 *   - a unit the model omitted                           -> fallback category
 *   - ids the model invented                             -> ignored
 *   - unparseable model output                           -> one retry, then throw
 */

import { TextModel } from "./gemini.js";
import { Redactor } from "./redactor.js";
import { Unit } from "./types.js";

export const FALLBACK_CATEGORY = "Reference Notes";

export class Classifier {
  constructor(private model: TextModel) {}

  /**
   * Returns a map from unit id to a category guaranteed to be in `categories`.
   * Every input unit is present in the result exactly once.
   */
  async classify(
    units: Unit[],
    categories: string[]
  ): Promise<Map<number, string>> {
    if (units.length === 0) return new Map();

    const allowed = new Set(categories);
    const fallback = categories.includes(FALLBACK_CATEGORY)
      ? FALLBACK_CATEGORY
      : categories[categories.length - 1];

    const prompt = this.buildPrompt(units, categories);
    const raw = await this.generateWithRetry(prompt);
    const parsed = this.parseAssignments(raw);

    const result = new Map<number, string>();
    for (const unit of units) {
      const assigned = parsed.get(unit.id);
      result.set(unit.id, assigned && allowed.has(assigned) ? assigned : fallback);
    }
    return result;
  }

  private async generateWithRetry(prompt: string): Promise<string> {
    const first = await this.model.generate(prompt);
    if (this.tryParse(first) !== null) return first;
    // One retry: transient formatting slips are common; a second try is cheap.
    const second = await this.model.generate(prompt);
    if (this.tryParse(second) !== null) return second;
    throw new Error(
      "Classifier could not parse a valid category mapping from the model response."
    );
  }

  private parseAssignments(raw: string): Map<number, string> {
    const parsed = this.tryParse(raw);
    if (parsed === null) {
      throw new Error("Model response was not valid JSON.");
    }
    return parsed;
  }

  /**
   * Attempts to extract a `{ "id": "category" }` object from the model output,
   * tolerating code fences or surrounding prose. Returns null if nothing usable
   * is found.
   */
  private tryParse(raw: string): Map<number, string> | null {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) return null;

    let obj: unknown;
    try {
      obj = JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
    if (obj === null || typeof obj !== "object") return null;

    const map = new Map<number, string>();
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const id = Number(key);
      if (Number.isInteger(id) && typeof value === "string") {
        map.set(id, value.trim());
      }
    }
    return map;
  }

  private buildPrompt(units: Unit[], categories: string[]): string {
    const categoryList = categories.map((c) => `- ${c}`).join("\n");
    const items = units
      .map((u) => `${u.id}: ${Redactor.redact(u.text).safeText.replace(/\s+/g, " ").trim()}`)
      .join("\n");

    return `You are a text classifier. You are given numbered items and a fixed list of categories.

Assign EACH item to exactly ONE category from the allowed list. Do not invent categories. Do not rewrite, echo, or return the item text.

ALLOWED CATEGORIES (use these names exactly):
${categoryList}

ITEMS:
${items}

Respond with ONLY a JSON object mapping each item number (as a string key) to a category name, for example:
{"1": "Links & Resources", "2": "Ideas & TODO"}

If an item does not clearly fit any category, assign it to "${FALLBACK_CATEGORY}" if present, otherwise the last category. Output the JSON object and nothing else.`;
  }
}
