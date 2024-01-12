import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../../framework/PageNavigation/PageApp';
import { Login } from '../../common/Login';
import '../../common/i18n';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';
import { HubMasthead } from './HubMasthead';
import { useHubNavigation } from './useHubNavigation';

// eslint-disable-next-line no-restricted-exports
export default function HubMain() {
  const navigation = useHubNavigation();
  return (
    <PageApp
      login={<Login apiUrl={hubAPI`/_ui/v1/auth/login/`} onLoginUrl="/overview" />}
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
