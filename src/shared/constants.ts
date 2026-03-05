export const STORAGE_KEYS = {
  SETTINGS: 'apc_settings',
  OPENAI_KEY: 'apc_openai_key',
  GEMINI_KEY: 'apc_gemini_key',
  GROK_KEY: 'apc_grok_key',
} as const;

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1'],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  grok: ['grok-3-mini', 'grok-3'],
};

export const DEFAULT_SETTINGS = {
  defaultTemplateId: 'auto_fix',
  llmProvider: 'openai',
  openaiModel: 'gpt-4.1-mini',
  geminiModel: 'gemini-2.5-flash',
  grokModel: 'grok-3-mini',
  theme: 'dark',
  systemPrompt: '',
} as const;

export const MAX_SELECTION_CHARS = 12000;

export const REQUEST_TIMEOUT_MS = 30000;
