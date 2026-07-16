/**
 * Tests for Redactor
 */

import { describe, it, expect } from "@jest/globals";
import { Redactor } from "../../src/core/redactor";

// Secret-shaped test values are assembled from parts so the literal token never
// appears contiguously in source (keeps GitHub push protection happy) while
// still matching the redactor's detection patterns.
const FAKE_STRIPE = ["sk", "live", "EXAMPLEkeyNOTREAL123"].join("_");
const FAKE_AWS = "AKIA" + "EXAMPLENOTREAL01";

describe("Redactor", () => {
  it("leaves ordinary content untouched", () => {
    const r = Redactor.redact("The best time to plant a tree was 20 years ago");
    expect(r.redacted).toBe(false);
    expect(r.safeText).toBe("The best time to plant a tree was 20 years ago");
  });

  it("redacts a Stripe-style key", () => {
    const r = Redactor.redact(FAKE_STRIPE);
    expect(r.redacted).toBe(true);
    expect(r.safeText).toBe("[REDACTED credential]");
  });

  it("redacts key=value secrets", () => {
    const r = Redactor.redact("password: SecurePass123!");
    expect(r.redacted).toBe(true);
    expect(r.type).toBe("credential");
    expect(r.safeText).not.toContain("SecurePass123");
  });

  it("redacts a database connection string", () => {
    const r = Redactor.redact("postgresql://user:pass@localhost:5432/mydb");
    expect(r.redacted).toBe(true);
    expect(r.type).toBe("connection string");
  });

  it("redacts an AWS access key id", () => {
    const r = Redactor.redact(FAKE_AWS);
    expect(r.redacted).toBe(true);
  });

  it("redacts a private key header", () => {
    const r = Redactor.redact("-----BEGIN RSA PRIVATE KEY-----");
    expect(r.redacted).toBe(true);
    expect(r.type).toBe("private key");
  });

  it("emits a typed placeholder the model can still classify from", () => {
    const r = Redactor.redact("api_key=sk_test_abcdef123456");
    expect(r.safeText).toMatch(/^\[REDACTED .+\]$/);
  });
});
