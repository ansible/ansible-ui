/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ContentTypeEnum } from '../../../interfaces/expanded/ContentType';
import { HubRolePage } from './HubRolePage';

const mockRole = {
  id: 5,
  name: 'galaxy.custom_role',
  description: 'Custom role',
  managed: false,
  content_type: ContentTypeEnum.Namespace,
  permissions: ['galaxy.view_namespace'],
  modified: '',
  created: '',
  url: '',
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
  modified_by: null,
  created_by: null,
};

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    user: { is_superuser: true },
    hasPermission: () => true,
  }),
}));

vi.mock('../hooks/useDeleteRoles', () => ({
  useDeleteRoles: () => vi.fn(),
}));

describe('HubRolePage', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders role page header with role name', async () => {
    server.use(http.get('*/_ui/v2/role_definitions/5/', () => HttpResponse.json(mockRole)));

    render(
      <MemoryRouter initialEntries={['/roles/5']}>
        <Routes>
          <Route path="/roles/:id/*" element={<HubRolePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'galaxy.custom_role' })).toBeInTheDocument();
    });
  });
});
