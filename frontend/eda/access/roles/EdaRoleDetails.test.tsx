/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaRoleDetails } from './EdaRoleDetails';

vi.mock('../../common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => ({
    activeEdaUser: {
      id: 1,
      username: 'admin',
      is_superuser: true,
    },
  }),
}));

const mockRole = {
  id: 1,
  name: 'Project Admin',
  description: 'Has all project permissions',
  content_type: 'eda.project',
  permissions: ['eda.view_project', 'eda.change_project', 'eda.delete_project'],
  managed: true,
  created: '2024-04-10T17:43:26.032037Z',
  modified: '2024-04-10T17:43:26.032048Z',
};

describe('EdaRoleDetails', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders role details', async () => {
    server.use(
      http.get('*/role_definitions/1/', () => {
        return HttpResponse.json(mockRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/roles/1/details']}>
        <Routes>
          <Route path="/roles/:id/details" element={<EdaRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Admin')).toBeInTheDocument();
    });
  });
});
