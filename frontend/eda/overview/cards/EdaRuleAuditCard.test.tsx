import { edaAPI, setEdaApiPath } from '@ansible/eda-ui/common/eda-utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaRuleAuditCard } from './EdaRuleAuditCard';

describe('EdaRuleAuditCard', () => {
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

  it('should show empty state when no rule audit records exist', async () => {
    server.use(
      http.get(edaAPI`/audit-rules/`, () =>
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
        <EdaRuleAuditCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('There are currently no rule audit records')).toBeInTheDocument();
    });
  });

  it('should show populated table when rule audit records exist', async () => {
    const mockRuleAuditRecords = [
      {
        id: 1,
        name: 'Test Rule 1',
        status: 'successful',
        activation_instance: {
          id: 101,
          name: 'Test Activation 1',
        },
        fired_at: '2023-06-16T15:12:31.857874Z',
      },
      {
        id: 2,
        name: 'Test Rule 2',
        status: 'failed',
        activation_instance: {
          id: 102,
          name: 'Test Activation 2',
        },
        fired_at: '2023-06-15T15:12:31.857874Z',
      },
    ];

    server.use(
      http.get(edaAPI`/audit-rules/`, () =>
        HttpResponse.json({
          count: 2,
          results: mockRuleAuditRecords,
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter>
        <EdaRuleAuditCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const row1 = screen.getByTestId('row-id-1');
      expect(within(row1).getByTestId('name-column-cell')).toHaveTextContent('Test Rule 1');
      expect(within(row1).getByTestId('status-column-cell')).toHaveTextContent('Success');

      const row2 = screen.getByTestId('row-id-2');
      expect(within(row2).getByTestId('name-column-cell')).toHaveTextContent('Test Rule 2');
      expect(within(row2).getByTestId('status-column-cell')).toHaveTextContent('Failed');

      expect(
        screen.queryByText('There are currently no rule audit records')
      ).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    server.use(http.get(edaAPI`/audit-rules/`, () => HttpResponse.error()));

    render(
      <MemoryRouter>
        <EdaRuleAuditCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rule Audit')).toBeInTheDocument();
      expect(screen.getByText('Error loading rule audit records')).toBeInTheDocument();
    });
  });
});
