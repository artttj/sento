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
      'Fix all grammar, spelling, and punctuation errors. Improve clarity where the meaning is ambiguous. Keep the original tone, voice, and intent. Do not add new ideas, remove content, or change the level of formality. If the text is already correct, return it unchanged.',
  },
  {
    id: 'professional',
    label: 'Pro',
    instruction:
      'Rewrite in a clear, professional tone suitable for business communication. Be direct and specific. Remove filler words and vague language. Use active voice. Keep sentences short. Maintain the original intent and all key details. Do not sound robotic or overly formal.',
  },
  {
    id: 'custom',
    label: 'Mine',
    instruction:
      'Rewrite the text according to the custom instruction provided by the user. If no custom instruction is set, improve the text for clarity and readability while keeping the original meaning.',
  },
  {
    id: 'shorten',
    label: 'Trim',
    instruction:
      'Cut the text length by at least 40%. Keep every essential fact, action item, and decision. Remove redundancy, qualifiers, and filler. Prefer short sentences. If the text contains a list, keep the list but tighten each item. Do not drop important context.',
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

export function buildRewritePrompt(input: { templateId: RewriteTemplateId; text: string; url?: string; title?: string; instructionOverride?: string; language?: string }): string {
  const template = getTemplate(input.templateId);
  const instruction = input.instructionOverride?.trim() || template.instruction;
  const context = [
    input.title ? `Title: ${input.title}` : '',
    input.url ? `URL: ${input.url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const langNote = input.language && input.language !== 'en'
    ? `Write the output in the same language as the original text. If the original is in ${input.language === 'de' ? 'German' : input.language}, respond in that language.`
    : '';

  return [
    `Task: ${instruction}`,
    'Return only the rewritten text. Do not include commentary, quotes, markdown fences, or explanations.\nPreserve the original formatting structure: keep line breaks, bullet points, numbered lists, and paragraph spacing intact.',
    langNote,
    context ? `Context:\n${context}` : '',
    'Original text:',
    input.text,
  ]
    .filter(Boolean)
    .join('\n\n');
}
