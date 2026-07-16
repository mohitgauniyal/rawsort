# Usage Guide

## Basic Commands

### Sort Your Scratchpad

```bash
rawsort sort
```

Uses the file path from your config file (`~/.rawsort/config.json`).

### Sort a Specific File

```bash
rawsort sort ~/my-scratchpad.txt
```

This overrides the file path in your config for this run only.

### Dry-Run (Preview Changes)

```bash
rawsort sort --dry-run
```

Shows what would happen without actually writing to the file. Great for testing!

### Show Configuration

```bash
rawsort config
```

Displays:
- Location of your config file
- Example config structure
- Default categories

## Workflow Examples

### Example 1: Weekly Sort

1. Throughout the week, paste content into `~/scratchpad.txt`:
```
buy groceries
https://github.com/awesome-repo
function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }
Remember: consistency beats perfection
password: mySecurePass123
api_key: sk-12345
```

2. At the end of the week, run:
```bash
rawsort sort
```

3. Your file is now organized:
```
## Quotes & Inspiration
Remember: consistency beats perfection

## Code & Commands
function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }

## Links & Resources
https://github.com/awesome-repo

## Credentials & Tokens
password: mySecurePass123
api_key: sk-12345

## Ideas & TODO
buy groceries
```

### Example 2: Custom Categories

1. Edit `~/.rawsort/config.json`:
```json
{
  "geminiApiKey": "...",
  "filePath": "~/scratchpad.txt",
  "categories": [
    "Work",
    "Personal",
    "Learning",
    "Code Snippets",
    "Misc"
  ]
}
```

2. Run:
```bash
rawsort sort
```

3. Content is organized by your custom categories.

### Example 3: Testing Before Committing

1. Make a test copy of your scratchpad:
```bash
cp ~/scratchpad.txt ~/scratchpad.backup.txt
```

2. Test with dry-run:
```bash
rawsort sort ~/scratchpad.backup.txt --dry-run
```

3. If it looks good, run for real:
```bash
rawsort sort ~/scratchpad.txt
```

## Tips & Tricks

### Tip 1: Multiple Scratchpads

You can organize different scratchpads with different category sets:

```bash
# Work scratchpad
rawsort sort ~/work-notes.txt

# Personal scratchpad
rawsort sort ~/personal-notes.txt
```

Just make sure each file path is specified explicitly or update your config before each run.

### Tip 2: Undo if Something Goes Wrong

If rawsort organizes something unexpectedly:
```bash
# In your editor (Sublime, VS Code, etc.)
Ctrl+Z  (or Cmd+Z on Mac)
```

Your file reverts to the previous state.

### Tip 3: Preview First

Always use `--dry-run` on a file the first time:
```bash
rawsort sort ~/scratchpad.txt --dry-run
```

This shows you exactly how it will be organized before making changes.

### Tip 4: Keep a Backup

Before running rawsort on important files:
```bash
cp ~/scratchpad.txt ~/scratchpad.backup.txt
rawsort sort ~/scratchpad.txt
```

If anything goes wrong, you can restore from the backup.

## Command Reference

```
Usage: rawsort [command] [options]

Commands:
  sort [filePath]   Sort your scratchpad file
  config           Show configuration file location and format
  help [command]   Display help for command

Options:
  --version        Display version number
  --help           Display help message
  --dry-run        Preview changes without writing to file
  --config <path>  Path to config file (not yet implemented)

Examples:
  rawsort sort                           # Sort using config file path
  rawsort sort ~/scratchpad.txt          # Sort specific file
  rawsort sort ~/scratchpad.txt --dry-run  # Preview changes
  rawsort config                         # Show config location
  rawsort --version                      # Show version
  rawsort --help                         # Show this help
```

## Automation (Advanced)

### Using with cron (macOS/Linux)

Create a script `~/sort-scratchpad.sh`:
```bash
#!/bin/bash
rawsort sort ~/scratchpad.txt
```

Make it executable:
```bash
chmod +x ~/sort-scratchpad.sh
```

Add to crontab:
```bash
crontab -e
```

Add this line to run every Sunday at 10 AM:
```
0 10 * * 0 /Users/yourname/sort-scratchpad.sh
```

### Using with Task Scheduler (Windows)

1. Create a batch file `C:\Users\YourName\sort-scratchpad.bat`:
```batch
@echo off
rawsort sort C:\Users\YourName\scratchpad.txt
```

2. Open Task Scheduler
3. Create a new basic task
4. Set trigger (e.g., weekly)
5. Set action to run the batch file

## Troubleshooting

### File Not Sorting

1. Check your config:
```bash
rawsort config
cat ~/.rawsort/config.json
```

2. Verify file path:
```bash
ls -la ~/scratchpad.txt
```

3. Test with dry-run:
```bash
rawsort sort ~/scratchpad.txt --dry-run
```

### Content Not Organized as Expected

This usually means:
1. Categories in config don't match content well
2. Content doesn't fit neatly into categories

Try:
1. Adjust categories in your config
2. Run again
3. Use `--dry-run` to preview

### API Errors

If you get API errors:
1. Check your API key is valid
2. Verify you have API quota remaining
3. Check your internet connection

## Need Help?

- Check [README.md](../README.md) for overview
- Check [CONFIG.md](./CONFIG.md) for configuration details
- File an issue on GitHub
