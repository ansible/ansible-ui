/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivationManageUsers } from './EdaRulebookActivationManageUsers';

const mockActivation = {
  id: 1,
  name: 'Test Activation',
  description: 'A test activation',
  is_enabled: true,
  status: 'running',
};

const mockUsers = {
  count: 1,
  results: [
    {
      id: 10,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
  ],
};

const server = setupServer(
  http.get(edaAPI`/activations/1/`, () => {
    return HttpResponse.json(mockActivation);
  }),
  http.get('*/users/', () => {
    return HttpResponse.json(mockUsers);
  }),
  http.get('*/role_definitions/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get('*/role_user_assignments/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  })
);

describe('EdaRulebookActivationManageUsers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the page with user and activation names', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/eda.activation/1/users/abc-123/roles']}>
        <Routes>
          <Route
            path="/rulebook-activations/:resource_type/:resource_id/users/:user_id/roles"
            element={<EdaRulebookActivationManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Manage roles directly assigned to testuser for Test Activation/)
      ).toBeInTheDocument();
    });
  });

  it('should render breadcrumbs with activation name', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/eda.activation/1/users/abc-123/roles']}>
        <Routes>
          <Route
            path="/rulebook-activations/:resource_type/:resource_id/users/:user_id/roles"
            element={<EdaRulebookActivationManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('RulebookActivations')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Activation')).toBeInTheDocument();
    });
    expect(screen.getByText('User Access')).toBeInTheDocument();
  });

  it('should handle user not found', async () => {
    server.use(
      http.get(edaAPI`/users/`, () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/eda.activation/1/users/no-user/roles']}>
        <Routes>
          <Route
            path="/rulebook-activations/:resource_type/:resource_id/users/:user_id/roles"
            element={<EdaRulebookActivationManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Manage roles directly assigned to.*for Test Activation/)
      ).toBeInTheDocument();
    });
  });
});
