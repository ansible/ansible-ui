/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RulebookActivationTeamAccess } from './RuleBookActivationTeamAccess';

const server = setupServer(
  http.get('*/role_team_access/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get('*/role_team_assignments/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get('*/role_definitions/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  })
);

describe('RulebookActivationTeamAccess', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render PlatformTeamAccess component', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/team-access']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/team-access"
            element={<RulebookActivationTeamAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/assign teams to this rulebook activation/i)).toBeInTheDocument();
    });
  });

  it('should render without errors', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/10/team-access']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/team-access"
            element={<RulebookActivationTeamAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/assign teams to this rulebook activation/i)).toBeInTheDocument();
    });
  });
});
