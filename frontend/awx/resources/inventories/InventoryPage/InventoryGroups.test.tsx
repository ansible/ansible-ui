import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryGroups } from './InventoryGroups';

const server = setupServer(
  http.options(awxAPI`/groups/`, () => HttpResponse.json({ actions: { POST: {}, GET: {} } })),
  http.options(
    ({ request }: { request: Request }) =>
      request.url.includes('/inventories/') && request.url.includes('/groups/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }: { request: Request }) =>
      request.url.includes('/inventories/') && request.url.includes('/groups/'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryGroups', () => {
  it('should render inventory groups with empty state', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/groups']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/groups" element={<InventoryGroups />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const emptyText =
        screen.queryByText('No groups are assigned to this inventory.') ??
        screen.queryByText('Create group');
      expect(emptyText).toBeInTheDocument();
    });
  });
});
