import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

// patternfly-charts-theme-dark.css must come after patternfly-charts.css
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import { AwxActiveUserProvider } from '../../frontend/awx/common/useAwxActiveUser';
import { AwxConfigProvider } from '../../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../../frontend/awx/common/useAwxWebSocket';
import '../../frontend/common/i18n';
import { EdaActiveUserProvider } from '../../frontend/eda/common/useEdaActiveUser';
import { HubContextProvider } from '../../frontend/hub/common/useHubContext';
import { ActivePlatformUserProvider } from '../hooks/useActivePlatformUser';
import { QuickStartProvider } from '../overview/quickstarts/QuickStartProvider';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMasthead } from './PlatformMasthead';
import { usePlatformNavigation } from './usePlatformNavigation';

// eslint-disable-next-line no-restricted-exports
export default function PlatformMain() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      login={<PlatformLogin />}
      root={
        <QuickStartProvider>
          <WebSocketProvider>
            <ActivePlatformUserProvider>
              <AwxActiveUserProvider>
                <AwxConfigProvider>
                  <HubContextProvider>
                    <EdaActiveUserProvider>
                      <Outlet />
                    </EdaActiveUserProvider>
                  </HubContextProvider>
                </AwxConfigProvider>
              </AwxActiveUserProvider>
            </ActivePlatformUserProvider>
          </WebSocketProvider>
        </QuickStartProvider>
      }
      masthead={<PlatformMasthead />}
      navigation={navigation}
      defaultRefreshInterval={30}
    />
  );
}
