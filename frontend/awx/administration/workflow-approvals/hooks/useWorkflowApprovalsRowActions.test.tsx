import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionType } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { mockWorkflowApproval } from '../mocks/workflowApproval.fixture';
import { useApproveWorkflowApprovals } from './useApproveWorkflowApprovals';
import { useDeleteWorkflowApprovals } from './useDeleteWorkflowApprovals';
import { useDenyWorkflowApprovals } from './useDenyWorkflowApprovals';
import { useWorkflowApprovalsRowActions } from './useWorkflowApprovalsRowActions';

vi.mock('./useApproveWorkflowApprovals');
vi.mock('./useDeleteWorkflowApprovals');
vi.mock('./useDenyWorkflowApprovals');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn()),
}));

function getActionByLabel(
  actions: ReturnType<typeof useWorkflowApprovalsRowActions>,
  label: string
) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function getButtonActionByLabel(
  actions: IPageAction<WorkflowApproval>[],
  label: string
): Extract<IPageAction<WorkflowApproval>, { type: PageActionType.Button }> | undefined {
  return actions.find(
    (action): action is Extract<IPageAction<WorkflowApproval>, { type: PageActionType.Button }> =>
      action.type === PageActionType.Button && 'label' in action && action.label === label
  );
}

describe('useWorkflowApprovalsRowActions', () => {
  const mockApprove = vi.fn();
  const mockDeny = vi.fn();
  const mockDelete = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApproveWorkflowApprovals).mockReturnValue(mockApprove);
    vi.mocked(useDenyWorkflowApprovals).mockReturnValue(mockDeny);
    vi.mocked(useDeleteWorkflowApprovals).mockReturnValue(mockDelete);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('exposes approve, deny, cancel, and delete actions for pending approvals', () => {
    const { result } = renderHook(() => useWorkflowApprovalsRowActions(vi.fn()));

    expect(getActionByLabel(result.current, 'Approve')).toMatchObject({
      type: PageActionType.Button,
    });
    expect(getActionByLabel(result.current, 'Deny')).toBeDefined();
    expect(getActionByLabel(result.current, 'Cancel')).toBeDefined();
    expect(getActionByLabel(result.current, 'Delete workflow approval')).toMatchObject({
      isDanger: true,
    });
  });

  it('invokes approve handler when approve is clicked', () => {
    const { result } = renderHook(() => useWorkflowApprovalsRowActions(vi.fn()));
    const approveAction = getButtonActionByLabel(result.current, 'Approve');
    if (
      approveAction &&
      'onClick' in approveAction &&
      typeof approveAction.onClick === 'function'
    ) {
      (approveAction.onClick as (item: WorkflowApproval) => void)(mockWorkflowApproval);
    }
    expect(mockApprove).toHaveBeenCalledWith([mockWorkflowApproval]);
  });

  it('hides approve and deny when workflow job is finished', () => {
    const finished = { ...mockWorkflowApproval, status: 'successful' as const };
    const { result } = renderHook(() => useWorkflowApprovalsRowActions(vi.fn()));

    const approveAction = getButtonActionByLabel(result.current, 'Approve');
    if (
      approveAction &&
      'isHidden' in approveAction &&
      typeof approveAction.isHidden === 'function'
    ) {
      expect(
        (approveAction.isHidden as (item: WorkflowApproval) => boolean | undefined)(finished)
      ).toBe(true);
    } else {
      throw new Error('expected approve action with isHidden');
    }

    const deleteAction = getButtonActionByLabel(result.current, 'Delete workflow approval');
    const finishedWithDelete = {
      ...finished,
      summary_fields: {
        ...finished.summary_fields,
        user_capabilities: { ...finished.summary_fields.user_capabilities, delete: true },
      },
    } as WorkflowApproval;
    if (
      deleteAction &&
      'isDisabled' in deleteAction &&
      typeof deleteAction.isDisabled === 'function'
    ) {
      expect(
        (deleteAction.isDisabled as (item: WorkflowApproval) => string | undefined)(
          finishedWithDelete
        )
      ).toBe('');
    } else {
      throw new Error('expected delete action with isDisabled');
    }
  });
});
