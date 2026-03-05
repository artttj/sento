/**
 * Background service worker. Listens for rewrite messages and routes them to the AI provider.
 */

import { MSG, type RuntimeMessage } from '../shared/messages';
import { rewriteWithProvider } from './providerRouter';

const controllers = new Map<string, AbortController>();

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  if (message.type === MSG.OPEN_SETTINGS) {
    void chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return;
  }

  if (message.type === MSG.REWRITE_ABORT) {
    const controller = controllers.get(message.requestId);
    controller?.abort();
    controllers.delete(message.requestId);
    sendResponse({ ok: true });
    return;
  }

  if (message.type !== MSG.REWRITE_REQUEST) {
    return;
  }

  const controller = new AbortController();
  controllers.set(message.payload.requestId, controller);

  void (async () => {
    try {
      const result = await rewriteWithProvider(message.payload, controller.signal);
      if (result.ok) {
        sendResponse({
          ok: true,
          type: MSG.REWRITE_SUCCESS,
          payload: result.payload,
        });
      } else {
        sendResponse({
          ok: false,
          type: MSG.REWRITE_ERROR,
          error: result.error,
        });
      }
    } finally {
      controllers.delete(message.payload.requestId);
    }
  })();

  return true;
});
