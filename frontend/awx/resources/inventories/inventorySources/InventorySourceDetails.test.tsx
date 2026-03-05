import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventorySourceDetails } from './InventorySourceDetails';

const mockInventorySource = {
  id: 1,
  name: 'Test Inventory Source',
  description: 'Test description',
  source: 'scm',
  inventory: 1,
  update_on_launch: false,
  overwrite: false,
  overwrite_vars: false,
  source_path: '',
  source_vars: '---',
  scm_branch: '',
  update_cache_timeout: 0,
  host_filter: '',
  enabled_var: '',
  enabled_value: '',
  verbosity: 0,
  custom_virtualenv: null,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-02T00:00:00Z',
  summary_fields: {
    inventory: { id: 1, name: 'Demo Inventory', kind: '' },
    organization: { id: 1, name: 'Default' },
    credential: null,
    source_project: null,
    execution_environment: null,
    created_by: null,
    modified_by: null,
    current_job: null,
    last_job: null,
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/1/'),
    () => HttpResponse.json(mockInventorySource)
  ),
  http.options(
    ({ request }) => request.url.includes('inventory_sources'),
    () =>
      HttpResponse.json({
        actions: { GET: { source: { choices: [['scm', 'Sourced from a Project']] } } },
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventorySourceDetails', () => {
  it('should render source name', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/sources/1/details']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/sources/:source_id/details"
            element={<InventorySourceDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Inventory Source')).toBeInTheDocument();
    });
  });
});
