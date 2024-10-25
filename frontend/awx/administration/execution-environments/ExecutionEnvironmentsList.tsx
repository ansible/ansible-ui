import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageTable, useGetPageUrl } from '../../../../framework';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { useExecutionEnvRowActions } from './hooks/useExecutionEnvRowActions';
import { useExecutionEnvToolbarActions } from './hooks/useExecutionEnvToolbarActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from './hooks/useExecutionEnvironmentsFilters';

export function ExecutionEnvironmentsList({
  url,
  hideOrgColumn,
}: {
  url?: string;
  hideOrgColumn: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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
      emptyState={
        canCreateExecutionEnvironment ? (
          <PageTableEmptyState
            title={t('No execution environments yet')}
            description={t('To get started, create an execution environment.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(AwxRoute.CreateExecutionEnvironment)}
            >
              {t('Create execution environment')}
            </ButtonLink>
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubesIcon}
            title={t('You do not have permission to create an execution environment.')}
            description={t(
              'Please contact your organization administrator if there is an issue with your access.'
            )}
          />
        )
      }
      {...view}
      defaultSubtitle={t('Execution environment')}
    />
  );
}
