import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialManageUsers } from './CredentialManageUsers';

vi.mock('../../../../common/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-roles" />,
}));

const server = setupServer(
  http.get(awxAPI`/credentials/7/`, () =>
    HttpResponse.json({ id: 7, name: 'Machine Cred', type: 'credential' })
  ),
  http.get('*/api/gateway/v1/users/*', () =>
    HttpResponse.json({ results: [{ id: 3, username: 'jdoe' }] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialManageUsers', () => {
  it('renders manage roles header after data loads', async () => {
    render(
      <MemoryRouter initialEntries={['/credentials/7/user-access/3/manage']}>
        <Routes>
          <Route
            path="/credentials/:resource_id/user-access/:user_id/manage"
            element={<CredentialManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('manage-roles')).toBeInTheDocument();
      expect(
        screen.getByText(/Manage roles directly assigned to jdoe for Machine Cred/)
      ).toBeInTheDocument();
    });
  });
});
