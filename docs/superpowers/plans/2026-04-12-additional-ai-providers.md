# Additional AI Providers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OpenRouter, Zai, Anthropic (Claude), and Custom Endpoint providers to the Sentō browser extension.

**Architecture:** Extend the existing Provider Strategy pattern with a base class for OpenAI-compatible providers and a dedicated Anthropic provider for its Messages API format. Custom endpoint uses the base class with dynamic URL configuration.

**Tech Stack:** TypeScript, Chrome Extension Manifest V3, Vitest for testing

---

## File Structure

**New Files:**
- `src/shared/providers/base/OpenAICompatibleProvider.ts` — Base class for OpenAI-compatible APIs
- `src/shared/providers/openrouter.ts` — OpenRouter provider
- `src/shared/providers/zai.ts` — Zai provider
- `src/shared/providers/anthropic.ts` — Anthropic/Claude provider
- `src/shared/providers/custom.ts` — Custom endpoint provider
- `src/shared/providers/custom.test.ts` — Tests for custom provider

**Modified Files:**
- `src/shared/types.ts` — Add new provider names and settings fields
- `src/shared/constants.ts` — Add new storage keys and model lists
- `src/shared/storage.ts` — Add key getter/setter functions
- `src/shared/providers/index.ts` — Register new providers
- `src/background/providerRouter.ts` — Handle custom endpoint routing
- `src/settings/settings.html` — Add UI for new providers
- `src/settings/settings.ts` — Wire up new UI elements
- `src/settings/i18n.ts` — Add translations
- `manifest.json` — Add host permissions

---

## Task 1: Update Type Definitions

**Files:**
- Modify: `src/shared/types.ts`

- [ ] **Step 1: Add new providers to ProviderName union**

```typescript
// Replace line 3
export type ProviderName = 'openai' | 'gemini' | 'grok' | 'openrouter' | 'zai' | 'anthropic' | 'custom';
```

- [ ] **Step 2: Add new fields to ProviderSettings interface**

```typescript
// Add after line 21 (grokModel field)
  zaiModel: string;
  openrouterModel: string;
  anthropicModel: string;
  customEndpoint: string;
  customModel: string;
  customPreset: 'ollama' | 'lmstudio' | 'custom';
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/shared/types.ts
git commit -m "feat: add type definitions for new providers"
```

---

## Task 2: Update Constants

**Files:**
- Modify: `src/shared/constants.ts`

- [ ] **Step 1: Add new storage keys**

```typescript
// Add after line 7 (GROK_KEY)
  OPENROUTER_KEY: 'apc_openrouter_key',
  ZAI_KEY: 'apc_zai_key',
  ANTHROPIC_KEY: 'apc_anthropic_key',
  CUSTOM_KEY: 'apc_custom_key',
```

- [ ] **Step 2: Add model lists for new providers**

```typescript
// Add to PROVIDER_MODELS object after line 13
  openrouter: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-2.5-flash', 'meta-llama/llama-3.1-70b'],
  zai: ['zai-7b', 'zai-70b'],
  anthropic: ['claude-3.5-sonnet', 'claude-3.5-haiku', 'claude-3-opus'],
  custom: ['llama3', 'llama3:70b', 'mistral', 'qwen2', 'deepseek-coder', 'phi3'],
```

- [ ] **Step 3: Add default values to DEFAULT_SETTINGS**

