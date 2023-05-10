import { Page } from '@patternfly/react-core';
import { AnsibleMasthead } from '../common/Masthead';
import { EventDrivenRouter } from './EventDrivenRouter';
import { EventDrivenSidebar } from './EventDrivenSidebar';

export function EventDriven() {
  return (
    <Page header={<AnsibleMasthead />} sidebar={<EventDrivenSidebar />}>
      <EventDrivenRouter />
    </Page>
  );
}
