// Copyright (c) Artem Iagovdik

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZaiProvider } from './zai';

const fetchMock = vi.fn();

describe('ZaiProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('uses correct Zai API endpoint', async () => {
    const provider = new ZaiProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'response' } }] }),
    });

    await provider.rewrite({
      apiKey: 'zai-test-key',
      model: 'glm-5',
      userPrompt: 'test prompt',
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.zai.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('includes Zai authorization header', async () => {
    const provider = new ZaiProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: 'zai-key-123',
      model: 'glm-4.7',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers).toMatchObject({
      'Authorization': 'Bearer zai-key-123',
    });
  });

  it('sends correct request body structure', async () => {
    const provider = new ZaiProvider();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'output' } }] }),
    });

    await provider.rewrite({
      apiKey: 'key',
      model: 'kimi-k2',
      systemPrompt: 'You are a helpful assistant.',
      userPrompt: 'Hello',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);

    expect(body).toMatchObject({
      model: 'kimi-k2',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.3,
    });
  });

  it('handles error responses', async () => {
    const provider = new ZaiProvider();
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    });

    await expect(provider.rewrite({
      apiKey: 'invalid',
      model: 'test',
      userPrompt: 'test',
      signal: new AbortController().signal,
    })).rejects.toThrow();
  });
});
