import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import { AnsibleMasthead } from '../common/Masthead';
import '../common/i18n';
import { ActiveEdaUserProvider } from '../common/useActiveUser';
import { useEdaNavigation } from './useEdaNavigation';

export default function EdaMain() {
  const navigation = useEdaNavigation();
  return (
    <PageApp
      root={
        <ActiveEdaUserProvider>
          <Outlet />
        </ActiveEdaUserProvider>
      }
      header={<AnsibleMasthead />}
      navigation={navigation}
    />
  );
}
