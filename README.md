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

✅ **Content-safe**: Character-level integrity validation ensures not a single character is modified  
✅ **Constrained categorization**: No wild category creation—only uses your predefined categories  
✅ **Simple**: CLI tool, no complicated setup  
✅ **Free**: Uses Google Gemini's free API tier  
✅ **Local first**: Your file never leaves your control  

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

1. **Read**: rawsort reads your scratchpad file
2. **Classify**: Sends content to Gemini API with instructions to categorize into your predefined categories
3. **Validate**: Performs character-level integrity check to ensure no content was modified
4. **Write**: Updates your file with organized, categorized content (if validation passes)

### Safety Guarantees

- **Content Integrity**: Every character from your original file is verified to be present in the sorted version
- **No Wild Categories**: AI can only use categories you explicitly define
- **Constraint Prompting**: Gemini is explicitly instructed NOT to modify content, only reorganize it
- **Undo-Safe**: If something looks wrong, `Ctrl+Z` in your editor reverts changes

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

- **v0.2.0**: Sanitization (optional password/credential masking), backup before sort, diff preview
- **v0.3.0**: Sublime Text integration (keybind support)
- **v1.0+**: VSCode extension, web app (rawsort.app), local mode (no API)

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
