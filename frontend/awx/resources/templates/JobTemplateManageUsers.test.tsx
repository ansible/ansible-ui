import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { JobTemplateManageUsers } from './JobTemplateManageUsers';

vi.mock('../../../common/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const server = setupServer(
  http.get(awxAPI`/job_templates/3/`, () =>
    HttpResponse.json({ id: 3, name: 'Demo Job Template', type: 'job_template' })
  ),
  http.get('*/api/gateway/v1/users/*', () =>
    HttpResponse.json({
      results: [{ id: 2, username: 'jt-user', first_name: 'JT', last_name: 'User' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobTemplateManageUsers', () => {
  it('renders manage roles page for a user', async () => {
    render(
      <MemoryRouter
        initialEntries={['/templates/job_template/3/user-access/awx.job_template/2/manage']}
      >
        <Routes>
          <Route
            path="/templates/job_template/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<JobTemplateManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'Manage roles directly assigned to jt-user for Demo Job Template',
        })
      ).toBeInTheDocument();
    });
  });

  it('shows loading page until job template and user data are available', () => {
    render(
      <MemoryRouter
        initialEntries={['/templates/job_template/3/user-access/awx.job_template/2/manage']}
      >
        <Routes>
          <Route
            path="/templates/job_template/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<JobTemplateManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });
});
