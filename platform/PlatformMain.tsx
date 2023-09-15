import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { PlatformLogin } from './PlatformLogin';
import { AnsibleMasthead } from '../frontend/common/Masthead';
import { usePlatformNavigation } from './usePlatformNavigation';

export default function PlatformMain() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      login={<PlatformLogin />}
      root={<Outlet />}
      header={<AnsibleMasthead />}
      navigation={navigation}
    />
  );
}
