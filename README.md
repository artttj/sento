# <img src="icons/icon48.png" width="32" alt="" valign="middle" /> Sentō

Sentō is a Chrome MV3 extension that adds a **selection-first AI rewrite bubble** to editable fields on any webpage.

**Author:** Artem Iagovdik

It uses a local BYOK setup (OpenAI, Gemini, Grok), runs provider calls through the background service worker, and applies rewritten text with native events so React/Vue/contenteditable editors detect updates correctly.

## Highlights

- Selection-first trigger: bubble appears only when text is selected in supported editable fields
- Shadow DOM UI: bubble styles are isolated from host page CSS
- Preview-first rewrite flow: rewrite -> preview -> apply
- BYOK provider strategy: OpenAI, Gemini, Grok
- Provider routing in background script (MV3-safe network path)
- Framework-aware text replacement with native event dispatch (`beforeinput`, `input`, `change`)
- Settings UI with Sentō-style visual system and left sidebar navigation
- App icon set generated from `icons/logo-source.png` and wired in manifest/build

## Tech Stack

- TypeScript (strict mode)
- Chrome Extension Manifest V3
- esbuild

## Project Structure

```text
src/
  background/
    service-worker.ts        # Runtime message handling + request lifecycle
    providerRouter.ts        # Provider/model/key resolution + timeout/error mapping
  content/
    main.ts                  # Content entrypoint
    rewriteController.ts     # Orchestration between tracker, bubble, input handler
    selectionTracker.ts      # Selection/focus tracking in editable targets
    editable.ts              # Editable target detection helpers
    input/
      adapters.ts            # TextControl / ContentEditable / Framework fallback adapters
      inputHandler.ts        # Selection restore + replacement + event dispatch
    bubble/
      rewriteBubble.ts       # Shadow DOM popup UI + interaction locking
      styles.ts              # Bubble tokenized CSS
  settings/
    settings.html            # Settings UI markup
    settings.css             # Sentō-style settings design system clone
    settings.ts              # Settings state, tabs, segmented controls, key management
  shared/
    constants.ts             # Storage keys, defaults, model lists, limits
    types.ts                 # Shared domain types
    messages.ts              # Runtime message contracts
    storage.ts               # chrome.storage.local read/write helpers
    rewriteTemplates.ts      # Rewrite template definitions + prompt builder
    providers/
      openai.ts gemini.ts grok.ts index.ts errors.ts
scripts/
  build.js                   # dist build pipeline
icons/
  icon16.png icon32.png icon48.png icon128.png
```

## Requirements

- Node.js 18+
- Chrome/Chromium with Developer Mode enabled

## Install & Build

```bash
npm install
npm run typecheck
npm run build
```

Build output is generated in `dist/`.

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `/private/var/www/sento/dist`

## Settings & BYOK

Open extension settings page and configure:

- Default Rewrite Template
- Provider (`openai`, `gemini`, `grok`)
- Theme (`dark`, `light`)
- Provider model per service
- Optional system prompt
- API keys for each provider

All settings and keys are stored in `chrome.storage.local`.

## How Rewrite Works

1. User selects text in supported editable field.
2. Content tracker captures selection snapshot and shows bubble near selection.
3. User picks template and clicks `Auto-Fix`.
4. Content script sends `REWRITE_REQUEST` to background.
5. Background resolves provider/model/key and executes strategy request.
6. Bubble shows rewritten text preview.
7. On `Apply`, input handler restores selection, injects text, and dispatches:
   - `beforeinput` (`insertReplacementText`)
   - `input` (`insertReplacementText`)
   - `change`

## Supported Targets

- `textarea`
- text-like `input` (`text`, `search`, `url`, `email`, `tel`)
- `contenteditable` editors

## Known Limitations

- Cross-origin iframe editors are out of scope for this version
- Closed shadow-root editors are out of scope
- Non-streaming provider responses (single final response only)

## Troubleshooting

### Bubble closes while clicking controls

Interaction lock is implemented in `rewriteBubble.ts`.
If this still happens on a specific site/editor, report URL/editor type and we can add a targeted fallback path.

### Missing key error

Configure provider keys in Settings -> AI Connections.

### Provider timeout/rate limit

Use `Retry` in bubble or switch provider/model in Settings.

## Scripts

- `npm run typecheck` — strict TypeScript validation
- `npm run build` — build extension into `dist/`
