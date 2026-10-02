/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialTeamAccess } from './CredentialTeamAccess';

const mockTeamAssignmentsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      role_definition: { id: 201, name: 'EDA Credential Admin' },
      summary_fields: {
        team: { id: 50, name: 'Cred Team' },
        role_definition: { id: 201, name: 'EDA Credential Admin' },
      },
      content_type: 'eda.edacredential',
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
    <MemoryRouter initialEntries={['/credentials/10/team-access']}>
      <Routes>
        <Route path="/credentials/:id/team-access" element={<CredentialTeamAccess />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CredentialTeamAccess', () => {
  it('should render the team access list with team data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Cred Team')).toBeInTheDocument();
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
