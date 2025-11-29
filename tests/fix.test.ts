import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fixLocales } from "../src/fix";
import fs from "fs";
import path from "path";

describe("fixLocales", () => {
    const tmpDir = path.join(__dirname, "tmp_fixtures");

    beforeEach(() => {
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
        fs.mkdirSync(tmpDir);
    });

    afterEach(() => {
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
    });

    it("adds missing keys to JSON files", () => {
        fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify({ hello: "world", bye: "bye" }));
        fs.writeFileSync(path.join(tmpDir, "fr.json"), JSON.stringify({ hello: "monde" }));

        const result = fixLocales(tmpDir, "en");
        expect(result.fixedFiles).toContain("fr.json");

        const frContent = JSON.parse(fs.readFileSync(path.join(tmpDir, "fr.json"), "utf-8"));
        expect(frContent).toEqual({ hello: "monde", bye: "__MISSING__" });
    });

    it("adds missing nested keys to JSON files", () => {
        fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify({ auth: { login: "Login", logout: "Logout" } }));
        fs.writeFileSync(path.join(tmpDir, "es.json"), JSON.stringify({ auth: { login: "Entrar" } }));

        fixLocales(tmpDir, "en");

        const esContent = JSON.parse(fs.readFileSync(path.join(tmpDir, "es.json"), "utf-8"));
        expect(esContent).toEqual({ auth: { login: "Entrar", logout: "__MISSING__" } });
    });

    it("adds missing keys to YAML files", () => {
        fs.writeFileSync(path.join(tmpDir, "en.yaml"), "hello: world\nbye: bye\n");
        fs.writeFileSync(path.join(tmpDir, "de.yaml"), "hello: welt\n");

        const result = fixLocales(tmpDir, "en");
        expect(result.fixedFiles).toContain("de.yaml");

        const deContent = fs.readFileSync(path.join(tmpDir, "de.yaml"), "utf-8");
        expect(deContent).toContain("bye: __MISSING__");
        expect(deContent).toContain("hello: welt");
    });
});
