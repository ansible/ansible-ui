import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { GroupHosts } from './GroupHosts';

const emptyHosts = { count: 0, next: null, previous: null, results: [] };

const server = setupServer(
  http.options(awxAPI`/hosts/`, () => HttpResponse.json({ actions: {} })),
  http.options(
    ({ request }) => request.url.includes('all_hosts'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/groups/') && request.url.includes('all_hosts'),
    () => HttpResponse.json(emptyHosts)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GroupHosts', () => {
  it('should render group hosts view', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/inventory/group/1/hosts']}>
        <Routes>
          <Route
            path="/inventories/:id/:inventory_type/group/:group_id/hosts"
            element={<GroupHosts />}
          />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('You do not have permission to create a host')).toBeInTheDocument();
    });
  });
});
