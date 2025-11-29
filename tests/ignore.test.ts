import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { lintLocales } from "../src/check";
import { fixLocales } from "../src/fix";
import fs from "fs";
import path from "path";

describe("ignore patterns", () => {
    const tmpDir = path.join(__dirname, "tmp_ignore");

    beforeEach(() => {
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
        fs.mkdirSync(tmpDir);
    });

    afterEach(() => {
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
    });

    it("ignores specified keys in linting", () => {
        fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify({ hello: "world", ignored: "val" }));
        fs.writeFileSync(path.join(tmpDir, "fr.json"), JSON.stringify({ hello: "monde" }));

        const result = lintLocales(tmpDir, "en", ["ignored"]);
        expect(result.errors).toHaveLength(0);
    });

    it("ignores specified nested keys in linting", () => {
        fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify({ auth: { login: "Login", secret: "shh" } }));
        fs.writeFileSync(path.join(tmpDir, "fr.json"), JSON.stringify({ auth: { login: "Login" } }));

        const result = lintLocales(tmpDir, "en", ["auth.secret"]);
        expect(result.errors).toHaveLength(0);
    });

    it("ignores specified keys in fixing", () => {
        fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify({ hello: "world", ignored: "val" }));
        fs.writeFileSync(path.join(tmpDir, "fr.json"), JSON.stringify({ hello: "monde" }));

        const result = fixLocales(tmpDir, "en", ["ignored"]);
        expect(result.fixedFiles).toHaveLength(0);

        const frContent = JSON.parse(fs.readFileSync(path.join(tmpDir, "fr.json"), "utf-8"));
        expect(frContent).not.toHaveProperty("ignored");
    });
});
