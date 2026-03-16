// Copyright (c) Artem Iagovdik

import { ProviderBadResponseError, ProviderHttpError } from './errors';

export interface CompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function parseProviderResponse(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as CompletionResponse;

  if (!res.ok) {
    throw new ProviderHttpError(res.status, body.error?.message ?? `HTTP ${res.status}`);
  }

  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new ProviderBadResponseError('Provider returned an empty rewrite result.');
  }

  return text;
}
