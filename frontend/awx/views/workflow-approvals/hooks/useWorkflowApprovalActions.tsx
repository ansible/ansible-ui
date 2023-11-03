import { ThumbsDownIcon, ThumbsUpIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useDeleteWorkflowApprovals } from './useDeleteWorkflowApprovals';
import { useDenyWorkflowApprovals } from './useDenyWorkflowApprovals';
import { useApproveWorkflowApprovals } from './useApproveWorkflowApprovals';
import { useMemo } from 'react';

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
