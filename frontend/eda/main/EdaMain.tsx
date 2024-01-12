import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Outlet } from 'react-router-dom';
import { PageApp } from '../../../framework/PageNavigation/PageApp';
import { Login } from '../../common/Login';
import '../../common/i18n';
import { edaAPI } from '../common/eda-utils';
import { EdaActiveUserProvider } from '../common/useEdaActiveUser';
import { EdaMasthead } from './EdaMasthead';
import { useEdaNavigation } from './useEdaNavigation';

// eslint-disable-next-line no-restricted-exports
export default function EdaMain() {
  const navigation = useEdaNavigation();
  return (
    <PageApp
      login={<Login apiUrl={edaAPI`/auth/session/login/`} onLoginUrl="/overview" />}
      root={
        <EdaActiveUserProvider>
          <Outlet />
        </EdaActiveUserProvider>
      }
      masthead={<EdaMasthead />}
      navigation={navigation}
      basename={process.env.EDA_ROUTE_PREFIX}
    />
  );
}
