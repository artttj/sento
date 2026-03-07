# <img src="icons/icon128.png" width="36" alt="" valign="middle" /> Sentō

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)

## Rewrite anywhere.

Sentō is a Chrome extension that puts a floating AI rewrite bubble inside any editable field. Select text, pick a template, review the result, and apply it in place. No copy-paste loop. No context switching.

- **Works everywhere.** Textarea, contenteditable, ProseMirror editors, rich text fields. If you can type paragraphs in it, Sentō rewrites it.
- **See before you apply.** Every rewrite shows a preview. Nothing changes until you click Apply.
- **Your keys, your price.** Connect your own OpenAI, Gemini, or Grok API key. You pay the provider directly—no markups, no subscriptions.
- **Invisible until needed.** The bubble appears only when you select text. Zero distraction when you don't need it.
- **Smart site control.** Choose All Sites, Allow List, or Block List to control where the bubble shows.
- **Privacy by design.** Your API keys stay local. Your text goes straight to the AI provider. Sentō has no backend.

---

## Quick Start

1. **Clone & build:**
   ```bash
   git clone https://github.com/artttj/sento.git && cd sento
   npm install && npm run build
   ```

2. **Install:**
   - Open `chrome://extensions`
   - Turn on **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist/` folder

3. **Connect an API key:**
   - Click the Sentō icon → **Settings** → **AI Connections**
   - Pick a provider and add your API key

| Provider | Get a key |
| --- | --- |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | [console.x.ai](https://console.x.ai/) |

---

## How It Works

1. Select text in any editable field
2. The rewrite bubble appears below your selection
3. Click a template (Fix, Pro, Mine, Trim)
4. Review the rewritten text
5. Click **Apply** to replace, or **Retry** for a new version

Rich text (bullet points, lists) is preserved and re-inserted correctly—even in Jira, Confluence, and ProseMirror editors.

---

## Rewrite Templates

| Template | Purpose |
| --- | --- |
| **Fix** | Fix grammar, spelling, and clarity. Keep the tone. |
| **Pro** | Polished professional tone. Concise and courteous. |
| **Mine** | Your own custom instruction. Configure in Settings. |
| **Trim** | Make it 40% shorter. Keep key points. |

Drag to reorder templates. Toggle any on or off. Edit the instruction for "Mine" directly in Settings.

---

## Languages

The interface supports:

- **English**
- **Deutsch** (German)

Switch in Settings → General → Language. Your choice is remembered.

Template prompts sent to AI are always in English.

---

## Settings

**General**
- Default template to auto-select
- Pill label visibility
- Output language
- Site access (allow/deny/block specific domains)
- Custom rewrite prompts per template

**AI Connections**
- Add and manage API keys for OpenAI, Gemini, Grok
- Choose which provider to use
- Select model per provider

---

## Real-World Uses

- **Jira/Linear tickets:** Turn rambling comments into a clean summary
- **Email drafts:** Fix tone and grammar without leaving your inbox
- **Slack/Teams messages:** Rewrite for clarity before hitting send
- **Code reviews:** Polish comments and suggestions
- **Notion/Markdown:** Fix formatting and tighten prose

---

## Privacy & Security

- **Local keys:** API keys stored in `chrome.storage.local` only. Never synced or sent anywhere.
- **Direct connection:** Your text travels straight from your browser to the provider API. Sentō never sees it.
- **No backend:** Sentō is 100% client-side. Open source. No servers.

Provider privacy: [OpenAI](https://openai.com/policies/privacy-policy/) · [Google](https://ai.google.dev/gemini-api/terms) · [xAI](https://x.ai/legal/privacy-policy/)

---

## Tech Stack

- TypeScript (strict mode)
- Chrome Extension Manifest V3
- Shadow DOM for UI isolation
- esbuild for fast builds

---

## Keyboard Shortcuts

| Action | Windows / macOS |
| --- | --- |
| **Force apply** | Shift + Click template |

Skip the preview and apply the rewrite directly.

---

## License

MIT. You can use, modify, and distribute it. Keep the copyright notice. See [LICENSE](LICENSE).
