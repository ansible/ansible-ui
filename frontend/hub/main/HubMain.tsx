import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../../framework';
import '../../common/i18n';
<<<<<<< HEAD
import { HubActiveUserProvider } from '../common/useHubActiveUser';
=======
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { HubApp } from './HubApp';
import { HubLogin } from './HubLogin';

// eslint-disable-next-line no-restricted-exports
export default function HubMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
<<<<<<< HEAD
        <HubActiveUserProvider>
          <HubLogin>
            <HubApp />
          </HubLogin>
        </HubActiveUserProvider>
=======
        <HubLogin>
          <HubApp />
        </HubLogin>
>>>>>>> 8269c803c (Login Flow Update (#1946))
      </PageFramework>
    </BrowserRouter>
  );
}
