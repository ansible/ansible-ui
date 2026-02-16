import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstanceGroupUserAccess } from './InstanceGroupUserAccess';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('instance_groups') && request.url.includes('/1/'),
    () =>
      HttpResponse.json({
        id: 1,
        name: 'Test Group',
        type: 'instance_group',
        url: '/api/v2/instance_groups/1/',
      })
  ),
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(
    ({ request }) => request.url.includes('role_user_access'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupUserAccess', () => {
  it('should render user access view', async () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/1/user-access']}>
        <Routes>
          <Route path="/instance-groups/:id/user-access" element={<InstanceGroupUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Below displays a list of users with access/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
