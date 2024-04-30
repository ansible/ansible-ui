import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageTable,
  usePageNavigate,
  IPageAction,
  PageActionType,
  PageActionSelection,
} from '../../../../framework';
import { useAwxView } from '../../common/useAwxView';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { useMemo } from 'react';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';
import { useExecutionEnvRowActions } from './hooks/useExecutionEnvRowActions';
import { cannotDeleteResources } from '../../../common/utils/RBAChelpers';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from './hooks/useExecutionEnvironmentsFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';
import { useDeleteExecutionEnvironments } from './hooks/useDeleteExecutionEnvironments';

export function ExecutionEnvironmentsList({
  url,
  hideOrgColumn,
}: {
  url?: string;
  hideOrgColumn: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const filteredColumns = hideOrgColumn
    ? tableColumns.filter((column) => column.header !== 'Organization')
    : tableColumns;
  const view = useAwxView<ExecutionEnvironment>({
    url: url ? url : awxAPI`/execution_environments/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    url ? url : awxAPI`/execution_environments/`
  );
  const rowActions = useExecutionEnvRowActions({
    onExecutionEnvironmentsDeleted: view.unselectItemsAndRefresh,
  });
  console.log(data);
  const canCreateExecutionEnvironment = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create execution environment'),
        isDisabled: canCreateExecutionEnvironment
          ? undefined
          : t(
              'You do not have permission to create an execution environment. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(AwxRoute.CreateExecutionEnvironment),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        isDisabled: (executionEnvironments) => cannotDeleteResources(executionEnvironments, t),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
      },
    ],
    [t, canCreateExecutionEnvironment, deleteExecutionEnvironments, pageNavigate]
  );

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
