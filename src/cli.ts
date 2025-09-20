#!/usr/bin/env node
import { Command } from "commander";
import { lintLocales } from "./check";

const program = new Command();

program
  .name("i18n-lint")
  .description(
    "Lint translation files for missing/unused keys and placeholder mismatches"
  )
  .argument("<dir>", "directory containing locale files")
  .option("--base <locale>", "base locale (default: en)", "en")
  .action((dir, options) => {
    const result = lintLocales(dir, options.base);
    if (result.errors.length > 0) {
      console.error("❌ Errors found:");
      result.errors.forEach((e) => console.error(" -", e));
      process.exit(1);
    } else {
      console.log("✅ All locales are consistent!");
    }
  });

program.parse(process.argv);
