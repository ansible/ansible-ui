import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { WorkflowApproval } from '../../interfaces/WorkflowApproval';
import { useWorkflowApprovalToolbarActions } from './hooks/useWorkflowApprovalToolbarActions';
import { useWorkflowApprovalsColumns } from './hooks/useWorkflowApprovalsColumns';
import { useWorkflowApprovalsFilters } from './hooks/useWorkflowApprovalsFilters';
import { useWorkflowApprovalsRowActions } from './hooks/useWorkflowApprovalsRowActions';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';

export function WorkflowApprovals() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const toolbarFilters = useWorkflowApprovalsFilters();
  const tableColumns = useWorkflowApprovalsColumns();
  const view = useAwxView<WorkflowApproval>({
    url: awxAPI`/workflow_approvals/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useWorkflowApprovalToolbarActions(view);
  const rowActions = useWorkflowApprovalsRowActions(view.unselectItemsAndRefresh);
  usePersistentFilters('jobs');
  const config = useAwxConfig();

  const { refresh } = view;
  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'workflow_approval':
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
      <PageHeader
        title={t('Workflow Approvals')}
        titleHelpTitle={t('Workflow Approvals')}
        titleHelp={t(
          `A workflow approval represents a pause in a workflow where approval is needed before the workflow continues executing.`,
          { product }
        )}
        titleDocLink={useGetDocsUrl(config, 'workflows')}
        description={t(
          `A workflow approval represents a pause in a workflow where approval is needed before the workflow continues executing.`,
          { product }
        )}
        headerActions={<ActivityStreamIcon type={'workflow_approval'} />}
      />
      <PageTable
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading workflow approvals')}
        emptyStateTitle={t('There are currently no workflow approvals')}
        emptyStateDescription={t(
          'Past and pending workflow approvals will appear here when available'
        )}
        {...view}
        defaultSubtitle={t('Workflow Approval')}
      />
    </PageLayout>
  );
}
