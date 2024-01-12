import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useWorkflowApprovalsColumns } from './useWorkflowApprovalsColumns';

export function useApproveWorkflowApprovals(
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
  const postRequest = usePostRequest();
  const cannotApprove = (workflow_approval: WorkflowApproval) => {
    if (workflow_approval.timed_out)
      return t(`The workflow approval cannot be approved because it has timed out`);

    switch (workflow_approval.status) {
      case 'canceled':
        return t(`The workflow approval cannot be approved because the workflow has been canceled`);
      case 'successful':
        return t(`The workflow approval cannot be approved because it has already been approved`);
      case 'failed':
        return t(`The workflow approval cannot be approved because it has already been denied`);
      case 'error':
        return t(`The workflow approval cannot be approved because it is in an error state`);
      default:
        if (!workflow_approval.can_approve_or_deny)
          return t(`The workflow approval cannot be approved due to insufficient permissions`);
        return '';
    }
  };

  const approveWorkflowApprovals = (workflow_approvals: WorkflowApproval[]) => {
    const unapproveableWorkflowApprovals: WorkflowApproval[] =
      workflow_approvals.filter(cannotApprove);

    bulkAction({
      title: t('Approve workflow approvals', { count: workflow_approvals.length }),
      confirmText: t('Yes, I confirm that I want to approve these {{count}} workflow approvals.', {
        count: workflow_approvals.length - unapproveableWorkflowApprovals.length,
      }),
      actionButtonText: t('Approve workflow approvals', { count: workflow_approvals.length }),
      items: workflow_approvals.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts: unapproveableWorkflowApprovals.length
        ? [
            ...(unapproveableWorkflowApprovals.length
              ? [
                  t('{{count}} of the selected workflow approvals cannot be approved.', {
                    count: unapproveableWorkflowApprovals.length,
                  }),
                ]
              : []),
          ]
        : undefined,
      isItemNonActionable: (item: WorkflowApproval) => cannotApprove(item),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (workflow_approval: WorkflowApproval) =>
        postRequest(awxAPI`/workflow_approvals/${workflow_approval.id.toString()}/approve/`, {}),
    });
  };
  return approveWorkflowApprovals;
}
