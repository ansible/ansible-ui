import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { AwxConfigProvider } from '../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../frontend/awx/common/useAwxWebSocket';
import { ActiveEdaUserProvider, ActiveUserProvider } from '../frontend/common/useActiveUser';
import { HubContextProvider } from '../frontend/hub/useHubContext';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMasthead } from './PlatformMasthead';
import { ActivePlatformUserProvider } from './hooks/useActivePlatformUser';
import { usePlatformNavigation } from './usePlatformNavigation';

export default function PlatformMain() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      login={<PlatformLogin />}
      root={
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
      }
      masthead={<PlatformMasthead />}
      navigation={navigation}
    />
  );
}
