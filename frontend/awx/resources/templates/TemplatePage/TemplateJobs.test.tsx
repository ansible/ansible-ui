import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TemplateJobs } from './TemplateJobs';

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('unified_jobs'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('unified_jobs'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateJobs', () => {
  it('should render jobs list for job template', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-template/1/jobs']}>
        <Routes>
          <Route
            path="/templates/job-template/:id/jobs"
            element={<TemplateJobs resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No jobs yet')).toBeInTheDocument();
    });
  });
});
