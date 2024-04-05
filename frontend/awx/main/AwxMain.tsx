import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../../framework';
import '../../common/i18n';
<<<<<<< HEAD
import { AwxActiveUserProvider } from '../common/useAwxActiveUser';
=======
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { AwxApp } from './AwxApp';
import { AwxLogin } from './AwxLogin';

// eslint-disable-next-line no-restricted-exports
export default function AwxMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
<<<<<<< HEAD
        <AwxActiveUserProvider>
          <AwxLogin>
            <AwxApp />
          </AwxLogin>
        </AwxActiveUserProvider>
=======
        <AwxLogin>
          <AwxApp />
        </AwxLogin>
>>>>>>> 8269c803c (Login Flow Update (#1946))
      </PageFramework>
    </BrowserRouter>
  );
}
