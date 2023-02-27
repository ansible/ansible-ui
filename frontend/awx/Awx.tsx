import { Page } from '@patternfly/react-core';
import { useState } from 'react';
import { AnsibleMasthead } from '../common/Masthead';
import { WebSocketProvider } from './common/useAwxWebSocket';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxRouter } from './AwxRouter';
import { AwxSidebar } from './AwxSidebar';

export function AWX() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth >= 1200);
  return (
    <WebSocketProvider>
      <ActiveUserProvider>
        <Page
          header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
          sidebar={<AwxSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
        >
          <AwxRouter />
        </Page>
      </ActiveUserProvider>
    </WebSocketProvider>
  );
}
