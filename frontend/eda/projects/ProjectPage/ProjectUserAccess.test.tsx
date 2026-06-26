/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProjectUserAccess } from './ProjectUserAccess';

const mockUserAccessResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      is_superuser: false,
      object_role_assignments: [
        {
          id: 301,
          role_definition: { id: 201, name: 'EDA Project Admin' },
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
      name: 'EDA Project Admin',
      url: '/api/gateway/v1/role_definitions/201/',
    },
  ],
};

const server = setupServer(
  http.get('*/role_user_access/*', () => HttpResponse.json(mockUserAccessResponse)),
  http.get('*/role_definitions/', () => HttpResponse.json(mockRoleDefinitionsResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/projects/10/user-access']}>
      <Routes>
        <Route path="/projects/:id/user-access" element={<ProjectUserAccess />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectUserAccess', () => {
  it('should render the info alert about user access', async () => {
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
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('should display the Username column header', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('username-column-header')).toBeInTheDocument();
    });
  });
});
