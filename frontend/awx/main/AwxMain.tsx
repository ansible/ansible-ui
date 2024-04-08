import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../../framework';
import '../../common/i18n';
import { AwxActiveUserProvider } from '../common/useAwxActiveUser';
import { AwxApp } from './AwxApp';
import { AwxLogin } from './AwxLogin';

// eslint-disable-next-line no-restricted-exports
export default function AwxMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
        <AwxActiveUserProvider>
          <AwxLogin>
            <AwxApp />
          </AwxLogin>
        </AwxActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