```typescript
// Add after grokModel: 'grok-3-mini',
  openrouterModel: 'anthropic/claude-3.5-sonnet',
  zaiModel: 'zai-7b',
  anthropicModel: 'claude-3.5-sonnet',
  customEndpoint: 'http://localhost:11434/v1',
  customModel: 'llama3',
  customPreset: 'ollama',
```

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/shared/constants.ts
git commit -m "feat: add constants for new providers"
```

---

## Task 3: Update Storage Functions

**Files:**
- Modify: `src/shared/storage.ts`

- [ ] **Step 1: Update isProviderName function**

```typescript
// Replace line 6-8
function isProviderName(value: string): value is ProviderName {
  return value === 'openai' || value === 'gemini' || value === 'grok' ||
         value === 'openrouter' || value === 'zai' || value === 'anthropic' || value === 'custom';
}
```

- [ ] **Step 2: Add new fields to getProviderSettings return**

```typescript
// Add after line 45 (grokModel line)
    openrouterModel: raw.openrouterModel ?? DEFAULT_SETTINGS.openrouterModel,
    zaiModel: raw.zaiModel ?? DEFAULT_SETTINGS.zaiModel,
    anthropicModel: raw.anthropicModel ?? DEFAULT_SETTINGS.anthropicModel,
    customEndpoint: raw.customEndpoint ?? DEFAULT_SETTINGS.customEndpoint,
    customModel: raw.customModel ?? DEFAULT_SETTINGS.customModel,
    customPreset: raw.customPreset ?? DEFAULT_SETTINGS.customPreset,
```

- [ ] **Step 3: Add getter/setter functions for new keys**

```typescript
// Add after saveGrokKey function (line 112)

export async function getOpenRouterKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OPENROUTER_KEY);
  return (result[STORAGE_KEYS.OPENROUTER_KEY] as string | undefined) ?? '';
}

export async function saveOpenRouterKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OPENROUTER_KEY]: key });
}

export async function getZaiKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ZAI_KEY);
  return (result[STORAGE_KEYS.ZAI_KEY] as string | undefined) ?? '';
}

export async function saveZaiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ZAI_KEY]: key });
}

export async function getAnthropicKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ANTHROPIC_KEY);
  return (result[STORAGE_KEYS.ANTHROPIC_KEY] as string | undefined) ?? '';
}

export async function saveAnthropicKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ANTHROPIC_KEY]: key });
}

export async function getCustomKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_KEY);
  return (result[STORAGE_KEYS.CUSTOM_KEY] as string | undefined) ?? '';
}

export async function saveCustomKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_KEY]: key });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All existing tests pass

- [ ] **Step 5: Commit**

```bash
git add src/shared/storage.ts
git commit -m "feat: add storage functions for new providers"
```

---

## Task 4: Create Base Provider Class

**Files:**
- Create: `src/shared/providers/base/OpenAICompatibleProvider.ts`

- [ ] **Step 1: Create base directory and file**

```bash
mkdir -p src/shared/providers/base
```

- [ ] **Step 2: Write the base provider class**

```typescript
// src/shared/providers/base/OpenAICompatibleProvider.ts
// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../../types';
import { buildMessages, parseProviderResponse } from '../utils';

export interface RewriteInput {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  signal: AbortSignal;
}

export abstract class OpenAICompatibleProvider implements ProviderStrategy {
  abstract readonly baseUrl: string;
  abstract readonly headers: (apiKey: string) => Record<string, string>;

  async rewrite(input: RewriteInput): Promise<string> {
    const messages = buildMessages(input.systemPrompt, input.userPrompt);

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers(input.apiKey),
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        temperature: 0.3,
      }),
      signal: input.signal,
    });

    return parseProviderResponse(res);
  }
}
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/shared/providers/base/
git commit -m "feat: add OpenAI-compatible base provider"
```

---

## Task 5: Create OpenRouter Provider

**Files:**
- Create: `src/shared/providers/openrouter.ts`

- [ ] **Step 1: Write the OpenRouter provider**

```typescript
// src/shared/providers/openrouter.ts
// Copyright (c) Artem Iagovdik

import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider';

export class OpenRouterProvider extends OpenAICompatibleProvider {
  readonly baseUrl = 'https://openrouter.ai/api/v1';

  readonly headers = (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': chrome.runtime.getURL(''),
    'X-Title': 'Sentō',
  });
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/providers/openrouter.ts
git commit -m "feat: add OpenRouter provider"
```

---

## Task 6: Create Zai Provider

**Files:**
- Create: `src/shared/providers/zai.ts`

- [ ] **Step 1: Write the Zai provider**

