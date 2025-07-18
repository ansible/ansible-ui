import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockEmptyUsers from '../../../platform/access/organizations/components/emptyUsers.fixture.json';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';

describe('Resource User Access', () => {
  const server = setupServer(
    http.get(awxAPI`/role_user_assignments/`, () => {
      return HttpResponse.json(mockEmptyUsers);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should show empty state when no users are assigned to resource', async () => {
    server.use(
      http.get(awxAPI`/role_user_assignments/`, () => {
        return HttpResponse.json(mockEmptyUsers);
      })
    );

    render(
      <MemoryRouter initialEntries={['/role_user_assignments/']}>
        <Routes>
          <Route
            path="/role_user_assignments/"
            element={
              <UserAccess
                service="awx"
                id={''}
                type={'credential'}
                addRolesRoute={AwxRoute.CredentialAddUsers}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No users assigned to this {{resourceType}}./)).toBeInTheDocument();
      expect(
        screen.getByText(/To get started, assign users to this {{resourceType}}./)
      ).toBeInTheDocument();
      expect(screen.getByText(/Assign users/)).toBeInTheDocument();
    });
  });
});
