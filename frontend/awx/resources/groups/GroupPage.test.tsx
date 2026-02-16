import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { GroupPage } from './GroupPage';

const mockGroup = {
  id: 1,
  name: 'Test Group',
  inventory: 42,
  summary_fields: {
    inventory: { id: 42, name: 'Demo Inventory' },
    user_capabilities: {},
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/groups/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GroupPage', () => {
  it('should display group name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/42/groups/1']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/groups/:group_id" element={<GroupPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Group');
    });
  });
});
