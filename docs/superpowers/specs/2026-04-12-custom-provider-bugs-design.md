# Custom Provider Bugs — Design Spec

**Date:** 2026-04-12
**Scope:** 3 surgical fixes in storage, response parsing, and warning indicator

## Problem

On a fresh install, selecting the Custom provider and configuring a local Ollama model (e.g., `qwen3:1.7b`) fails in three compounding ways:

1. Custom model fields don't survive page reload — settings appear to save but get wiped on next load
2. Ollama responses are silently rejected because the parser only understands OpenAI's response shape
3. The "!" warning indicator in the sidebar shows stale/incorrect status

## Bug 1: `getProviderSettings()` drops optional model fields

**File:** `src/shared/storage.ts` — `getProviderSettings()`

The function constructs a new `ProviderSettings` object but omits all optional custom model fields: `customOverrideModel`, `openaiCustomModel`, `geminiCustomModel`, `grokCustomModel`, `openrouterCustomModel`, `zaiCustomModel`, `anthropicCustomModel`.

**Impact chain:**
- Save writes `customOverrideModel: "qwen3:1.7b"` to storage — works
- Page reload calls `getProviderSettings()` — returned object has no `customOverrideModel`
- `applySettings()` sets the input to empty
- Next save reads the empty input, writes `undefined`, wiping the stored value

**Fix:** Add the missing optional fields to the settings construction in `getProviderSettings()`, passing through `raw` values:

```typescript
customOverrideModel: raw.customOverrideModel,
openaiCustomModel: raw.openaiCustomModel,
geminiCustomModel: raw.geminiCustomModel,
grokCustomModel: raw.grokCustomModel,
openrouterCustomModel: raw.openrouterCustomModel,
zaiCustomModel: raw.zaiCustomModel,
anthropicCustomModel: raw.anthropicCustomModel,
```

## Bug 2: Response parser rejects Ollama format

**File:** `src/shared/providers/utils.ts` — `parseProviderResponse()`

The parser expects OpenAI format: `{ choices: [{ message: { content: "..." } }] }`.
Ollama returns: `{ message: { role: "assistant", content: "..." } }`.

The parser finds no `choices`, throws `ProviderBadResponseError('Provider returned an empty rewrite result.')`.

**Fix:** Check both response shapes. Try OpenAI `choices[0].message.content` first, fall back to Ollama `message.content`:

```typescript
interface OllamaResponse {
  message?: { content?: string };
}

type ProviderResponse = CompletionResponse & OllamaResponse;
```

Extract text as:
```typescript
const text = body.choices?.[0]?.message?.content?.trim()
  || body.message?.content?.trim();
```

This handles OpenAI, Ollama, and any provider that uses either shape.

## Bug 3: `navAiWarning` inconsistent logic

**File:** `src/settings/settings.ts`

Two functions control the same warning indicator with contradictory logic:

- `loadApiKeys()` line 592: hides warning only when openai AND gemini AND grok all have keys
- `refreshBadges()` line 307: hides warning when ANY key has a value

Neither checks whether the *active provider* is configured.

**Fix:** Unify both locations to use the same logic: check whether the currently selected provider has its required credential configured. For custom, check that the endpoint is set. For standard providers, check the API key.

Extract a helper:

```typescript
function isActiveProviderConfigured(
  provider: ProviderName,
  keys: string[],
  customEndpoint: string
): boolean {
  if (provider === 'custom') return !!customEndpoint.trim();
  const keyIndex: Record<string, number> = {
    openai: 0, gemini: 1, grok: 2, openrouter: 3, zai: 4, anthropic: 5
  };
  const idx = keyIndex[provider];
  return idx !== undefined && !!keys[idx]?.trim();
}
```

Use this in both `refreshBadges()` and `loadApiKeys()` to toggle `navAiWarning`.

## Files Changed

| File | Change |
|------|--------|
| `src/shared/storage.ts` | Pass through optional model fields in `getProviderSettings()` |
| `src/shared/providers/utils.ts` | Support both OpenAI and Ollama response shapes |
| `src/settings/settings.ts` | Unify `navAiWarning` logic to check active provider |

## Testing

- Fresh install: set Custom provider, type model name, reload page — model name persists
- Ollama rewrite: select text, trigger rewrite with `qwen3:1.7b` — response parses correctly
- Warning indicator: configure only Custom provider — "!" hides; clear it — "!" shows
- Existing providers: OpenAI/Gemini/etc. still work (parser tries `choices` first)

## Out of Scope

- Refactoring the read-modify-write pattern in `saveProviderSettings`
- Adding provider-specific endpoint validation
- Changing the `/api/chat` endpoint path
