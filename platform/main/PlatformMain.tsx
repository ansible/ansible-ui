import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

// patternfly-charts-theme-dark.css must come after patternfly-charts.css
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Bullseye, Page, Spinner } from '@patternfly/react-core';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../framework';
import { AwxActiveUserProvider } from '../../frontend/awx/common/useAwxActiveUser';
import { AwxConfigProvider } from '../../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../../frontend/awx/common/useAwxWebSocket';
import { DocsVersionProvider } from '../../frontend/awx/common/useDocsVersion';
import { useGet } from '../../frontend/common/crud/useGet';
import '../../frontend/common/i18n';
import { EdaActiveUserProvider } from '../../frontend/eda/common/useEdaActiveUser';
import { HubActiveUserProvider } from '../../frontend/hub/common/useHubActiveUser';
import { HubContextProvider } from '../../frontend/hub/common/useHubContext';
import { QuickStartProvider } from '../overview/quickstarts/QuickStartProvider';
import { gatewayAPI } from '../utils/gateway-api-utils';
import {
  GatewayServicesProvider,
  useHasAwxService,
  useHasEdaService,
  useHasHubService,
} from './GatewayServices';
import { GatewayUIAuthProvider } from './GatewayUIAuth';
import { PlatformActiveUserProvider } from './PlatformActiveUserProvider';
import { PlatformApp } from './PlatformApp';
import { PlatformLogin } from './PlatformLogin';
import { PlatformSubscription } from './PlatformSubscription';

// eslint-disable-next-line no-restricted-exports
export default function PlatformMain() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <Page>
            <Bullseye>
              <Spinner />
            </Bullseye>
          </Page>
        }
      >
        <PageFramework defaultRefreshInterval={10}>
          <PlatformActiveUserProvider>
            <PlatformLogin>
              <GatewayUIAuthProvider>
                <GatewayServicesProvider>
                  <PlatformMainInternal />
                </GatewayServicesProvider>
              </GatewayUIAuthProvider>
            </PlatformLogin>
          </PlatformActiveUserProvider>
        </PageFramework>
      </Suspense>
    </BrowserRouter>
  );
}

export function PlatformMainInternal() {
  const platformInfo = useGet<{ version: string }>(
    gatewayAPI`/ping/`,
    {},
    {
      refreshInterval: 0,
    }
  );
  let platformVersion = platformInfo.data?.version;
  if (!platformVersion || platformVersion === 'development') {
    platformVersion = '2.5';
  }

  const hasAwx = useHasAwxService();
  const hasHub = useHasHubService();
  const hasEda = useHasEdaService();

  return (
    <QuickStartProvider>
      <AwxActiveUserProvider disabled={!hasAwx}>
        <EdaActiveUserProvider disabled={!hasEda}>
          <HubActiveUserProvider disabled={!hasHub}>
            <DocsVersionProvider version={platformVersion}>
              <WebSocketProvider>
                <AwxConfigProvider disabled={!hasAwx}>
                  <HubContextProvider disabled={!hasHub}>
                    <PlatformSubscription>
                      <PlatformApp />
                    </PlatformSubscription>
                  </HubContextProvider>
                </AwxConfigProvider>
              </WebSocketProvider>
            </DocsVersionProvider>
          </HubActiveUserProvider>
        </EdaActiveUserProvider>
      </AwxActiveUserProvider>
    </QuickStartProvider>
  );
}
