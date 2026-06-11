import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { ThumbsDownIcon, ThumbsUpIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useApproveWorkflowApprovals } from './useApproveWorkflowApprovals';
import { useDeleteWorkflowApprovals } from './useDeleteWorkflowApprovals';
import { useDenyWorkflowApprovals } from './useDenyWorkflowApprovals';

export function useWorkflowApprovalActions(
  onComplete: (workflow_approvals: WorkflowApproval[]) => void
) {
  const { t } = useTranslation();
  const approveWorkflowApprovals = useApproveWorkflowApprovals(() => {});
  const denyWorkflowApprovals = useDenyWorkflowApprovals(() => {});
  const deleteWorkflowApprovals = useDeleteWorkflowApprovals(onComplete);

  return useMemo<IPageAction<WorkflowApproval>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: approveWorkflowApprovals,
        isPinned: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsDownIcon,
        label: t('Deny'),
        onClick: denyWorkflowApprovals,
        isDanger: true,
        isPinned: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete'),
        onClick: deleteWorkflowApprovals,
        isDanger: true,
      },
    ];
  }, [deleteWorkflowApprovals, denyWorkflowApprovals, approveWorkflowApprovals, t]);
}
