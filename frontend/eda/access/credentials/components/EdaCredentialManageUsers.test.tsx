/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredentialManageUsers } from './EdaCredentialManageUsers';

const mockCredential = {
  id: 1,
  name: 'Test Credential',
  description: 'A test credential',
  credential_type: { id: 1, name: 'Machine', kind: 'cloud' },
};

const mockUsers = {
  count: 1,
  next: null,
  previous: null,
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
  http.get(edaAPI`/eda-credentials/1/`, () => HttpResponse.json(mockCredential)),
  http.get('*/v1/users/*', () => HttpResponse.json(mockUsers)),
  http.get('*/role_definitions/*', () => HttpResponse.json({ count: 0, results: [] })),
  http.get('*/role_user_assignments/*', () => HttpResponse.json({ count: 0, results: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/credentials/eda.edacredential/1/users/user-abc-123/roles']}>
      <Routes>
        <Route
          path="/credentials/:resource_type/:resource_id/users/:user_id/roles"
          element={<EdaCredentialManageUsers />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaCredentialManageUsers', () => {
  it('should render page header with credential and user name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Manage roles directly assigned to testuser for Test Credential/)
      ).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Credentials')).toBeInTheDocument();
      expect(screen.getByText('Test Credential')).toBeInTheDocument();
      expect(screen.getByText('User Access')).toBeInTheDocument();
    });
  });
});
