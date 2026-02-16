import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventoryAssignTeams } from './InventoryAssignTeams';

const mockInventory = {
  id: 1,
  name: 'Test Inventory',
  type: 'inventory',
  kind: '',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/inventories/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockInventory)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/teams'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryAssignTeams', () => {
  it('should render wizard with Select team(s) step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/team-access/assign']}>
        <Routes>
          <Route path="/inventories/:id/team-access/assign" element={<InventoryAssignTeams />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
