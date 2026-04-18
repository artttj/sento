import { describe, expect, it } from 'vitest';
import { getOrderedTemplates, getTemplate, buildRewritePrompt, REWRITE_TEMPLATES } from './rewriteTemplates';
import type { RewriteTemplateId } from './types';

describe('REWRITE_TEMPLATES', () => {
  it('contains all expected template ids', () => {
    const ids = REWRITE_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(['auto_fix', 'professional', 'custom', 'translate']);
  });

  it('all templates have non-empty instructions', () => {
    for (const tpl of REWRITE_TEMPLATES) {
      expect(tpl.instruction.length).toBeGreaterThan(0);
      expect(tpl.label.length).toBeGreaterThan(0);
    }
  });
});

describe('getOrderedTemplates', () => {
  it('returns default order when no order specified', () => {
    const templates = getOrderedTemplates();
    expect(templates.map((t) => t.id)).toEqual(['auto_fix', 'professional', 'custom', 'translate']);
  });

  it('returns default order when order is empty', () => {
    const templates = getOrderedTemplates([]);
    expect(templates.map((t) => t.id)).toEqual(['auto_fix', 'professional', 'custom', 'translate']);
  });

  it('returns reordered templates', () => {
    const templates = getOrderedTemplates(['translate', 'auto_fix']);
    expect(templates.map((t) => t.id)).toEqual(['translate', 'auto_fix', 'professional', 'custom']);
  });

  it('handles partial order', () => {
    const templates = getOrderedTemplates(['professional']);
    expect(templates.map((t) => t.id)).toEqual(['professional', 'auto_fix', 'custom', 'translate']);
  });

  it('ignores invalid template ids', () => {
    const templates = getOrderedTemplates(['invalid', 'auto_fix'] as RewriteTemplateId[]);
    expect(templates.map((t) => t.id)).toEqual(['auto_fix', 'professional', 'custom', 'translate']);
  });
});

describe('getTemplate', () => {
  it('returns correct template for valid id', () => {
    const tpl = getTemplate('auto_fix');
    expect(tpl.id).toBe('auto_fix');
    expect(tpl.label).toBe('Fix');
  });

  it('returns first template for invalid id', () => {
    const tpl = getTemplate('invalid' as RewriteTemplateId);
    expect(tpl.id).toBe('auto_fix');
  });
});

describe('buildRewritePrompt', () => {
  it('includes task with instruction', () => {
    const prompt = buildRewritePrompt({ templateId: 'auto_fix', text: 'Hello' });
    expect(prompt).toContain('Task: Correct grammar');
  });

  it('includes original text', () => {
    const prompt = buildRewritePrompt({ templateId: 'auto_fix', text: 'Original content here' });
    expect(prompt).toContain('Original text:');
    expect(prompt).toContain('Original content here');
  });

  it('includes context when provided', () => {
    const prompt = buildRewritePrompt({
      templateId: 'auto_fix',
      text: 'Hello',
      url: 'https://example.com',
      title: 'Page Title',
    });
    expect(prompt).toContain('Title: Page Title');
    expect(prompt).toContain('URL: https://example.com');
  });

  it('excludes context when not provided', () => {
    const prompt = buildRewritePrompt({ templateId: 'auto_fix', text: 'Hello' });
    expect(prompt).not.toContain('Title:');
    expect(prompt).not.toContain('URL:');
  });

  it('uses instructionOverride when provided', () => {
    const prompt = buildRewritePrompt({
      templateId: 'auto_fix',
      text: 'Hello',
      instructionOverride: 'Custom instruction here',
    });
    expect(prompt).toContain('Task: Custom instruction here');
    expect(prompt).not.toContain('Fix all grammar');
  });

  it('always includes source-language directive', () => {
    const prompt = buildRewritePrompt({ templateId: 'auto_fix', text: 'Привет' });
    expect(prompt).toContain('same language as the original text');
  });

  it('includes output requirements', () => {
    const prompt = buildRewritePrompt({ templateId: 'auto_fix', text: 'Hello' });
    expect(prompt).toContain('Return only the rewritten text');
    expect(prompt).toContain('Preserve the original formatting');
  });
});