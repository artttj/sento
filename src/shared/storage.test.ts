import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { isSiteAllowed } from './storage';
import type { ProviderSettings } from './types';

vi.mock('./constants', () => ({
  STORAGE_KEYS: {
    SETTINGS: 'apc_settings',
    OPENAI_KEY: 'apc_openai_key',
    GEMINI_KEY: 'apc_gemini_key',
    GROK_KEY: 'apc_grok_key',
  },
  DEFAULT_SETTINGS: {
    defaultTemplateId: 'auto_fix',
    llmProvider: 'openai',
    openaiModel: 'gpt-4.1-mini',
    geminiModel: 'gemini-2.5-flash',
    grokModel: 'grok-3-mini',
    systemPrompt: 'test',
    showPillLabels: true,
    forceInsert: false,
    language: 'en',
    siteListMode: 'all',
    siteList: [],
  },
}));

describe('isSiteAllowed', () => {
  const createSettings = (mode: ProviderSettings['siteListMode'], list: string[]): ProviderSettings => ({
    defaultTemplateId: 'auto_fix',
    llmProvider: 'openai',
    openaiModel: 'gpt-4.1-mini',
    geminiModel: 'gemini-2.5-flash',
    grokModel: 'grok-3-mini',
    siteListMode: mode,
    siteList: list,
    showPillLabels: true,
    forceInsert: false,
    language: 'en',
  });

  describe('mode: all', () => {
    it('allows all sites', () => {
      const settings = createSettings('all', []);
      expect(isSiteAllowed(settings, 'example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'any.site.com')).toBe(true);
    });
  });

  describe('mode: allowlist', () => {
    it('allows only listed sites', () => {
      const settings = createSettings('allowlist', ['example.com', 'test.org']);
      expect(isSiteAllowed(settings, 'example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'test.org')).toBe(true);
      expect(isSiteAllowed(settings, 'other.com')).toBe(false);
    });

    it('matches subdomains with wildcard', () => {
      const settings = createSettings('allowlist', ['*.example.com']);
      expect(isSiteAllowed(settings, 'sub.example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'deep.sub.example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'other.com')).toBe(false);
    });

    it('is case-insensitive', () => {
      const settings = createSettings('allowlist', ['Example.COM']);
      expect(isSiteAllowed(settings, 'example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'EXAMPLE.COM')).toBe(true);
    });

    it('ignores empty patterns', () => {
      const settings = createSettings('allowlist', ['', 'example.com', '   ']);
      expect(isSiteAllowed(settings, 'example.com')).toBe(true);
      expect(isSiteAllowed(settings, 'other.com')).toBe(false);
    });
  });

  describe('mode: blocklist', () => {
    it('blocks listed sites', () => {
      const settings = createSettings('blocklist', ['blocked.com']);
      expect(isSiteAllowed(settings, 'blocked.com')).toBe(false);
      expect(isSiteAllowed(settings, 'allowed.com')).toBe(true);
    });

    it('matches subdomains with wildcard', () => {
      const settings = createSettings('blocklist', ['*.blocked.com']);
      expect(isSiteAllowed(settings, 'sub.blocked.com')).toBe(false);
      expect(isSiteAllowed(settings, 'allowed.com')).toBe(true);
    });

    it('is case-insensitive', () => {
      const settings = createSettings('blocklist', ['BLOCKED.COM']);
      expect(isSiteAllowed(settings, 'blocked.com')).toBe(false);
    });
  });
});