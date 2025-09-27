#!/usr/bin/env node
import { Command } from "commander";
import { lintLocales } from "./check";

const program = new Command();

program
  .name("i18n-lint")
  .version("0.1.6")
  .description(
    "Lint translation files for missing/unused keys and placeholder mismatches"
  )
  .argument("<dir>", "directory containing locale files")
  .option("--base <locale>", "base locale (default: en)", "en")
  .option("--json", "output results as JSON")
  .action((dir, options) => {
    try {
      const result = lintLocales(dir, options.base);
      if (options.json) {
        console.log(JSON.stringify({ errors: result.errors }, null, 2));
      } else {
        if (result.errors.length > 0) {
          console.error("❌ Errors found:");
          result.errors.forEach((e) => console.error(" -", e));
          process.exit(1);
        } else {
          console.log("✅ All locales are consistent!");
        }
      }
      process.exit(result.errors.length > 0 ? 1 : 0);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
