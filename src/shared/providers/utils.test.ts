import { describe, expect, it } from 'vitest';
import { buildMessages, parseProviderResponse } from './utils';
import { ProviderBadResponseError, ProviderHttpError } from './errors';

describe('buildMessages', () => {
  it('returns user message only when no system prompt', () => {
    const messages = buildMessages(undefined, 'Hello world');
    expect(messages).toEqual([{ role: 'user', content: 'Hello world' }]);
  });

  it('returns user message only when system prompt is empty', () => {
    const messages = buildMessages('', 'Hello world');
    expect(messages).toEqual([{ role: 'user', content: 'Hello world' }]);
  });

  it('returns user message only when system prompt is whitespace', () => {
    const messages = buildMessages('   ', 'Hello world');
    expect(messages).toEqual([{ role: 'user', content: 'Hello world' }]);
  });

  it('returns both messages when system prompt is provided', () => {
    const messages = buildMessages('You are helpful.', 'Hello');
    expect(messages).toEqual([
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hello' },
    ]);
  });

  it('trims system prompt whitespace', () => {
    const messages = buildMessages('  You are helpful.  ', 'Hello');
    expect(messages).toEqual([
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hello' },
    ]);
  });
});

describe('parseProviderResponse', () => {
  it('returns text from successful response', async () => {
    const res = new Response(JSON.stringify({ choices: [{ message: { content: 'Rewritten text' } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await parseProviderResponse(res);
    expect(result).toBe('Rewritten text');
  });

  it('trims whitespace from response', async () => {
    const res = new Response(JSON.stringify({ choices: [{ message: { content: '  text  ' } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await parseProviderResponse(res);
    expect(result).toBe('text');
  });

  it('throws ProviderHttpError for non-OK status', async () => {
    const res = new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
    await expect(parseProviderResponse(res)).rejects.toThrow(ProviderHttpError);
    await expect(parseProviderResponse(res)).rejects.toMatchObject({ status: 401 });
  });

  it('throws ProviderBadResponseError for empty content', async () => {
    const res = new Response(JSON.stringify({ choices: [{ message: { content: '' } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    await expect(parseProviderResponse(res)).rejects.toThrow(ProviderBadResponseError);
  });

  it('throws ProviderBadResponseError for missing choices', async () => {
    const res = new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    await expect(parseProviderResponse(res)).rejects.toThrow(ProviderBadResponseError);
  });
});