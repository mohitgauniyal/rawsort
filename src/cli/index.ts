#!/usr/bin/env node

/**
 * rawsort - CLI entry point
 */

import { Command } from "commander";
import chalk from "chalk";
import { ConfigManager } from "../core/config.js";
import { Sorter } from "../core/sorter.js";

const program = new Command();

program
  .name("rawsort")
  .description(
    "AI-powered tool to organize your scratchpad file with constrained categorization"
  )
  .version("0.1.0");

program
  .command("sort [filePath]")
  .description("Sort your scratchpad file")
  .option("--dry-run", "Preview changes without writing to file")
  .option("--config <path>", "Path to config file")
  .action(async (filePath: string | undefined, options) => {
    try {
      console.log(chalk.blue.bold("\n📝 rawsort v0.1.0\n"));

      // Load config
      let config = ConfigManager.loadConfig();
      console.log(chalk.gray(`Config loaded from: ${ConfigManager.getConfigPath()}`));

      // Override file path if provided
      if (filePath) {
        config.filePath = filePath;
      }

      // Set dry-run if flag provided
      if (options.dryRun) {
        config.dryRun = true;
        console.log(chalk.yellow("🔍 Dry-run mode: no changes will be written"));
      }

      // Create sorter and run
      const sorter = new Sorter(config);
      const result = await sorter.sort();

      // Display result
      if (result.success) {
        console.log(chalk.green(`✅ ${result.message}`));
        console.log(chalk.gray(`   File: ${result.originalPath}`));
        console.log(
          chalk.gray(
            `   Categories found: ${result.categoriesFound.join(", ")}`
          )
        );
        if (result.backupPath) {
          console.log(chalk.gray(`   Backup saved: ${result.backupPath}`));
        }
      } else {
        console.error(chalk.red(`❌ ${result.message}`));
        if (result.error) {
          console.error(chalk.red(`   Error: ${result.error}`));
        }
        process.exit(1);
      }

      console.log();
    } catch (error) {
      console.error(
        chalk.red(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
      process.exit(1);
    }
  });

program
  .command("config")
  .description("Show configuration file location and format")
  .action(() => {
    const configPath = ConfigManager.getConfigPath();
    console.log(chalk.blue.bold("\n📋 Configuration\n"));
    console.log(chalk.gray(`Config file: ${configPath}`));
    console.log(chalk.gray("\nExample config structure:"));
    console.log(
      chalk.gray(JSON.stringify(
        {
          geminiApiKey: "YOUR_API_KEY_HERE",
          filePath: "~/scratchpad.txt",
          categories: ConfigManager.getDefaultCategories(),
        },
        null,
        2
      ))
    );
    console.log();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
