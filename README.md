# <img src="icons/icon128.png" width="36" alt="" valign="middle" /> Sentō

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)

## Rewrite anywhere

Sentō is a Chrome extension that adds a floating AI rewrite bubble to any editable field. Select text, choose a template, review the result, and apply it instantly.

No copy-paste. No switching tabs. No context loss.

<p align="center">
  <img src="screenshots/sento_1400x560.png" width="600" alt="Sentō in action">
</p>

## Key Features

- **Works everywhere**: textareas, contenteditable, ProseMirror, Jira, Confluence, Notion.
- **Preview before applying**: nothing changes until you click Apply. Hold Shift to skip preview.
- **Bring your own API key**: OpenAI, Gemini, or Grok. No subscriptions, no markup.
- **Appears only when needed**: bubble shows only when text is selected.
- **Flexible site control**: All Sites, Allow List, or Block List.
- **Privacy by design**: keys stay local, requests go directly to AI providers.

## Quick Start

### 1. Clone and build

```bash
git clone https://github.com/artttj/sento.git
cd sento
npm install
npm run build
```

### 2. Install the extension

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `dist/` folder

### 3. Add your API key

Click the Sentō icon → Settings → AI Connections

| Provider | Get a key |
|---|---|
| OpenAI | https://platform.openai.com/api-keys |
| Google Gemini | https://aistudio.google.com/app/apikey |
| Grok (xAI) | https://console.x.ai/ |

## How It Works

1. Select text in any editable field
2. The rewrite bubble appears
3. Choose a template (Fix, Pro, Mine, Trim)
4. Review the rewritten text
5. Click Apply or Retry

Formatting like lists and bullet points is preserved, including in Jira, Confluence, and ProseMirror.

## Rewrite Templates

| Template | Purpose |
|---|---|
| Fix | Correct grammar, spelling, and clarity |
| Pro | Rewrite with a concise professional tone |
| Mine | Your custom instruction |
| Trim | Shorten text by about 40% |

Templates can be reordered, disabled, or customized in Settings.

## Languages

The interface supports English and Deutsch (German). Change it in Settings → General → Language.

Prompts sent to AI providers remain in English.

## Common Use Cases

- **Jira / Linear tickets**: turn rough notes into a clean update
- **Email drafts**: fix tone and grammar before sending
- **Slack / Teams**: rewrite messages for clarity
- **Code review comments**: make suggestions concise
- **Notion or Markdown**: improve formatting and readability

## Privacy and Security

- API keys stored only in chrome.storage.local
- Text goes directly to the AI provider
- No backend: runs entirely client-side

Provider policies: [OpenAI](https://openai.com/policies/privacy-policy/), [Google](https://ai.google.dev/gemini-api/terms), [xAI](https://x.ai/legal/privacy-policy/)

## Tech Stack

- TypeScript (strict mode)
- Chrome Extension Manifest V3
- Shadow DOM UI isolation
- esbuild bundling

## License

MIT: see [LICENSE](LICENSE) for details.
