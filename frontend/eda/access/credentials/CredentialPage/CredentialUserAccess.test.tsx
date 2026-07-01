/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { CredentialUserAccess } from './CredentialUserAccess';

const mockUserAccessResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      username: 'creduser',
      first_name: 'Cred',
      last_name: 'User',
      is_superuser: false,
      object_role_assignments: [
        {
          id: 301,
          role_definition: { id: 201, name: 'EDA Credential Admin' },
        },
      ],
    },
  ],
};

const mockRoleDefinitionsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 200,
  page: 1,
  results: [
    {
      id: 201,
      name: 'EDA Credential Admin',
      url: '/api/gateway/v1/role_definitions/201/',
    },
  ],
};

const server = setupServer(
  http.get('*/role_user_access/*', () => HttpResponse.json(mockUserAccessResponse)),
  http.get(edaAPI`/role_definitions/`, () => HttpResponse.json(mockRoleDefinitionsResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/credentials/10/user-access']}>
      <Routes>
        <Route path="/credentials/:id/user-access" element={<CredentialUserAccess />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CredentialUserAccess', () => {
  it('should render user access info alert', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Below displays a list of users with access to this resource/i)
      ).toBeInTheDocument();
    });
  });

  it('should render user data from the API', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('creduser')).toBeInTheDocument();
    });
  });

  it('should render the Username column header', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('username-column-header')).toBeInTheDocument();
    });
  });
});
