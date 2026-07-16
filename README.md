# rawsort

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/rawsort)](https://www.npmjs.com/package/rawsort)

A lightweight, AI-powered tool to organize your scratchpad file with constrained categorization using Google Gemini API.

## The Problem

You keep a scratchpad file where you paste random stuff:
- Quotes and inspiration
- Code snippets and commands
- Links and resources
- Credentials and tokens
- Ideas and TODOs
- Random notes

Every week or two, you manually organize them into categories. **rawsort** automates this—while keeping your content 100% safe and intact.

## Why rawsort?

✅ **Corruption is impossible by design**: The AI only assigns a *category label* to each block—your output is rebuilt from the original, untouched text. The model never reproduces your content, so it can't alter it.  
✅ **Constrained categorization**: No wild category creation—only uses your predefined categories (enforced in code, not just the prompt)  
✅ **Secrets stay local**: Likely credentials/tokens are replaced with a typed placeholder before anything is sent to the API; the real value is written back untouched  
✅ **Backed up**: The original is copied to a timestamped `.backup` before any overwrite  
✅ **Simple**: CLI tool, no complicated setup  
✅ **Free**: Uses Google Gemini's free API tier  

## Installation

### Prerequisites
- Node.js 18+
- Google Gemini API key (free at [ai.google.dev](https://ai.google.dev))

### Install via npm

```bash
npm install -g rawsort
```

Or use with `npx`:
```bash
npx rawsort sort ~/scratchpad.txt
```

## Quick Start

### 1. Get a Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key

### 2. Create Configuration

rawsort will create a config file automatically on first use:

```bash
rawsort config
```

This creates `~/.rawsort/config.json` with a template.

### 3. Edit Configuration

Open `~/.rawsort/config.json`:

```json
{
  "geminiApiKey": "YOUR_API_KEY_HERE",
  "filePath": "~/scratchpad.txt",
  "categories": [
    "Quotes & Inspiration",
    "Code & Commands",
    "Links & Resources",
    "Credentials & Tokens",
    "Ideas & TODO",
    "Reference Notes"
  ]
}
```

### 4. Sort Your Scratchpad

```bash
rawsort sort
```

Or specify a different file:
```bash
rawsort sort ~/my-scratchpad.txt
```

## Usage

### Basic Sort
```bash
rawsort sort ~/scratchpad.txt
```

### Dry-Run (preview without saving)
```bash
rawsort sort ~/scratchpad.txt --dry-run
```

### Show Configuration
```bash
rawsort config
```

### Help
```bash
rawsort --help
rawsort sort --help
```

## Configuration

### Config File Location
`~/.rawsort/config.json`

### Config Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `geminiApiKey` | string | ✅ | Your Google Gemini API key |
| `filePath` | string | ✅ | Path to your scratchpad file (supports `~`) |
| `categories` | array | ✅ | List of allowed categories for organization |
| `dryRun` | boolean | ❌ | Preview changes without writing (default: false) |

### Example: Custom Categories

Edit your config to use different categories:

```json
{
  "geminiApiKey": "YOUR_API_KEY_HERE",
  "filePath": "~/scratchpad.txt",
  "categories": [
    "Work Tasks",
    "Personal",
    "Learning",
    "Snippets",
    "References"
  ]
}
```

## How It Works

1. **Segment**: rawsort splits your file into *units* (blank-line-separated blocks). A multi-line snippet stays together as one unit.
2. **Redact**: Likely secrets (API keys, passwords, tokens, connection strings) are swapped for a typed placeholder like `[REDACTED credential]` *before* anything is sent to the API.
3. **Classify**: Gemini receives the numbered (redacted) units and your fixed category list, and returns **only** a mapping of `unit → category`. It never sends your content back.
4. **Reassemble**: rawsort rebuilds the document locally by grouping the **original, untouched** units under their category headers.
5. **Verify & Write**: A final integrity gate asserts every original unit is present exactly; the original is backed up to a `.backup` file, then the sorted version is written.

### Safety Guarantees

- **Corruption is structurally impossible**: because the model only returns labels and the output is built from your original bytes, there is nothing for the AI to reword, drop, or hallucinate.
- **No Wild Categories**: a returned category that isn't in your list is coerced to `Reference Notes` in code—the AI cannot invent categories.
- **Nothing is ever dropped**: a unit the model omits or can't place goes to `Reference Notes`, never disappears.
- **Secrets stay local**: detected secrets are never transmitted in the clear.
- **Backed up & undo-safe**: a timestamped `.backup` is written before every overwrite, and `Ctrl+Z` in your editor also reverts changes.

## Examples

### Before
```
awesome quote by someone
https://github.com/awesome/repo
const greeting = () => console.log("hello");
TODO: finish project
api_key=sk-1234567890
another quote
```

### After
```
## Quotes & Inspiration
awesome quote by someone
another quote

## Code & Commands
const greeting = () => console.log("hello");

## Links & Resources
https://github.com/awesome/repo

## Credentials & Tokens
api_key=sk-1234567890

## Ideas & TODO
TODO: finish project
```

## Roadmap

- **v0.2.0** ✅: Classify-and-reassemble engine (corruption impossible by design), secret redaction, backup before sort
- **v0.3.0** ✅: Smarter segmentation (per-line units, code/fence/indent blocks kept whole), transient-error retry, configurable model
- **v0.4.0**: Large-file batching, diff preview, local/offline model option
- **v1.0+**: Editor plugins (VSCode, Obsidian), embeddable library API

## API Limits

rawsort uses Google's free Gemini API tier:
- **Rate limit**: 60 requests per minute
- **Daily quota**: Limited (usually sufficient for weekly sorts)

For heavy usage, consider using a paid Gemini plan.

## Troubleshooting

### Error: "API key not found"
- Make sure you've added your Gemini API key to `~/.rawsort/config.json`
- Check that the file path is correct

### Error: "File is empty"
- Ensure your scratchpad file has content before running rawsort

### Error: "Validation failed"
- Contact maintainers with your specific content sample (sanitized)
- This shouldn't happen under normal circumstances

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Add tests for new functionality
4. Ensure tests pass (`npm test`)
5. Submit a pull request

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed development setup.

## License

MIT © 2025

## Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/yourusername/rawsort/issues)
- 💬 [Discussions](https://github.com/yourusername/rawsort/discussions)

---

**Made with ❤️ for developers who like keeping scratchpads organized.**
