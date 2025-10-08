import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaRulebookActivationsCard } from './EdaRulebookActivationsCard';
import { setEdaApiPath } from '@ansible/eda-ui/common/eda-utils';

describe('EdaRulebookActivationsCard', () => {
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

  it('should show empty state when no rulebook activations exist', async () => {
    server.use(
      http.get(edaAPI`/activations/`, () =>
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
        <EdaRulebookActivationsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('There are currently no rulebook activations')).toBeInTheDocument();
      expect(
        screen.getByText('Create a rulebook activation by clicking the button below.')
      ).toBeInTheDocument();
      expect(screen.getByText('Create rulebook activation')).toBeInTheDocument();
    });
  });

  it('should show populated table when rulebook activations exist', async () => {
    const mockActivations = [
      {
        id: 1,
        name: 'Test Activation 1',
        description: 'Test Description 1',
        is_enabled: true,
        status: 'running',
        created_at: '2023-06-21T14:14:06.573532Z',
        modified_at: '2023-06-21T14:14:06.573544Z',
      },
      {
        id: 2,
        name: 'Test Activation 2',
        description: 'Test Description 2',
        is_enabled: false,
        status: 'stopped',
        created_at: '2023-06-20T14:14:06.573532Z',
        modified_at: '2023-06-20T14:14:06.573544Z',
      },
    ];

    server.use(
      http.get(edaAPI`/activations/`, () =>
        HttpResponse.json({
          count: 2,
          results: mockActivations,
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter>
        <EdaRulebookActivationsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const row1 = screen.getByTestId('row-id-1');
      expect(within(row1).getByTestId('name-column-cell')).toHaveTextContent('Test Activation 1');
      expect(within(row1).getByTestId('status-column-cell')).toHaveTextContent('Running');

      const row2 = screen.getByTestId('row-id-2');
      expect(within(row2).getByTestId('name-column-cell')).toHaveTextContent('Test Activation 2');
      expect(within(row2).getByTestId('status-column-cell')).toHaveTextContent('Stopped');

      expect(
        screen.queryByText('There are currently no rulebook activations')
      ).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock error response
    server.use(http.get(edaAPI`/activations/`, () => HttpResponse.error()));

    render(
      <MemoryRouter>
        <EdaRulebookActivationsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rulebook Activations')).toBeInTheDocument();
    });
  });
});
