# JSON Toolkit for Obsidian

A powerful and lightweight JSON formatting, minification, and manipulation plugin for [Obsidian](https://obsidian.md).

Supports both standard strict JSON and flexible formats (comments, trailing commas, unquoted keys, hexadecimals) using dynamic parsing engines (**JSONC** and **JSON5**).

---

## Features

- **Dynamic Engine Switching**:
  - **JSONC (`jsonc-parser`)**: VS Code's parser that performs surgical AST-based formatting, preserving single-line (`//`) and multi-line (`/* */`) comments as well as trailing commas.
  - **JSON5 (`json5`)**: Serializes relaxed JSON5 syntax including unquoted keys, single-quoted strings, hexadecimals, and trailing commas.
- **Selection & Block Formatting**:
  - **`JSON: Format Selection`**: Formats the selected text in the active note.
  - **`JSON: Format Block under Cursor`**: Automatically detects the surrounding ` ```json `, ` ```jsonc `, or ` ```json5 ` code block and formats its inner content while preserving Markdown fence delimiters.
- **Minification**:
  - **`JSON: Minify Selection / Block`**: Strips whitespace and comments, producing compact machine-readable payloads. Supports selection or cursor-targeted block fallback.
- **Detailed Syntax Error Reporting**:
  - Syntax errors display informative notifications with exact line and column numbers.
- **Customizable Formatting**:
  - Configurable indent size (2 spaces, 4 spaces).
  - Tab indentation support.
  - Alphabetical key sorting (*Sort Keys*).
  - Optional success notifications.
- **High Performance & Mobile Ready**:
  - Zero native Node dependencies; 100% compatible with Obsidian Desktop and Mobile (iOS/Android).
  - Bundle size < 60 KB.

---

## Engine Comparison

| Feature | JSONC (`jsonc-parser`) | JSON5 (`json5`) |
| :--- | :--- | :--- |
| **Comments (`//`, `/* */`)** | Preserved intact via edits | Comments stripped on re-serialization |
| **Unquoted Keys** | No (strict key quotes) | Yes (e.g. `{ key: 1 }`) |
| **Single-Quoted Strings** | No | Yes (e.g. `'string'`) |
| **Hexadecimal / Infinity / NaN** | No | Yes (e.g. `0xFF`) |
| **Trailing Commas** | Yes | Yes |

---

## Commands

- `JSON: Format Selection`: Formats selected JSON text.
- `JSON: Format Block under Cursor`: Locates the enclosing Markdown JSON code block and formats it.
- `JSON: Minify Selection / Block`: Minifies selected JSON or the code block under the cursor.

---

## Settings

Open **Settings -> Community Plugins -> JSON Toolkit**:

- **Active parser engine**: Select default engine (`JSONC` or `JSON5`).
- **Indent size**: 2 or 4 spaces.
- **Use tabs**: Toggle tab-based indentation.
- **Sort keys**: Toggle recursive alphabetical key sorting.
- **Notify on success**: Toggle success notices.

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build production bundle
npm run build

# Run complete quality checks
npm run check
```

---

## License

[MIT](LICENSE)
