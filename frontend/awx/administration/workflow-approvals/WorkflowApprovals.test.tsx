import { act, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { WorkflowApprovals } from './WorkflowApprovals';

let capturedOnMessage: ((message: unknown) => void) | undefined;

vi.mock('../../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: (
    _events: Record<string, string[]>,
    onMessage: (message: unknown) => void
  ) => {
    capturedOnMessage = onMessage;
    return { sendMessage: vi.fn(), lastMessage: null, readyState: 1 };
  },
}));

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
afterEach(() => {
  server.resetHandlers();
  capturedOnMessage = undefined;
});
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

describe('WorkflowApprovals WebSocket handler', () => {
  async function renderAndWait() {
    render(
      <MemoryRouter>
        <WorkflowApprovals />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Test Approval 1')).toBeInTheDocument();
    });
    expect(capturedOnMessage).toBeDefined();
  }

  it('should trigger refresh on workflow_approval WS message', async () => {
    let fetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/workflow_approvals/') && request.method === 'GET') {
        fetchCount++;
      }
    });

    await renderAndWait();
    const initialFetchCount = fetchCount;

    act(() => {
      capturedOnMessage!({ group_name: 'jobs', type: 'workflow_approval' });
    });

    await waitFor(() => {
      expect(fetchCount).toBeGreaterThan(initialFetchCount);
    });

    server.events.removeAllListeners();
  });

  it('should ignore WS messages with non-matching type', async () => {
    let fetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/workflow_approvals/') && request.method === 'GET') {
        fetchCount++;
      }
    });

    await renderAndWait();
    await new Promise((r) => setTimeout(r, 100));
    const initialFetchCount = fetchCount;

    act(() => {
      capturedOnMessage!({ group_name: 'jobs', type: 'job' });
    });

    await new Promise((r) => setTimeout(r, 300));

    expect(fetchCount).toBe(initialFetchCount);
    server.events.removeAllListeners();
  });

  it('should ignore WS messages with non-matching group_name', async () => {
    let fetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/workflow_approvals/') && request.method === 'GET') {
        fetchCount++;
      }
    });

    await renderAndWait();
    await new Promise((r) => setTimeout(r, 100));
    const initialFetchCount = fetchCount;

    act(() => {
      capturedOnMessage!({ group_name: 'inventories', type: 'workflow_approval' });
    });

    await new Promise((r) => setTimeout(r, 300));

    expect(fetchCount).toBe(initialFetchCount);
    server.events.removeAllListeners();
  });

  it('should throttle multiple rapid WS messages to a single immediate refresh', async () => {
    let fetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/workflow_approvals/') && request.method === 'GET') {
        fetchCount++;
      }
    });

    await renderAndWait();
    const initialFetchCount = fetchCount;

    act(() => {
      for (let i = 0; i < 10; i++) {
        capturedOnMessage!({ group_name: 'jobs', type: 'workflow_approval' });
      }
    });

    // Leading edge fires 1 call synchronously; the other 9 are coalesced
    await waitFor(() => {
      expect(fetchCount).toBe(initialFetchCount + 1);
    });

    // Wait a short time — still no additional calls within the throttle window
    await new Promise((r) => setTimeout(r, 200));
    expect(fetchCount).toBe(initialFetchCount + 1);

    server.events.removeAllListeners();
  });
});
