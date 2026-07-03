/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProjectTeamAccess } from './ProjectTeamAccess';

const mockTeamAssignmentsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      role_definition: { id: 201, name: 'EDA Project Admin' },
      summary_fields: {
        team: { id: 50, name: 'Alpha Team' },
        role_definition: { id: 201, name: 'EDA Project Admin' },
      },
      content_type: 'eda.project',
      object_id: '10',
    },
  ],
};

const mockEmptyTeamAssignments = {
  count: 0,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [],
};

const server = setupServer(
  http.get('*/api/gateway/v1/role_team_assignments/', () =>
    HttpResponse.json(mockTeamAssignmentsResponse)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/projects/10/team-access']}>
      <Routes>
        <Route path="/projects/:id/team-access" element={<ProjectTeamAccess />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectTeamAccess', () => {
  it('should render the team access list with team data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });
  });

  it('should render the Assign teams action', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Assign teams')).toBeInTheDocument();
    });
  });

  it('should handle empty team access list', async () => {
    server.use(
      http.get('*/api/gateway/v1/role_team_assignments/', () =>
        HttpResponse.json(mockEmptyTeamAssignments)
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Assign teams')).toBeInTheDocument();
    });
  });
});