```typescript
// src/shared/providers/zai.ts
// Copyright (c) Artem Iagovdik

import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider';

export class ZaiProvider extends OpenAICompatibleProvider {
  readonly baseUrl = 'https://api.zai.ai/v1';

  readonly headers = (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
  });
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/providers/zai.ts
git commit -m "feat: add Zai provider"
```

---

## Task 7: Create Custom Endpoint Provider

**Files:**
- Create: `src/shared/providers/custom.ts`
- Create: `src/shared/providers/custom.test.ts`

- [ ] **Step 1: Write the custom provider**

```typescript
// src/shared/providers/custom.ts
// Copyright (c) Artem Iagovdik

import { OpenAICompatibleProvider, type RewriteInput } from './base/OpenAICompatibleProvider';

export class CustomEndpointProvider extends OpenAICompatibleProvider {
  readonly baseUrl: string;
  private readonly includeAuth: boolean;

  constructor(baseUrl: string, includeAuth = true) {
    super();
    this.baseUrl = baseUrl;
    this.includeAuth = includeAuth;
  }

  readonly headers = (apiKey: string) => {
    if (!this.includeAuth) return {};
    if (!apiKey?.trim()) return {};
    return { 'Authorization': `Bearer ${apiKey}` };
  };
}
```

- [ ] **Step 2: Write tests for custom provider**

```typescript
// src/shared/providers/custom.test.ts
// Copyright (c) Artem Iagovdik

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomEndpointProvider } from './custom';

const fetchMock = vi.fn();

global.fetch = fetchMock as any;

describe('CustomEndpointProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('uses provided base URL', async () => {
    const provider = new CustomEndpointProvider('http://localhost:8080/v1');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'rewritten' } }] }),
    });

    await provider.rewrite({
      apiKey: 'test-key',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/v1/chat/completions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes auth header when apiKey provided and includeAuth is true', async () => {
    const provider = new CustomEndpointProvider('http://localhost:11434/v1', true);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: 'my-key',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers).toMatchObject({
      'Authorization': 'Bearer my-key',
    });
  });

  it('omits auth header when apiKey is empty', async () => {
    const provider = new CustomEndpointProvider('http://localhost:11434/v1', true);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: '',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers?.Authorization).toBeUndefined();
  });

  it('omits auth header when includeAuth is false', async () => {
    const provider = new CustomEndpointProvider('http://localhost:11434/v1', false);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: 'my-key',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers?.Authorization).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test custom.test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/shared/providers/custom.ts src/shared/providers/custom.test.ts
git commit -m "feat: add custom endpoint provider with tests"
```

---

## Task 8: Create Anthropic Provider

**Files:**
- Create: `src/shared/providers/anthropic.ts`

- [ ] **Step 1: Write the Anthropic provider**

```typescript
// src/shared/providers/anthropic.ts
// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../types';
import { ProviderBadResponseError, ProviderHttpError } from './errors';

type RewriteInput = {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  signal: AbortSignal;
};

export class AnthropicProvider implements ProviderStrategy {
  async rewrite(input: RewriteInput): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': input.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: input.model,
        system: input.systemPrompt || 'You are a helpful assistant.',
        messages: [{ role: 'user', content: input.userPrompt }],
        max_tokens: 4096,
        temperature: 0.3,
      }),
      signal: input.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ProviderHttpError(res.status, body.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();

    if (!text) {
      throw new ProviderBadResponseError('Provider returned an empty rewrite result.');
    }

    return text;
  }
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/providers/anthropic.ts
git commit -m "feat: add Anthropic provider"
```

---

## Task 9: Update Provider Registry

**Files:**
- Modify: `src/shared/providers/index.ts`

- [ ] **Step 1: Update imports**

```typescript
// Replace lines 3-6
import type { ProviderName, ProviderStrategy } from '../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { GrokProvider } from './grok';
import { OpenRouterProvider } from './openrouter';
import { ZaiProvider } from './zai';
import { AnthropicProvider } from './anthropic';
import { CustomEndpointProvider } from './custom';
```

