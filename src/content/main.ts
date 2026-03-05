import { RewriteController } from './rewriteController';

const controller = new RewriteController();

void controller.start().catch((error: unknown) => {
  console.error('[Sentō] failed to initialize content script', error);
});
