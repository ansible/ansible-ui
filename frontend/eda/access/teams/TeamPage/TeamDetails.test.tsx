/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TeamDetails } from './TeamDetails';

const mockTeam = {
  id: 10,
  name: 'Alpha Team',
  description: 'First team description',
  created: '2024-03-15T10:30:00Z',
  modified: '2024-04-20T14:45:00Z',
};

const server = setupServer(http.get('*/teams/10/', () => HttpResponse.json(mockTeam)));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderTeamDetails() {
  return render(
    <MemoryRouter initialEntries={['/teams/10/details']}>
      <Routes>
        <Route path="/teams/:id/details" element={<TeamDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TeamDetails', () => {
  it('should render team name and description', async () => {
    renderTeamDetails();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });
    expect(screen.getByText('First team description')).toBeInTheDocument();
  });

  it('should render detail labels', async () => {
    renderTeamDetails();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render loading page when team is not yet loaded', () => {
    server.use(
      http.get('*/teams/99/', async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockTeam);
      })
    );

    render(
      <MemoryRouter initialEntries={['/teams/99/details']}>
        <Routes>
          <Route path="/teams/:id/details" element={<TeamDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Alpha Team')).not.toBeInTheDocument();
  });

  it('should handle team with empty description', async () => {
    server.use(http.get('*/teams/10/', () => HttpResponse.json({ ...mockTeam, description: '' })));

    renderTeamDetails();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
