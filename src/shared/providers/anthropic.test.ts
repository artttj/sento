// Copyright (c) Artem Iagovdik

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from './anthropic';

const fetchMock = vi.fn();

describe('AnthropicProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('uses correct Anthropic API endpoint', async () => {
    const provider = new AnthropicProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: 'response' }] }),
    });

    await provider.rewrite({
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-6',
      userPrompt: 'test prompt',
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('includes Anthropic-specific headers', async () => {
    const provider = new AnthropicProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: 'result' }] }),
    });

    await provider.rewrite({
      apiKey: 'sk-ant-key-123',
      model: 'claude-opus-4-6',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers).toMatchObject({
      'x-api-key': 'sk-ant-key-123',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    });
  });

  it('sends correct Anthropic message format', async () => {
    const provider = new AnthropicProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: 'output' }] }),
    });

    await provider.rewrite({
      apiKey: 'key',
      model: 'claude-haiku-4-5',
      systemPrompt: 'You are a helpful assistant.',
      userPrompt: 'Hello',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);

    expect(body).toMatchObject({
      model: 'claude-haiku-4-5',
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 4096,
      temperature: 0.3,
    });
  });

  it('handles error responses', async () => {
    const provider = new AnthropicProvider();
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

  it('parses Anthropic response format correctly', async () => {
    const provider = new AnthropicProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: '  rewritten text  ' }],
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
    const provider = new AnthropicProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: '' }] }),
    });

    await expect(provider.rewrite({
      apiKey: 'key',
      model: 'test',
      userPrompt: 'test',
      signal: new AbortController().signal,
    })).rejects.toThrow('empty rewrite result');
  });

  it('throws on missing content in response', async () => {
    const provider = new AnthropicProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [] }),
    });

    await expect(provider.rewrite({
      apiKey: 'key',
      model: 'test',
      userPrompt: 'test',
      signal: new AbortController().signal,
    })).rejects.toThrow('empty rewrite result');
  });
});
