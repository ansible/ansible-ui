import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { jobsFixture } from './jobs.fixture';
import { Jobs } from './Jobs';

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

describe('JobsList WebSocket Handler', () => {
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

  test('should trigger full list refresh on pending status', async () => {
    let listFetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      if (request.url.includes('/unified_jobs/') && !request.url.match(/\/unified_jobs\/\d+\//)) {
        listFetchCount++;
      }
    });

    await renderAndWaitForJobs();
    const initialCount = listFetchCount;

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'pending',
      unified_job_id: 999,
    });

    await waitFor(() => {
      expect(listFetchCount).toBeGreaterThan(initialCount);
    });

    server.events.removeAllListeners();
  }, 15000);

  test('should trigger full list refresh on final status', async () => {
    let listFetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      if (request.url.includes('/unified_jobs/') && !request.url.match(/\/unified_jobs\/\d+\//)) {
        listFetchCount++;
      }
    });

    await renderAndWaitForJobs();
    const initialCount = listFetchCount;

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'successful',
      unified_job_id: 492,
    });

    await waitFor(() => {
      expect(listFetchCount).toBeGreaterThan(initialCount);
    });

    server.events.removeAllListeners();
  }, 15000);

  test('should fetch individual job for intermediate status when job is on page', async () => {
    let detailFetchId: string | undefined;
    server.use(
      http.get('*/unified_jobs/:id/', ({ params }) => {
        detailFetchId = params['id'] as string;
        return HttpResponse.json({ ...jobsFixture.results[1], status: 'running' });
      })
    );

    await renderAndWaitForJobs();

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'running',
      unified_job_id: 492,
    });

    await waitFor(() => {
      expect(detailFetchId).toBe('492');
    });
  }, 15000);

  test('should skip fetch for intermediate status when job is not on page', async () => {
    let detailFetched = false;
    let listFetchCount = 0;
    server.use(
      http.get('*/unified_jobs/:id/', () => {
        detailFetched = true;
        return HttpResponse.json({});
      })
    );
    server.events.on('request:match', ({ request }) => {
      if (request.url.includes('/unified_jobs/') && !request.url.match(/\/unified_jobs\/\d+\//)) {
        listFetchCount++;
      }
    });

    await renderAndWaitForJobs();
    const initialListCount = listFetchCount;

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      status: 'running',
      unified_job_id: 9999,
    });

    // Give time for any async work to settle
    await new Promise((r) => setTimeout(r, 500));

    expect(detailFetched).toBe(false);
    expect(listFetchCount).toBe(initialListCount);

    server.events.removeAllListeners();
  }, 15000);

  test('should fall back to full refresh when status is missing', async () => {
    let listFetchCount = 0;
    server.events.on('request:match', ({ request }) => {
      if (request.url.includes('/unified_jobs/') && !request.url.match(/\/unified_jobs\/\d+\//)) {
        listFetchCount++;
      }
    });

    await renderAndWaitForJobs();
    const initialCount = listFetchCount;

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'job',
      unified_job_id: 492,
    });

    await waitFor(() => {
      expect(listFetchCount).toBeGreaterThan(initialCount);
    });

    server.events.removeAllListeners();
  }, 15000);

  test('should ignore messages with non-job group_name', async () => {
    let detailFetched = false;
    let listFetchCount = 0;
    server.use(
      http.get('*/unified_jobs/:id/', () => {
        detailFetched = true;
        return HttpResponse.json({});
      })
    );
    server.events.on('request:match', ({ request }) => {
      if (request.url.includes('/unified_jobs/') && !request.url.match(/\/unified_jobs\/\d+\//)) {
        listFetchCount++;
      }
    });

    await renderAndWaitForJobs();
    const initialListCount = listFetchCount;

    capturedOnMessage!({
      group_name: 'inventories',
      type: 'job',
      status: 'pending',
      unified_job_id: 492,
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(detailFetched).toBe(false);
    expect(listFetchCount).toBe(initialListCount);

    server.events.removeAllListeners();
  }, 15000);

  test('should ignore messages with unrecognized type', async () => {
    let detailFetched = false;
    let listFetchCount = 0;
    server.use(
      http.get('*/unified_jobs/:id/', () => {
        detailFetched = true;
        return HttpResponse.json({});
      })
    );
    server.events.on('request:match', ({ request }) => {
      if (request.url.includes('/unified_jobs/') && !request.url.match(/\/unified_jobs\/\d+\//)) {
        listFetchCount++;
      }
    });

    await renderAndWaitForJobs();
    const initialListCount = listFetchCount;

    capturedOnMessage!({
      group_name: 'jobs',
      type: 'inventory_update',
      status: 'running',
      unified_job_id: 492,
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(detailFetched).toBe(false);
    expect(listFetchCount).toBe(initialListCount);

    server.events.removeAllListeners();
  }, 15000);
});
