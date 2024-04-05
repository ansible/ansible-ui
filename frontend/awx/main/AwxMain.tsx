import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { PageFramework } from '../../../framework';
import '../../common/i18n';
import { AwxApp } from './AwxApp';
import { AwxLogin } from './AwxLogin';

// eslint-disable-next-line no-restricted-exports
export default function AwxMain() {
  return (
    <PageFramework defaultRefreshInterval={10}>
      <AwxLogin>
        <AwxApp />
      </AwxLogin>
    </PageFramework>
  );
}
