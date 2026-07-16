# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-07-16

### Changed — Smarter segmentation
- Each non-blank line now starts its own unit by default, so a stack of distinct
  one-line notes no longer collapses into a single unit (and a single mis-category).
  Lines are merged into a multi-line unit only when they are genuine continuations:
  inside a fenced code block, indented, or while an earlier bracket is still open
  (which also captures a closing `}`/`)`/`]` on its own line). Verified live: content
  that previously lumped 20 items into one wrong category now sorts each correctly,
  with integrity preserved.

### Added
- **Transient-error retry**: model calls now retry 503/429/network failures with
  exponential backoff before giving up (`retry.ts`), so momentary Gemini overload no
  longer aborts a sort.
- **Configurable model**: set `"model"` in `~/.rawsort/config.json` to override the
  default. Default is now `gemini-flash-lite-latest` (has free-tier quota on typical
  accounts and is ample for label-only classification).

## [0.2.0] - 2026-07-16

### Changed — Architecture pivot: the model never touches your content
- Reworked the engine so the LLM only assigns a category label to each unit; the
  output document is reassembled from the **original, untouched** unit text. Content
  corruption is now **structurally impossible** rather than merely detected.
- Content is segmented into blank-line-separated **units**; multi-line snippets
  (code blocks, wrapped quotes) stay together and are never split across categories.
- Re-sorting an already-sorted file is now **idempotent** (existing `##` headers are
  treated as structure and regenerated).

### Added
- **Redaction hint** for secrets: likely credentials/tokens/keys/connection strings
  are replaced with a typed placeholder (e.g. `[REDACTED credential]`) before the
  text is shown to the model. The real value never leaves the machine and is written
  back untouched.
- **Backup before sort**: the original is copied to a timestamped `.backup` file
  before any overwrite; the path is shown in the CLI output.
- New internal modules: `segmenter`, `redactor`, `classifier`, `reassembler`.
- Injectable model interface (`TextModel`) so the pipeline is fully unit-testable
  without network access.

### Fixed
- Replaced the fake 5%-tolerance token check with a real content-line integrity
  gate that fails closed on any added/removed/altered line.
- Removed a broken `inspector/promises` import and leftover debug logging.
- Use `os.homedir()` so tilde and config paths work correctly on Windows.
- Added an ESLint configuration so `npm run lint` (and CI) works.

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