- [ ] **Step 2: Update provider registry**

```typescript
// Replace lines 8-12
const providers: Record<ProviderName, ProviderStrategy> = {
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
  grok: new GrokProvider(),
  openrouter: new OpenRouterProvider(),
  zai: new ZaiProvider(),
  anthropic: new AnthropicProvider(),
  custom: new CustomEndpointProvider(''), // placeholder, will be replaced in router
};
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/shared/providers/index.ts
git commit -m "feat: register new providers in registry"
```

---

## Task 10: Update Provider Router

**Files:**
- Modify: `src/background/providerRouter.ts`

- [ ] **Step 1: Update imports**

```typescript
// Add after line 5
import { getOpenRouterKey, getZaiKey, getAnthropicKey, getCustomKey } from '../shared/storage';
```

- [ ] **Step 2: Update resolveProviderContext function**

```typescript
// Replace entire function (lines 50-81) with:
async function resolveProviderContext(): Promise<{
  provider: ProviderName;
  model: string;
  key: string;
  systemPrompt?: string;
  settings: ProviderSettings;
  customStrategy?: ProviderStrategy;
}> {
  const settings = await getProviderSettings();
  const provider = settings.llmProvider;

  // Handle custom endpoint separately (dynamic URL)
  if (provider === 'custom') {
    return {
      provider,
      model: settings.customModel,
      key: settings.customEndpoint, // using endpoint URL as "key" for validation
      systemPrompt: settings.systemPrompt,
      settings,
      customStrategy: new CustomEndpointProvider(
        settings.customEndpoint,
        !!(await getCustomKey()).trim()
      ),
    };
  }

  const keyMap: Record<ProviderName, () => Promise<string>> = {
    openai: getOpenAIKey,
    gemini: getGeminiKey,
    grok: getGrokKey,
    openrouter: getOpenRouterKey,
    zai: getZaiKey,
    anthropic: getAnthropicKey,
    custom: getCustomKey,
  };

  const modelMap: Record<ProviderName, keyof ProviderSettings> = {
    openai: 'openaiModel',
    gemini: 'geminiModel',
    grok: 'grokModel',
    openrouter: 'openrouterModel',
    zai: 'zaiModel',
    anthropic: 'anthropicModel',
    custom: 'customModel',
  };

  const key = await keyMap[provider]();
  const modelKey = modelMap[provider];
  const model = settings[modelKey] as string;

  return {
    provider,
    model,
    key,
    systemPrompt: settings.systemPrompt,
    settings,
  };
}
```

- [ ] **Step 3: Update rewriteWithProvider to handle custom strategy**

```typescript
// Modify line 103 (providerStrategy assignment)
    const providerStrategy = response.customStrategy ?? getProviderStrategy(provider);
```

- [ ] **Step 4: Update API key check for custom**

```typescript
// Replace lines 90-100 with:
  const isCustom = provider === 'custom';
  const keyForValidation = isCustom ? settings.customEndpoint : key;

  if (!keyForValidation.trim()) {
    return {
      ok: false,
      error: {
        code: 'MISSING_KEY',
        message: isCustom
          ? 'No custom endpoint URL configured. Open Settings to add one.'
          : `No ${provider.toUpperCase()} API key configured. Open Settings to add one.`,
        provider,
        model,
      },
    };
  }

  const apiKey = isCustom ? await getCustomKey() : key;
```

- [ ] **Step 5: Update provider call with correct API key**

```typescript
// Update line 118-123
    const text = await providerStrategy.rewrite({
      apiKey: isCustom ? (apiKey ?? '') : apiKey,
      model,
      systemPrompt,
      userPrompt: prompt,
      signal: combinedSignal,
    });
```

- [ ] **Step 6: Add CustomEndpointProvider import**

```typescript
// Add to imports at top
import { CustomEndpointProvider } from '../shared/providers/custom';
```

- [ ] **Step 7: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 9: Commit**

```bash
git add src/background/providerRouter.ts
git commit -m "feat: update router to handle new providers"
```

