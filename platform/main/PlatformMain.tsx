import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

// patternfly-charts-theme-dark.css must come after patternfly-charts.css
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../framework';
import { AwxActiveUserProvider } from '../../frontend/awx/common/useAwxActiveUser';
import { AwxConfigProvider } from '../../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../../frontend/awx/common/useAwxWebSocket';
import '../../frontend/common/i18n';
import { EdaActiveUserProvider } from '../../frontend/eda/common/useEdaActiveUser';
import { HubActiveUserProvider } from '../../frontend/hub/common/useHubActiveUser';
import { HubContextProvider } from '../../frontend/hub/common/useHubContext';
import { QuickStartProvider } from '../overview/quickstarts/QuickStartProvider';
import { GatewayServicesCheck, GatewayServicesProvider } from './GatewayServices';
import { PlatformActiveUserProvider } from './PlatformActiveUserProvider';
import { PlatformApp } from './PlatformApp';
import { PlatformLogin } from './PlatformLogin';

// eslint-disable-next-line no-restricted-exports
export default function PlatformMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
        <PlatformActiveUserProvider>
          <GatewayServicesProvider>
            <QuickStartProvider>
              <AwxActiveUserProvider>
                <EdaActiveUserProvider>
                  <HubActiveUserProvider>
                    <WebSocketProvider>
                      <AwxConfigProvider>
                        <HubContextProvider>
                          <PlatformLogin>
                            <GatewayServicesCheck>
                              <PlatformApp />
                            </GatewayServicesCheck>
                          </PlatformLogin>
                        </HubContextProvider>
                      </AwxConfigProvider>
                    </WebSocketProvider>
                  </HubActiveUserProvider>
                </EdaActiveUserProvider>
              </AwxActiveUserProvider>
            </QuickStartProvider>
          </GatewayServicesProvider>
        </PlatformActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
