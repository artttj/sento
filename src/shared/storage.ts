// Copyright (c) Artem Iagovdik

import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';
import type { AppLanguage, ProviderName, ProviderSettings, RewriteTemplateId, SiteListMode } from './types';

function isProviderName(value: string): value is ProviderName {
  return value === 'openai' || value === 'gemini' || value === 'grok';
}

function isRewriteTemplateId(value: string): value is RewriteTemplateId {
  return value === 'auto_fix' || value === 'professional' || value === 'custom' || value === 'shorten';
}

function isSiteListMode(value: string): value is SiteListMode {
  return value === 'all' || value === 'allowlist' || value === 'blocklist';
}

function isAppLanguage(value: string): value is AppLanguage {
  return value === 'en' || value === 'de';
}

/**
 * Loads provider settings from chrome.storage.local with validation.
 * Falls back to defaults for missing or invalid values.
 */
export async function getProviderSettings(): Promise<ProviderSettings> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const raw = (stored[STORAGE_KEYS.SETTINGS] as Partial<ProviderSettings> | undefined) ?? {};

  const rawProvider = raw.llmProvider;
  const provider: ProviderName = rawProvider && isProviderName(rawProvider) ? rawProvider : DEFAULT_SETTINGS.llmProvider;

  const rawTemplateId = raw.defaultTemplateId;
  const defaultTemplateId: RewriteTemplateId =
    rawTemplateId && isRewriteTemplateId(rawTemplateId) ? rawTemplateId : DEFAULT_SETTINGS.defaultTemplateId;

  const rawSiteMode = raw.siteListMode;
  const siteListMode: SiteListMode = rawSiteMode && isSiteListMode(rawSiteMode) ? rawSiteMode : DEFAULT_SETTINGS.siteListMode;

  return {
    defaultTemplateId,
    llmProvider: provider,
    openaiModel: raw.openaiModel ?? DEFAULT_SETTINGS.openaiModel,
    geminiModel: raw.geminiModel ?? DEFAULT_SETTINGS.geminiModel,
    grokModel: raw.grokModel ?? DEFAULT_SETTINGS.grokModel,
    systemPrompt: raw.systemPrompt ?? DEFAULT_SETTINGS.systemPrompt,
    templateConfigs: raw.templateConfigs,
    templateOrder: Array.isArray(raw.templateOrder) ? raw.templateOrder : undefined,
    showPillLabels: raw.showPillLabels ?? DEFAULT_SETTINGS.showPillLabels,
    forceInsert: raw.forceInsert ?? DEFAULT_SETTINGS.forceInsert,
    language: (raw.language && isAppLanguage(raw.language)) ? raw.language : DEFAULT_SETTINGS.language,
    siteListMode,
    siteList: Array.isArray(raw.siteList) ? raw.siteList : [...DEFAULT_SETTINGS.siteList],
  };
}

/**
 * Merges partial settings into existing settings and persists to storage.
 */
export async function saveProviderSettings(partial: Partial<ProviderSettings>): Promise<void> {
  const current = await getProviderSettings();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: {
      ...current,
      ...partial,
    },
  });
}

export async function getOpenAIKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OPENAI_KEY);
  return (result[STORAGE_KEYS.OPENAI_KEY] as string | undefined) ?? '';
}

export async function saveOpenAIKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OPENAI_KEY]: key });
}

export async function getGeminiKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GEMINI_KEY);
  return (result[STORAGE_KEYS.GEMINI_KEY] as string | undefined) ?? '';
}

export async function saveGeminiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GEMINI_KEY]: key });
}

export function isSiteAllowed(settings: ProviderSettings, hostname: string): boolean {
  if (settings.siteListMode === 'all') return true;

  const normalizedHost = hostname.toLowerCase();
  const matches = settings.siteList.some((pattern) => {
    const p = pattern.toLowerCase().trim();
    if (!p) return false;
    if (p.startsWith('*.')) {
      const suffix = p.slice(2);
      return normalizedHost === suffix || normalizedHost.endsWith(`.${suffix}`);
    }
    return normalizedHost === p;
  });

  return settings.siteListMode === 'allowlist' ? matches : !matches;
}

export async function getGrokKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GROK_KEY);
  return (result[STORAGE_KEYS.GROK_KEY] as string | undefined) ?? '';
}

export async function saveGrokKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GROK_KEY]: key });
}
