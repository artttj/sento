# Additional AI Providers Integration Design

**Date:** 2026-04-12
**Status:** Draft
**Related Issue:** N/A

## Summary

Add support for OpenRouter, Zai, Anthropic (Claude), and a flexible Custom Endpoint provider with Ollama/LM Studio presets to the Sentō browser extension.

## Goals

- Enable users to access more AI models through OpenRouter's unified API
- Add native Claude support via Anthropic API
- Support self-hosted/local LLMs (Ollama, LM Studio)
- Maintain existing BYOK (Bring Your Own Key) architecture
- Follow existing Provider Strategy pattern

## Non-Goals

- Building a backend service (all API calls remain browser-to-provider)
- Changing the existing provider architecture

## Architecture

### Provider Strategy Pattern

Existing pattern is extended with new providers:

```
src/shared/providers/
├── base/
│   └── OpenAICompatibleProvider.ts  # NEW: base for OpenAI-compatible APIs
├── openrouter.ts                    # NEW: extends base
├── zai.ts                           # NEW: extends base
├── custom.ts                        # NEW: extends base + dynamic URL
├── anthropic.ts                     # NEW: implements Messages API
├── openai.ts                        # existing
├── gemini.ts                        # existing
├── grok.ts                          # existing
├── errors.ts                        # existing
├── utils.ts                         # existing
└── index.ts                         # updated registry
```

### Base Class for OpenAI-Compatible Providers

`OpenAICompatibleProvider` handles the common `/v1/chat/completions` format:

- Abstract `baseUrl` property
- Abstract `headers(apiKey)` factory method
- Shared `rewrite()` implementation using `buildMessages()` and `parseProviderResponse()`

Providers extending this:
- `OpenRouterProvider` — `https://openrouter.ai/api/v1`
- `ZaiProvider` — `https://api.zai.ai/v1`
- `CustomEndpointProvider` — dynamic URL from settings

### Anthropic Provider

Claude uses the Messages API format, not OpenAI-compatible:

- Endpoint: `https://api.anthropic.com/v1/messages`
- Headers: `x-api-key`, `anthropic-version: 2023-06-01`
- Body structure: `{ system, messages: [{role, content}], max_tokens, temperature }`
- Response: `{ content: [{ type: "text", text: "..." }] }`

## Type Changes

### ProviderName Union

```typescript
export type ProviderName =
  | 'openai' | 'gemini' | 'grok'        // existing
  | 'openrouter' | 'zai' | 'anthropic'  // new cloud providers
  | 'custom';                           // new: self-hosted/custom
```

### ProviderSettings Interface

```typescript
export interface ProviderSettings {
  // ...existing fields
  openrouterModel: string;
  zaiModel: string;
  anthropicModel: string;
  customEndpoint: string;      // URL for custom provider
  customModel: string;         // model name for custom
  customPreset: 'ollama' | 'lmstudio' | 'custom';
  customApiKey?: string;       // optional (local endpoints often don't need auth)
}
```

## Storage Keys

```typescript
export const STORAGE_KEYS = {
  // existing
  SETTINGS: 'apc_settings',
  OPENAI_KEY: 'apc_openai_key',
  GEMINI_KEY: 'apc_gemini_key',
  GROK_KEY: 'apc_grok_key',
  // new
  OPENROUTER_KEY: 'apc_openrouter_key',
  ZAI_KEY: 'apc_zai_key',
  ANTHROPIC_KEY: 'apc_anthropic_key',
  CUSTOM_KEY: 'apc_custom_key',
} as const;
```

## Model Lists

```typescript
export const PROVIDER_MODELS: Record<string, string[]> = {
  // existing
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1'],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  grok: ['grok-3-mini', 'grok-3'],
  // new
  openrouter: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-2.5-flash'],
  zai: ['zai-7b', 'zai-70b'], // verify actual models
  anthropic: ['claude-3.5-sonnet', 'claude-3.5-haiku', 'claude-3-opus'],
  custom: ['llama3', 'llama3:70b', 'mistral', 'qwen2', 'deepseek-coder'],
};
```

