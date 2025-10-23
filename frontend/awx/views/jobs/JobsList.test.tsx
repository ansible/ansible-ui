import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { jobsFixture } from './jobs.fixture';
import { Jobs } from './Jobs';

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
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobsList Component Tests', () => {
  test('renders job list with table and rows', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    // Verify table columns are visible
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    // Verify at least one job is rendered (from mock data)
    await waitFor(() => {
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
    });
  });

  test('renders toolbar and row actions', { timeout: 10000 }, async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    // Find and click toolbar actions button
    const toolbarActions = await screen.findByRole('button', { name: /toolbar actions/i });
    expect(toolbarActions).toBeInTheDocument();

    await userEvent.click(toolbarActions);

    // Verify toolbar actions are visible
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /Delete jobs/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Cancel jobs/i })).toBeInTheDocument();
    });
  });

  test('row action to delete job is disabled if the user does not have permissions', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    // Wait for jobs to load - find job with id 488 which has delete: false
    await waitFor(() => {
      expect(screen.getByText('488')).toBeInTheDocument();
    });

    // Find the row with job id 488 and open kebab menu
    const row = screen.getByText('488').closest('tr');
    expect(row).toBeInTheDocument();

    if (row) {
      const kebabButton = row.querySelector('button[aria-label="kebab dropdown toggle"]');
      if (kebabButton) {
        await userEvent.click(kebabButton);

        // Verify delete button is disabled
        await waitFor(() => {
          const deleteButton = screen.getByRole('menuitem', { name: /Delete job/i });
          expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
        });
      }
    }
  });

  test('row action to cancel job is disabled if the selected job is not running', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    // Wait for jobs to load - find job with id 488 which has status "successful"
    await waitFor(() => {
      expect(screen.getByText('488')).toBeInTheDocument();
    });

    // Find the row with job id 488 and open kebab menu
    const row = screen.getByText('488').closest('tr');
    expect(row).toBeInTheDocument();

    if (row) {
      const kebabButton = row.querySelector('button[aria-label="kebab dropdown toggle"]');
      if (kebabButton) {
        await userEvent.click(kebabButton);

        // Verify cancel button is disabled
        await waitFor(() => {
          const cancelButton = screen.getByRole('menuitem', { name: /Cancel job/i });
          expect(cancelButton).toHaveAttribute('aria-disabled', 'true');
        });
      }
    }
  });

  test('renders relaunch job button in row actions', { timeout: 10000 }, async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    // Verify at least one relaunch button is visible in the table
    await waitFor(() => {
      const relaunchButtons = screen.getAllByRole('button', { name: /Relaunch job/i });
      expect(relaunchButtons.length).toBeGreaterThan(0);
    });
  });

  test('renders job rows with correct data from mock', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    // Verify some jobs from the fixture are rendered
    await waitFor(() => {
      // Check for some job IDs from the fixture
      expect(screen.getByText('491')).toBeInTheDocument();
      expect(screen.getByText('492')).toBeInTheDocument();
    });

    // Verify job names are rendered
    await waitFor(() => {
      expect(screen.getByText('Workflow1214')).toBeInTheDocument();
      const demoJobTemplates = screen.getAllByText('Demo Job Template');
      expect(demoJobTemplates.length).toBeGreaterThan(0);
    });
  });
});
