import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import { PlatformOrganizationTeamsAddRoles } from './PlatformOrganizationTeamsAddRoles';

describe('PlatformOrganizationTeamsAddRoles', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
    http.get(gatewayAPI`/organizations/1/teams/`, () =>
      HttpResponse.json({ count: 0, results: [], next: null, previous: null })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render wizard with title and first step', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/assign-organization-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/assign-organization-roles"
            element={<PlatformOrganizationTeamsAddRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Assign organization roles' })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Select team(s)' })).toBeInTheDocument();
  });
});
