import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { jobsFixture } from './jobs.fixture';
import { Jobs } from './Jobs';
import { getWsAction } from './JobsList';

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

const server = setupServer(
  http.options(awxAPI`/unified_jobs/`, () => {
    return HttpResponse.json({
      actions: {
        GET: {},
        POST: {},
      },
    });
  }),
  // Catch-all handler for unified_jobs with any query parameters (/api/controller/v2)
  http.get('*/api/controller/v2/unified_jobs/', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page');

    // Return empty results for page 2+ to prevent unnecessary pagination
    if (page && Number.parseInt(page) > 1) {
      return HttpResponse.json({
        count: jobsFixture.count,
        next: null,
        previous: `/api/v2/unified_jobs/?not__launch_type=sync&order_by=-finished&page=1&page_size=10`,
        results: [],
      });
    }

    // Return fixture for page 1 or unspecified page
    return HttpResponse.json(jobsFixture);
  }),
  // Also handle requests without /controller/ prefix
  http.get('*/api/v2/unified_jobs/', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page');

    // Return empty results for page 2+ to prevent unnecessary pagination
    if (page && Number.parseInt(page) > 1) {
      return HttpResponse.json({
        count: jobsFixture.count,
        next: null,
        previous: `/api/v2/unified_jobs/?not__launch_type=sync&order_by=-finished&page=1&page_size=10`,
        results: [],
      });
    }

    // Return fixture for page 1 or unspecified page
    return HttpResponse.json(jobsFixture);
  }),
  // Mock other endpoints that Jobs component might call
  http.options(awxAPI`/inventory_sources/`, () => {
    return HttpResponse.json({});
  }),
  http.get(awxAPI`/inventory_sources/`, () => {
    return HttpResponse.json({ count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  capturedOnMessage = undefined;
});
afterAll(() => server.close());

describe('JobsList Component Tests', () => {
  test('renders job list with table and rows', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Verify table columns are visible
    await waitFor(
      () => {
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Verify at least one job is rendered (from mock data)
    await waitFor(
      () => {
        const table = screen.getByRole('grid');
        expect(table).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  test('renders toolbar and row actions', { timeout: 20000 }, async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Find and click toolbar actions button
    const toolbarActions = await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /toolbar actions/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
        return button;
      },
      { timeout: 10000 }
    );

    await user.click(toolbarActions);

    // Verify toolbar actions are visible
    await waitFor(
      () => {
        expect(screen.getByRole('menuitem', { name: /Delete jobs/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /Cancel jobs/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  test('row action to delete job is disabled if the user does not have permissions', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Wait for jobs to load - find job with id 488 which has delete: false
    await waitFor(
      () => {
        expect(screen.getByText('488')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Find the row with job id 488 and open kebab menu
    const row = screen.getByText('488').closest('tr');
    expect(row).toBeInTheDocument();

    if (row) {
      const kebabButton = row.querySelector('button[aria-label="kebab dropdown toggle"]');
      if (kebabButton) {
        await user.click(kebabButton);

        // Verify delete button is disabled
        await waitFor(
          () => {
            const deleteButton = screen.getByRole('menuitem', { name: /Delete job/i });
            expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
          },
          { timeout: 10000 }
        );
      }
    }
  }, 20000);

  test('row action to cancel job is disabled if the selected job is not running', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Wait for jobs to load - find job with id 488 which has status "successful"
    await waitFor(
      () => {
        expect(screen.getByText('488')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Find the row with job id 488 and open kebab menu
    const row = screen.getByText('488').closest('tr');
    expect(row).toBeInTheDocument();

    if (row) {
      const kebabButton = row.querySelector('button[aria-label="kebab dropdown toggle"]');
      if (kebabButton) {
        await user.click(kebabButton);

        // Verify cancel button is disabled
        await waitFor(
          () => {
            const cancelButton = screen.getByRole('menuitem', { name: /Cancel job/i });
            expect(cancelButton).toHaveAttribute('aria-disabled', 'true');
          },
          { timeout: 10000 }
        );
      }
    }
  }, 15000);

  test('renders relaunch job button in row actions', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Verify at least one relaunch button is visible in the table
    await waitFor(
      () => {
        const relaunchButtons = screen.getAllByRole('button', { name: /Relaunch job/i });
        expect(relaunchButtons.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );
  });

  test('renders job rows with correct data from mock', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Verify some jobs from the fixture are rendered
    await waitFor(
      () => {
        // Check for some job IDs from the fixture
        expect(screen.getByText('491')).toBeInTheDocument();
        expect(screen.getByText('492')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Verify job names are rendered
    await waitFor(
      () => {
        expect(screen.getByText('Workflow1214')).toBeInTheDocument();
        const demoJobTemplates = screen.getAllByText('Demo Job Template');
        expect(demoJobTemplates.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );
  }, 15000);
});

describe('getWsAction', () => {
  const pageItemIds = [491, 492, 489, 488];

  test('should return fetch for pending status (off-page new job)', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'job', status: 'pending', unified_job_id: 999 },
        pageItemIds
      )
    ).toEqual({ type: 'fetch', jobId: 999 });
  });

  test('should return fetch for new status (off-page new job)', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'job', status: 'new', unified_job_id: 999 },
        pageItemIds
      )
    ).toEqual({ type: 'fetch', jobId: 999 });
  });

  test('should return fetch for each final status when job is on page', () => {
    for (const status of ['successful', 'failed', 'error', 'canceled']) {
      expect(
        getWsAction({ group_name: 'jobs', type: 'job', status, unified_job_id: 492 }, pageItemIds)
      ).toEqual({ type: 'fetch', jobId: 492 });
    }
  });
  test('should return skip for each final status when job is not on page', () => {
    for (const status of ['successful', 'failed', 'error', 'canceled']) {
      expect(
        getWsAction({ group_name: 'jobs', type: 'job', status, unified_job_id: 9999 }, pageItemIds)
      ).toEqual({ type: 'skip' });
    }
  });

  test('should return fetch for intermediate status when job is on page', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'job', status: 'running', unified_job_id: 492 },
        pageItemIds
      )
    ).toEqual({ type: 'fetch', jobId: 492 });
  });

  test('should return fetch for waiting status when job is on page', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'job', status: 'waiting', unified_job_id: 491 },
        pageItemIds
      )
    ).toEqual({ type: 'fetch', jobId: 491 });
  });

  test('should return skip for intermediate status when job is not on page', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'job', status: 'running', unified_job_id: 9999 },
        pageItemIds
      )
    ).toEqual({ type: 'skip' });
  });

  test('should return refresh when status is missing', () => {
    expect(
      getWsAction({ group_name: 'jobs', type: 'job', unified_job_id: 492 }, pageItemIds)
    ).toEqual({ type: 'refresh' });
  });

  test('should return refresh when unified_job_id is missing', () => {
    expect(
      getWsAction({ group_name: 'jobs', type: 'job', status: 'running' }, pageItemIds)
    ).toEqual({ type: 'refresh' });
  });

  test('should return skip for non-job group_name', () => {
    expect(
      getWsAction(
        { group_name: 'inventories', type: 'job', status: 'pending', unified_job_id: 492 },
        pageItemIds
      )
    ).toEqual({ type: 'skip' });
  });

  test('should return skip for unrecognized type', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'inventory_update', status: 'running', unified_job_id: 492 },
        pageItemIds
      )
    ).toEqual({ type: 'skip' });
  });

  test('should return skip for undefined message', () => {
    expect(getWsAction(undefined, pageItemIds)).toEqual({ type: 'skip' });
  });

  test('should handle workflow_job type', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'workflow_job', status: 'running', unified_job_id: 491 },
        pageItemIds
      )
    ).toEqual({ type: 'fetch', jobId: 491 });
  });

  test('should handle project_update type', () => {
    expect(
      getWsAction(
        { group_name: 'jobs', type: 'project_update', status: 'pending', unified_job_id: 999 },
        pageItemIds
      )
    ).toEqual({ type: 'fetch', jobId: 999 });
  });
});

