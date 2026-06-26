/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RulebookActivationHistory } from './RulebookActivationHistory';

const mockInstances = {
  count: 2,
  results: [
    {
      id: 1,
      name: 'Instance 1',
      status: 'running',
      activation_id: 5,
      started_at: '2023-10-01T12:00:00Z',
      organization_id: 1,
    },
    {
      id: 2,
      name: 'Instance 2',
      status: 'completed',
      activation_id: 5,
      started_at: '2023-10-02T14:00:00Z',
      organization_id: 1,
    },
  ],
};

const server = setupServer();

describe('RulebookActivationHistory', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the history table with instances', async () => {
    server.use(
      http.get('*/activations/5/instances/*', () => {
        return HttpResponse.json(mockInstances);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history']}>
        <Routes>
          <Route path="/rulebook-activations/:id/history" element={<RulebookActivationHistory />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Instance 1/)).toBeInTheDocument();
    });
  });

  it('should render empty state when no history exists', async () => {
    server.use(
      http.get('*/activations/5/instances/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history']}>
        <Routes>
          <Route path="/rulebook-activations/:id/history" element={<RulebookActivationHistory />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No activation history')).toBeInTheDocument();
    });
  });

  it('should render error state on API failure', async () => {
    server.use(
      http.get('*/activations/5/instances/*', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history']}>
        <Routes>
          <Route path="/rulebook-activations/:id/history" element={<RulebookActivationHistory />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading history')).toBeInTheDocument();
    });
  });
});
