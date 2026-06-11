/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RulebookActivations } from './RulebookActivations';

const mockActivations = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Activation 1',
      description: 'Test activation',
      is_enabled: true,
      status: 'running',
      rules_count: 5,
      rules_fired_count: 2,
      restart_count: 0,
      created_at: '2023-10-02T13:34:18.445029Z',
      modified_at: '2023-10-02T13:34:28.742952Z',
      status_message: 'Activation is running',
    },
    {
      id: 2,
      name: 'Activation 2',
      description: 'Another test activation',
      is_enabled: true,
      status: 'completed',
      rules_count: 3,
      rules_fired_count: 3,
      restart_count: 1,
      created_at: '2023-10-02T13:34:18.445029Z',
      modified_at: '2023-10-02T13:34:28.742952Z',
      status_message: 'Activation has completed',
    },
  ],
};

describe('RulebookActivations', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the rulebook activations list', async () => {
    server.use(
      http.get('*/activations/*', () => {
        return HttpResponse.json(mockActivations);
      }),
      http.options('*/activations/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <RulebookActivations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rulebook Activations')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Activation 1')).toBeInTheDocument();
    });
  });

  it('displays empty state without permission', async () => {
    server.use(
      http.get('*/activations/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/activations/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <RulebookActivations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/You do not have permission to create a rulebook activation/i)
      ).toBeInTheDocument();
    });
  });

  it('displays empty state with permission', async () => {
    server.use(
      http.get('*/activations/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/activations/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <RulebookActivations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/no rulebook activations created for your organization/i)
      ).toBeInTheDocument();
    });
  });
});
