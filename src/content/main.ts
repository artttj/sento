// Copyright (c) Artem Iagovdik

import { getProviderSettings, isSiteAllowed } from '../shared/storage';
import { RewriteController } from './rewriteController';

async function boot(): Promise<void> {
  const settings = await getProviderSettings();
  if (!isSiteAllowed(settings, location.hostname)) return;

  const controller = new RewriteController();
  await controller.start();
}

void boot().catch((error: unknown) => {
  console.error('[Sentō] failed to initialize content script', error);
});
