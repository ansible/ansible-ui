import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../framework';
import { AutomationServer } from '../AutomationServer';
import { indexedDbItemKey, useIndexedDbDeleteItem } from '../IndexDb';
import { useAutomationServersColumns } from './useAutomationServersColumns';

export function useRemoveAutomationServers() {
  const { t } = useTranslation();
  const indexedDbDeleteItem = useIndexedDbDeleteItem('servers');
  const confirmationColumns = useAutomationServersColumns({
    disableLinks: true,
    disableSort: true,
  });
  const bulkAction = useBulkConfirmation<AutomationServer>();
  const deleteAutomationServers = (servers: AutomationServer[]) => {
    bulkAction({
      title: t('Permanently delete servers', { count: servers.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} servers.', {
        count: servers.length,
      }),
      actionButtonText: t('Delete servers', { count: servers.length }),
      items: servers.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: indexedDbItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      actionFn: (automationServer: AutomationServer) => {
        return indexedDbDeleteItem(automationServer.id);
      },
    });
  };
  return deleteAutomationServers;
}
