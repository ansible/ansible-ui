import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventoryHostDetails } from './InventoryHostDetails';

const mockHost = {
  id: 42,
  name: 'test-host-01',
  description: 'Test host',
  inventory: 1,
  enabled: true,
  variables: '---',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    inventory: { id: 1, name: 'Default', kind: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    recent_jobs: [],
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/hosts/'),
    () => HttpResponse.json(mockHost)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryHostDetails', () => {
  it('should render host details with host name', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/hosts/42/details']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/hosts/:host_id/details"
            element={<InventoryHostDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-host-01')).toBeInTheDocument();
    });
  });
});
