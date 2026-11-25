/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaAddUserRoles } from './EdaAddUserRoles';

const mockUser = {
  id: 7,
  username: 'eda-user',
  email: 'eda-user@example.com',
  first_name: 'Eda',
  last_name: 'User',
};

const resourceTypeOptions = {
  actions: {
    GET: {
      content_type: {
        choices: [
          { value: 'eda.project', display_name: 'Project' },
          { value: 'eda.credential', display_name: 'Credential' },
        ],
      },
    },
  },
};

const server = setupServer(
  http.get(edaAPI`/users/7/`, () => HttpResponse.json(mockUser)),
  http.options(edaAPI`/role_definitions/`, () => HttpResponse.json(resourceTypeOptions))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/users/7/roles/add']}>
      <Routes>
        <Route path="/users/:id/roles/add" element={<EdaAddUserRoles />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaAddUserRoles', () => {
  it('renders page header and add roles wizard after loading the user', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Assign users' })).toBeInTheDocument();
    });

    expect(screen.getByText('eda-user')).toBeInTheDocument();
    expect(screen.getAllByText('Select a resource type').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });
});
