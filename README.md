# i18n-lint-cli

A CLI tool and Node library to **lint translation files** for i18n projects.  
It detects:

- ✅ Missing keys
- ✅ Extra/unused keys
- ✅ Placeholder mismatches (e.g., `{name}` vs `{username}`)

Helps ensure your translations stay consistent and reduces runtime bugs.

---

## 🌟 Features

- Works with **JSON** and **YAML** files.
- Supports **nested translation keys**.
- Outputs **colorful CLI messages** for easy debugging.
- Can be used in **CI/CD pipelines**.

---

## 💻 Installation

Install as a dev dependency:

```bash
npm install -D i18n-lint-cli
```

Or run without installing using npx:

```bash
npx i18n-lint-cli ./locales --base en
```

---

## ⚙️ Usage

### CLI Example

Given `locales/en.json`:

```json
{
  "greeting": "Hello {name}",
  "logout": "Log out"
}
```

And `locales/fr.json`:

```json
{
  "greeting": "Bonjour {username}"
}
```

Run:

```bash
npx i18n-lint-cli ./locales --base en
```

Output:

```yaml
❌ Errors found:
 - [fr] Missing key: logout
 - [fr] Placeholder mismatch in greeting: expected {name}, found {username}
```

Exit code: `1` if errors are found (perfect for CI).

### Programmatic Usage

You can also use it as a library:

```ts
import { lintLocales } from "i18n-lint-cli";

const result = lintLocales("./locales", "en");
console.log(result.errors);
```

Output:

```js
[
  "[fr] Missing key: logout",
  "[fr] Placeholder mismatch in greeting: expected {name}, found {username}",
];
```

---

## 🏗️ CI/CD Integration

Example GitHub Actions workflow (`.github/workflows/i18n-lint.yml`):

```yaml
name: i18n Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: npm ci
      - run: npx i18n-lint-cli ./locales --base en
```

Fails the pipeline if missing keys or placeholder mismatches are detected.

Keeps your translations safe before deployment.

---

## 🔧 Scripts

- Build: `npm run build`
- Dev mode (watch + build): `npm run dev`
- Tests: `npm run test`

---

## 📝 Roadmap / Ideas

- Auto-fix missing keys with placeholder values.
- Support `.po` files and other localization formats.
- Add `--json` output mode for CI parsing.
- Add ignore rules for specific keys or files.

---

## 📦 License

MIT
