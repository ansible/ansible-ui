import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxTeamDetails } from './AwxTeamDetails';

const mockTeam = {
  id: 1,
  name: 'Test Team Details',
  description: 'Team description',
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
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

function renderAwxTeamDetails() {
  return render(
    <MemoryRouter initialEntries={['/teams/1/details']}>
      <Routes>
        <Route path="/teams/:id/details" element={<AwxTeamDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxTeamDetails', () => {
  it('should display team name in details', async () => {
    renderAwxTeamDetails();

    await waitFor(() => {
      expect(screen.getByText('Test Team Details')).toBeInTheDocument();
    });
  });
});
