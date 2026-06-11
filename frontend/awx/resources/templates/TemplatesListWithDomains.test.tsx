/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { TemplatesListWithDomains } from './TemplatesListWithDomains';

const server = setupServer(
  http.options(awxAPI`/unified_job_templates/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/unified_job_templates/`, () =>
    HttpResponse.json({
      count: 0,
      results: [],
      next: null,
      previous: null,
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplatesListWithDomains', () => {
  test('should render Domains section', async () => {
    render(
      <MemoryRouter>
        <TemplatesListWithDomains />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Domains')).toBeInTheDocument();
    });
  });

  test('should render templates list', async () => {
    render(
      <MemoryRouter>
        <TemplatesListWithDomains />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText(/No templates yet|Templates/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
