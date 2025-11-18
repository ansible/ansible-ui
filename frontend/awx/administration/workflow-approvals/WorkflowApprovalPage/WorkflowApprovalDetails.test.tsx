import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowApprovalDetails } from './WorkflowApprovalDetails';
import { mockWorkflowApproval } from '../mocks/workflowApproval.fixture';

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: vi.fn(() => ({
    data: mockWorkflowApproval,
    error: null,
    refresh: vi.fn(),
  })),
}));

describe('WorkflowApprovalDetails', () => {
  it('should render basic detail fields', async () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('label-id')).toHaveTextContent('ID');
      expect(screen.getByTestId('id')).toHaveTextContent('1');

      expect(screen.getByTestId('label-name')).toHaveTextContent('Name');
      expect(screen.getByTestId('name')).toHaveTextContent('Test Workflow Approval');

      expect(screen.getByTestId('label-status')).toHaveTextContent('Status');
      expect(screen.getByTestId('status')).toHaveTextContent('Timed out');

      expect(screen.getByTestId('label-started')).toHaveTextContent('Started');
      expect(screen.getByTestId('started')).toBeInTheDocument();
    });
  });
});
