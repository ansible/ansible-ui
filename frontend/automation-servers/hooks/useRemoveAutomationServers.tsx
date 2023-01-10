import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../framework';
import { useAutomationServersColumns } from '../AutomationServers';
import { useAutomationServers } from '../contexts/AutomationServerProvider';
import { AutomationServer, automationServerKeyFn } from '../interfaces/AutomationServer';

export function useRemoveAutomationServers() {
  const { t } = useTranslation();
  const a = useAutomationServers();
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
      keyFn: automationServerKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      actionFn: (automationServer: AutomationServer) => {
        a.setAutomationServers(a.automationServers.filter((a) => a !== automationServer));
        return Promise.resolve();
      },
    });
  };
  return deleteAutomationServers;
}
