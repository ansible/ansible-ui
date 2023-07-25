import { useCallback } from 'react';
import { AutomationServer } from '../AutomationServer';
import { useAutomationServers } from '../AutomationServersProvider';
import { indexedDbItemKey, useIndexDbPutItem } from '../IndexDb';

export function useSetActiveAutomationServer() {
  const automationServers = useAutomationServers();
  const indexDbPutItem = useIndexDbPutItem('servers');
  const setActiveAutomationServerHandler = useCallback(
    (automationServer: AutomationServer) => {
      if (automationServers) {
        for (const server of automationServers) {
          if (indexedDbItemKey(server) === indexedDbItemKey(automationServer)) {
            server.isActive = true;
            void indexDbPutItem(server);
          } else if (server.isActive) {
            server.isActive = false;
            void indexDbPutItem(server);
          }
        }
      }
    },
    [automationServers, indexDbPutItem]
  );
  return setActiveAutomationServerHandler;
}
