import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { mockWorkflowApproval } from '../mocks/workflowApproval.fixture';
import { useDeleteWorkflowApprovals } from './useDeleteWorkflowApprovals';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useWorkflowApprovalsColumns', () => ({
  useWorkflowApprovalsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

describe('useDeleteWorkflowApprovals', () => {
  const mockConfirmation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockConfirmation);
  });

  it('opens bulk confirmation when deleting workflow approvals', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteWorkflowApprovals(onComplete));

    result.current([mockWorkflowApproval]);

    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete workflow approvals',
        onComplete,
      })
    );
  });

  it('marks approvals without delete permission via isItemNonActionable', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteWorkflowApprovals(onComplete));

    result.current([mockWorkflowApproval]);

    const options = mockConfirmation.mock.calls[0]?.[0] as {
      isItemNonActionable: (item: WorkflowApproval) => string;
    };

    expect(
      options.isItemNonActionable({
        ...mockWorkflowApproval,
        summary_fields: {
          ...mockWorkflowApproval.summary_fields,
          user_capabilities: {
            ...mockWorkflowApproval.summary_fields.user_capabilities,
            delete: false,
          },
        },
      })
    ).toContain('insufficient permission');
    expect(options.isItemNonActionable(mockWorkflowApproval)).toBe('');
  });
});
