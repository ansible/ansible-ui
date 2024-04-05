import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { BrowserRouter } from 'react-router-dom';
import { PageFramework } from '../../../framework';
import '../../common/i18n';
<<<<<<< HEAD
import { EdaActiveUserProvider } from '../common/useEdaActiveUser';
=======
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { EdaApp } from './EdaApp';
import { EdaLogin } from './EdaLogin';

// eslint-disable-next-line no-restricted-exports
export default function EdaMain() {
  return (
    <BrowserRouter>
      <PageFramework defaultRefreshInterval={10}>
<<<<<<< HEAD
        <EdaActiveUserProvider>
          <EdaLogin>
            <EdaApp />
          </EdaLogin>
        </EdaActiveUserProvider>
=======
        <EdaLogin>
          <EdaApp />
        </EdaLogin>
>>>>>>> 8269c803c (Login Flow Update (#1946))
      </PageFramework>
    </BrowserRouter>
  );
}
