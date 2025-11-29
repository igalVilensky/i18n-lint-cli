import fs from "fs";
import path from "path";
import YAML from "yaml";
import { loadLocales, getMissingKeys, walkKeys } from "./check";

function setNestedValue(obj: any, pathStr: string, value: any) {
    const keys = pathStr.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

import ignore from "ignore";

export function fixLocales(dir: string, base: string, ignorePatterns: string[] = []) {
    const locales = loadLocales(dir);
    const baseData = locales[base];

    if (!baseData) {
        throw new Error(`Base locale '${base}' not found in ${dir}`);
    }

    const ig = ignore().add(ignorePatterns);
    const baseKeys = walkKeys(baseData).filter((k) => !ig.ignores(k));
    const fixedFiles: string[] = [];

    for (const [locale, data] of Object.entries(locales)) {
        if (locale === base) continue;

        const keys = walkKeys(data).filter((k) => !ig.ignores(k));
        const missing = getMissingKeys(baseKeys, keys);

        if (missing.length > 0) {
            const filePath = path.join(dir, `${locale}.json`); // Default to json, check actual extension
            const actualFile = fs.readdirSync(dir).find(f => f.startsWith(locale + "."));

            if (!actualFile) continue;

            const fullPath = path.join(dir, actualFile);
            const content = fs.readFileSync(fullPath, "utf-8");
            const ext = path.extname(actualFile);

            if (ext === ".yaml" || ext === ".yml") {
                const doc = YAML.parseDocument(content);
                missing.forEach((key) => {
                    doc.setIn(key.split("."), "__MISSING__");
                });
                fs.writeFileSync(fullPath, doc.toString());
            } else {
                // JSON
                const jsonObj = JSON.parse(content);
                missing.forEach((key) => {
                    setNestedValue(jsonObj, key, "__MISSING__");
                });
                fs.writeFileSync(fullPath, JSON.stringify(jsonObj, null, 2));
            }
            fixedFiles.push(actualFile);
        }
    }

    return { fixedFiles };
}
