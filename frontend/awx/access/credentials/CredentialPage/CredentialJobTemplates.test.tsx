import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialJobTemplates } from './CredentialJobTemplates';

const mockTemplates = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 7,
      type: 'job_template',
      name: 'Demo Job Template',
      description: '',
      unified_job_type: 'job',
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
        organization: { id: 1, name: 'Default' },
      },
    },
  ],
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('job_templates'),
    () => HttpResponse.json({ actions: { POST: {}, GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('job_templates'),
    () => HttpResponse.json(mockTemplates)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialJobTemplates', () => {
  it('should render job templates list', async () => {
    render(
      <MemoryRouter initialEntries={['/credentials/1/job-templates']}>
        <Routes>
          <Route path="/credentials/:id/job-templates" element={<CredentialJobTemplates />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
    });
  });
});
