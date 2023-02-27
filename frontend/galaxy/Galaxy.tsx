import { Page } from '@patternfly/react-core';
import { useState } from 'react';
import { AnsibleMasthead } from '../common/Masthead';
import { HubRouter } from './GalaxyRouter';
import { HubSidebar } from './GalaxySidebar';

export function Hub() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth >= 1200);
  return (
    <Page
      header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
      sidebar={<HubSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
    >
      <HubRouter />
    </Page>
  );
}