## Custom Endpoint Presets

| Preset | URL | API Key |
|--------|-----|---------|
| `ollama` | `http://localhost:11434/v1` | Optional |
| `lmstudio` | `http://localhost:1234/v1` | Optional |
| `custom` | User enters URL | Optional |

When preset is selected, URL auto-fills. User can modify if needed.

## Routing Changes

### Provider Registry Update

`src/shared/providers/index.ts` registers all providers.

### Custom Endpoint Handling

The `custom` provider is special — its URL is dynamic:

```typescript
if (provider === 'custom') {
  const customProvider = new CustomEndpointProvider(
    settings.customEndpoint,
    !!settings.customApiKey?.trim()
  );
  // use customProvider for this request
}
```

### Storage Helper Consolidation

`getProviderKey(provider: ProviderName)` function routes to the appropriate getter:

```typescript
async function getProviderKey(provider: ProviderName): Promise<string> {
  const getters = {
    openai: getOpenAIKey,
    gemini: getGeminiKey,
    grok: getGrokKey,
    openrouter: getOpenRouterKey,
    zai: getZaiKey,
    anthropic: getAnthropicKey,
    custom: getCustomKey,
  };
  return getters[provider]();
}
```

## UI Changes

### Settings Page — New Provider Cards

Four new cards added to AI Connections tab:

1. **OpenRouter** — standard layout (model select + API key)
2. **Zai** — standard layout
3. **Claude** — standard layout
4. **Custom** — preset dropdown + URL input + optional API key

### Custom Endpoint Card Details

- Preset select: Ollama / LM Studio / Custom
- URL input: auto-fills based on preset, editable
- API key input: optional, placeholder indicates optional

### Provider Segmented Control

Add buttons for new providers in the main provider selector.

### i18n Updates

Add English/German translations for:
- Provider names (OpenRouter, Zai, Claude, Custom)
- Setting descriptions
- Privacy notice updates

## Manifest Permissions

```json
{
  "host_permissions": [
    "*://*/*",
    "https://api.openai.com/*",
    "https://api.x.ai/*",
    "https://generativelanguage.googleapis.com/*",
    "https://openrouter.ai/*",
    "https://api.anthropic.com/*",
    "https://api.zai.ai/*",
    "http://localhost/*"
  ]
}
```

## Error Handling

Existing error normalization handles all providers:
- `MISSING_KEY` — when API key is empty
- `UNAUTHORIZED` — 401/403 responses
- `RATE_LIMITED` — 429 responses
- `NETWORK` — fetch failures
- `TIMEOUT` — request exceeds timeout
- `BAD_RESPONSE` — malformed API responses
- `ABORTED` — user cancellation

No changes needed — errors are provider-agnostic.

## Testing

### Unit Tests

- `OpenAICompatibleProvider` base class
- Each new provider class
- Storage functions for new keys
- Custom endpoint URL resolution

### Integration Tests

- Full rewrite flow with each provider
- Preset selection auto-fills correct URL
- Custom provider with and without API key
- Error handling for invalid URLs

### Manual Testing

- Test with real API keys for each provider
- Verify Ollama local connection
- Verify LM Studio local connection
- Test custom URL with self-hosted endpoint

## Implementation Order

1. Types and constants updates
2. Storage functions for new keys
3. Base provider class
4. OpenRouter, Zai, Anthropic providers
5. Custom endpoint provider with presets
6. Provider registry and routing updates
7. Settings UI (HTML + CSS + TypeScript)
8. i18n translations
9. Manifest permissions
10. Tests

## Open Questions

1. **Zai actual domain and models** — verify `api.zai.ai` is correct and get model list
2. **OpenRouter referer requirement** — they may want a referer header, need to verify
3. **Anthropic max_tokens** — is 4096 sufficient for all rewrite use cases?

## Security Considerations

- All API keys stored locally via `chrome.storage.local`
- No keys sent to any server except the respective provider
- Custom endpoint with `http://localhost` allows local-only usage
- No additional security concerns beyond existing architecture
