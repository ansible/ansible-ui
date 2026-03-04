/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RuleAudit } from './RuleAudit';

const mockRuleAudit = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Say Hello from ruleset 1',
      status: 'successful',
      activation_instance: {
        id: 59,
        name: 'Activation 4',
      },
      fired_at: '2023-10-31T13:45:31.576578Z',
    },
    {
      id: 2,
      name: 'Run Job Template',
      status: 'failed',
      activation_instance: {
        id: 60,
        name: 'Activation 5',
      },
      fired_at: '2023-10-31T13:45:30.941856Z',
    },
  ],
};

describe('RuleAudit', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the rule audit list', async () => {
    server.use(
      http.get('*/audit-rules/*', () => {
        return HttpResponse.json(mockRuleAudit);
      })
    );

    render(
      <MemoryRouter>
        <RuleAudit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rule Audit')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Say Hello from ruleset 1')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    server.use(
      http.get('*/audit-rules/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter>
        <RuleAudit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no rule audit data for your organization/i)).toBeInTheDocument();
    });
  });
});
