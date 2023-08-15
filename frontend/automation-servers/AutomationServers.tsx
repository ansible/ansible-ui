import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, useInMemoryView } from '../../framework';
import { PageTableViewTypeE } from '../../framework/PageToolbar/PageTableViewType';
import { AutomationServer } from './AutomationServer';
import { useAutomationServers } from './AutomationServersProvider';
import { indexedDbItemKey } from './IndexDb';
import { useAddAutomationServer } from './hooks/useAddAutomationServer';
import { useAutomationServerFilters } from './hooks/useAutomationServerFilters';
import { useAutomationServersColumns } from './hooks/useAutomationServersColumns';
import { useAutomationServersRowActions } from './hooks/useAutomationServersRowActions';
import { useAutomationServersToolbarActions } from './hooks/useAutomationServersToolbarActions';

export function AutomationServers() {
  const { t } = useTranslation();

  const automationServers = useAutomationServers();

  const tableColumns = useAutomationServersColumns();
  const toolbarFilters = useAutomationServerFilters();

  const view = useInMemoryView<AutomationServer>({
    items: automationServers,
    keyFn: indexedDbItemKey,
    tableColumns,
    toolbarFilters,
  });

  const toolbarActions = useAutomationServersToolbarActions();
  const rowActions = useAutomationServersRowActions();

  const addAutomationServer = useAddAutomationServer();

  return (
    <PageLayout>
      <PageHeader
        title={t('Automation servers')}
        description={t(
          'Centralized platforms for efficient management, deployment, and sharing of automation.'
        )}
      />
      <PageTable<AutomationServer>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading automation servers')}
        emptyStateTitle={t('Welcome to Ansible')}
        emptyStateDescription={t('To get started, add your Ansible automation servers.')}
        emptyStateButtonText={t('Add automation server')}
        emptyStateButtonClick={addAutomationServer}
        {...view}
        defaultTableView={PageTableViewTypeE.Cards}
      />
    </PageLayout>
  );
}
