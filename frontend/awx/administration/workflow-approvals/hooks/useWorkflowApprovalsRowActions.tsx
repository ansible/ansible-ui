import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, ThumbsDownIcon, ThumbsUpIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useApproveWorkflowApprovals } from './useApproveWorkflowApprovals';
import { useDeleteWorkflowApprovals } from './useDeleteWorkflowApprovals';
import { useDenyWorkflowApprovals } from './useDenyWorkflowApprovals';
import { awxAPI } from '../../../common/api/awx-utils';
import { usePostRequest } from '../../../../common/crud/usePostRequest';

export function useWorkflowApprovalsRowActions(
  onComplete: (workflow_approvals: WorkflowApproval[]) => void
) {
  const { t } = useTranslation();
  const approveWorkflowApprovals = useApproveWorkflowApprovals(onComplete);
  const deleteWorkflowApprovals = useDeleteWorkflowApprovals(onComplete);
  const denyWorkflowApprovals = useDenyWorkflowApprovals(onComplete);
  const postRequest = usePostRequest();

  return useMemo<IPageAction<WorkflowApproval>[]>(() => {
    const cannotDeleteWorkflowApproval = (workflow_approval: WorkflowApproval) => {
      if (!['successful', 'failed', 'error', 'canceled'].includes(workflow_approval.status)) {
        return t(
          `The workflow approval cannot be deleted because the workflow job is still running`
        );
      }
      if (!workflow_approval.summary_fields.user_capabilities.delete)
        return t(`The workflow approval cannot be deleted due to insufficient permissions`);
      return '';
    };

    const cannotApprove = (workflow_approval: WorkflowApproval) => {
      if (!workflow_approval.can_approve_or_deny) {
        return t(`The workflow approval cannot be approved due to insufficient permissions`);
      }
      return '';
    };

    const cannotDeny = (workflow_approval: WorkflowApproval) => {
      if (!workflow_approval.can_approve_or_deny) {
        return t(`The workflow approval cannot be denied due to insufficient permissions`);
      }
      return '';
    };

    const actions: IPageAction<WorkflowApproval>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: ThumbsUpIcon,
        label: t(`Approve`),
        isDisabled: (workflow_approval: WorkflowApproval) => cannotApprove(workflow_approval),
        isHidden: (workflow_approval: WorkflowApproval) =>
          ['successful', 'failed', 'error', 'canceled'].includes(workflow_approval.status),
        onClick: (workflow_approval: WorkflowApproval) =>
          approveWorkflowApprovals([workflow_approval]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: ThumbsDownIcon,
        label: t(`Deny`),
        isDisabled: (workflow_approval: WorkflowApproval) => cannotDeny(workflow_approval),
        isHidden: (workflow_approval: WorkflowApproval) =>
          ['successful', 'failed', 'error', 'canceled'].includes(workflow_approval.status),
        onClick: (workflow_approval: WorkflowApproval) =>
          denyWorkflowApprovals([workflow_approval]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: MinusCircleIcon,
        label: t(`Cancel`),
        isDisabled: (workflow_approval: WorkflowApproval) => cannotDeny(workflow_approval),
        isHidden: (workflow_approval: WorkflowApproval) =>
          ['successful', 'failed', 'error', 'canceled'].includes(workflow_approval.status),
        onClick: (workflow_approval: WorkflowApproval) =>
          postRequest(
            awxAPI`/workflow_jobs/${workflow_approval?.summary_fields?.workflow_job?.id.toString()}/cancel/`,
            {}
          ),
      },

      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete workflow approval`),
        isDisabled: (workflow_approval: WorkflowApproval) =>
          cannotDeleteWorkflowApproval(workflow_approval),
        onClick: (workflow_approval: WorkflowApproval) =>
          deleteWorkflowApprovals([workflow_approval]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, approveWorkflowApprovals, denyWorkflowApprovals, postRequest, deleteWorkflowApprovals]);
}
