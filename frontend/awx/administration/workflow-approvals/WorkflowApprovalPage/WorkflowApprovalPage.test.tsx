import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WorkflowApprovalPage } from './WorkflowApprovalPage';
import { mockWorkflowApproval } from '../mocks/workflowApproval.fixture';
import { mockWorkflowJob } from '../mocks/workflowJob.fixture';

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: vi.fn(() => ({
    data: mockWorkflowApproval,
    error: null,
    refresh: vi.fn(),
  })),
  useGet: vi.fn(() => ({
    data: mockWorkflowJob,
    error: null,
  })),
}));

describe('WorkflowApprovalPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={['/workflow-approvals/1']}>
        <Routes>
          <Route path="/workflow-approvals/:id" element={<WorkflowApprovalPage />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('should render page with header, breadcrumbs, and tabs', async () => {
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Workflow Approval' })).toBeInTheDocument();

      expect(screen.getByText('Workflow Approvals')).toBeInTheDocument();

      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Workflow Job Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Back to Workflow Approvals' })).toBeInTheDocument();
    });
  });

  it('should render workflow approval action buttons', async () => {
    await waitFor(() => {
      const approveButton = screen.getByRole('button', { name: /approve/i });
      const denyButton = screen.getByRole('button', { name: /deny/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(approveButton).toBeInTheDocument();
      expect(approveButton).not.toBeDisabled();

      expect(denyButton).toBeInTheDocument();
      expect(denyButton).not.toBeDisabled();

      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();
    });
  });
});
