// Copyright (c) Artem Iagovdik

import type { RewriteRequestPayload, RewriteResponsePayload, RewriteErrorPayload } from './types';

export const MSG = {
  REWRITE_REQUEST: 'REWRITE_REQUEST',
  REWRITE_ABORT: 'REWRITE_ABORT',
  OPEN_SETTINGS: 'OPEN_SETTINGS',
  REWRITE_SUCCESS: 'REWRITE_SUCCESS',
  REWRITE_ERROR: 'REWRITE_ERROR',
} as const;

export interface RewriteRequestMessage {
  type: typeof MSG.REWRITE_REQUEST;
  payload: RewriteRequestPayload;
}

export interface RewriteAbortMessage {
  type: typeof MSG.REWRITE_ABORT;
  requestId: string;
}

export interface OpenSettingsMessage {
  type: typeof MSG.OPEN_SETTINGS;
}

export type RuntimeMessage = RewriteRequestMessage | RewriteAbortMessage | OpenSettingsMessage;

export interface RewriteSuccessResult {
  ok: true;
  type: typeof MSG.REWRITE_SUCCESS;
  payload: RewriteResponsePayload;
}

export interface RewriteErrorResult {
  ok: false;
  type: typeof MSG.REWRITE_ERROR;
  error: RewriteErrorPayload;
}

export type RewriteRuntimeResult = RewriteSuccessResult | RewriteErrorResult;
