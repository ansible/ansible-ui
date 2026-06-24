/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryHostPage } from './InventoryHostPage';

const mockHost = {
  id: 42,
  name: 'test-host',
  type: 'host',
  inventory: 1,
  enabled: true,
  variables: '---',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {},
};

const server = setupServer(
  http.get(awxAPI`/inventories/1/`, () =>
    HttpResponse.json({
      id: 1,
      name: 'Test Inventory',
      type: 'inventory',
    })
  ),
  http.get(
    ({ request }) => request.url.includes('/hosts/') && request.url.includes('42'),
    () => HttpResponse.json(mockHost)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryHostPage', () => {
  test('should render page with host name when loaded', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/hosts/42/details']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/hosts/:host_id/*"
            element={<InventoryHostPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'test-host' })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  test('should show Facts, Groups, and Jobs tabs for constructed inventory hosts', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/constructed_inventory/1/hosts/42/details']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/hosts/:host_id/*"
            element={<InventoryHostPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('tab', { name: 'Facts' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Groups' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Jobs' })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
});
