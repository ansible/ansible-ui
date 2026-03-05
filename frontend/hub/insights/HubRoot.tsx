/**
 * HubRoot - Insights/CRC Entry Point
 *
 * This is the entry point for Hub when running as a federated module
 * within the Insights Chrome shell (console.redhat.com).
 *
 * Key differences from standalone Hub.tsx / HubMain.tsx:
 * - Exports a React component (does not use createRoot)
 * - Uses Chrome shell's authentication via useChrome hook
 * - Does NOT import global PatternFly CSS (shell provides it)
 * - Does NOT use BrowserRouter (Chrome provides routing context)
 * - Does NOT render HubMasthead (Chrome provides the header)
 * - Calls identifyApp() to register with the shell
 */

import { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import type { ChromeAPI } from '@redhat-cloud-services/types';
import { PageFramework } from '@ansible/ansible-ui-framework';
import '@ansible/common-ui/i18n';
import { HubActiveUserProvider } from '../common/useHubActiveUser';
import { HubContextProvider } from '../common/useHubContext';
import { HubInsightsApp } from './HubInsightsApp';

/**
 * Force light theme for the Insights/CRC build.
 *
 * CRC Chrome loads both PF v5 and PF v6 CSS. PF v6's dark theme tokens
 * use :where() (zero specificity) and get overridden, causing PF v6
 * components to render with broken colors in dark mode. Until Chrome
 * properly supports PF v6 dark theme, we force light mode.
 */
function useForceLight() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('pf-v6-theme-dark');

    // Observe and revert if PageSettingsProvider re-adds it
    const observer = new MutationObserver(() => {
      if (html.classList.contains('pf-v6-theme-dark')) {
        html.classList.remove('pf-v6-theme-dark');
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);
}

/**
 * Main entry component for Insights/CRC deployment.
 * This component is exposed via Module Federation and loaded by the Chrome shell.
 *
 * Chrome shell provides:
 * - Router context (HistoryRouter at root level)
 * - Masthead/header
 * - Authentication
 * - PatternFly base styles
 */
function HubRoot() {
  const chrome: ChromeAPI = useChrome();

  useEffect(() => {
    // Register this app with the Insights Chrome shell
    // Guard against Chrome context not being ready yet
    void chrome?.identifyApp?.('automation-hub');
    chrome?.updateDocumentTitle?.('Automation Hub');
  }, [chrome]);

  // Force light theme — CRC Chrome doesn't support PF v6 dark mode properly
  useForceLight();

  // Note: No BrowserRouter here - Chrome provides the router context
  return (
    <PageFramework defaultRefreshInterval={30}>
      <HubActiveUserProvider>
        <HubContextProvider>
          <HubInsightsApp />
        </HubContextProvider>
      </HubActiveUserProvider>
    </PageFramework>
  );
}

export { HubRoot };
// eslint-disable-next-line no-restricted-exports
export default HubRoot;
