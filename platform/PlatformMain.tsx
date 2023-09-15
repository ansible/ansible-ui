import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts.css';
import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { AwxConfigProvider } from '../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../frontend/awx/common/useAwxWebSocket';
import { AnsibleMasthead } from '../frontend/common/Masthead';
import { ActiveEdaUserProvider, ActiveUserProvider } from '../frontend/common/useActiveUser';
import { HubContextProvider } from '../frontend/hub/useHubContext';
import { PlatformLogin } from './PlatformLogin';
import { usePlatformNavigation } from './usePlatformNavigation';

export default function PlatformMain() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      login={<PlatformLogin />}
      root={
        <WebSocketProvider>
          <ActiveUserProvider>
            <AwxConfigProvider>
              <HubContextProvider>
                <ActiveEdaUserProvider>
                  <Outlet />
                </ActiveEdaUserProvider>
              </HubContextProvider>
            </AwxConfigProvider>
          </ActiveUserProvider>
        </WebSocketProvider>
      }
      header={<AnsibleMasthead />}
      navigation={navigation}
    />
  );
}
