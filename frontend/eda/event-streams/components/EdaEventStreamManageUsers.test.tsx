/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStreamManageUsers } from './EdaEventStreamManageUsers';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: ({
    resource,
    user,
  }: {
    resource: { name: string };
    user?: { username: string };
  }) => (
    <div>
      <span>{resource.name}</span>
      <span>{user?.username ?? 'no-user'}</span>
    </div>
  ),
}));

const server = setupServer();

function renderComponent(resourceId = '15') {
  return render(
    <MemoryRouter
      initialEntries={[`/event-streams/${resourceId}/user-access/eda.eventstream/user-1/manage`]}
    >
      <Routes>
        <Route
          path="/event-streams/:resource_id/user-access/:resource_type/:user_id/manage"
          element={<EdaEventStreamManageUsers />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaEventStreamManageUsers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should show a loading page until the event stream is available', () => {
    server.use(
      http.get(edaAPI`/event-streams/99/`, () => HttpResponse.json({}, { status: 404 })),
      http.get(/gateway\/v1\/users/, () => HttpResponse.json({ results: [] }))
    );

    renderComponent('99');
    expect(screen.queryByText('Test Event Stream')).not.toBeInTheDocument();
  });

  it('should render manage-roles heading with the user and event stream names', async () => {
    server.use(
      http.get(edaAPI`/event-streams/15/`, () =>
        HttpResponse.json({ id: 15, name: 'Test Event Stream' })
      ),
      http.get(/gateway\/v1\/users/, () =>
        HttpResponse.json({
          results: [{ id: 101, username: 'testuser' }],
        })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Manage roles directly assigned to/ })
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText('Test Event Stream').length).toBeGreaterThan(0);
  });

  it('should render manage roles without a username when no user is returned', async () => {
    server.use(
      http.get(edaAPI`/event-streams/15/`, () =>
        HttpResponse.json({ id: 15, name: 'Test Event Stream' })
      ),
      http.get(/gateway\/v1\/users/, () => HttpResponse.json({ results: [] }))
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Manage roles directly assigned to/ })
      ).toBeInTheDocument();
    });
  });
});
