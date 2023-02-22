import { Page } from '@patternfly/react-core';
import { useState } from 'react';
import { AnsibleMasthead } from '../common/Masthead';
import { WebSocketProvider } from './common/useAwxWebSocket';
import { ActiveUserProvider } from '../common/useActiveUser';
import { ControllerRouter } from './AwxRouter';
import { ControllerSidebar } from './AwxSidebar';

export function Controller() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth >= 1200);
  return (
    <WebSocketProvider>
      <ActiveUserProvider>
        <Page
          header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
          sidebar={<ControllerSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
        >
          <ControllerRouter />
        </Page>
      </ActiveUserProvider>
    </WebSocketProvider>
  );
}
