/**
 * Tests for ContentValidator
 */

import { describe, it, expect } from "@jest/globals";
import { ContentValidator } from "../../src/core/validator";

describe("ContentValidator", () => {
  describe("validateIntegrity", () => {
    it("should pass validation for identical content", () => {
      const original = "hello world\nthis is a test";
      const sorted = "## Greetings\nhello world\n\n## Testing\nthis is a test";

      const result = ContentValidator.validateIntegrity(original, sorted);

      expect(result.isValid).toBe(true);
      expect(result.originalCharCount).toBeGreaterThan(0);
    });

    it("should fail validation if content is missing", () => {
      const original = "hello world test";
      const sorted = "## Greetings\nhello world";

      const result = ContentValidator.validateIntegrity(original, sorted);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("mismatch");
    });

    it("should fail validation if content is modified", () => {
      const original = "my-password-123";
      const sorted = "## Credentials\nmy-password-124";

      const result = ContentValidator.validateIntegrity(original, sorted);

      expect(result.isValid).toBe(false);
    });

    it("should preserve exact character count", () => {
      const original = "code: function() { return 42; }";
      const sorted = "## Code\ncode: function() { return 42; }";

      const result = ContentValidator.validateIntegrity(original, sorted);

      expect(result.isValid).toBe(true);
    });

    it("should handle multiline content", () => {
      const original = `Line 1
Line 2
Line 3`;
      const sorted = `## Section
Line 1
Line 2
Line 3`;

      const result = ContentValidator.validateIntegrity(original, sorted);

      expect(result.isValid).toBe(true);
    });

    it("should handle special characters", () => {
      const original = "user@example.com password@123!";
      const sorted = "## Credentials\nuser@example.com password@123!";

      const result = ContentValidator.validateIntegrity(original, sorted);

      expect(result.isValid).toBe(true);
    });
  });

  describe("extractCategories", () => {
    it("should extract markdown headers as categories", () => {
      const content = `## Quotes
Some quote
## Code
function test() {}
## Links
https://example.com`;

      const categories = ContentValidator.extractCategories(content);

      expect(categories).toContain("Quotes");
      expect(categories).toContain("Code");
      expect(categories).toContain("Links");
    });

    it("should remove duplicate categories", () => {
      const content = `## Code
function a() {}
## Code
function b() {}`;

      const categories = ContentValidator.extractCategories(content);

      expect(categories).toHaveLength(1);
      expect(categories[0]).toBe("Code");
    });

    it("should return empty array if no headers", () => {
      const content = "Just some text without headers";

      const categories = ContentValidator.extractCategories(content);

      expect(categories).toHaveLength(0);
    });

    it("should handle headers with special characters", () => {
      const content = `## Code & Commands
## Ideas & TODO`;

      const categories = ContentValidator.extractCategories(content);

      expect(categories).toContain("Code & Commands");
      expect(categories).toContain("Ideas & TODO");
    });
  });
});
