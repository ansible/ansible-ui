import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

// patternfly-charts-theme-dark.css must come after patternfly-charts.css
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { AwxConfigProvider } from '../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../frontend/awx/common/useAwxWebSocket';
import '../frontend/common/i18n';
import { ActiveEdaUserProvider, ActiveUserProvider } from '../frontend/common/useActiveUser';
import { HubContextProvider } from '../frontend/hub/useHubContext';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMasthead } from './PlatformMasthead';
import { PlatformProvider } from './PlatformProvider';
import { ActivePlatformUserProvider } from './hooks/useActivePlatformUser';
import { usePlatformNavigation } from './usePlatformNavigation';

export default function PlatformMain() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      login={<PlatformLogin />}
      root={
        <PlatformProvider>
          <WebSocketProvider>
            <ActivePlatformUserProvider>
              <ActiveUserProvider>
                <AwxConfigProvider>
                  <HubContextProvider>
                    <ActiveEdaUserProvider>
                      <Outlet />
                    </ActiveEdaUserProvider>
                  </HubContextProvider>
                </AwxConfigProvider>
              </ActiveUserProvider>
            </ActivePlatformUserProvider>
          </WebSocketProvider>
        </PlatformProvider>
      }
      masthead={<PlatformMasthead />}
      navigation={navigation}
    />
  );
}
