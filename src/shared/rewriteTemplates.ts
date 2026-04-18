// Copyright (c) Artem Iagovdik

import type { RewriteTemplateId } from './types';

export interface RewriteTemplate {
  id: RewriteTemplateId;
  label: string;
  instruction: string;
}

export const REWRITE_TEMPLATES: RewriteTemplate[] = [
  {
    id: 'auto_fix',
    label: 'Fix',
    instruction:
      'Correct grammar, spelling, and punctuation. Resolve ambiguous phrasing only when the meaning is unclear. Preserve the original tone, voice, formality, and intent. Do not add or remove ideas. Return the text unchanged if it has no errors.',
  },
  {
    id: 'professional',
    label: 'Pro',
    instruction:
      'Rewrite in a polished business tone. Use active voice, short sentences, and specific language. Cut filler and hedging. Preserve intent and every key detail. Stay conversational, not stiff or corporate.',
  },
  {
    id: 'custom',
    label: 'Mine',
    instruction:
      "Follow the user's custom instruction. If none is provided, improve clarity and readability while preserving meaning.",
  },
  {
    id: 'shorten',
    label: 'Trim',
    instruction:
      'Cut length by at least 40%. Keep every fact, action item, and decision. Remove redundancy, qualifiers, and filler. Prefer short sentences. In lists, keep every item but tighten each one.',
  },
];

const templateMap = new Map(REWRITE_TEMPLATES.map((template) => [template.id, template]));

export function getOrderedTemplates(order?: RewriteTemplateId[]): RewriteTemplate[] {
  if (!order || order.length === 0) return REWRITE_TEMPLATES;
  const ordered = order
    .map((id) => templateMap.get(id))
    .filter((t): t is RewriteTemplate => t !== undefined);
  const missing = REWRITE_TEMPLATES.filter((t) => !order.includes(t.id));
  return [...ordered, ...missing];
}

export function getTemplate(id: RewriteTemplateId): RewriteTemplate {
  return templateMap.get(id) ?? REWRITE_TEMPLATES[0];
}

export function buildRewritePrompt(input: { templateId: RewriteTemplateId; text: string; url?: string; title?: string; instructionOverride?: string }): string {
  const template = getTemplate(input.templateId);
  const instruction = input.instructionOverride?.trim() || template.instruction;
  const context = [
    input.title ? `Title: ${input.title}` : '',
    input.url ? `URL: ${input.url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    `Task: ${instruction}`,
    'Write the output in the same language as the original text.',
    'Return only the rewritten text. Do not include commentary, quotes, markdown fences, or explanations.\nPreserve the original formatting structure: keep line breaks, bullet points, numbered lists, and paragraph spacing intact.',
    context ? `Context:\n${context}` : '',
    'Original text:',
    input.text,
  ]
    .filter(Boolean)
    .join('\n\n');
}
