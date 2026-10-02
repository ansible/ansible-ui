import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import mockEmptyTeams from '../../../platform/access/organizations/components/fixtures/emptyTeams.fixture.json';

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
      expect(screen.getByText(/No teams are assigned to this credentials/)).toBeInTheDocument();
      expect(
        screen.getByText(/To get started, assign a team to this credentials./)
      ).toBeInTheDocument();
      expect(screen.getByText(/Assign teams/)).toBeInTheDocument();
    });
  });
});
