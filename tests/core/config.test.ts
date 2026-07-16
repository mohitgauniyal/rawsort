/**
 * Tests for ConfigManager
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { ConfigManager } from "../../src/core/config";
import fs from "fs";

// Mock config path for testing
const testConfigDir = "/tmp/rawsort-test-config";

describe("ConfigManager", () => {
  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true });
    }
  });

  describe("getDefaultCategories", () => {
    it("should return default categories", () => {
      const categories = ConfigManager.getDefaultCategories();

      expect(categories).toContain("Quotes & Inspiration");
      expect(categories).toContain("Code & Commands");
      expect(categories).toContain("Links & Resources");
      expect(categories).toContain("Credentials & Tokens");
      expect(categories).toContain("Ideas & TODO");
      expect(categories).toContain("Reference Notes");
    });

    it("should have at least 6 categories", () => {
      const categories = ConfigManager.getDefaultCategories();
      expect(categories.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("validateConfig", () => {
    it("should throw error if geminiApiKey is missing", () => {
      const invalidConfig = {
        geminiApiKey: "",
        filePath: "~/scratchpad.txt",
        categories: ["Test"],
      };

      expect(() => ConfigManager.validateConfig(invalidConfig as any)).toThrow(
        /API key/
      );
    });

    it("should throw error if filePath is missing", () => {
      const invalidConfig = {
        geminiApiKey: "test-key",
        filePath: "",
        categories: ["Test"],
      };

      expect(() => ConfigManager.validateConfig(invalidConfig as any)).toThrow(
        /path/
      );
    });

    it("should throw error if categories array is empty", () => {
      const invalidConfig = {
        geminiApiKey: "test-key",
        filePath: "~/scratchpad.txt",
        categories: [],
      };

      expect(() => ConfigManager.validateConfig(invalidConfig as any)).toThrow(
        /Categories/
      );
    });

    it("should pass validation for valid config", () => {
      const validConfig = {
        geminiApiKey: "test-key",
        filePath: "~/scratchpad.txt",
        categories: ["Test"],
      };

      expect(() => ConfigManager.validateConfig(validConfig as any)).not.toThrow();
    });
  });

  describe("getConfigPath", () => {
    it("should return a path under .rawsort directory", () => {
      const configPath = ConfigManager.getConfigPath();
      expect(configPath).toContain(".rawsort");
      expect(configPath).toContain("config.json");
    });
  });
});
