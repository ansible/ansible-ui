import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { GroupRelatedGroups } from './GroupRelatedGroups';

const emptyGroups = { count: 0, next: null, previous: null, results: [] };

const server = setupServer(
  http.options(awxAPI`/groups/`, () => HttpResponse.json({ actions: {} })),
  http.options(
    ({ request }) => request.url.includes('/children'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/groups/') && request.url.includes('/children'),
    () => HttpResponse.json(emptyGroups)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GroupRelatedGroups', () => {
  it('should render related groups view', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/inventory/group/1/related-groups']}>
        <Routes>
          <Route
            path="/inventories/:id/:inventory_type/group/:group_id/related-groups"
            element={<GroupRelatedGroups />}
          />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to add related groups.')
      ).toBeInTheDocument();
    });
  });
});
