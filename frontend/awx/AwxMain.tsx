import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import '../common/i18n';
import { AwxLogin } from './AwxLogin';
import { AwxMasthead } from './AwxMasthead';
import { AwxActiveUserProvider } from './common/useAwxActiveUser';
import { AwxConfigProvider } from './common/useAwxConfig';
import { WebSocketProvider } from './common/useAwxWebSocket';
import { useAwxNavigation } from './useAwxNavigation';

// eslint-disable-next-line no-restricted-exports
export default function AwxMain() {
  const navigation = useAwxNavigation();
  return (
    <PageApp
      login={<AwxLogin />}
      root={
        <WebSocketProvider>
          <AwxActiveUserProvider>
            <AwxConfigProvider>
              <Outlet />
            </AwxConfigProvider>
          </AwxActiveUserProvider>
        </WebSocketProvider>
      }
      masthead={<AwxMasthead />}
      navigation={navigation}
      basename={process.env.AWX_ROUTE_PREFIX}
    />
  );
}
