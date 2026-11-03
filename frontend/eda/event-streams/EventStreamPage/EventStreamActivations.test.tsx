/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EventStreamActivations } from './EventStreamActivations';

const server = setupServer();

function renderPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/event-streams/${id}/activations`]}>
      <Routes>
        <Route path="/event-streams/:id/activations" element={<EventStreamActivations />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EventStreamActivations', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render activations for the event stream', async () => {
    server.use(
      http.get(edaAPI`/event-streams/1/activations/`, () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 9,
              name: 'GitHub activation',
              description: 'Forwards events',
              created_at: '2024-01-01T00:00:00Z',
              modified_at: '2024-01-02T00:00:00Z',
              status: 'running',
            },
          ],
        })
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('GitHub activation')).toBeInTheDocument();
    });
  });

  it('should render an empty state when there are no activations', async () => {
    server.use(
      http.get(edaAPI`/event-streams/2/activations/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    renderPage('2');

    await waitFor(() => {
      expect(screen.getAllByText('No activations for this event stream').length).toBeGreaterThan(0);
    });
  });
});
