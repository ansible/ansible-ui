/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { WorkflowApprovalStatusCell } from './WorkflowApprovalStatusCell';

function createWorkflowApproval(overrides: Partial<WorkflowApproval> = {}): WorkflowApproval {
  return {
    id: 1,
    name: 'test-approval',
    type: 'workflow_approval',
    status: 'pending',
    ...overrides,
  } as WorkflowApproval;
}

describe('WorkflowApprovalStatusCell', () => {
  test('should render Timed out when timed_out is true', () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalStatusCell
          workflow_approval={createWorkflowApproval({ timed_out: true })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Timed out')).toBeInTheDocument();
  });

  test('should render Canceled when canceled_on is set', () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalStatusCell
          workflow_approval={createWorkflowApproval({ canceled_on: '2024-01-01T00:00:00Z' })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  test('should render Approved for successful status', () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalStatusCell
          workflow_approval={createWorkflowApproval({ status: 'successful' })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  test('should render Denied for failed status', () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalStatusCell
          workflow_approval={createWorkflowApproval({ status: 'failed' })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Denied')).toBeInTheDocument();
  });

  test('should render Never expires for pending without approval_expiration', () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalStatusCell
          workflow_approval={createWorkflowApproval({ status: 'pending' })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Never expires')).toBeInTheDocument();
  });

  test('should render Error for error status', () => {
    render(
      <MemoryRouter>
        <WorkflowApprovalStatusCell
          workflow_approval={createWorkflowApproval({ status: 'error' })}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
