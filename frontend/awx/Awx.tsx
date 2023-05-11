import { Page } from '@patternfly/react-core';
import { AnsibleMasthead } from '../common/Masthead';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxRouter } from './AwxRouter';
import { AwxSidebar } from './AwxSidebar';
import { WebSocketProvider } from './common/useAwxWebSocket';
import { AwxConfigProvider } from './common/useAwxConfig';

export function AWX() {
  return (
    <WebSocketProvider>
      <ActiveUserProvider>
        <AwxConfigProvider>
          <Page header={<AnsibleMasthead />} sidebar={<AwxSidebar />}>
            <AwxRouter />
          </Page>
        </AwxConfigProvider>
      </ActiveUserProvider>
    </WebSocketProvider>
  );
}