---

## Task 11: Update Settings HTML

**Files:**
- Modify: `src/settings/settings.html`

- [ ] **Step 1: Add new provider buttons to segmented control**

```html
<!-- Add after line 218 (Grok button) -->
              <button class="seg-btn" data-value="openrouter" type="button">OpenRouter</button>
              <button class="seg-btn" data-value="zai" type="button">Zai</button>
              <button class="seg-btn" data-value="anthropic" type="button">Claude</button>
              <button class="seg-btn" data-value="custom" type="button">Custom</button>
```

- [ ] **Step 2: Add OpenRouter provider card**

```html
<!-- Add after Grok card (before line 289) -->
        <div class="provider-card">
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-name">OpenRouter</div>
              <select id="openrouter-model" class="provider-model-select setting-select setting-select--sm"></select>
            </div>
            <span id="badge-openrouter" class="status-badge unconfigured">Not Configured</span>
          </div>
          <div class="provider-key-row">
            <input id="openrouter-key" type="password" class="key-input" placeholder="sk-or-..." autocomplete="off" spellcheck="false" />
          </div>
          <div class="provider-footer">
            <span class="provider-hint">Sent only to <code>openrouter.ai</code></span>
            <div class="provider-btns">
              <button id="btn-save-openrouter" class="btn btn-primary btn-sm" data-i18n="save" type="button">Save</button>
              <button id="btn-clear-openrouter" class="btn btn-ghost btn-sm" data-i18n="clear" type="button">Clear</button>
            </div>
          </div>
        </div>
```

- [ ] **Step 3: Add Zai provider card**

```html
        <div class="provider-card">
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-name">Zai</div>
              <select id="zai-model" class="provider-model-select setting-select setting-select--sm"></select>
            </div>
            <span id="badge-zai" class="status-badge unconfigured">Not Configured</span>
          </div>
          <div class="provider-key-row">
            <input id="zai-key" type="password" class="key-input" placeholder="zai-..." autocomplete="off" spellcheck="false" />
          </div>
          <div class="provider-footer">
            <span class="provider-hint">Sent only to <code>api.zai.ai</code></span>
            <div class="provider-btns">
              <button id="btn-save-zai" class="btn btn-primary btn-sm" data-i18n="save" type="button">Save</button>
              <button id="btn-clear-zai" class="btn btn-ghost btn-sm" data-i18n="clear" type="button">Clear</button>
            </div>
          </div>
        </div>
```

- [ ] **Step 4: Add Anthropic provider card**

```html
        <div class="provider-card">
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-name">Claude</div>
              <select id="anthropic-model" class="provider-model-select setting-select setting-select--sm"></select>
            </div>
            <span id="badge-anthropic" class="status-badge unconfigured">Not Configured</span>
          </div>
          <div class="provider-key-row">
            <input id="anthropic-key" type="password" class="key-input" placeholder="sk-ant-..." autocomplete="off" spellcheck="false" />
          </div>
          <div class="provider-footer">
            <span class="provider-hint">Sent only to <code>api.anthropic.com</code></span>
            <div class="provider-btns">
              <button id="btn-save-anthropic" class="btn btn-primary btn-sm" data-i18n="save" type="button">Save</button>
              <button id="btn-clear-anthropic" class="btn btn-ghost btn-sm" data-i18n="clear" type="button">Clear</button>
            </div>
          </div>
        </div>
```

- [ ] **Step 5: Add Custom Endpoint provider card**

```html
        <div class="provider-card">
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-name">Custom</div>
              <select id="custom-preset" class="provider-model-select setting-select setting-select--sm">
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>
            <span id="badge-custom" class="status-badge unconfigured">Not Configured</span>
          </div>
          <div class="provider-key-row">
            <input id="custom-endpoint" type="url" class="key-input" placeholder="http://localhost:11434/v1" autocomplete="off" spellcheck="false" />
          </div>
          <div class="provider-key-row">
            <input id="custom-key" type="password" class="key-input" placeholder="API key (optional)" autocomplete="off" spellcheck="false" />
          </div>
          <div class="provider-footer">
            <span class="provider-hint">For Ollama, LM Studio, or compatible APIs</span>
            <div class="provider-btns">
              <button id="btn-save-custom" class="btn btn-primary btn-sm" data-i18n="save" type="button">Save</button>
              <button id="btn-clear-custom" class="btn btn-ghost btn-sm" data-i18n="clear" type="button">Clear</button>
            </div>
          </div>
        </div>
```

