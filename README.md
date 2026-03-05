# <img src="icons/icon128.png" width="48" alt="" valign="middle" /> Sento

A Chrome extension that adds a floating AI rewrite bubble to any editable field on the web. Select text, pick a template, and get a rewritten version in place.

- **Works everywhere.** Textarea, input fields, contenteditable editors. If you can type in it, Sento can rewrite it.
- **Preview before applying.** Every rewrite shows a preview first. You decide what goes in. Nothing changes until you click Apply.
- **Your keys, your cost.** Bring your own OpenAI, Gemini, or Grok API key. No middleman, no subscriptions, no data harvesting.
- **Invisible until needed.** The bubble only appears when you select text in a supported field. It stays out of your way otherwise.
- **Isolated by design.** The bubble lives in Shadow DOM so it never breaks page styles, and page styles never break it.

---

## Quick Start

1. `git clone https://github.com/artttj/sento.git && cd sento`
2. `npm install && npm run build`
3. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the `dist/` folder.
4. Click the Sento icon, go to **Settings**, and add your API key under **AI Connections**.

| Provider | Get a key |
| --- | --- |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | [console.x.ai](https://console.x.ai/) |

---

## How It Works

1. Select text in any supported editable field.
2. The rewrite bubble appears near your selection.
3. Pick a template (Fix, Pro, Code, or Trim).
4. Review the rewritten text in the preview area.
5. Click **Apply** to replace the original, or **Retry** to regenerate.

Text replacement uses native browser events (`beforeinput`, `input`, `change`) so React, Vue, and contenteditable editors detect the update correctly.

---

## Rewrite Templates

| Template | What it does |
| --- | --- |
| **Fix** | Grammar, spelling, and punctuation cleanup |
| **Pro** | Polished, professional tone |
| **Code** | Technical and precise wording |
| **Trim** | Shorter version, same meaning |

You can set a default template and add a custom system prompt in Settings.

---

## Settings

- **Default Template** to pre-select when the bubble opens
- **AI Provider** switch between OpenAI, Gemini, and Grok
- **Theme** with a liquid glass dark/light switcher
- **Model** selection per provider
- **System Prompt** prepended to every request
- **API Keys** stored locally, never sent anywhere except your chosen provider

---

## Privacy

- Keys are stored in `chrome.storage.local` and never leave your machine.
- Selected text goes directly from your browser to the provider API. Sento has no backend.
- The full source code is right here for you to read.

---

## Tech Stack

- TypeScript (strict mode)
- Chrome Extension Manifest V3
- Shadow DOM for UI isolation
- esbuild for builds

---

## Supported Targets

- `textarea` and text-like `input` (text, search, url, email, tel)
- `contenteditable` elements
- Most rich text editors that use the above

Cross-origin iframes and closed shadow roots are out of scope for now.

---

## License

MIT
