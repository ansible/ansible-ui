import { Page } from '@patternfly/react-core';
import { AnsibleMasthead } from '../common/Masthead';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxRouter } from './AwxRouter';
import { AwxSidebar } from './AwxSidebar';
import { WebSocketProvider } from './common/useAwxWebSocket';

export function AWX() {
  return (
    <WebSocketProvider>
      <ActiveUserProvider>
        <Page header={<AnsibleMasthead />} sidebar={<AwxSidebar />}>
          <AwxRouter />
        </Page>
      </ActiveUserProvider>
    </WebSocketProvider>
  );
}
