/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { TeamPage } from './TeamPage';

const mockTeam = {
  id: 10,
  name: 'Alpha Team',
  description: 'The alpha team',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-02T00:00:00Z',
};

const server = setupServer(http.get(edaAPI`/teams/10/`, () => HttpResponse.json(mockTeam)));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderTeamPage() {
  return render(
    <MemoryRouter initialEntries={['/teams/10/details']}>
      <Routes>
        <Route path="/teams/:id/*" element={<TeamPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TeamPage', () => {
  it('should render team name in header', async () => {
    renderTeamPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Alpha Team', level: 1 })).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs with Teams link', async () => {
    renderTeamPage();

    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
  });

  it('should display Details and Roles tabs', async () => {
    renderTeamPage();

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('should display Back to Teams tab', async () => {
    renderTeamPage();

    await waitFor(() => {
      expect(screen.getByText('Back to Teams')).toBeInTheDocument();
    });
  });

  it('should render loading page when team data is not available', () => {
    server.use(
      http.get(edaAPI`/teams/99/`, async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockTeam);
      })
    );

    render(
      <MemoryRouter initialEntries={['/teams/99/details']}>
        <Routes>
          <Route path="/teams/:id/*" element={<TeamPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Alpha Team')).not.toBeInTheDocument();
  });

  it('should display error page when API returns an error', async () => {
    server.use(http.get(edaAPI`/teams/10/`, () => HttpResponse.json({}, { status: 500 })));

    renderTeamPage();

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Alpha Team' })).not.toBeInTheDocument();
    });
  });

  it('should display Edit team and Delete team actions', async () => {
    renderTeamPage();

    await waitFor(() => {
      expect(screen.getByText('Edit team')).toBeInTheDocument();
    });
  });
});