- [ ] **Step 6: Commit**

```bash
git add src/settings/settings.html
git commit -m "feat: add UI for new providers"
```

---

## Task 12: Update Settings TypeScript

**Files:**
- Modify: `src/settings/settings.ts`

- [ ] **Step 1: Update imports**

```typescript
// Add to imports (after line 13)
import {
  getOpenRouterKey,
  saveOpenRouterKey,
  getZaiKey,
  saveZaiKey,
  getAnthropicKey,
  saveAnthropicKey,
  getCustomKey,
  saveCustomKey,
} from '../shared/storage';
```

- [ ] **Step 2: Update Provider type**

```typescript
// Replace line 18
type Provider = 'openai' | 'gemini' | 'grok' | 'openrouter' | 'zai' | 'anthropic' | 'custom';
```

- [ ] **Step 3: Add new refs**

```typescript
// Add to refs object (after line 53, before closing brace)
  openrouterModel: document.getElementById('openrouter-model') as HTMLSelectElement,
  zaiModel: document.getElementById('zai-model') as HTMLSelectElement,
  anthropicModel: document.getElementById('anthropic-model') as HTMLSelectElement,

  openrouterKey: document.getElementById('openrouter-key') as HTMLInputElement,
  zaiKey: document.getElementById('zai-key') as HTMLInputElement,
  anthropicKey: document.getElementById('anthropic-key') as HTMLInputElement,

  btnSaveOpenrouter: document.getElementById('btn-save-openrouter') as HTMLButtonElement,
  btnClearOpenrouter: document.getElementById('btn-clear-openrouter') as HTMLButtonElement,
  btnSaveZai: document.getElementById('btn-save-zai') as HTMLButtonElement,
  btnClearZai: document.getElementById('btn-clear-zai') as HTMLButtonElement,
  btnSaveAnthropic: document.getElementById('btn-save-anthropic') as HTMLButtonElement,
  btnClearAnthropic: document.getElementById('btn-clear-anthropic') as HTMLButtonElement,

  badgeOpenrouter: document.getElementById('badge-openrouter') as HTMLElement,
  badgeZai: document.getElementById('badge-zai') as HTMLElement,
  badgeAnthropic: document.getElementById('badge-anthropic') as HTMLElement,

  customPreset: document.getElementById('custom-preset') as HTMLSelectElement,
  customEndpoint: document.getElementById('custom-endpoint') as HTMLInputElement,
  customKey: document.getElementById('custom-key') as HTMLInputElement,
  btnSaveCustom: document.getElementById('btn-save-custom') as HTMLButtonElement,
  btnClearCustom: document.getElementById('btn-clear-custom') as HTMLButtonElement,
  badgeCustom: document.getElementById('badge-custom') as HTMLElement,
```

- [ ] **Step 4: Update populateSelect calls**

```typescript
// Add after line 418 (after grok populateSelect)
  populateSelect(refs.openrouterModel, PROVIDER_MODELS.openrouter, PROVIDER_MODELS.openrouter[0]);
  populateSelect(refs.zaiModel, PROVIDER_MODELS.zai, PROVIDER_MODELS.zai[0]);
  populateSelect(refs.anthropicModel, PROVIDER_MODELS.anthropic, PROVIDER_MODELS.anthropic[0]);
```

- [ ] **Step 5: Update loadFromSettings for new providers**

```typescript
// Add after line 310 (after grokModel.value = settings.grokModel)
  refs.openrouterModel.value = settings.openrouterModel;
  refs.zaiModel.value = settings.zaiModel;
  refs.anthropicModel.value = settings.anthropicModel;
  refs.customPreset.value = settings.customPreset;
  refs.customEndpoint.value = settings.customEndpoint;
```

