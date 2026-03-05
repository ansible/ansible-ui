import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstanceGroupAddUsers } from './InstanceGroupAddUsers';

const mockInstanceGroup = {
  id: 1,
  name: 'Test Instance Group',
  is_container_group: false,
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/instance_groups/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockInstanceGroup)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/users'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupAddUsers', () => {
  it('should render wizard with Select user(s) step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/1/instance-groups/users/add-users']}>
        <Routes>
          <Route
            path="/instance-groups/:id/instance-groups/users/add-users"
            element={<InstanceGroupAddUsers />}
          />
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
