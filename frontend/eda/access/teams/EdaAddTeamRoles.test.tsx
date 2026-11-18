/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaAddTeamRoles } from './EdaAddTeamRoles';

const mockTeam = {
  id: 3,
  name: 'automation-team',
};

const resourceTypeOptions = {
  actions: {
    GET: {
      content_type: {
        choices: [{ value: 'eda.project', display_name: 'Project' }],
      },
    },
  },
};

const server = setupServer(
  http.get(edaAPI`/teams/3/`, () => HttpResponse.json(mockTeam)),
  http.options(edaAPI`/role_definitions/`, () => HttpResponse.json(resourceTypeOptions))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/teams/3/roles/add']}>
      <Routes>
        <Route path="/teams/:id/roles/add" element={<EdaAddTeamRoles />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaAddTeamRoles', () => {
  it('renders page header and add roles wizard after loading the team', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add roles' })).toBeInTheDocument();
    });

    expect(screen.getByText('automation-team')).toBeInTheDocument();
    expect(screen.getAllByText('Select a resource type').length).toBeGreaterThanOrEqual(1);
  });
});