- [ ] **Step 6: Update saveSettings for new providers**

```typescript
// Add to the settings object (after line 336, inside the object)
    openrouterModel: refs.openrouterModel.value,
    zaiModel: refs.zaiModel.value,
    anthropicModel: refs.anthropicModel.value,
    customEndpoint: refs.customEndpoint.value,
    customPreset: refs.customPreset.value as 'ollama' | 'lmstudio' | 'custom',
```

- [ ] **Step 7: Add event listeners for new provider save buttons**

```typescript
// Add after line 397 (after btnClearGrok listener)
refs.btnSaveOpenrouter.addEventListener('click', async () => {
  await saveOpenRouterKey(refs.openrouterKey.value);
  updateBadges();
  flash(refs.keysStatus);
});

refs.btnClearOpenrouter.addEventListener('click', async () => {
  refs.openrouterKey.value = '';
  await saveOpenRouterKey('');
  updateBadges();
});

refs.btnSaveZai.addEventListener('click', async () => {
  await saveZaiKey(refs.zaiKey.value);
  updateBadges();
  flash(refs.keysStatus);
});

refs.btnClearZai.addEventListener('click', async () => {
  refs.zaiKey.value = '';
  await saveZaiKey('');
  updateBadges();
});

refs.btnSaveAnthropic.addEventListener('click', async () => {
  await saveAnthropicKey(refs.anthropicKey.value);
  updateBadges();
  flash(refs.keysStatus);
});

refs.btnClearAnthropic.addEventListener('click', async () => {
  refs.anthropicKey.value = '';
  await saveAnthropicKey('');
  updateBadges();
});

refs.btnSaveCustom.addEventListener('click', async () => {
  await saveCustomKey(refs.customKey.value);
  await saveProviderSettings({
    customEndpoint: refs.customEndpoint.value,
    customPreset: refs.customPreset.value as 'ollama' | 'lmstudio' | 'custom',
  });
  updateBadges();
  flash(refs.keysStatus);
});

refs.btnClearCustom.addEventListener('click', async () => {
  refs.customKey.value = '';
  refs.customEndpoint.value = DEFAULT_SETTINGS.customEndpoint;
  await saveCustomKey('');
  await saveProviderSettings({
    customEndpoint: DEFAULT_SETTINGS.customEndpoint,
    customPreset: DEFAULT_SETTINGS.customPreset,
  });
  updateBadges();
});
```

- [ ] **Step 8: Update loadFromSettings to load keys for new providers**

```typescript
// Add after line 287 (after refs.grokKey.value = await getGrokKey())
  refs.openrouterKey.value = await getOpenRouterKey();
  refs.zaiKey.value = await getZaiKey();
  refs.anthropicKey.value = await getAnthropicKey();
  refs.customKey.value = await getCustomKey();
```

- [ ] **Step 9: Update updateBadges function**

```typescript
// Modify updateBadges function to include new providers (around line 280)
async function updateBadges(): Promise<void> {
  const keys = await Promise.all([
    getOpenAIKey(),
    getGeminiKey(),
    getGrokKey(),
    getOpenRouterKey(),
    getZaiKey(),
    getAnthropicKey(),
    getCustomKey(),
    chrome.storage.local.get(STORAGE_KEYS.SETTINGS).then(r => (r[STORAGE_KEYS.SETTINGS] as ProviderSettings | undefined)?.customEndpoint),
  ]);

  setBadge(refs.badgeOpenai, !!keys[0].trim());
  setBadge(refs.badgeGemini, !!keys[1].trim());
  setBadge(refs.badgeGrok, !!keys[2].trim());
  setBadge(refs.badgeOpenrouter, !!keys[3].trim());
  setBadge(refs.badgeZai, !!keys[4].trim());
  setBadge(refs.badgeAnthropic, !!keys[5].trim());
  setBadge(refs.badgeCustom, !!(keys[6].trim() || keys[7]?.trim()));

  const allConfigured = keys.slice(0, 6).some(k => k.trim());
  refs.navAiWarning.classList.toggle('hidden', allConfigured);
}
```

