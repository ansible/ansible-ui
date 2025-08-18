import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockEmptyTeams from '../../../platform/access/organizations/components/fixtures/emptyTeams.fixture.json';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';

describe('Resource Team Access', () => {
  const server = setupServer(
    http.get(awxAPI`/role_team_assignments/`, () => {
      return HttpResponse.json(mockEmptyTeams);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should show empty state when no teams are assigned to resource', async () => {
    server.use(
      http.get(awxAPI`/role_team_assignments/`, () => {
        return HttpResponse.json(mockEmptyTeams);
      })
    );

    render(
      <MemoryRouter initialEntries={['/role_team_assignments/']}>
        <Routes>
          <Route
            path="/role_team_assignments/"
            element={
              <TeamAccess
                service="awx"
                id={''}
                type={'credentials'}
                addRolesRoute={AwxRoute.CredentialAssignTeams}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No teams assigned to credential/)).toBeInTheDocument();
      expect(
        screen.getByText(/To get started, assign teams to this credential./)
      ).toBeInTheDocument();
      expect(screen.getByText(/Assign teams/)).toBeInTheDocument();
    });
  });
});
