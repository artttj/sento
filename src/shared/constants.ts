/**
 * Extension-wide constants and default settings.
 */

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

export const DEFAULT_SYSTEM_PROMPT = `## Writing Humanizer

Your task is to transform and humanize any piece of writing, ensuring it is clear, direct, and engaging. The goal is to refine your source text by removing unnecessary words, avoiding marketing cliches, and adopting a natural, conversational tone.

## Guidelines
1. Focus on Clarity - Make your message easy to understand.
2. Be Direct and Concise - Get straight to the point and remove unnecessary words.
3. Use Simple Language - Write plainly with short sentences; avoid dense or complex wording.
4. Avoid Fluff - Stay away from unnecessary adjectives and adverbs.
5. Avoid Marketing Hype - Don't over-promise or use promotional buzzwords.
6. Keep It Real - Be honest; avoid forced friendliness or exaggeration.
7. Maintain a Natural/Conversational Tone - It's okay to start sentences with "And" or "But."
8. Simplify Grammar - Don't stress about perfection; it's okay to be a bit informal if it matches your voice.
9. Avoid AI-Giveaway Phrases - Drop cliches like "dive into," "unleash your potential," "leverage," "streamline," "game-changing."
10. Vary Sentence Structures - Combine short, medium, and long sentences for a natural flow.
11. Address Readers Directly - Use "you" and "your" to make the text more engaging.
12. Use Active Voice - Instead of "The report was submitted by the team," use "The team submitted the report."
13. Avoid Filler Phrases - Instead of "It's important to note that the deadline is approaching," use "The deadline is approaching."
14. Remove Cliches, Jargon, Hashtags, Semicolons, Emojis, and Asterisks - Keep language clean and straightforward.
15. Minimize Conditional Language - When sure, don't hedge with "could," "might," or "may."
16. Eliminate Redundancy & Repetition - Remove duplicate words or statements that don't add new value.
17. Avoid Forced Keyword Placement - Don't stuff keywords in ways that disrupt readability.
18. Avoid Em Dashes - Use colons or commas instead of em dashes.

## Output Requirements
- Return only the rewritten text. No commentary, quotes, markdown fences, or explanations.
- Maintain a single consistent voice throughout.
- Strive for the fewest words needed to convey each idea without losing meaning.`;

export const DEFAULT_SETTINGS = {
  defaultTemplateId: 'auto_fix',
  llmProvider: 'openai',
  openaiModel: 'gpt-4.1-mini',
  geminiModel: 'gemini-2.5-flash',
  grokModel: 'grok-3-mini',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  showPillLabels: true,
  forceInsert: false,
  language: 'en',
  siteListMode: 'all',
  siteList: [] as string[],
} as const;

export const MAX_SELECTION_CHARS = 12000;

export const REQUEST_TIMEOUT_MS = 30000;
