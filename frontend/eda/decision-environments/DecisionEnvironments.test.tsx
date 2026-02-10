/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DecisionEnvironments } from './DecisionEnvironments';

const mockDecisionEnvironments = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Test DE 1',
      description: 'A decision environment',
      image_url: 'quay.io/ansible/de:latest',
      created_at: '2023-07-11T22:00:00.179292Z',
      modified_at: '2023-07-11T22:00:02.244685Z',
    },
    {
      id: 2,
      name: 'Test DE 2',
      description: 'Another DE',
      image_url: 'quay.io/ansible/de:v2',
      created_at: '2023-07-11T22:00:10.299948Z',
      modified_at: '2023-07-11T22:00:11.814164Z',
    },
  ],
};

describe('DecisionEnvironments', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the decision environments list', async () => {
    server.use(
      http.get('*/decision-environments/*', () => {
        return HttpResponse.json(mockDecisionEnvironments);
      }),
      http.options('*/decision-environments/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <DecisionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Decision Environments')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test DE 1')).toBeInTheDocument();
    });
  });

  it('displays empty state when no DEs exist', async () => {
    server.use(
      http.get('*/decision-environments/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter>
        <DecisionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/You do not have permission to create a decision environment/)
      ).toBeInTheDocument();
    });
  });
});
