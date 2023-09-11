import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import { AnsibleMasthead } from '../common/Masthead';
import '../common/i18n';
import { HubContextProvider } from './useHubContext';
import { useHubNavigation } from './useHubNavigation';

export default function AwxMain() {
  const navigation = useHubNavigation();
  return (
    <PageApp
      root={
        <HubContextProvider>
          <Outlet />
        </HubContextProvider>
      }
      header={<AnsibleMasthead />}
      navigation={navigation}
    />
  );
}
