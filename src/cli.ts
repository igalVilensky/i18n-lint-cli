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
  .option("--fix", "automatically fix missing keys")
  .option("--ignore-file <path>", "path to ignore file (default: .i18nignore)")
  .action((dir, options) => {
    try {
      const fs = require("fs");
      const path = require("path");
      let ignorePatterns: string[] = [];
      const ignoreFilePath = options.ignoreFile || path.join(process.cwd(), ".i18nignore");

      if (fs.existsSync(ignoreFilePath)) {
        ignorePatterns = fs.readFileSync(ignoreFilePath, "utf-8").split("\n").filter((l: string) => l.trim() && !l.startsWith("#"));
      }

      if (options.fix) {
        const { fixLocales } = require("./fix");
        const result = fixLocales(dir, options.base, ignorePatterns);
        if (result.fixedFiles.length > 0) {
          console.log("✅ Fixed files:");
          result.fixedFiles.forEach((f: string) => console.log(" -", f));
        } else {
          console.log("✨ No files needed fixing.");
        }
        process.exit(0);
      }

      const result = lintLocales(dir, options.base, ignorePatterns);
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
