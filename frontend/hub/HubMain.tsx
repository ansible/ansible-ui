import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { useGetPageUrl } from '../../framework';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import { Login } from '../common/Login';
import '../common/i18n';
import { HubMasthead } from './HubMasthead';
import { hubAPI } from './api/formatPath';
import { HubContextProvider } from './useHubContext';
import { useHubNavigation } from './useHubNavigation';

export default function HubMain() {
  const navigation = useHubNavigation();
  const getPageUrl = useGetPageUrl();
  return (
    <PageApp
      login={<Login apiUrl={hubAPI`/_ui/v1/auth/login/`} onLoginUrl="/dashboard" />}
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
