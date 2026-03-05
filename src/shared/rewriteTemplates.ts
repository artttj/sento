import type { RewriteTemplateId } from './types';

export interface RewriteTemplate {
  id: RewriteTemplateId;
  label: string;
  instruction: string;
}

export const REWRITE_TEMPLATES: RewriteTemplate[] = [
  {
    id: 'auto_fix',
    label: 'Auto-Fix',
    instruction:
      'Fix grammar, spelling, punctuation, and clarity while preserving the original meaning and tone.',
  },
  {
    id: 'professional',
    label: 'Professional',
    instruction:
      'Rewrite in a polished professional tone that is concise, courteous, and specific.',
  },
  {
    id: 'technical',
    label: 'Technical',
    instruction:
      'Rewrite in a precise technical style with clear structure and unambiguous terminology.',
  },
  {
    id: 'shorten',
    label: 'Shorten',
    instruction:
      'Rewrite to be significantly shorter while preserving key intent, facts, and action items.',
  },
];

const templateMap = new Map(REWRITE_TEMPLATES.map((template) => [template.id, template]));

export function getTemplate(id: RewriteTemplateId): RewriteTemplate {
  return templateMap.get(id) ?? REWRITE_TEMPLATES[0];
}

export function buildRewritePrompt(input: { templateId: RewriteTemplateId; text: string; url?: string; title?: string }): string {
  const template = getTemplate(input.templateId);
  const context = [
    input.title ? `Title: ${input.title}` : '',
    input.url ? `URL: ${input.url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    `Task: ${template.instruction}`,
    'Return only the rewritten text. Do not include commentary, quotes, markdown fences, or explanations.',
    context ? `Context:\n${context}` : '',
    'Original text:',
    input.text,
  ]
    .filter(Boolean)
    .join('\n\n');
}
