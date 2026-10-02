import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySources } from './InventorySources';

const emptySources = { count: 0, next: null, previous: null, results: [] };

const server = setupServer(
  http.options(awxAPI`/inventory_sources/`, () => HttpResponse.json({ actions: { POST: {} } })),
  http.options(
    ({ request }: { request: Request }) =>
      request.url.includes('/inventories/') && request.url.includes('inventory_sources'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }: { request: Request }) =>
      request.url.includes('/inventories/') && request.url.includes('inventory_sources'),
    () => HttpResponse.json(emptySources)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventorySources', () => {
  it('should render inventory sources view for inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/inventory_sources']}>
        <Routes>
          <Route path="/inventories/:id/inventory_sources" element={<InventorySources />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByText('There are currently no sources assigned to this inventory.')
      ).toBeInTheDocument();
    });
  });
});
