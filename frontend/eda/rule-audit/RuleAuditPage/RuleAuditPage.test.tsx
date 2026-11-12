/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { RuleAuditPage } from './RuleAuditPage';

const server = setupServer();

describe('RuleAuditPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the rule audit title, breadcrumbs, and tabs', async () => {
    server.use(
      http.get(edaAPI`/audit-rules/7/`, () => HttpResponse.json({ id: 7, name: 'Say Hello' }))
    );

    render(
      <MemoryRouter initialEntries={['/rule-audits/7/details']}>
        <Routes>
          <Route path="/rule-audits/:id/*" element={<RuleAuditPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Say Hello' })).toBeInTheDocument();
    });
    expect(screen.getByText('Rule Audit')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Events' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Actions' })).toBeInTheDocument();
  });
});
