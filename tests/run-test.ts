import { lintLocales } from "../src/check";

const result = lintLocales("./tests/fixtures", "en");

console.log(result.errors);
