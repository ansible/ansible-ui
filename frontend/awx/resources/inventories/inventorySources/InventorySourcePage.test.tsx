import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventorySourcePage } from './InventorySourcePage';

const inventorySource = {
  id: 10,
  type: 'inventory_source',
  url: '/api/v2/inventory_sources/10/',
  name: 'Test Source',
  source: 'scm',
  inventory: 1,
  summary_fields: {
    inventory: { id: 1, name: 'Demo Inventory', kind: '' },
    user_capabilities: { edit: true, delete: true, start: true },
  },
  created: '',
  modified: '',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/10'),
    () => HttpResponse.json(inventorySource)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventorySourcePage', () => {
  it('should render inventory source page with source name', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/sources/10']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/sources/:source_id"
            element={<InventorySourcePage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Source');
    });
  });
});
