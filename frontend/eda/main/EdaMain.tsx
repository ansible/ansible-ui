import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { PageFramework } from '../../../framework';
import '../../common/i18n';
import { EdaApp } from './EdaApp';
import { EdaLogin } from './EdaLogin';

// eslint-disable-next-line no-restricted-exports
export default function EdaMain() {
  return (
    <PageFramework defaultRefreshInterval={10}>
      <EdaLogin>
        <EdaApp />
      </EdaLogin>
    </PageFramework>
  );
}
