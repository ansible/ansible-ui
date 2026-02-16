import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventoryPage } from './InventoryPage';

const mockInventory = {
  id: 1,
  name: 'Test Inventory',
  kind: '',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    user_capabilities: {},
  },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/') &&
      request.url.includes('/1/') &&
      !request.url.includes('inventory_sources'),
    () => HttpResponse.json(mockInventory)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryPage', () => {
  it('should display inventory name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id" element={<InventoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Inventory');
    });
  });
});
