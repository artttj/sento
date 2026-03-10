import { getProviderSettings, isSiteAllowed, saveProviderSettings } from '../shared/storage';

async function init(): Promise<void> {
  const siteEl = document.getElementById('site-name') as HTMLElement;
  const toggleBtn = document.getElementById('btn-toggle') as HTMLButtonElement;
  const statusEl = document.getElementById('status-label') as HTMLElement;
  const footerEl = document.getElementById('footer-hint') as HTMLElement;
  const settingsBtn = document.getElementById('btn-settings') as HTMLButtonElement;

  settingsBtn.addEventListener('click', () => {
    void chrome.runtime.openOptionsPage();
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let hostname = '';
  try {
    const parsed = new URL(tab?.url ?? '');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      hostname = parsed.hostname;
    }
  } catch {
    // non-web page
  }

  if (!hostname) {
    siteEl.textContent = 'No site';
    toggleBtn.disabled = true;
    statusEl.textContent = 'Open a webpage to manage site access';
    return;
  }

  siteEl.textContent = hostname;

  let settings = await getProviderSettings();
  let allowed = isSiteAllowed(settings, hostname);

  function render(): void {
    toggleBtn.classList.toggle('blocked', !allowed);
    toggleBtn.setAttribute('aria-label', allowed ? `Block on ${hostname}` : `Unblock on ${hostname}`);
    statusEl.textContent = allowed ? 'Active on this site' : 'Blocked on this site';
    footerEl.textContent = allowed ? 'Click to block' : 'Click to unblock';
  }

  render();

  toggleBtn.addEventListener('click', async () => {
    settings = await getProviderSettings();

    if (allowed) {
      if (settings.siteListMode === 'allowlist') {
        await saveProviderSettings({ siteList: settings.siteList.filter((h) => h !== hostname) });
      } else {
        await saveProviderSettings({
          siteListMode: 'blocklist',
          siteList: [...new Set([...settings.siteList, hostname])],
        });
      }
      allowed = false;
    } else {
      if (settings.siteListMode === 'blocklist') {
        await saveProviderSettings({ siteList: settings.siteList.filter((h) => h !== hostname) });
      } else if (settings.siteListMode === 'allowlist') {
        await saveProviderSettings({ siteList: [...new Set([...settings.siteList, hostname])] });
      }
      allowed = true;
    }

    render();
  });
}

void init().catch(console.error);