- [ ] **Step 10: Add custom preset change handler**

```typescript
// Add after wireSegmented call (around line 425)
refs.customPreset.addEventListener('change', (e) => {
  const preset = (e.target as HTMLSelectElement).value;
  const urls: Record<string, string> = {
    ollama: 'http://localhost:11434/v1',
    lmstudio: 'http://localhost:1234/v1',
    custom: '',
  };
  if (urls[preset]) {
    refs.customEndpoint.value = urls[preset];
  }
});
```

- [ ] **Step 11: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 12: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 13: Commit**

```bash
git add src/settings/settings.ts
git commit -m "feat: wire up new providers in settings UI"
```

---

## Task 13: Update i18n Translations

**Files:**
- Modify: `src/settings/i18n.ts`

- [ ] **Step 1: Add English translations for provider names**

Find the object with English translations (starts around line 17) and add provider names:

```typescript
// Add after grok related entries
    'provider-openrouter': 'OpenRouter',
    'provider-zai': 'Zai',
    'provider-anthropic': 'Claude',
    'provider-custom': 'Custom',
    'custom-preset-ollama': 'Ollama',
    'custom-preset-lmstudio': 'LM Studio',
    'custom-preset-custom': 'Custom URL',
```

- [ ] **Step 2: Add German translations**

Find the German translations object (starts around line 93) and add:

```typescript
// Add after grok related German entries
    'provider-openrouter': 'OpenRouter',
    'provider-zai': 'Zai',
    'provider-anthropic': 'Claude',
    'provider-custom': 'Benutzerdefiniert',
    'custom-preset-ollama': 'Ollama',
    'custom-preset-lmstudio': 'LM Studio',
    'custom-preset-custom': 'Benutzerdefinierte URL',
```

- [ ] **Step 3: Commit**

```bash
git add src/settings/i18n.ts
git commit -m "feat: add i18n for new providers"
```

---

## Task 14: Update Manifest Permissions

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Add host permissions for new providers**

```json
// Add to host_permissions array (after line 25)
    "https://openrouter.ai/*",
    "https://api.anthropic.com/*",
    "https://api.zai.ai/*",
    "http://localhost/*",
```

- [ ] **Step 2: Commit**

```bash
git add manifest.json
git commit -m "feat: add host permissions for new providers"
```

---

## Task 15: Final Build and Test

**Files:**
- All

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Build the extension**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 4: Load extension in Chrome for manual testing**

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `dist` folder

- [ ] **Step 5: Test each provider in Settings**

1. Open Sentō Settings
2. Go to AI Connections tab
3. Verify each new provider card appears
4. Test saving API keys for each provider
5. Verify status badges update correctly
6. Test custom endpoint presets (Ollama, LM Studio)
7. Test switching between providers

- [ ] **Step 6: Test actual rewrite with a mock provider**

For a quick smoke test without real API keys:
1. Select OpenRouter as provider
2. Try a rewrite (will fail with missing key, but confirms routing works)

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete additional AI providers integration"
```

---

## Self-Review Checklist

- [ ] **Spec coverage**: All spec requirements implemented
  - OpenRouter provider ✓
  - Zai provider ✓
  - Anthropic provider ✓
  - Custom endpoint with presets ✓
  - Type definitions updated ✓
  - Storage functions added ✓
  - Router updated ✓
  - UI cards added ✓
  - i18n translations added ✓
  - Manifest permissions added ✓

- [ ] **Placeholder scan**: No TBD, TODO, or incomplete steps
  - All code is complete
  - All file paths are exact
  - All commands are specific

- [ ] **Type consistency**: All types match across files
  - ProviderName union includes all 7 providers
  - ProviderSettings has all new fields
  - Storage keys match constants
  - Ref names in settings.ts match HTML IDs
