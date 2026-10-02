import '@patternfly/patternfly/dist/patternfly-base.css';
import '@patternfly/patternfly/dist/patternfly-charts.css';

import { PageFramework } from '@ansible/ansible-ui-framework';
import '@ansible/common-ui/i18n';
import { BrowserRouter } from 'react-router-dom';
import { EdaActiveUserProvider } from '../common/useEdaActiveUser';
import { EdaApp } from './EdaApp';
import { EdaLogin } from './EdaLogin';

// eslint-disable-next-line no-restricted-exports
export default function EdaMain() {
  return (
    <BrowserRouter>
      <PageFramework>
        <EdaActiveUserProvider>
          <EdaLogin>
            <EdaApp />
          </EdaLogin>
        </EdaActiveUserProvider>
      </PageFramework>
    </BrowserRouter>
  );
}
