/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ActivationInstancePage } from './ActivationInstancePage';

const mockInstance = {
  id: 42,
  name: 'Test Instance',
  status: 'running',
  activation_id: 5,
  started_at: '2023-10-01T12:00:00Z',
  organization_id: 1,
};

const mockActivation = {
  id: 5,
  name: 'My Activation',
  description: 'Test activation',
  is_enabled: true,
  status: 'running',
};

const server = setupServer(
  http.get('*/activation-instances/42/', () => {
    return HttpResponse.json(mockInstance);
  }),
  http.get('*/activations/5/', () => {
    return HttpResponse.json(mockActivation);
  })
);

describe('ActivationInstancePage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the page with instance id and name', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history/42']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/history/:instanceId"
            element={<ActivationInstancePage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('42 - Test Instance').length).toBeGreaterThan(0);
    });
  });

  it('should render breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history/42']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/history/:instanceId"
            element={<ActivationInstancePage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rulebook Activations')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('My Activation')).toBeInTheDocument();
    });
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should render Details tab', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history/42']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/history/:instanceId"
            element={<ActivationInstancePage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('should handle missing instance data gracefully', async () => {
    server.use(
      http.get('*/activation-instances/99/', () => {
        return HttpResponse.json({
          id: 99,
          activation_id: null,
          started_at: '2023-10-01T00:00:00Z',
          organization_id: 1,
        });
      }),
      http.get('*/activations//', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/history/99']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/history/:instanceId"
            element={<ActivationInstancePage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rulebook Activations')).toBeInTheDocument();
    });
  });
});
