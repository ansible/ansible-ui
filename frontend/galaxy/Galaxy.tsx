import { Page } from '@patternfly/react-core';
import { useState } from 'react';
import { AnsibleMasthead } from '../common/Masthead';
import { GalaxyRouter } from './GalaxyRouter';
import { GalaxySidebar } from './GalaxySidebar';

export function Galaxy() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth >= 1200);
  return (
    <Page
      header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
      sidebar={<GalaxySidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
    >
      <GalaxyRouter />
    </Page>
  );
}
