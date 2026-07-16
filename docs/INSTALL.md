# Installation Guide

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Google Gemini API Key**: Free at [ai.google.dev](https://ai.google.dev)

## Step-by-Step Installation

### 1. Check Node.js Version

```bash
node --version
# Should output v18.0.0 or higher
```

If you don't have Node.js, download from [nodejs.org](https://nodejs.org/).

### 2. Install rawsort

#### Option A: Global Installation (Recommended)

```bash
npm install -g rawsort
```

Then use it from anywhere:
```bash
rawsort sort ~/scratchpad.txt
```

#### Option B: Using npx (No Installation)

```bash
npx rawsort sort ~/scratchpad.txt
```

This downloads and runs rawsort without installing globally.

#### Option C: Local Installation

```bash
npm install rawsort
npx rawsort sort ~/scratchpad.txt
```

### 3. Get Gemini API Key

1. Visit [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new Google Cloud project or select existing
4. Generate a new API key
5. Copy the key

### 4. Configure rawsort

Run the config command:
```bash
rawsort config
```

This creates `~/.rawsort/config.json` automatically.

Edit the file with your API key:
```bash
# On macOS/Linux
nano ~/.rawsort/config.json

# Or use your preferred editor
```

Add your Gemini API key:
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

### 5. Verify Installation

```bash
rawsort --version
# Should output: 0.1.0

rawsort --help
# Should display help message
```

## Troubleshooting

### "rawsort: command not found"

**If using global installation:**
```bash
# Make sure npm global bin is in PATH
npm config get prefix
# Add this to your ~/.bashrc or ~/.zshrc:
export PATH=$(npm config get prefix)/bin:$PATH
```

**If using npx:**
Just use `npx rawsort` instead.

### "Cannot find module"

Try reinstalling:
```bash
npm install -g rawsort@latest
```

### Permission Denied (macOS/Linux)

```bash
sudo npm install -g rawsort
```

### API Key Issues

- Make sure your API key is correct
- Check that it has Gemini API enabled
- Try generating a new key at [ai.google.dev](https://ai.google.dev)

## Next Steps

- Read [USAGE.md](./USAGE.md) to learn how to use rawsort
- Read [CONFIG.md](./CONFIG.md) for configuration options
- Check [examples/](../examples/) for sample files
