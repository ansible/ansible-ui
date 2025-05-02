import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { PageFramework } from '@ansible/ansible-ui-framework';
import '@ansible/common-ui/i18n';
import { BrowserRouter } from 'react-router';
import { HubActiveUserProvider } from '../common/useHubActiveUser';
import { HubApp } from './HubApp';
import { HubLogin } from './HubLogin';

// eslint-disable-next-line no-restricted-exports
export default function HubMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
        <HubActiveUserProvider>
          <HubLogin>
            <HubApp />
          </HubLogin>
        </HubActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
