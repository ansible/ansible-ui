import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { idKeyFn, useHubView } from '../useHubView';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import { useExecutionEnvironmentsActions } from './hooks/useExecutionEnvironmentsActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const toolbarFilters = useExecutionEnvironmentFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useHubView<ExecutionEnvironment>(
    `/api/automation-hub/v3/plugin/execution-environments/repositories/`,
    idKeyFn,
    toolbarFilters,
    tableColumns
  );
  const toolbarActions = useExecutionEnvironmentsActions();
  const rowActions = useExecutionEnvironmentActions();
  return (
    <PageLayout>
      <PageHeader
        title={t('Execution Environments')}
        description={t(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )}
      />
      <PageTable<ExecutionEnvironment>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        {...view}
        defaultSubtitle={t('Execution Environment')}
      />
    </PageLayout>
  );
}
