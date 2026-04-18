# Settings & Prompt Polish — Design Spec

**Date:** 2026-04-17
**Scope:** Four related UX/prompt improvements shipped together.

## Goals

1. Make the AI Connections tab intuitive — selecting a provider should focus the UI on that provider.
2. Stop leaking the UI language setting into model prompts. Output language should mirror the source text.
3. Tighten the four predefined template instructions and the default system prompt.
4. Replace the sun/ray glyph in the popup settings button (and the matching sidebar "General" icon) with unambiguous icons.

## Section 1 — Collapse-to-Active Provider Cards

**Problem:** `src/settings/settings.html` renders all seven `.provider-card` blocks at once. Picking a provider at the top does nothing visual below.

**Change:**
- Each `.provider-card` gets `data-provider="<id>"`.
- New helper `updateProviderCardVisibility(active)` in `settings.ts` toggles `.hidden` on all non-active cards.
- Called in `applySettings()` and from the `wireSegmented(refs.providerSegmented, …)` change handler.

**Out of scope:** card internals, badge logic, save/clear buttons.

## Section 2 — Language Decoupling

**Problem:** `buildRewritePrompt` reads `settings.language`. With the default `en`, no language instruction is emitted and Russian input can come back in English.

**Change:**
- Drop the `language` parameter from `buildRewritePrompt`.
- Always emit: *"Write the output in the same language as the original text."*
- `providerRouter.ts` stops passing `language` into the prompt builder.
- `ProviderSettings.language` stays — still drives UI translations in `applyTranslations()`.
- Tests updated: assert language line is present unconditionally; drop German-branch assertion.

## Section 3 — Prompt Optimization Pass

**Scope:** `REWRITE_TEMPLATES` (4 entries in `rewriteTemplates.ts`) and `DEFAULT_SYSTEM_PROMPT` in `constants.ts`.

**Approach:**
- Tighten instructions: cut redundancy with the prompt scaffolding (which already handles "return only the text" and formatting preservation).
- Align system prompt with the user's humanizer rules from `~/.claude/CLAUDE.md`.
- Bake the "preserve source language" directive into the system prompt so it reinforces Section 2.
- Keep ids and labels unchanged — ids are persisted in user settings.

**Migration:** users who customized an instruction keep their override via the existing `instruction === tpl.instruction ? '' : instruction` sticky logic.

## Section 4 — Icon Swaps

- `src/popup/popup.html:13-16` — circle-with-rays → classic 8-tooth cog outline.
- `src/settings/settings.html:22-25` — same sun/ray glyph on General tab → sliders icon (three horizontal lines with offset dots).
- Both keep `viewBox="0 0 20 20"`, `stroke="currentColor"`, `stroke-width="1.5"`.

## Files Touched

- `src/settings/settings.html` — `data-provider` attrs, sidebar general icon swap.
- `src/settings/settings.ts` — `updateProviderCardVisibility` helper + wire-up.
- `src/popup/popup.html` — settings button icon swap.
- `src/shared/rewriteTemplates.ts` — signature change, unconditional language line, optimized template instructions.
- `src/shared/rewriteTemplates.test.ts` — updated assertions.
- `src/shared/constants.ts` — optimized `DEFAULT_SYSTEM_PROMPT`.
- `src/background/providerRouter.ts` — drop `language` from `buildRewritePrompt` call.
