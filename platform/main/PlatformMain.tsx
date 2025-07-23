import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

import { PageFramework } from '@ansible/ansible-ui-framework';
import { AwxActiveUserProvider } from '@ansible/awx-ui/common/useAwxActiveUser';
import { AwxConfigProvider } from '@ansible/awx-ui/common/useAwxConfig';
import { WebSocketProvider } from '@ansible/awx-ui/common/useAwxWebSocket';
import { ChatbotProvider } from '@ansible/chatbot/ChatbotProvider';
import { useGet } from '@ansible/common-ui/crud/useGet';
import '@ansible/common-ui/i18n';
import { DocsVersionProvider } from '@ansible/common-ui/utils/useDocsVersion';
import { EdaActiveUserProvider } from '@ansible/eda-ui/common/useEdaActiveUser';
import { HubActiveUserProvider } from '@ansible/hub-ui/common/useHubActiveUser';
import { HubContextProvider } from '@ansible/hub-ui/common/useHubContext';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router';
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
          <Bullseye>
            <Spinner />
          </Bullseye>
        }
      >
        <PageFramework defaultRefreshInterval={10}>
          <PlatformActiveUserProvider>
            <AwxActiveUserProvider>
              <HubActiveUserProvider>
                <PlatformLogin>
                  <GatewayUIAuthProvider>
                    <GatewayServicesProvider>
                      <PlatformMainInternal />
                    </GatewayServicesProvider>
                  </GatewayUIAuthProvider>
                </PlatformLogin>
              </HubActiveUserProvider>
            </AwxActiveUserProvider>
          </PlatformActiveUserProvider>
        </PageFramework>
      </Suspense>
    </BrowserRouter>
  );
}

export function PlatformMainInternal() {
  const platformInfo = useGet<{ version: string }>(gatewayAPI`/ping/`, {}, { refreshInterval: 0 });
  let platformVersion = platformInfo.data?.version;
  if (!platformVersion || platformVersion === 'development') {
    platformVersion = '2.5';
  }

  const hasAwx = useHasAwxService(true);
  const hasHub = useHasHubService();
  const hasEda = useHasEdaService();

  return (
    <QuickStartProvider>
      <EdaActiveUserProvider disabled={!hasEda}>
        <DocsVersionProvider version={platformVersion}>
          <WebSocketProvider>
            <AwxConfigProvider disabled={!hasAwx}>
              <HubContextProvider disabled={!hasHub}>
                <ChatbotProvider>
                  <PlatformSubscription>
                    <PlatformApp />
                  </PlatformSubscription>
                </ChatbotProvider>
              </HubContextProvider>
            </AwxConfigProvider>
          </WebSocketProvider>
        </DocsVersionProvider>
      </EdaActiveUserProvider>
    </QuickStartProvider>
  );
}
