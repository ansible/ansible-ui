import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SchedulesList } from './SchedulesList';

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('schedules'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('schedules'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SchedulesList', () => {
  it('should render schedules list', async () => {
    render(
      <MemoryRouter initialEntries={['/schedules']}>
        <Routes>
          <Route
            path="/schedules"
            element={
              <SchedulesList createSchedulePageId="awx-schedules-create" url="/api/v2/schedules/" />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No schedules yet')).toBeInTheDocument();
    });
  });
});
