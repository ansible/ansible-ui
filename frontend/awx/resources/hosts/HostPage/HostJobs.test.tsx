/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { HostJobs } from './HostJobs';

const server = setupServer(
  http.options(awxAPI`/unified_jobs/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.options(awxAPI`/inventory_sources/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/unified_jobs/`, () =>
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

describe('HostJobs', () => {
  test('should render HostJobs and show jobs list content', async () => {
    render(
      <MemoryRouter initialEntries={['/hosts/123/jobs']}>
        <Routes>
          <Route path="/hosts/:id/jobs" element={<HostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('No jobs yet')).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
  });
});
