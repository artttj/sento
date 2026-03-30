# AGENTS.md

## Project overview

Sento is a Chrome extension that adds a floating AI rewrite bubble to any editable field on the web. Users select text, pick a rewrite template, preview the result, and apply it in place. The extension runs entirely client-side with no backend, no accounts, and no analytics. Users bring their own API keys for OpenAI, Gemini, or Grok.

## Tech stack

- TypeScript (strict mode, ES2020 target)
- Chrome Extension Manifest V3 (service worker, content script, popup, settings page)
- Shadow DOM for UI isolation from host pages
- esbuild for bundling (four parallel targets: service worker ESM, content script IIFE, settings IIFE, popup IIFE)
- Zero runtime dependencies. Only devDependencies: `@types/chrome`, `esbuild`, `typescript`

## Source structure

```
src/
  background/
    service-worker.ts        # Message listener, AbortController lifecycle
    providerRouter.ts        # Resolves provider, builds prompts, calls AI, normalizes errors
  content/
    main.ts                  # Entry point, site access check, boots RewriteController
    rewriteController.ts     # Orchestrates selection tracking, bubble display, API calls
    selectionTracker.ts      # Monitors focus/selection events, produces SelectionSnapshot
    editable.ts              # Detects editable elements, extracts structured text from DOM
    types.ts                 # Content-layer type definitions
    bubble/
      rewriteBubble.ts       # Shadow DOM floating UI component
      styles.ts              # All bubble CSS as template literal
    input/
      adapters.ts            # TextControl, ContentEditable, and Framework adapters
      inputHandler.ts        # Selection restore and text replacement dispatch
  popup/
    popup.ts                 # Site toggle (block/unblock on current domain)
    popup.html / popup.css
  settings/
    settings.ts              # Full settings page logic
    settings.html / settings.css
    i18n.ts                  # Translation strings (English, German)
  shared/
    types.ts                 # Core types: ProviderName, RewriteTemplateId, etc.
    constants.ts             # Storage keys, model lists, default system prompt, defaults
    storage.ts               # chrome.storage.local read/write, site allowlist/blocklist matching
    messages.ts              # Runtime message type definitions
    rewriteTemplates.ts      # Template definitions and prompt builder
    providers/
      index.ts               # Provider strategy registry
      openai.ts              # OpenAI API implementation
      gemini.ts              # Gemini via OpenAI-compatible endpoint
      grok.ts                # Grok/xAI API implementation
      errors.ts              # ProviderHttpError, ProviderBadResponseError
      utils.ts               # Shared response parser
  types/
    runtime.ts               # Re-exports of core types
```

## Build and run

```bash
npm install
npm run build          # outputs to dist/
npm run typecheck      # tsc --noEmit
```

Load the extension: open `chrome://extensions`, enable Developer mode, click "Load unpacked", select the `dist/` folder.

## Architecture notes

### Data flow

1. Content script detects text selection in an editable field
2. Floating bubble appears near the selection (rendered inside Shadow DOM)
3. User clicks a template button (Fix, Pro, Mine, Trim)
4. Content script sends a `REWRITE_REQUEST` message to the service worker
5. Service worker resolves the provider, reads the API key from `chrome.storage.local`, builds the prompt, and calls the provider API directly
6. Response comes back through `REWRITE_RESPONSE` message
7. Content script shows a preview (or applies directly if Force Insert is on)
8. On Apply, the content script replaces text using simulated paste events for framework compatibility

### Editable field support

The extension handles multiple editor types through adapters:

- `TextControlAdapter` for `<textarea>` and `<input>` elements
- `ContentEditableAdapter` for `contenteditable` divs
- `FrameworkEditableAdapter` fallback for ProseMirror and similar editors

Text replacement uses simulated `ClipboardEvent` paste (with `text/plain` and `text/html` payloads) and property descriptor hacking for textarea values. This ensures compatibility with React, Vue, and Angular controlled components.

### Storage

All data lives in `chrome.storage.local`. No IndexedDB. No remote storage.

Keys: `apc_settings`, `apc_openai_key`, `apc_gemini_key`, `apc_grok_key`.

### AI providers

Three providers, all using OpenAI-compatible chat completions format:

| Provider | Endpoint | Models |
|----------|----------|--------|
| OpenAI | `api.openai.com/v1/chat/completions` | gpt-4o-mini, gpt-4.1-mini, gpt-4.1 |
| Gemini | `generativelanguage.googleapis.com/v1beta/openai/chat/completions` | gemini-2.5-flash, gemini-2.5-pro |
| Grok | `api.x.ai/v1/chat/completions` | grok-3-mini, grok-3 |

Temperature is fixed at 0.3. Timeout is 30 seconds. Requests are cancellable via AbortController.

### Rewrite templates

| ID | Label | Behavior |
|----|-------|----------|
| `auto_fix` | Fix | Grammar, spelling, punctuation, clarity. Preserves tone |
| `professional` | Pro | Professional business tone, active voice, short sentences |
| `custom` | Mine | User-defined instruction (falls back to clarity improvement) |
| `shorten` | Trim | Cut length by 40%+ while keeping facts and action items |

Templates are reorderable, individually toggleable, and accept custom instruction overrides.

### System prompt

The default system prompt is a "Writing Humanizer" with 18 rules targeting clarity, directness, and natural tone. It tells the model to return only rewritten text with no commentary. The system prompt is fully editable in Settings.

### Error handling

Structured error codes: `MISSING_KEY`, `UNAUTHORIZED`, `RATE_LIMITED`, `NETWORK`, `TIMEOUT`, `BAD_RESPONSE`, `ABORTED`, `UNKNOWN`. Each maps to a user-facing message. `MISSING_KEY` shows an "Open Settings" action.

### UI approach

- Glassmorphism dark theme with `backdrop-filter: blur()` and `color-mix()` shadows
- Bubble renders at `z-index: 2147483647` inside Shadow DOM to avoid CSS conflicts
- Repositions on scroll/resize via `requestAnimationFrame`
- Settings page uses a sticky sidebar with six tabs: General, Templates, AI Connections, Help, Privacy, About

### Interaction guards

- 1200ms acquire delay before showing bubble after focus
- 900ms release delay before hiding bubble after blur
- 460ms debounce on template clicks to prevent double-fires
- 12,000 character selection limit (truncated with warning, not silently)
- Extension reload detection via `chrome.runtime.id` check

## Coding conventions

- No frameworks. Pure TypeScript throughout
- `declare(strict_types)` equivalent: TypeScript strict mode is on
- Private methods go at the bottom of each class
- No `var_dump`/`console.log` debugging left in production code
- Self-explanatory code preferred over comments - do NOT add code comments
- JSDoc is acceptable for exported public API functions in storage.ts and similar shared utilities
- Avoid unnecessary abstractions

## Privacy model

- No accounts, no servers, no analytics, no telemetry
- API keys stored only in `chrome.storage.local`, sent only to their respective provider endpoint
- Selected text goes directly from the browser to the AI provider
- The extension is not involved in the data transfer between browser and provider
- Full source is available at https://github.com/artttj/sento
