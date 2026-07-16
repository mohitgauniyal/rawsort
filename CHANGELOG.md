# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for v0.2.0
- Sanitization mode (optional masking of passwords/API keys before sending to API)
- Backup before sort (automatic `.backup` files)
- Diff preview on first run
- Better error messages
- Enhanced logging

### Planned for v0.3.0
- Sublime Text plugin integration
- Keybind support for editor integration

### Planned for v1.0.0
- VSCode extension
- Web UI (rawsort.app)
- Local mode (no API required, runs entirely offline)

## [0.1.0] - 2025-05-12

### Added
- Initial release
- Core sorting logic with Gemini API integration
- Character-level content integrity validation
- Constrained categorization (no wild category creation)
- CLI tool with `sort` and `config` commands
- Configuration management with `~/.rawsort/config.json`
- Comprehensive unit and integration tests
- Documentation (README, INSTALL, USAGE, CONFIG)
- Default category set:
  - Quotes & Inspiration
  - Code & Commands
  - Links & Resources
  - Credentials & Tokens
  - Ideas & TODO
  - Reference Notes
- Support for `--dry-run` flag
- Path expansion (supports `~` in file paths)
- Error handling and validation

### Features
- ✅ AI-powered categorization using Google Gemini API
- ✅ 100% content-safe (character-level verification)
- ✅ Constrained categories (prevents unwanted category creation)
- ✅ Simple CLI interface
- ✅ Free (uses Gemini free tier)
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Open-source (MIT License)
