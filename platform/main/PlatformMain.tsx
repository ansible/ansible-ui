import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

// patternfly-charts-theme-dark.css must come after patternfly-charts.css
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../framework';
import '../../frontend/common/i18n';
import { PlatformActiveUserProvider } from './PlatformActiveUserProvider';
import { PlatformApp } from './PlatformApp';
import { PlatformLogin } from './PlatformLogin';

// eslint-disable-next-line no-restricted-exports
export default function PlatformMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
        <PlatformActiveUserProvider>
          <PlatformLogin>
            <PlatformApp />
          </PlatformLogin>
        </PlatformActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
