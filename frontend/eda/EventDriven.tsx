import { Page } from '@patternfly/react-core';
import { AnsibleMasthead } from '../common/Masthead';
import { EventDrivenRouter } from './EventDrivenRouter';
import { EventDrivenSidebar } from './EventDrivenSidebar';
import { ActiveEdaUserProvider } from '../common/useActiveUser';

export function EventDriven() {
  return (
    <ActiveEdaUserProvider>
      <Page header={<AnsibleMasthead />} sidebar={<EventDrivenSidebar />}>
        <EventDrivenRouter />
      </Page>
    </ActiveEdaUserProvider>
  );
}
