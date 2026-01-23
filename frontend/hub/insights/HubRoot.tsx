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
import { HubInsightsApp } from './HubInsightsApp';

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

  // Note: No BrowserRouter here - Chrome provides the router context
  return (
    <PageFramework defaultRefreshInterval={10}>
      <HubActiveUserProvider>
        <HubInsightsApp />
      </HubActiveUserProvider>
    </PageFramework>
  );
}

export { HubRoot };
// eslint-disable-next-line no-restricted-exports
export default HubRoot;
