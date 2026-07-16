/**
 * Configuration loader and validator for rawsort
 */

import fs from "fs";
import path from "path";
import { RawsortConfig } from "./types.js";

const DEFAULT_CATEGORIES = [
  "Quotes & Inspiration",
  "Code & Commands",
  "Links & Resources",
  "Credentials & Tokens",
  "Ideas & TODO",
  "Reference Notes",
];

const CONFIG_PATH = path.join(process.env.HOME || "~", ".rawsort", "config.json");

export class ConfigManager {
  static getConfigPath(): string {
    return CONFIG_PATH;
  }

  static ensureConfigExists(): void {
    const configDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_PATH)) {
      const defaultConfig = {
        geminiApiKey: "",
        filePath: "",
        categories: DEFAULT_CATEGORIES,
      };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    }
  }

  static loadConfig(): RawsortConfig {
    this.ensureConfigExists();

    const configData = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config = JSON.parse(configData) as RawsortConfig;

    this.validateConfig(config);
    return config;
  }

  static validateConfig(config: RawsortConfig): void {
    if (!config.geminiApiKey || config.geminiApiKey.trim() === "") {
      throw new Error(
        `Gemini API key not found in ${CONFIG_PATH}. Please add your API key.`
      );
    }

    if (!config.filePath || config.filePath.trim() === "") {
      throw new Error(
        `File path not found in ${CONFIG_PATH}. Please specify the path to your scratchpad file.`
      );
    }

    if (!config.categories || config.categories.length === 0) {
      throw new Error("Categories array is empty. Define at least one category.");
    }
  }

  static getDefaultCategories(): string[] {
    return DEFAULT_CATEGORIES;
  }
}
