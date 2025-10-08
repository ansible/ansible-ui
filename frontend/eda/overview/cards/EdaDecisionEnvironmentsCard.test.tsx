import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaDecisionEnvironmentsCard } from './EdaDecisionEnvironmentsCard';
import { setEdaApiPath } from '@ansible/eda-ui/common/eda-utils';

describe('EdaDecisionEnvironmentsCard', () => {
  const server = setupServer();

  beforeAll(() => {
    setEdaApiPath('/api/eda/v1');
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => server.close());

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it('should show empty state when no decision environments exist', async () => {
    server.use(
      http.get(edaAPI`/decision-environments/`, () =>
        HttpResponse.json({
          count: 0,
          results: [],
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter>
        <EdaDecisionEnvironmentsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('There are currently no decision environments')).toBeInTheDocument();
      expect(
        screen.getByText('Create a decision environment by clicking the button below.')
      ).toBeInTheDocument();
      expect(screen.getByText('Create decision environment')).toBeInTheDocument();
    });
  });

  it('should show populated table when decision environments exist', async () => {
    const mockDecisionEnvironments = [
      {
        id: 1,
        name: 'Test DE 1',
        description: 'Test DE Description 1',
        image_url: 'quay.io/ansible/ansible-rulebook:v1',
        created_at: '2023-06-21T13:35:14.393063Z',
        modified_at: '2023-06-21T13:35:14.393075Z',
      },
      {
        id: 2,
        name: 'Test DE 2',
        description: 'Test DE Description 2',
        image_url: 'quay.io/ansible/ansible-rulebook:v2',
        created_at: '2023-06-20T13:35:14.393063Z',
        modified_at: '2023-06-20T13:35:14.393075Z',
      },
    ];

    server.use(
      http.get(edaAPI`/decision-environments/`, () =>
        HttpResponse.json({
          count: 2,
          results: mockDecisionEnvironments,
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter>
        <EdaDecisionEnvironmentsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const row1 = screen.getByTestId('row-id-1');
      expect(within(row1).getByTestId('name-column-cell')).toHaveTextContent('Test DE 1');

      const row2 = screen.getByTestId('row-id-2');
      expect(within(row2).getByTestId('name-column-cell')).toHaveTextContent('Test DE 2');

      expect(
        screen.queryByText('There are currently no decision environments')
      ).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    server.use(http.get(edaAPI`/decision-environments/`, () => HttpResponse.error()));

    render(
      <MemoryRouter>
        <EdaDecisionEnvironmentsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Decision Environments')).toBeInTheDocument();
    });
  });
});
