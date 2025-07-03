import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import { PageFramework } from '@ansible/ansible-ui-framework';
import '@ansible/common-ui/i18n';
import { BrowserRouter } from 'react-router';
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
