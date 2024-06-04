import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageTable, usePageNavigate } from '../../../../framework';
import { useAwxView } from '../../common/useAwxView';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';
import { useExecutionEnvRowActions } from './hooks/useExecutionEnvRowActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from './hooks/useExecutionEnvironmentsFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';
import { useExecutionEnvToolbarActions } from './hooks/useExecutionEnvToolbarActions';

export function ExecutionEnvironmentsList({
  url,
  hideOrgColumn,
}: {
  url?: string;
  hideOrgColumn: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useExecutionEnvironmentsFilters({ url: url });
  const tableColumns = useExecutionEnvironmentsColumns();
  const filteredColumns = hideOrgColumn
    ? tableColumns.filter((column) => column.header !== 'Organization')
    : tableColumns;
  const view = useAwxView<ExecutionEnvironment>({
    url: url ? url : awxAPI`/execution_environments/`,
    toolbarFilters,
    tableColumns,
  });
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    url ? url : awxAPI`/execution_environments/`
  );
  const rowActions = useExecutionEnvRowActions({
    onDelete: view.unselectItemsAndRefresh,
    onCopy: view.refresh,
  });
  const canCreateExecutionEnvironment = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useExecutionEnvToolbarActions(view);

  return (
    <PageTable<ExecutionEnvironment>
      id="awx-execution-environments-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={filteredColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading execution environments')}
      emptyStateTitle={
        canCreateExecutionEnvironment
          ? t('No execution environments yet')
          : t('You do not have permission to create an execution environment.')
      }
      emptyStateDescription={
        canCreateExecutionEnvironment
          ? t('To get started, create an execution environment.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={
        canCreateExecutionEnvironment ? t('Create execution environment') : undefined
      }
      emptyStateButtonClick={
        canCreateExecutionEnvironment
          ? () => pageNavigate(AwxRoute.CreateExecutionEnvironment)
          : undefined
      }
      {...view}
      defaultSubtitle={t('Execution environment')}
    />
  );
}
