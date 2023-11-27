import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import { Login } from '../common/Login';
import '../common/i18n';
import { HubMasthead } from './HubMasthead';
import { HubContextProvider } from './useHubContext';
import { useHubNavigation } from './useHubNavigation';

export default function HubMain() {
  const navigation = useHubNavigation();
  return (
    <PageApp
      login={<Login />}
      root={
        <HubContextProvider>
          <Outlet />
        </HubContextProvider>
      }
      masthead={<HubMasthead />}
      navigation={navigation}
      basename={process.env.HUB_ROUTE_PREFIX}
    />
  );
}
