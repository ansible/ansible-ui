import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { idKeyFn } from '../../common/utils/nameKeyFn';
import { hubAPI } from '../common/api/formatPath';
import { useHubView } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import { useExecutionEnvironmentsActions } from './hooks/useExecutionEnvironmentsActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const toolbarFilters = useExecutionEnvironmentFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useHubView<ExecutionEnvironment>({
    url: hubAPI`/v3/plugin/execution-environments/repositories/`,
    keyFn: idKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useExecutionEnvironmentsActions(view.unselectItemsAndRefresh);
  const rowActions = useExecutionEnvironmentActions(view.unselectItemsAndRefresh);
  const navigate = usePageNavigate();

  return (
    <PageLayout>
      <PageHeader
        title={t('Execution Environments')}
        titleHelpTitle={t('Execution Environments')}
        titleHelp={t(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )}
        description={t(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )}
        titleHelpTitle={t('Execution Environments')}
        titleHelp={t(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )}
      />
      <PageTable<ExecutionEnvironment>
        id="hub-execution-environments-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        emptyStateButtonText={t('Create execution environment')}
        emptyStateButtonIcon={
          <Icon>
            <PlusCircleIcon />
          </Icon>
        }
        emptyStateButtonClick={() => navigate(HubRoute.CreateExecutionEnvironment)}
        {...view}
        defaultSubtitle={t('Execution Environment')}
      />
    </PageLayout>
  );
}
