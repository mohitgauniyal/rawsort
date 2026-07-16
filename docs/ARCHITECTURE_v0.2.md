# rawsort v0.2.0 — Architecture Pivot

> **The core principle: the LLM never reproduces your content. It only assigns labels. Our code reassembles the output from the original, untouched units.**
>
> This turns content corruption from something we *detect after the fact* into
> something that is *structurally impossible*.

## Why

In v0.1.0 the whole file is sent to Gemini and the model returns the reorganized
text — physically re-typing every character, free to drop/reword/merge/hallucinate.
The integrity gate catches that, but a caught failure is still a failed sort.

In v0.2.0 the model receives a numbered list of units + the fixed category set, and
returns only a mapping `{unitId -> category}`. No content round-trips. Consequences:

- **Corruption is structurally impossible**, not merely detected.
- **~5–10x cheaper** — the model emits a small JSON map, not the whole file twice.
- **Large files work** — classify in batches, reassemble deterministically & locally.
- **Real secrets story** — secret units are sent as typed placeholders (`[REDACTED credential]`);
  the real value never leaves the machine and is what lands in the output file.

## Pipeline

```
read file
  → segment      content -> Unit[]   (blank-line blocks; strip existing ## headers)
  → redact       per unit: detect secrets, produce safeText for the model
  → classify     (units.safeText + categories) -> Map<unitId, category>   [LLM, batched]
  → coerce       unknown/missing/invalid category -> "Reference Notes"
  → reassemble   group ORIGINAL unit text by category, config order, stable within
  → integrity    assert output units == input units exactly (formality; fail closed)
  → backup+write timestamped .backup, then atomic write
```

## Decisions (locked)

| Question | Decision |
|---|---|
| Unit = ? | **Blank-line-separated blocks.** Multi-line code/quotes stay as one unit. |
| Unknown/unsure/invalid label | Coerced to **"Reference Notes"** in code. Never dropped, never a new category. |
| Idempotency | **Yes.** Existing `## headers` stripped on segment; re-sort is stable. |
| Ordering | Categories in config order; units in original order within a category. |
| Secrets (this milestone) | **Redaction hint only.** Secret → `[REDACTED <type>]` sent to model; original kept locally. |
| Model returns bad JSON | One retry, then **fail closed** (no write). |
| Missing unit IDs in response | Default to Reference Notes. |
| Extra/unknown unit IDs | Ignored. |
| Scope | **Core engine + existing CLI only.** Ship as v0.2.0. |

## Internal modules

- `core/segmenter.ts` — `segment(content: string): Unit[]`. Splits on blank lines,
  strips leading `#{1,6}` header lines, assigns stable ids. `Unit = { id: number; text: string }`.
- `core/redactor.ts` — `redact(text: string): { safeText: string; redacted: boolean; type?: string }`.
  Regex patterns for api keys, bearer/tokens, passwords, connection strings, private keys.
- `core/classifier.ts` — replaces the raw prompt in `gemini.ts`.
  `classify(units, categories): Promise<Map<number, string>>`. Sends `id + safeText`,
  batched (N units/request), merges maps, validates each returned category ∈ allowed set.
- `core/reassembler.ts` — `reassemble(units, labels, categories): string`. Deterministic,
  builds from original `unit.text`.
- `core/validator.ts` — unchanged integrity gate, runs as final assertion.
- `core/sorter.ts` — orchestrates the pipeline.

## Testing expectations

- **segmenter**: blank-line blocks; multi-line block kept whole; header stripping; idempotency.
- **redactor**: each secret pattern detected; non-secrets untouched; typed placeholder emitted.
- **classifier** (mocked model): category coercion; unknown/missing id handling; batching; bad-JSON retry then fail.
- **reassembler**: grouping, config order, stable within-category order, Reference-Notes fallback.
- **integration** (mocked classifier): end-to-end sort preserves every original unit exactly.

## Non-goals for v0.2.0 (explicit)

Smart segmentation, local/offline model, BYO-key config surface, web app, editor
plugins, hosted B2B API, streaming. These layer on top of this engine later.

## Compatibility

Same `rawsort sort [file]` CLI, same `~/.rawsort/config.json`. Output format
(`## Category` sections) is unchanged, so existing users see no interface break —
only a safer, cheaper engine underneath.
