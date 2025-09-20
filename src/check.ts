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

function walkKeys(obj: any, prefix = ""): string[] {
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

export function lintLocales(dir: string, base: string) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") || f.endsWith(".yaml"));
  const locales: Record<string, LocaleData> = {};

  files.forEach((file) => {
    const name = path.basename(file, path.extname(file));
    locales[name] = loadLocale(path.join(dir, file));
  });

  const baseData = locales[base];
  if (!baseData) {
    throw new Error(`Base locale '${base}' not found in ${dir}`);
  }

  const baseKeys = walkKeys(baseData);
  const errors: string[] = [];

  for (const [locale, data] of Object.entries(locales)) {
    if (locale === base) continue;
    const keys = walkKeys(data);

    // Missing keys
    for (const key of baseKeys) {
      if (!keys.includes(key)) errors.push(`[${locale}] Missing key: ${key}`);
    }

    // Extra keys
    for (const key of keys) {
      if (!baseKeys.includes(key)) errors.push(`[${locale}] Extra key: ${key}`);
    }

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
