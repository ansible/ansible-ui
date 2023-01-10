import { Page } from '@patternfly/react-core';
import { useState } from 'react';
import { AnsibleMasthead } from '../common/Masthead';
import { AutomationServers } from './AutomationServers';

export function AutomationServersRoute() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth > 1200);
  return (
    <Page header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} hideLogin />}>
      <AutomationServers />
    </Page>
  );
}
