/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { HostJobs } from './HostJobs';

const mockRegularHost = {
  id: 123,
  name: 'test-host',
  instance_id: '',
  summary_fields: { inventory: { kind: '' } },
};

const mockConstructedHost = {
  id: 123,
  name: 'proxy-host',
  instance_id: '42',
  summary_fields: { inventory: { kind: 'constructed' } },
};

const server = setupServer(
  http.get(awxAPI`/hosts/:id/`, () => HttpResponse.json(mockRegularHost)),
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

  test('should use source host instance_id for constructed inventory hosts', async () => {
    const capturedUrls: string[] = [];

    server.use(
      http.get(awxAPI`/hosts/:id/`, () => HttpResponse.json(mockConstructedHost)),
      http.get(awxAPI`/unified_jobs/`, ({ request }) => {
        capturedUrls.push(request.url);
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      })
    );

    render(
      <MemoryRouter initialEntries={['/hosts/123/jobs']}>
        <Routes>
          <Route path="/hosts/:id/jobs" element={<HostJobs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(capturedUrls.some((url) => url.includes('job__hosts=42'))).toBe(true);
      },
      { timeout: 15000 }
    );
  });
});
