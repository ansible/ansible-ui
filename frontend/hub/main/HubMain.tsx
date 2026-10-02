import '@patternfly/patternfly/dist/patternfly-base.css';
import '@patternfly/patternfly/dist/patternfly-charts.css';

import { PageFramework } from '@ansible/ansible-ui-framework';
import '@ansible/common-ui/i18n';
import { BrowserRouter } from 'react-router-dom';
import { HubActiveUserProvider } from '../common/useHubActiveUser';
import { HubApp } from './HubApp';
import { HubLogin } from './HubLogin';

// eslint-disable-next-line no-restricted-exports
export default function HubMain() {
  return (
    <BrowserRouter>
      <PageFramework>
        <HubActiveUserProvider>
          <HubLogin>
            <HubApp />
          </HubLogin>
        </HubActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
