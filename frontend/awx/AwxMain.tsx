import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/patternfly/patternfly-addons.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import '../common/i18n';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxLogin } from './AwxLogin';
import { AwxMasthead } from './AwxMasthead';
import { AwxConfigProvider } from './common/useAwxConfig';
import { WebSocketProvider } from './common/useAwxWebSocket';
import { useAwxNavigation } from './useAwxNavigation';

export default function AwxMain() {
  const navigation = useAwxNavigation();
  return (
    <PageApp
      login={<AwxLogin />}
      root={
        <WebSocketProvider>
          <ActiveUserProvider>
            <AwxConfigProvider>
              <Outlet />
            </AwxConfigProvider>
          </ActiveUserProvider>
        </WebSocketProvider>
      }
      masthead={<AwxMasthead />}
      navigation={navigation}
    />
  );
}
