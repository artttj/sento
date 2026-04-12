// Copyright (c) Artem Iagovdik

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterProvider } from './openrouter';

const fetchMock = vi.fn();

describe('OpenRouterProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    globalThis.chrome = {
      runtime: {
        getURL: vi.fn(() => 'https://example.com'),
      },
    } as any;
  });

  it('uses correct base URL and endpoint', async () => {
    const provider = new OpenRouterProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'response' } }] }),
    });

    await provider.rewrite({
      apiKey: 'sk-or-test',
      model: 'anthropic/claude-sonnet-4-6',
      userPrompt: 'test prompt',
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('includes OpenRouter authorization header', async () => {
    const provider = new OpenRouterProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: 'sk-or-test-key',
      model: 'google/gemma-4-26b-a4b-it:free',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers).toMatchObject({
      'Authorization': 'Bearer sk-or-test-key',
      'HTTP-Referer': expect.any(String),
    });
  });

  it('sends correct request body structure', async () => {
    const provider = new OpenRouterProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'output' } }] }),
    });

    await provider.rewrite({
      apiKey: 'key',
      model: 'meta-llama/llama-3.3-70b-instruct',
      systemPrompt: 'You are a helpful assistant.',
      userPrompt: 'Hello',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);

    expect(body).toMatchObject({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.3,
    });
  });

  it('handles error responses', async () => {
    const provider = new OpenRouterProvider();
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
    });

    await expect(provider.rewrite({
      apiKey: 'invalid',
      model: 'test',
      userPrompt: 'test',
      signal: new AbortController().signal,
    })).rejects.toThrow();
  });

  it('parses response content correctly', async () => {
    const provider = new OpenRouterProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '  rewritten text  ' } }],
      }),
    });

    const result = await provider.rewrite({
      apiKey: 'key',
      model: 'test',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    expect(result).toBe('rewritten text');
  });

  it('throws on empty response content', async () => {
    const provider = new OpenRouterProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '' } }] }),
    });

    await expect(provider.rewrite({
      apiKey: 'key',
      model: 'test',
      userPrompt: 'test',
      signal: new AbortController().signal,
    })).rejects.toThrow('empty rewrite result');
  });
});
