import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventoryJobs } from './InventoryJobs';

const mockJobsResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/unified_jobs/'),
    () => HttpResponse.json(mockJobsResponse)
  ),
  http.options(
    ({ request }) => request.url.includes('/unified_jobs/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryJobs', () => {
  it('should render jobs list for inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/jobs']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/jobs" element={<InventoryJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No jobs yet')).toBeInTheDocument();
    });
  });
});
