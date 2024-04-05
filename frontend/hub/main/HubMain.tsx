import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../../framework';
import '../../common/i18n';
import { HubApp } from './HubApp';
import { HubLogin } from './HubLogin';

// eslint-disable-next-line no-restricted-exports
export default function HubMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
        <HubLogin>
          <HubApp />
        </HubLogin>
      </PageFramework>
    </BrowserRouter>
  );
}
