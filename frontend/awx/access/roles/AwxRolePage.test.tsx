import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { ContentTypeEnum } from '../../interfaces/ContentType';
import { AwxRolePage } from './AwxRolePage';

const mockRole: AwxRbacRole = {
  id: 1,
  url: '/api/v2/role_definitions/1/',
  related: {
    team_assignments: '/api/v2/role_definitions/1/team_assignments/',
    user_assignments: '/api/v2/role_definitions/1/user_assignments/',
  },
  summary_fields: {},
  permissions: ['awx.change_credential', 'awx.delete_credential', 'awx.use_credential'],
  content_type: ContentTypeEnum.Credential,
  created: '2024-01-01T00:00:00.000000Z',
  modified: '2024-01-01T00:00:00.000000Z',
  name: 'Credential Admin',
  description: 'Has all permissions to a single credential',
  managed: true,
  created_by: null,
  modified_by: null,
};

const server = setupServer(
  http.get(awxAPI`/role_definitions/1/`, () => {
    return HttpResponse.json(mockRole);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRolePage', () => {
  it('should render the page title with role name', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/1']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRolePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Credential Admin');
    });
  });

  it('should display Roles in breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/1']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRolePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Roles')).toBeInTheDocument();
    });
  });

  it('should display Details tab', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/1']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRolePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    });
  });

  it('should display Back to Roles tab', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/1']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRolePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Back to Roles')).toBeInTheDocument();
    });
  });
});
