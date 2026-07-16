# Configuration Guide

## Overview

rawsort uses a JSON configuration file located at `~/.rawsort/config.json`.

This file is created automatically on first use. You can view it with:
```bash
rawsort config
```

## Configuration File

### Location
```
~/.rawsort/config.json
```

On macOS/Linux: `$HOME/.rawsort/config.json`  
On Windows: `%USERPROFILE%\.rawsort\config.json`

### Example Config
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

## Configuration Options

### `geminiApiKey` (Required)

Your Google Gemini API key.

**How to get:**
1. Visit [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a project or select existing
4. Generate API key
5. Copy and paste into config

**Example:**
```json
{
  "geminiApiKey": "AIzaSyDf4bN_9Q7x8vQ2z1mK3lP5..."
}
```

**Security:**
- Never commit your API key to version control
- Keep your API key private
- If you suspect it's compromised, regenerate at [ai.google.dev](https://ai.google.dev)

### `filePath` (Required)

Path to your scratchpad file.

**Supports:**
- Relative paths: `~/scratchpad.txt`
- Absolute paths: `/home/user/scratchpad.txt`
- Tilde expansion: `~` expands to your home directory

**Examples:**
```json
{
  "filePath": "~/scratchpad.txt"
}
```

```json
{
  "filePath": "~/Documents/my-scratchpad.txt"
}
```

```json
{
  "filePath": "/home/user/workspace/notes.txt"
}
```

### `categories` (Required)

Array of allowed categories for organizing content.

The AI will ONLY use these categories. It will not create new ones.

**Default categories:**
```json
{
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

**Custom examples:**

For work:
```json
{
  "categories": [
    "Projects",
    "Meetings",
    "Bugs & Issues",
    "Ideas",
    "Reference"
  ]
}
```

For personal:
```json
{
  "categories": [
    "Goals",
    "Learning",
    "Health",
    "Personal Notes",
    "Links",
    "Finance"
  ]
}
```

**Important:**
- Minimum: 1 category
- Recommended: 4-8 categories
- Too few categories → content crowded
- Too many categories → AI unsure where to place things
- Always include a catch-all like "Reference" or "Misc"

### `dryRun` (Optional)

Preview changes without writing to file.

**Default:** `false`

```json
{
  "dryRun": false
}
```

**Note:** Currently, set this via CLI flag instead:
```bash
rawsort sort --dry-run
```

## Examples

### Example 1: Basic Setup

```json
{
  "geminiApiKey": "AIzaSyDf4bN_9Q7x8vQ2z1mK3lP5...",
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

### Example 2: Work Focus

```json
{
  "geminiApiKey": "AIzaSyDf4bN_9Q7x8vQ2z1mK3lP5...",
  "filePath": "~/work/scratchpad.txt",
  "categories": [
    "Current Projects",
    "Sprint Tasks",
    "Technical Debt",
    "Meeting Notes",
    "Ideas & Improvements",
    "Reference & Docs"
  ]
}
```

### Example 3: Learning Focus

```json
{
  "geminiApiKey": "AIzaSyDf4bN_9Q7x8vQ2z1mK3lP5...",
  "filePath": "~/learning/notes.txt",
  "categories": [
    "Concepts to Learn",
    "Code Examples",
    "Resources & Links",
    "Questions",
    "Practice Problems",
    "Summary Notes"
  ]
}
```

## Tips for Categories

### ✅ Good Category Names
- Clear and descriptive
- Specific but not too narrow
- Intuitive (others would understand)
- Consistent in style

Examples:
- "Code & Commands"
- "Links & Resources"
- "Personal Notes"

### ❌ Avoid
- Too vague: "Stuff", "Things", "Random"
- Too specific: "Python Code", "SQL Code", "Bash Code" (group as "Code & Commands")
- Inconsistent style: "Quotes & Inspiration" vs "code_snippets" vs "LINKS"

### 💡 Best Practices

1. **Include a catch-all category**
   ```json
   {
     "categories": [
      "Work",
      "Personal",
      "Learning",
      "Miscellaneous"  // ← catch-all
    ]
   }
   ```

2. **Keep it balanced**
   - Not too few (data crowded)
   - Not too many (AI confused)
   - 5-7 is usually ideal

3. **Update periodically**
   - If you notice certain content doesn't fit
   - If you want to emphasize different areas
   - But don't change too often (disrupts organization)

4. **Use ampersands wisely**
   - "Code & Commands" (related concepts)
   - vs "Code and Commands" (both work, be consistent)

## Editing Config

### View Current Config
```bash
rawsort config
```

### Edit Config
```bash
# macOS/Linux
nano ~/.rawsort/config.json
vim ~/.rawsort/config.json
code ~/.rawsort/config.json  # VS Code

# Windows
notepad %USERPROFILE%\.rawsort\config.json
```

### Validate JSON
After editing, make sure your JSON is valid:
```bash
# Using Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.HOME + '/.rawsort/config.json', 'utf8')))"
```

If no error, your JSON is valid.

## Troubleshooting

### "Config file not found"
Create it manually:
```bash
mkdir -p ~/.rawsort
cat > ~/.rawsort/config.json << 'EOF'
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
EOF
```

### "API key not found"
- Make sure `geminiApiKey` is set in config
- Make sure it's not an empty string
- Check you have the right API key from [ai.google.dev](https://ai.google.dev)

### "File path not found"
- Make sure `filePath` is set in config
- Make sure the file exists
- Try using absolute path instead of `~`

### "JSON is invalid"
- Check for missing commas between properties
- Check all quotes are straight (`"`) not curly (`"`)
- Use a JSON validator: [jsonlint.com](https://www.jsonlint.com/)

## Multiple Configurations (Advanced)

You can maintain multiple config files and select them with environment variables (future feature). For now:

**Option 1: Keep switching the config**
```bash
# Edit ~/.rawsort/config.json for work setup
rawsort sort work-scratchpad.txt

# Edit ~/.rawsort/config.json for personal setup
rawsort sort personal-scratchpad.txt
```

**Option 2: Specify file explicitly**
```bash
rawsort sort ~/work-scratchpad.txt  # Overrides config path
rawsort sort ~/personal-scratchpad.txt
```

## Next Steps

- See [USAGE.md](./USAGE.md) for how to use rawsort
- See [README.md](../README.md) for overview
