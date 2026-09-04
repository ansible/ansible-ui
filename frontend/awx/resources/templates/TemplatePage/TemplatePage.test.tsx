import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
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

function renderTemplatePage() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={['/templates/job-template/1']}>
        <Routes>
          <Route path="/templates/job-template/:id" element={<TemplatePage />} />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('TemplatePage', () => {
  it('should render template page with template name', async () => {
    renderTemplatePage();

    await waitFor(() => {
      expect(screen.getByTestId('Test Job Template')).toBeInTheDocument();
    });
  });

  it('should show notifications tab when user has notification access', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('organizations'),
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 1, name: 'Default' }],
          })
      )
    );

    renderTemplatePage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    });
  });

  it('should show notification access errors', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('organizations'),
        () => HttpResponse.json({ detail: 'Failed to load organizations' }, { status: 500 })
      )
    );

    renderTemplatePage();

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
