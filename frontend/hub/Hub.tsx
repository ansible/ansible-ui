import { Page } from '@patternfly/react-core';
import { AnsibleMasthead } from '../common/Masthead';
import { HubRouter } from './HubRouter';
import { HubSidebar } from './HubSidebar';

export function Hub() {
  return (
    <Page header={<AnsibleMasthead />} sidebar={<HubSidebar />}>
      <HubRouter />
    </Page>
  );
}
