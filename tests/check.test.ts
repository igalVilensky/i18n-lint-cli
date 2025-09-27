import { describe, it, expect } from "vitest";
import { lintLocales } from "../src/check";
import path from "path";

describe("lintLocales", () => {
  const fixtures = path.join(__dirname, "fixtures");

  it("detects missing keys", () => {
    const result = lintLocales(fixtures, "en");
    expect(result.errors).toContain("[fr] Missing key: logout");
  });

  it("detects placeholder mismatches", () => {
    const result = lintLocales(fixtures, "en");
    expect(result.errors).toContain(
      "[fr] Placeholder mismatch in greeting: expected {name}, found {username}"
    );
  });

  it("returns errors in correct format for JSON output", () => {
    const result = lintLocales(fixtures, "en");
    expect(result).toEqual({
      errors: [
        "[fr] Missing key: logout",
        "[fr] Placeholder mismatch in greeting: expected {name}, found {username}",
      ],
    });
  });
});
