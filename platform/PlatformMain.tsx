import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { AwxConfigProvider } from '../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../frontend/awx/common/useAwxWebSocket';
import { ActiveEdaUserProvider, ActiveUserProvider } from '../frontend/common/useActiveUser';
import { HubContextProvider } from '../frontend/hub/useHubContext';
import { ActivePlatformUserProvider } from './hooks/useActivePlatformUser';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMasthead } from './PlatformMasthead';
import { usePlatformNavigationA, usePlatformNavigationB } from './usePlatformNavigation';

export default function PlatformMain() {
  const [navigationVersion, setNavigationVersion] = useState<'A' | 'B'>('A');
  const navigationA = usePlatformNavigationA();
  const navigationB = usePlatformNavigationB();
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
      masthead={
        <PlatformMasthead
          navigationVersion={navigationVersion}
          setNavigationVersion={setNavigationVersion}
        />
      }
      navigation={navigationVersion === 'A' ? navigationA : navigationB}
    />
  );
}
