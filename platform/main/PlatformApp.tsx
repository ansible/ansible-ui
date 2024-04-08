import { PageApp } from '../../framework';
import { AwxActiveUserProvider } from '../../frontend/awx/common/useAwxActiveUser';
import { AwxConfigProvider } from '../../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../../frontend/awx/common/useAwxWebSocket';
import { EdaActiveUserProvider } from '../../frontend/eda/common/useEdaActiveUser';
import { HubActiveUserProvider } from '../../frontend/hub/common/useHubActiveUser';
import { HubContextProvider } from '../../frontend/hub/common/useHubContext';
import { QuickStartProvider } from '../overview/quickstarts/QuickStartProvider';
import { GatewayServices } from './GatewayServices';
import { PlatformMasthead } from './PlatformMasthead';
import { usePlatformNavigation } from './usePlatformNavigation';

export function PlatformApp() {
  const navigation = usePlatformNavigation();
  return (
    <GatewayServices>
      <QuickStartProvider>
        <AwxActiveUserProvider>
          <EdaActiveUserProvider>
            <HubActiveUserProvider>
              <WebSocketProvider>
                <AwxConfigProvider>
                  <HubContextProvider>
                    <PageApp
                      masthead={<PlatformMasthead />}
                      navigation={navigation}
                      basename={process.env.ROUTE_PREFIX}
                      defaultRefreshInterval={10}
                    />
                  </HubContextProvider>
                </AwxConfigProvider>
              </WebSocketProvider>
            </HubActiveUserProvider>
          </EdaActiveUserProvider>
        </AwxActiveUserProvider>
      </QuickStartProvider>
    </GatewayServices>
  );
}
