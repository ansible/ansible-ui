import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import { PageFramework } from '@ansible/ansible-ui-framework';
import '@ansible/common-ui/i18n';
import { BrowserRouter } from 'react-router-dom';
import { AwxActiveUserProvider } from '../common/useAwxActiveUser';
import { AwxApp } from './AwxApp';
import { AwxLogin } from './AwxLogin';

// eslint-disable-next-line no-restricted-exports
export default function AwxMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={30}>
        <AwxActiveUserProvider>
          <AwxLogin>
            <AwxApp />
          </AwxLogin>
        </AwxActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
