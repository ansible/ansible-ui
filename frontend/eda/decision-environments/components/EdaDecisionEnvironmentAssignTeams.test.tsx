import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaDecisionEnvironmentAssignTeams } from './EdaDecisionEnvironmentAssignTeams';

const mockDecisionEnvironment = {
  id: 5,
  name: 'Test Decision Environment',
  description: 'A test decision environment',
  organization_id: 1,
  image_url: 'quay.io/ansible/ansible-rulebook:main',
};

const mockTeamsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [{ id: 101, name: 'Alpha Team', organization: 1 }],
};

const mockRolesResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 201,
      name: 'Decision Environment Admin',
      description: 'Has all permissions to a single decision environment',
      content_type: 'eda.decisionenvironment',
      managed: true,
    },
  ],
};

let capturedRolesUrl: string | undefined;

const server = setupServer(
  http.get(edaAPI`/decision-environments/5/`, () => HttpResponse.json(mockDecisionEnvironment)),
  http.get('*/api/gateway/v1/role_definitions/', ({ request }) => {
    capturedRolesUrl = request.url;
    return HttpResponse.json(mockRolesResponse);
  }),
  http.get('*/api/gateway/v1/teams/', () => HttpResponse.json(mockTeamsResponse))
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  capturedRolesUrl = undefined;
});
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/decision-environments/5/team-access/assign-teams']}>
      <Routes>
        <Route
          path="/decision-environments/:id/team-access/assign-teams"
          element={<EdaDecisionEnvironmentAssignTeams />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaDecisionEnvironmentAssignTeams', () => {
  it('should render the assign teams page title and breadcrumbs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });

    expect(screen.getByText('DecisionEnvironments')).toBeInTheDocument();
    expect(screen.getByText('Test Decision Environment')).toBeInTheDocument();
    expect(screen.getByText('Team Access')).toBeInTheDocument();
  });

  it('should render the wizard step labels', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText('Select team(s)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Select roles to apply').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
  });

  it('should fetch roles filtered by eda.decisionenvironment content type', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('Decision Environment Admin')).toBeInTheDocument();
    });

    expect(capturedRolesUrl).toBeDefined();
    expect(capturedRolesUrl).toContain('content_type__api_slug=eda.decisionenvironment');
  });

  it('should have a cancel button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });
});
