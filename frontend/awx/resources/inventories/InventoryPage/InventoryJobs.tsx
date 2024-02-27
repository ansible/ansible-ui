import { CubesIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout, PageTable, usePageNavigate } from '../../../../../framework';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoryJobsActions } from '../hooks/useInventoryJobsActions';
import { useJobsToolbarActions } from '../hooks/useInventoryJobsToolbarActions';
import { useInventoryJobsColumns } from '../hooks/useInventoryJobsColumns';
import { useJobsFilters } from '../hooks/useJobsFilters';
import { Job } from '../../../interfaces/Job';

export function InventoryJobs() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useJobsFilters();
  const tableColumns = useInventoryJobsColumns();
  const view = useAwxView<Job>({
    url: awxAPI`/unified_jobs/`,
    queryParams: {
      not__launch_type: 'sync',
      or__adhoccommand__inventory: '29',
      or__inventoryupdate__inventory_source__inventory: '29',
      or__job__inventory: '29',
      or__workflowjob__inventory: '29',
    },
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useJobsToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useInventoryJobsActions();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/projects/`);
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);
  const { refresh } = view;
  usePersistentFilters('projects');

  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
              void refresh();
              break;
            case 'workflow_job':
              void refresh();
              break;
            case 'project_update':
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh]
  );
  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  return (
    <PageLayout>
      <PageTable<Job>
        id="awx-projects-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        showSelect={true}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={
          canCreateProject
            ? t('There are currently no projects added to your organization.')
            : t('You do not have permission to create a project')
        }
        emptyStateDescription={
          canCreateProject
            ? t('Please create a project by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateProject ? undefined : CubesIcon}
        emptyStateButtonText={canCreateProject ? t('Create project') : undefined}
        emptyStateButtonClick={
          canCreateProject ? () => pageNavigate(AwxRoute.CreateProject) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
