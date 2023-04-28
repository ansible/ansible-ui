import { Page } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '../../framework';
import { AnsibleMasthead } from '../common/Masthead';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxRouter } from './AwxRouter';
import { AwxSidebar } from './AwxSidebar';
import { WebSocketProvider } from './common/useAwxWebSocket';

export function AWX() {
  const isXl = useBreakpoint('xl');
  const [isNavOpen, setNavOpen] = useState(() => isXl);
  useEffect(() => setNavOpen(isXl), [isXl, setNavOpen]);
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
