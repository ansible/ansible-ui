import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NotifierAssignTeams } from './NotifierAssignTeams';

const mockNotifier = {
  id: 1,
  name: 'Test Notifier',
  type: 'notification_template',
  summary_fields: {},
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('notification_templates') && request.url.includes('/1/'),
    () => HttpResponse.json(mockNotifier)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/teams'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('NotifierAssignTeams', () => {
  it('should render wizard with Select team(s) step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/notification_templates/1/team-access/assign']}>
        <Routes>
          <Route
            path="/notification_templates/:id/team-access/assign"
            element={<NotifierAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
