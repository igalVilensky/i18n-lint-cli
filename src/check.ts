import fs from "fs";
import path from "path";
import YAML from "yaml";

type LocaleData = Record<string, any>;

function loadLocale(filePath: string): LocaleData {
  const raw = fs.readFileSync(filePath, "utf-8");
  if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
    return YAML.parse(raw);
  }
  return JSON.parse(raw);
}

export function walkKeys(obj: any, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.keys(obj).flatMap((key) =>
    walkKeys(obj[key], prefix ? `${prefix}.${key}` : key)
  );
}

// Extract all {placeholders} from a string
function extractPlaceholders(str: string): string[] {
  const regex = /{([^}]+)}/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

// Get value at nested path
function getValue(obj: any, pathStr: string): any {
  return pathStr.split(".").reduce((acc, key) => acc?.[key], obj);
}

import ignore from "ignore";

export function loadLocales(dir: string): Record<string, LocaleData> {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") || f.endsWith(".yaml") || f.endsWith(".yml"));
  const locales: Record<string, LocaleData> = {};

  files.forEach((file) => {
    const name = path.basename(file, path.extname(file));
    locales[name] = loadLocale(path.join(dir, file));
  });
  return locales;
}

export function getMissingKeys(baseKeys: string[], targetKeys: string[]): string[] {
  return baseKeys.filter((key) => !targetKeys.includes(key));
}

export function getExtraKeys(baseKeys: string[], targetKeys: string[]): string[] {
  return targetKeys.filter((key) => !baseKeys.includes(key));
}

export function lintLocales(dir: string, base: string, ignorePatterns: string[] = []) {
  const locales = loadLocales(dir);
  const baseData = locales[base];

  if (!baseData) {
    throw new Error(`Base locale '${base}' not found in ${dir}`);
  }

  const ig = ignore().add(ignorePatterns);

  const baseKeys = walkKeys(baseData).filter((k) => !ig.ignores(k));
  const errors: string[] = [];

  for (const [locale, data] of Object.entries(locales)) {
    if (locale === base) continue;
    const keys = walkKeys(data).filter((k) => !ig.ignores(k));

    // Missing keys
    const missing = getMissingKeys(baseKeys, keys);
    missing.forEach(key => errors.push(`[${locale}] Missing key: ${key}`));

    // Extra keys
    const extra = getExtraKeys(baseKeys, keys);
    extra.forEach(key => errors.push(`[${locale}] Extra key: ${key}`));

    // Placeholder check
    for (const key of baseKeys) {
      const baseVal = getValue(baseData, key);
      const localeVal = getValue(data, key);

      if (typeof baseVal === "string" && typeof localeVal === "string") {
        const basePlaceholders = extractPlaceholders(baseVal).sort();
        const localePlaceholders = extractPlaceholders(localeVal).sort();

        const mismatch =
          basePlaceholders.length !== localePlaceholders.length ||
          !basePlaceholders.every((p, i) => p === localePlaceholders[i]);

        if (mismatch) {
          errors.push(
            `[${locale}] Placeholder mismatch in ${key}: expected {${basePlaceholders.join(
              ", "
            )}}, found {${localePlaceholders.join(", ")}}`
          );
        }
      }
    }
  }

  return { errors };
}
