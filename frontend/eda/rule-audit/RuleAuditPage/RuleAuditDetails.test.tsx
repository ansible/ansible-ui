/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RuleAuditDetails } from './RuleAuditDetails';

const mockRuleAudit = {
  id: 1,
  name: 'Say Hello long running',
  status: 'successful',
  ruleset_name: 'Long Running Range',
  activation_instance: {
    id: 1,
    name: 'Activation 1',
  },
  fired_at: '2023-10-31T13:45:31.576578Z',
  created_at: '2023-10-31T13:45:31.576578Z',
};

describe('RuleAuditDetails', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders rule audit details', async () => {
    server.use(
      http.get('*/audit-rules/1/', () => {
        return HttpResponse.json(mockRuleAudit);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rule-audit/1/details']}>
        <Routes>
          <Route path="/rule-audit/:id/details" element={<RuleAuditDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Say Hello long running')).toBeInTheDocument();
    });
  });
});
