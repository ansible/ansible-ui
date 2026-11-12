/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { RuleAuditActions } from './RuleAuditActions';

const server = setupServer();

function renderPage(id = '7') {
  return render(
    <MemoryRouter initialEntries={[`/rule-audits/${id}/actions`]}>
      <Routes>
        <Route path="/rule-audits/:id/actions" element={<RuleAuditActions />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RuleAuditActions', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render actions for the rule audit', async () => {
    server.use(
      http.get(edaAPI`/audit-rules/7/actions/`, () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 11,
              name: 'debug',
              status: 'successful',
              fired_at: '2024-01-01T00:00:00Z',
            },
          ],
        })
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('debug')).toBeInTheDocument();
    });
  });

  it('should render an empty state when there are no actions', async () => {
    server.use(
      http.get(edaAPI`/audit-rules/8/actions/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    renderPage('8');

    await waitFor(() => {
      expect(screen.getByText('No actions yet')).toBeInTheDocument();
    });
  });
});
