// Copyright (c) Artem Iagovdik

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomEndpointProvider } from './custom';

const fetchMock = vi.fn();

describe('CustomEndpointProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('uses provided base URL', async () => {
    const provider = new CustomEndpointProvider('http://localhost:8080/v1');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'rewritten' } }] }),
    });

    await provider.rewrite({
      apiKey: 'test-key',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/v1/api/chat',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes auth header when apiKey provided and includeAuth is true', async () => {
    const provider = new CustomEndpointProvider('http://localhost:11434/v1', true);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: 'my-key',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers).toMatchObject({
      'Authorization': 'Bearer my-key',
    });
  });

  it('omits auth header when apiKey is empty', async () => {
    const provider = new CustomEndpointProvider('http://localhost:11434/v1', true);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: '',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers?.Authorization).toBeUndefined();
  });

  it('omits auth header when includeAuth is false', async () => {
    const provider = new CustomEndpointProvider('http://localhost:11434/v1', false);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result' } }] }),
    });

    await provider.rewrite({
      apiKey: 'my-key',
      model: 'llama3',
      userPrompt: 'test',
      signal: new AbortController().signal,
    });

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1]?.headers?.Authorization).toBeUndefined();
  });
});
