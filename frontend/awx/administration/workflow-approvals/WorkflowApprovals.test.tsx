import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { WorkflowApprovals } from './WorkflowApprovals';

const mockWorkflowApprovals = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'workflow_approval',
      name: 'Test Approval 1',
      status: 'pending',
      started: '2024-01-15T10:30:00.000Z',
      can_approve_or_deny: true,
      summary_fields: {
        user_capabilities: { delete: true },
      },
    },
    {
      id: 2,
      type: 'workflow_approval',
      name: 'Test Approval 2',
      status: 'successful',
      started: '2024-01-14T09:00:00.000Z',
      can_approve_or_deny: false,
      summary_fields: {
        user_capabilities: { delete: false },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/workflow_approvals/`, () => {
    return HttpResponse.json({
      actions: {},
    });
  }),
  http.get(awxAPI`/workflow_approvals/`, () => {
    return HttpResponse.json(mockWorkflowApprovals);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('WorkflowApprovals', () => {
  it('should render workflow approvals list', async () => {
    render(
      <MemoryRouter>
        <WorkflowApprovals />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Workflow Approvals')).toBeInTheDocument();
    });
  });

  it('should display workflow approvals in table', async () => {
    render(
      <MemoryRouter>
        <WorkflowApprovals />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Approval 1')).toBeInTheDocument();
      expect(screen.getByText('Test Approval 2')).toBeInTheDocument();
    });
  });
});
