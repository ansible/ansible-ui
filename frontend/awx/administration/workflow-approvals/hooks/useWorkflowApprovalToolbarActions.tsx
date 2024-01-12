import { ThumbsDownIcon, ThumbsUpIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { IAwxView } from '../../../common/useAwxView';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useApproveWorkflowApprovals } from './useApproveWorkflowApprovals';
import { useDeleteWorkflowApprovals } from './useDeleteWorkflowApprovals';
import { useDenyWorkflowApprovals } from './useDenyWorkflowApprovals';

export function useWorkflowApprovalToolbarActions(view: IAwxView<WorkflowApproval>) {
  const { t } = useTranslation();
  const approveWorkflowApprovals = useApproveWorkflowApprovals(view.unselectItemsAndRefresh);
  const denyWorkflowApprovals = useDenyWorkflowApprovals(view.unselectItemsAndRefresh);
  const deleteWorkflowApprovals = useDeleteWorkflowApprovals(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<WorkflowApproval>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: approveWorkflowApprovals,
        isPinned: true,
        isDisabled:
          view.selectedItems.length === 0 ? t('Select at least one item from the list') : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsDownIcon,
        label: t('Deny'),
        onClick: denyWorkflowApprovals,
        isDanger: true,
        isPinned: true,
        isDisabled:
          view.selectedItems.length === 0 ? t('Select at least one item from the list') : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete'),
        onClick: deleteWorkflowApprovals,
        isDanger: true,
      },
    ],
    [
      t,
      approveWorkflowApprovals,
      view.selectedItems.length,
      denyWorkflowApprovals,
      deleteWorkflowApprovals,
    ]
  );
}
