import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TeamPage } from './TeamPage';

const mockTeam = {
  id: 1,
  name: 'Test Team',
  description: 'A test team',
  summary_fields: {
    organization: { id: 1, name: 'Default' },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/teams/') && request.url.includes('/1/'),
    () => {
      return HttpResponse.json(mockTeam);
    }
  )
);

function renderTeamPage() {
  return render(
    <MemoryRouter initialEntries={['/teams/1']}>
      <Routes>
        <Route path="/teams/:id" element={<TeamPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TeamPage', () => {
  it('should display team name in page header', async () => {
    renderTeamPage();

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Team');
    });
  });
});
