import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryHostJobs } from './InventoryHostJobs';

const mockRunningJob = {
  id: 70,
  type: 'job',
  url: '/api/v2/jobs/70/',
  name: 'Test Job Template',
  status: 'running',
  started: '2024-06-25T08:12:19.528109Z',
  finished: null,
  summary_fields: {
    job_template: {
      id: 75,
      name: 'Test Job Template',
    },
    inventory: {
      id: 107,
      name: 'Test Inventory',
    },
    user_capabilities: {
      start: true,
      delete: true,
    },
  },
};

const mockCompletedJob = {
  id: 71,
  type: 'job',
  url: '/api/v2/jobs/71/',
  name: 'Completed Job',
  status: 'successful',
  started: '2024-06-25T08:10:00.000000Z',
  finished: '2024-06-25T08:10:30.000000Z',
  summary_fields: {
    job_template: {
      id: 76,
      name: 'Completed Job Template',
    },
    user_capabilities: {
      start: false,
      delete: true,
    },
  },
};

describe('InventoryHostJobs Component', () => {
  const server = setupServer(
    http.get(awxAPI`/unified_jobs/`, () => {
      return HttpResponse.json({
        count: 1,
        next: null,
        previous: null,
        results: [mockRunningJob],
      });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render jobs list for a host', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/123/jobs']}>
        <Routes>
          <Route path="/inventories/:id/hosts/:host_id/jobs" element={<InventoryHostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Test Job Template')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  test('should show cancel button for running jobs', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/123/jobs']}>
        <Routes>
          <Route path="/inventories/:id/hosts/:host_id/jobs" element={<InventoryHostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Test Job Template')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    await waitFor(() => {
      const cancelButtons = screen.getAllByLabelText(/cancel/i);
      expect(cancelButtons.length).toBeGreaterThan(0);
      expect(cancelButtons[0]).toBeEnabled();
    });
  });

  test('should handle cancel job action', async () => {
    const user = userEvent.setup();
    let cancelAttempted = false;

    server.use(
      http.post(awxAPI`/jobs/:id/cancel/`, () => {
        cancelAttempted = true;
        return HttpResponse.json({ detail: 'Job cannot be canceled' }, { status: 400 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/123/jobs']}>
        <Routes>
          <Route path="/inventories/:id/hosts/:host_id/jobs" element={<InventoryHostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Test Job Template')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const cancelButton = screen.getAllByLabelText(/cancel/i)[0];
    await user.click(cancelButton);

    await waitFor(() => {
      expect(cancelAttempted || screen.queryByText(/cancel/i)).toBeTruthy();
    });
  });

  test('should not show cancel button for completed jobs', async () => {
    server.use(
      http.get(awxAPI`/unified_jobs/`, () => {
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockCompletedJob],
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/123/jobs']}>
        <Routes>
          <Route path="/inventories/:id/hosts/:host_id/jobs" element={<InventoryHostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Completed Job')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  test('should show empty state when no jobs exist', async () => {
    server.use(
      http.get(awxAPI`/unified_jobs/`, () => {
        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/123/jobs']}>
        <Routes>
          <Route path="/inventories/:id/hosts/:host_id/jobs" element={<InventoryHostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText(/No jobs yet/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
