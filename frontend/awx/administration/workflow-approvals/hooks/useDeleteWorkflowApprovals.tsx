import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useWorkflowApprovalsColumns } from './useWorkflowApprovalsColumns';

export function useDeleteWorkflowApprovals(
  onComplete: (workflow_approvals: WorkflowApproval[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useWorkflowApprovalsColumns({
    disableLinks: true,
    disableSort: true,
  });
  const cancelActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [cancelActionNameColumn], [cancelActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<WorkflowApproval>();
  const cannotDeleteDueToPermissions = (workflow_approval: WorkflowApproval) => {
    if (!workflow_approval.summary_fields.user_capabilities.delete)
      return t(`The workflow approval cannot be deleted due to insufficient permission`);
    return '';
  };

  const deleteWorkflowApprovals = (workflow_approvals: WorkflowApproval[]) => {
    const undeletableWorkflowApprovalsDueToPermissions: WorkflowApproval[] =
      workflow_approvals.filter(cannotDeleteDueToPermissions);

    bulkAction({
      title: t('Delete workflow approvals', { count: workflow_approvals.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} workflow approvals.', {
        count: workflow_approvals.length - undeletableWorkflowApprovalsDueToPermissions.length,
      }),
      actionButtonText: t('Delete workflow approvals', { count: workflow_approvals.length }),
      items: workflow_approvals.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts: undeletableWorkflowApprovalsDueToPermissions.length
        ? [
            ...(undeletableWorkflowApprovalsDueToPermissions.length
              ? [
                  t(
                    '{{count}} of the selected workflow approvals cannot be deleted due to insufficient permissions.',
                    {
                      count: undeletableWorkflowApprovalsDueToPermissions.length,
                    }
                  ),
                ]
              : []),
          ]
        : undefined,
      isItemNonActionable: (item: WorkflowApproval) => cannotDeleteDueToPermissions(item),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (workflow_approval: WorkflowApproval, signal) =>
        requestDelete(awxAPI`/workflow_approvals/${workflow_approval.id.toString()}/`, signal),
    });
  };
  return deleteWorkflowApprovals;
}
