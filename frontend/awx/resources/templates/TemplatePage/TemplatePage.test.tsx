import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TemplatePage } from './TemplatePage';

const jobTemplate = {
  id: 1,
  type: 'job_template',
  url: '/api/v2/job_templates/1/',
  name: 'Test Job Template',
  description: '',
  job_type: 'run',
  playbook: 'playbook.yml',
  inventory: 1,
  project: 1,
  summary_fields: {
    inventory: { name: 'Demo' },
    project: { name: 'Demo' },
    user_capabilities: { edit: true, delete: true },
  },
  created: '',
  modified: '',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('job_templates') && request.url.includes('/1'),
    () => HttpResponse.json(jobTemplate)
  ),
  http.get(
    ({ request }) => request.url.includes('organizations'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplatePage', () => {
  it('should render template page with template name', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-template/1']}>
        <Routes>
          <Route path="/templates/job-template/:id" element={<TemplatePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('Test Job Template')).toBeInTheDocument();
    });
  });
});
