import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { AwxLogin } from '../frontend/awx/AwxLogin';
import { AnsibleMasthead } from '../frontend/common/Masthead';
import { usePlatformNavigation } from './usePlatformNavigation';

export default function AwxMain() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      login={<AwxLogin />}
      root={<Outlet />}
      header={<AnsibleMasthead />}
      navigation={navigation}
    />
  );
}
