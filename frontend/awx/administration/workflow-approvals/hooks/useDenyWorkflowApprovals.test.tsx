import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { mockWorkflowApproval } from '../mocks/workflowApproval.fixture';
import { useDenyWorkflowApprovals } from './useDenyWorkflowApprovals';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn()),
}));
vi.mock('./useWorkflowApprovalsColumns', () => ({
  useWorkflowApprovalsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

describe('useDenyWorkflowApprovals', () => {
  const mockConfirmation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockConfirmation);
    vi.mocked(usePostRequest).mockReturnValue(vi.fn());
  });

  it('opens bulk confirmation when denying workflow approvals', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDenyWorkflowApprovals(onComplete));

    result.current([mockWorkflowApproval]);

    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Deny workflow approvals',
        onComplete,
      })
    );
  });

  it('marks non-actionable approvals via cannotDeny', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDenyWorkflowApprovals(onComplete));

    result.current([mockWorkflowApproval]);

    const options = mockConfirmation.mock.calls[0]?.[0] as {
      isItemNonActionable: (item: WorkflowApproval) => string;
    };

    expect(options.isItemNonActionable({ ...mockWorkflowApproval, status: 'failed' })).toContain(
      'already been denied'
    );
    expect(
      options.isItemNonActionable({
        ...mockWorkflowApproval,
        status: 'pending',
        can_approve_or_deny: '',
      })
    ).toContain('insufficient permissions');
    expect(
      options.isItemNonActionable({
        ...mockWorkflowApproval,
        status: 'pending',
        can_approve_or_deny: 'true',
      })
    ).toBe('');
  });
});
