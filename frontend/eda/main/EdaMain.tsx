import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../../framework';
import '../../common/i18n';
import { EdaActiveUserProvider } from '../common/useEdaActiveUser';
import { EdaApp } from './EdaApp';
import { EdaLogin } from './EdaLogin';

// eslint-disable-next-line no-restricted-exports
export default function EdaMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
        <EdaActiveUserProvider>
          <EdaLogin>
            <EdaApp />
          </EdaLogin>
        </EdaActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
