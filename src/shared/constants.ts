// Copyright (c) Artem Iagovdik

export const STORAGE_KEYS = {
  SETTINGS: 'apc_settings',
  OPENAI_KEY: 'apc_openai_key',
  GEMINI_KEY: 'apc_gemini_key',
  GROK_KEY: 'apc_grok_key',
  OPENROUTER_KEY: 'apc_openrouter_key',
  ZAI_KEY: 'apc_zai_key',
  ANTHROPIC_KEY: 'apc_anthropic_key',
  CUSTOM_KEY: 'apc_custom_key',
} as const;

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1', 'o1-mini', 'o1'],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  grok: ['grok-3-mini', 'grok-3', 'grok-4.1-fast'],
  openrouter: [
    'anthropic/claude-sonnet-4-6',
    'anthropic/claude-opus-4-6',
    'google/gemma-4-26b-a4b-it:free',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'openai/gpt-oss-120b:free',
  ],
  zai: ['zai-7b', 'zai-70b'],
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  custom: [
    'gemma4',
    'gemma3',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'llama4',
    'llama3.3',
    'qwen3.5',
    'deepseek-r1',
    'deepseek-v3',
    'phi4',
    'mistral',
    'kimi-k2',
    'glm-5',
  ],
};

export const DEFAULT_SYSTEM_PROMPT = `## Writing Humanizer

Rewrite the user's text with a clear, direct, natural voice. Strip AI-sounding phrasing. Preserve the original meaning.

## Rules
1. Clarity first. Prefer simple, concrete words over dense or abstract ones.
2. Be direct. Cut filler, hedging, and redundant statements.
3. Short sentences. Vary lengths for natural rhythm.
4. Active voice. "The team submitted the report" beats "The report was submitted."
5. No marketing hype or clichés. Drop "dive into," "unleash," "leverage," "streamline," "game-changing."
6. No forced friendliness or exaggeration.
7. Conversational is fine. Starting with "And" or "But" is fine.
8. Hedge only when the text is genuinely uncertain. Avoid reflexive "could," "might," "may."
9. No em dashes. Use commas or colons.
10. No emojis, hashtags, semicolons, or asterisks unless the source already uses them.
11. Keep "you" and "your" when the source addresses the reader directly.
12. Mirror the source language by default. Respond in whatever language the input uses, unless the task explicitly asks you to translate.

## Output
Return only the rewritten text. Keep a single consistent voice. Use the fewest words needed without losing meaning.`;

export const DEFAULT_SETTINGS = {
  defaultTemplateId: 'auto_fix',
  llmProvider: 'openai',
  openaiModel: 'gpt-4o-mini',
  geminiModel: 'gemini-2.5-flash',
  grokModel: 'grok-3-mini',
  openrouterModel: 'anthropic/claude-sonnet-4-6',
  zaiModel: 'zai-7b',
  anthropicModel: 'claude-sonnet-4-6',
  customEndpoint: 'http://localhost:11434',
  customUseAuth: false,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  showPillLabels: true,
  forceInsert: false,
  language: 'en',
  siteListMode: 'all',
  siteList: [] as string[],
} as const;

export const MAX_SELECTION_CHARS = 12000;

export const REQUEST_TIMEOUT_MS = 30000;

export const CUSTOM_REQUEST_TIMEOUT_MS = 180000;