describe('JobsList WebSocket handler integration', () => {
  async function renderAndWaitForJobs() {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );
    await waitFor(
      () => {
        expect(screen.getByText('491')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    expect(capturedOnMessage).toBeDefined();
  }

  test('should fetch individual job via filtered list query on pending status for new job', async () => {
    let fetchedWithId: string | null = null;
    let fetchedCountDisabled: string | null = null;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/unified_jobs/') && url.searchParams.get('id')) {
        fetchedWithId = url.searchParams.get('id');
        fetchedCountDisabled = url.searchParams.get('count_disabled');
      }
    });

    await renderAndWaitForJobs();

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'pending',
      unified_job_id: 999,
    });

    await waitFor(() => {
      expect(fetchedWithId).toBe('999');
      expect(fetchedCountDisabled).toBe('1');
    });

    server.events.removeAllListeners();
  }, 15000);

  test('should fetch individual job via filtered list query on final status for on-page job', async () => {
    let fetchedWithId: string | null = null;
    let fetchedCountDisabled: string | null = null;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/unified_jobs/') && url.searchParams.get('id')) {
        fetchedWithId = url.searchParams.get('id');
        fetchedCountDisabled = url.searchParams.get('count_disabled');
      }
    });

    await renderAndWaitForJobs();

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'successful',
      unified_job_id: 492,
    });

    await waitFor(() => {
      expect(fetchedWithId).toBe('492');
      expect(fetchedCountDisabled).toBe('1');
    });

    server.events.removeAllListeners();
  }, 15000);

  test('should fetch individual job via filtered list query on intermediate status', async () => {
    let fetchedWithId: string | null = null;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/unified_jobs/') && url.searchParams.get('id')) {
        fetchedWithId = url.searchParams.get('id');
      }
    });

    await renderAndWaitForJobs();

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'running',
      unified_job_id: 492,
    });

    await waitFor(() => {
      expect(fetchedWithId).toBe('492');
    });

    server.events.removeAllListeners();
  }, 15000);

  test('should skip for intermediate status when job is not on page', async () => {
    let fetchedWithId: string | null = null;
    server.events.on('request:match', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('/unified_jobs/') && url.searchParams.get('id')) {
        fetchedWithId = url.searchParams.get('id');
      }
    });

    await renderAndWaitForJobs();

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'running',
      unified_job_id: 9999,
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(fetchedWithId).toBeNull();
    server.events.removeAllListeners();
  }, 15000);
});
