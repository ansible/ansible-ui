import { Page } from '@patternfly/react-core';
import { AnsibleMasthead } from '../common/Masthead';
import { AutomationServers } from './AutomationServers';

export function AutomationServersRoute() {
  return (
    <Page header={<AnsibleMasthead hideLogin />}>
      <AutomationServers />
    </Page>
  );
}
