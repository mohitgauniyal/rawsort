/**
 * Redactor for rawsort.
 *
 * Before a unit is shown to the model for classification, likely secrets are
 * replaced with a typed placeholder such as `[REDACTED credential]`. The model
 * can still classify the unit from the placeholder's type hint, but the real
 * secret value never leaves the machine — the original, untouched unit text is
 * what gets written back to the file.
 *
 * This is a best-effort privacy safeguard, not a guarantee that every secret is
 * caught; it covers the common, high-signal patterns.
 */

import { RedactionResult } from "./types.js";

interface SecretPattern {
  type: string;
  re: RegExp;
}

/**
 * Patterns are ordered most-specific first. Each `re` is tested against the
 * whole unit text; the first match decides the redaction type.
 */
const SECRET_PATTERNS: SecretPattern[] = [
  { type: "private key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { type: "credential", re: /\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{8,}\b/ },
  { type: "credential", re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/ },
  { type: "credential", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { type: "token", re: /\b(bearer|token)\b[\s:=]+[A-Za-z0-9._-]{12,}/i },
  {
    type: "connection string",
    re: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s:/@]+@/i,
  },
  {
    type: "credential",
    re: /\b(api[_-]?key|secret|password|passwd|pwd|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*\S+/i,
  },
];

export class Redactor {
  /**
   * Returns the text to show the model. If a secret is detected the whole unit
   * is replaced with a typed placeholder; otherwise the original text is
   * returned unchanged.
   */
  static redact(text: string): RedactionResult {
    for (const { type, re } of SECRET_PATTERNS) {
      if (re.test(text)) {
        return { safeText: `[REDACTED ${type}]`, redacted: true, type };
      }
    }
    return { safeText: text, redacted: false };
  }
}
